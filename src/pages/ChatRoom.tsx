import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getChatMessages, forwardMessage } from "../services/message";
import { markAllMessagesAsRead } from "../services/chatRoom";
import SockJS from "sockjs-client";
import { Client, IMessage } from "@stomp/stompjs";
import styled from "styled-components";

// 채팅 메시지 인터페이스
export interface ChatMessageItem {
    id: string; // 메시지 식별자 (서버에서 생성)
    roomId: string;
    senderId: string;
    content: {
        text: string;
        type: string;
        attachments: any[];
        isEdited: boolean;
        isDeleted: boolean;
    };
    createdAt?: string;
    status: string; // "SENT", "DELIVERED", "READ" 등
    readBy: { [userId: string]: boolean }; // 읽음 상태 추가
}

// 타이핑 인디케이터 메시지 인터페이스
interface TypingIndicatorMessage {
    roomId: string;
    userId: string;
    username: string;
    isTyping: boolean;
}

// 스타일 컴포넌트들
const ChatWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh; /* 뷰포트 높이에 맞춤 */
    background-color: #f5f5f5;
    overflow: hidden; /* 뒷배경 스크롤 제거 */
`;

const ChatContainer = styled.div`
    width: 375px;
    height: 667px;
    background-color: #fff;
    border-radius: 30px;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    overflow: hidden; /* 컨테이너 내부에서만 스크롤 */
    position: relative;
`;

const Header = styled.div`
    padding: 8px 10px; /* 크기 축소 */
    background: #fff;
    border-bottom: 1px solid #ddd;
    display: flex;
    align-items: center;
    z-index: 10;
`;

const BackButton = styled.button`
    background: none;
    border: none;
    font-size: 1.2rem; /* 크기 조정 */
    cursor: pointer;
    color: #007bff;
    margin-right: 8px;
`;

const HeaderTitle = styled.h2`
    font-size: 1.1rem; /* 글자 크기 축소 */
    margin: 0;
    color: #333;
`;

const ChatArea = styled.div`
    flex: 1;
    padding: 10px 15px;
    background: #f8f8f8;
    overflow-y: auto; /* 채팅 영역에서만 스크롤 */
    scrollbar-width: thin;
    scrollbar-color: #888 transparent;
    &::-webkit-scrollbar {
        width: 6px;
    }
    &::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 3px;
    }
    &::-webkit-scrollbar-track {
        background: transparent;
    }
    &:hover::-webkit-scrollbar-thumb {
        background: #555;
    }
`;

const MessageWrapper = styled.div<{ isOwnMessage: boolean }>`
    display: flex;
    flex-direction: column;
    align-items: ${({ isOwnMessage }) => (isOwnMessage ? "flex-end" : "flex-start")};
    margin-bottom: 10px;
`;

const ChatBubble = styled.div.withConfig({
    shouldForwardProp: (prop) => prop !== "isOwnMessage"
})<{ isOwnMessage: boolean }>`
    max-width: 70%;
    padding: 12px 16px;
    border-radius: 20px;
    background: ${({ isOwnMessage }) => (isOwnMessage ? "linear-gradient(135deg, #007bff, #0056b3)" : "#e5e5ea")};
    color: ${({ isOwnMessage }) => (isOwnMessage ? "#fff" : "#000")};
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: transform 0.2s;
    &:hover {
        transform: translateY(-2px);
    }
`;

const MessageFooter = styled.div<{ isOwnMessage: boolean }>`
    display: flex;
    justify-content: ${({ isOwnMessage }) => (isOwnMessage ? "flex-end" : "flex-end")};
    align-items: center;
    margin-top: 4px;
`;

const Timestamp = styled.div<{ isOwnMessage: boolean }>`
    font-size: 0.75rem;
    color: ${({ isOwnMessage }) => (isOwnMessage ? "#999" : "#999")};
    text-align: ${({ isOwnMessage }) => (isOwnMessage ? "right" : "right")};
`;

const MessageStatusIndicator = styled.span`
    font-size: 0.75rem;
    color: #10380c;
    margin-left: 8px;
`;

const TypingIndicatorContainer = styled.div`
    padding: 5px 10px;
    font-size: 0.9rem;
    color: #555;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 10px;
    margin-bottom: 10px;
`;

const ChatInputContainer = styled.div`
    display: flex;
    padding: 10px;
    background: #fff;
    border-top: 1px solid #ddd;
    z-index: 10;
`;

const Input = styled.input`
    flex: 1;
    padding: 10px;
    font-size: 1rem;
    border: none;
    border-radius: 20px;
    background: #f0f0f0;
    &:focus {
        outline: none;
        background: #e8e8e8;
    }
`;

const SendButton = styled.button`
    padding: 10px 20px;
    margin-left: 10px;
    background: linear-gradient(135deg, #007bff, #0056b3);
    color: #fff;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    transition: transform 0.2s;
    &:hover {
        transform: scale(1.05);
    }
`;

const ErrorMessage = styled.div`
    padding: 10px;
    background: #ffebee;
    color: #c62828;
    text-align: center;
    font-size: 0.9rem;
    border-radius: 10px;
`;

/* 컨텍스트 메뉴 및 모달 스타일 (생략) */
const ContextMenu = styled.div`
    position: absolute;
    background: white;
    border: 1px solid #ccc;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    z-index: 1000;
`;

const ContextMenuItem = styled.div`
    padding: 8px 12px;
    cursor: pointer;
    &:hover {
        background: #f0f0f0;
    }
`;

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1001;
`;

const ModalContent = styled.div`
    background: white;
    padding: 20px;
    border-radius: 8px;
    min-width: 300px;
`;

const ModalButtons = styled.div`
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
`;

// ChatRoom 컴포넌트
const ChatRoom: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [messages, setMessages] = useState<ChatMessageItem[]>([]);
    const [input, setInput] = useState("");
    const [typingUsers, setTypingUsers] = useState<string[]>([]); // Set<string> 대신 string[]로 변경
    const [stompClient, setStompClient] = useState<Client | null>(null);
    const [connectionError, setConnectionError] = useState<string | null>(null);  // 에러 상태 추가
    const chatAreaRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const heartbeatRef = useRef<NodeJS.Timeout | null>(null);   // Heartbeat용 ref 추가
    const [contextMenu, setContextMenu] = useState<{            // 컨텍스트 메뉴 및 모달 상태
        visible: boolean;
        x: number;
        y: number;
        message: ChatMessageItem | null;
    }>({ visible: false, x: 0, y: 0, message: null });
    const [showForwardModal, setShowForwardModal] = useState(false);
    const [targetRoomId, setTargetRoomId] = useState("");
    const [isConnected, setIsConnected] = useState(true);

    // 읽음 처리 함수 (디바운스 제거)
    const markRead = useCallback(() => {
        if (document.visibilityState === "visible" && roomId && user) {
            markAllMessagesAsRead(roomId, user.id)
                .then(() => console.log("읽음 처리 완료"))
                .catch((err) => console.error("읽음 처리 실패", err));
        }
    }, [roomId, user]);

    const scrollToBottom = useCallback(() => {
        if (chatAreaRef.current) {
            chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
        }
    }, []);

    // 1) 초기 메시지 로드 및 STOMP 연결
    useEffect(() => {
        if (!roomId || !user) return;

        // 초기 메시지 로드 후 읽음 처리
        const fetchMessages = async () => {
            try {
                const res = await getChatMessages(roomId);
                setMessages(res.data);
                markRead();
                setTimeout(scrollToBottom, 0); // 비동기 렌더링 후 스크롤
            } catch (err) {
                console.error("메시지 로드 실패", err);
            }
        };

        fetchMessages();

        // STOMP 연결
        const token = localStorage.getItem("accessToken");
        console.log("Token:", token); // 토큰 값 확인
        
        const socket = new SockJS(`http://localhost:8100/ws/chat?token=${token}`);
        const client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            debug: (msg) => console.log("[STOMP]", msg),
            onConnect: () => {
                console.log("WebSocket 연결됨");
                setConnectionError(null); // 연결 성공 시 에러 제거
                setIsConnected(true);
                
                // onConnect 시 활성 상태(active: true) 전송 (활성화 되었다면 채팅 안읽은 개수를 업데이트하지 않는다.)
                client.publish({
                    destination: "/app/active",
                    body: JSON.stringify({ userId: user.id, roomId, active: true })
                });

                // Heartbeat 설정
                heartbeatRef.current = setInterval(() => {
                    if (client.connected) {
                        client.publish({
                            destination: "/app/active",
                            body: JSON.stringify({ userId: user.id, roomId, active: true })
                        });
                    }
                }, 30000); // 30초마다

                let lastMarkReadTime = 0;
                const MARK_READ_COOLDOWN = 5000;

                // 메시지 수신 구독
                client.subscribe(`/topic/messages/${roomId}`, (message: IMessage) => {
                    const msg: ChatMessageItem = JSON.parse(message.body);
                    setMessages((prev) => {
                        if (prev.some(m => m.id === msg.id)) return prev;
                        const updatedMessages = [...prev, msg].slice(-100);
                        setTimeout(scrollToBottom, 0); // 비동기 렌더링 후 스크롤
                        return updatedMessages;
                    });
                    const now = Date.now();
                    if (now - lastMarkReadTime > MARK_READ_COOLDOWN && document.visibilityState === "visible") {
                        markRead();
                        lastMarkReadTime = now;
                    }
                });

                // 타이핑 인디케이터 구독
                client.subscribe(`/topic/typing/${roomId}`, (message: IMessage) => {
                    const typingMsg: TypingIndicatorMessage = JSON.parse(message.body);
                    if (typingMsg.userId === user?.id) return;

                    console.log("Received typing message:", typingMsg);
                    setTypingUsers((prev) => {
                        const newUsers = typingMsg.isTyping
                            ? prev.includes(typingMsg.username) ? prev : [...prev, typingMsg.username] // 중복 제거
                            : prev.filter(u => u !== typingMsg.username);
                        console.log("Updated typingUsers:", newUsers);
                        if (newUsers.length > 0) scrollToBottom();
                        return newUsers;
                    });
                });
            },
            onDisconnect: () => {
                setConnectionError("WebSocket 연결이 끊겼습니다. 재접속 중...");
                setIsConnected(false);
            },
            onStompError: (frame) => {
                setConnectionError("WebSocket 오류 발생: " + frame.body);
                setIsConnected(false);
            }
        });
        client.activate();
        setStompClient(client);

        // 창 종료 이벤트
        const handleBeforeUnload = () => {
            if (client && client.connected) {
                client.publish({
                    destination: "/app/active",
                    body: JSON.stringify({ userId: user.id, roomId, active: false })
                });
                client.deactivate();
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            if (client && client.connected) {
                client.publish({
                    destination: "/app/active",
                    body: JSON.stringify({ userId: user.id, roomId, active: false })
                });
                client.deactivate();
            }
            // Heartbeat 정리
            if (heartbeatRef.current) {
                clearInterval(heartbeatRef.current);
            }
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [roomId, user, markRead, scrollToBottom]);

    // 메시지 및 타이핑 상태에 따른 스크롤 조정
    useEffect(() => {
        if (typingUsers.length > 0) {
            scrollToBottom();
        }
        // typingUsers가 비어질 때는 스크롤 위치를 유지 (원상복귀)
    }, [messages, typingUsers, scrollToBottom]);

    // 3) Window focus 이벤트: 창이 포커스 될 때 자동 "모두 읽음 처리" 호출
    useEffect(() => {
        const handleFocus = () => {
            if (user && roomId) {
                // 창 포커스 시 호출
                markAllMessagesAsRead(roomId, user.id)
                    .then(() => console.log("Window focus: 모두 읽음 처리 완료"))
                    .catch((err) => console.error("Window focus: 읽음 처리 실패", err));
            }
        };
        window.addEventListener("focus", handleFocus);
        return () => window.removeEventListener("focus", handleFocus);
    }, [roomId, user]);

    // 타이핑 인디케이터 전송
    const sendTypingIndicator = (isTyping: boolean) => {
        if (!stompClient || !stompClient.connected || !roomId || !user) return;
    
        const typingPayload: TypingIndicatorMessage = { 
            roomId,
            userId: user.id,
            username: user.name,
            isTyping 
        };
    
        stompClient.publish({
            destination: "/app/typing",
            body: JSON.stringify(typingPayload),
        });
    };

    // 입력값 변경 및 타이핑 디바운스 처리
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
        
        if (!stompClient || !roomId || !user || !stompClient.connected) return;
    
        const sendTyping = (isTyping: boolean) => {
            sendTypingIndicator(isTyping);
            if (isTyping) {
                stompClient.publish({
                    destination: "/app/active",
                    body: JSON.stringify({ userId: user.id, roomId, active: true })
                });
            }
        };
    
        // 입력 시작 시 즉시 타이핑 상태 전송
        sendTyping(true);

        // 이전 타이머 정리
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        
        // 2초 후 타이핑 종료 전송
        typingTimeoutRef.current = setTimeout(() => sendTyping(false), 2000);
    };

    // 메시지 전송
    const sendMessage = () => {
        if (!stompClient || !stompClient.connected || input.trim() === "" || !roomId || !user) {
            console.error("전송 불가: 연결 끊김 또는 유효하지 않은 입력");
            return;
        }

        // 메시지 세팅
        const chatMessage: ChatMessageItem = {
            id: "",
            roomId,
            senderId: user.id,
            content: {
                text: input,
                type: "TEXT",
                attachments: [],
                isEdited: false,
                isDeleted: false,
            },
            createdAt: new Date().toISOString(),
            status: "SENT",
            readBy: { [user.id]: true } // 초기 readBy 설정 (발신자만 읽음)
        };

        stompClient.publish({
            destination: "/app/chat",
            body: JSON.stringify(chatMessage),
        });

        setInput("");
        sendTypingIndicator(false);
        scrollToBottom(); // 메시지 전송 후 즉시 스크롤
    };

    // 우클릭: 컨텍스트 메뉴 표시 (메시지 전달 옵션)
    const handleContextMenu = (e: React.MouseEvent, message: ChatMessageItem) => {
        e.preventDefault();
        setContextMenu({ visible: true, x: e.clientX, y: e.clientY, message });
    };

    // 외부 클릭 시 컨텍스트 메뉴 닫기
    useEffect(() => {
        const handleClick = () => {
            if (contextMenu.visible) {
                setContextMenu({ ...contextMenu, visible: false, message: null });
            }
        };
        window.addEventListener("click", handleClick);
        return () => window.removeEventListener("click", handleClick);
    }, [contextMenu]);

    // 컨텍스트 메뉴에서 "메시지 전달" 선택
    const handleForwardClick = () => {
        setContextMenu({ ...contextMenu, visible: false });
        setShowForwardModal(true);
    };

    // 모달 제출: 대상 채팅방 ID 입력 후 메시지 전달 API 호출
    const handleModalSubmit = async () => {
        if (contextMenu.message) {
            try {
                await forwardMessage(contextMenu.message.id, targetRoomId, user!.id);
                alert("메시지가 전달되었습니다.");
            } catch (error) {
                console.error("Forward error", error);
                alert("메시지 전달 실패");
            }
        }
        setShowForwardModal(false);
        setTargetRoomId("");
    };

    // 모달 취소
    const handleModalCancel = () => {
        setShowForwardModal(false);
        setTargetRoomId("");
    };

    return (
        <ChatWrapper>
            <ChatContainer>
                <Header>
                    <BackButton onClick={() => navigate("/")}>←</BackButton> {/* 경로 수정 */}
                    <HeaderTitle>채팅방</HeaderTitle>
                </Header>
                {connectionError && <ErrorMessage>{connectionError}</ErrorMessage>}
                <ChatArea ref={chatAreaRef}>
                    {messages.map((msg, idx) => {
                        const isOwn = msg.senderId === user?.id;
                        const unreadByOpponent = isOwn && Object.entries(msg.readBy).some(([id, read]) => id !== user?.id && !read);
                        return (
                            <MessageWrapper key={idx} isOwnMessage={isOwn}>
                                <ChatBubble isOwnMessage={isOwn} onContextMenu={(e) => handleContextMenu(e, msg)}>
                                    {msg.content.text}
                                </ChatBubble>
                                <MessageFooter isOwnMessage={isOwn}>
                                    {msg.createdAt && <Timestamp isOwnMessage={isOwn}>{new Date(msg.createdAt).toLocaleTimeString()}</Timestamp>}
                                    {isOwn && (
                                        <MessageStatusIndicator>
                                            {unreadByOpponent ? "1" : ""}
                                        </MessageStatusIndicator>
                                    )}
                                </MessageFooter>
                            </MessageWrapper>
                        );
                    })}
                    {typingUsers.length > 0 && (
                        <TypingIndicatorContainer>
                            {typingUsers.join(", ")}님이 타이핑 중...
                        </TypingIndicatorContainer>
                    )}
                </ChatArea>
                <ChatInputContainer>
                    <Input
                        type="text"
                        value={input}
                        onChange={handleInputChange}
                        placeholder="메시지를 입력하세요"
                        disabled={!isConnected}
                    />
                    <SendButton onClick={sendMessage} disabled={!isConnected}>전송</SendButton>
                </ChatInputContainer>
                {contextMenu.visible && (
                    <ContextMenu style={{ top: contextMenu.y, left: contextMenu.x }}>
                        <ContextMenuItem onClick={handleForwardClick}>메시지 전달</ContextMenuItem>
                    </ContextMenu>
                )}
                {showForwardModal && (
                    <ModalOverlay>
                        <ModalContent>
                            <h3>메시지 전달</h3>
                            <p>전달할 대상 채팅방 ID를 입력하세요:</p>
                            <input value={targetRoomId} onChange={(e) => setTargetRoomId(e.target.value)} placeholder="대상 채팅방 ID" />
                            <ModalButtons>
                                <button onClick={handleModalSubmit}>전달</button>
                                <button onClick={handleModalCancel}>취소</button>
                            </ModalButtons>
                        </ModalContent>
                    </ModalOverlay>
                )}
            </ChatContainer>
        </ChatWrapper>
    );
};

export default ChatRoom;