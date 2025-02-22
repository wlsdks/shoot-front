import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
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
}

// 타이핑 인디케이터 메시지 인터페이스
interface TypingIndicatorMessage {
    roomId: string;
    userId: string;
    isTyping: boolean;
}

// 스타일 컴포넌트들
const ChatContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    border-radius: 8px;
    background: #fff;
    border: 1px solid #ddd;
    overflow: hidden;
`;

const ChatArea = styled.div`
    flex: 1;
    padding: 20px;
    background: #f8f8f8;
    overflow-y: auto;
`;

const ChatInputContainer = styled.div`
    display: flex;
    padding: 10px;
    background: #fff;
    border-top: 1px solid #ddd;
`;

const Input = styled.input`
    flex: 1;
    padding: 10px;
    font-size: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    &:focus {
        outline: none;
        border-color: #007bff;
    }
`;

const SendButton = styled.button`
    padding: 10px 20px;
    margin-left: 10px;
    background-color: #007bff;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
    &:hover {
        background-color: #0056b3;
    }
`;

const ChatBubble = styled.div<{ isOwnMessage: boolean }>`
    max-width: 70%;
    padding: 10px 15px;
    margin-bottom: 8px;
    border-radius: 15px;
    background-color: ${(props) => (props.isOwnMessage ? "#007bff" : "#e5e5ea")};
    color: ${(props) => (props.isOwnMessage ? "#fff" : "#000")};
    align-self: ${(props) => (props.isOwnMessage ? "flex-end" : "flex-start")};
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    cursor: pointer;
`;

const Timestamp = styled.div`
    font-size: 0.75rem;
    color: #666;
    margin-top: 2px;
    text-align: right;
`;

const MessageStatusIndicator = styled.span`
    font-size: 0.75rem;
    color: #007bff;
    margin-left: 8px;
`;

const TypingIndicatorContainer = styled.div`
    padding: 5px 10px;
    font-size: 0.9rem;
    color: #555;
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

const MarkAllReadButton = styled.button`
    margin: 10px;
    padding: 8px 16px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
`;

const ErrorMessage = styled.div`
    padding: 10px;
    background: #ffebee;
    color: #c62828;
    text-align: center;
    font-size: 0.9rem;
`;

// ChatRoom 컴포넌트
const ChatRoom: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const { user } = useAuth();
    const [messages, setMessages] = useState<ChatMessageItem[]>([]);
    const [input, setInput] = useState("");
    const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
    const [stompClient, setStompClient] = useState<Client | null>(null);
    // 에러 상태 추가
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const chatAreaRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    // 마지막 메시지 요소를 참조할 ref (IntersectionObserver용)
    const lastMessageRef = useRef<HTMLDivElement | null>(null);
    const heartbeatRef = useRef<NodeJS.Timeout | null>(null); // Heartbeat용 ref 추가
    // 컨텍스트 메뉴 및 모달 상태
    const [contextMenu, setContextMenu] = useState<{
        visible: boolean;
        x: number;
        y: number;
        message: ChatMessageItem | null;
    }>({ visible: false, x: 0, y: 0, message: null });
    const [showForwardModal, setShowForwardModal] = useState(false);
    const [targetRoomId, setTargetRoomId] = useState("");

    // 1) 초기 메시지 로드 및 STOMP 연결
    useEffect(() => {
        if (!roomId || !user) return;

        getChatMessages(roomId)
            .then((res) => setMessages(res.data))
            .catch((err) => console.error("메시지 로드 실패", err));

        const token = localStorage.getItem("accessToken");
        const socket = new SockJS(`http://localhost:8100/ws/chat?token=${token}`);
        const client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            debug: (msg) => console.log("[STOMP]", msg),
            onConnect: () => {
                console.log("WebSocket 연결됨");
                setConnectionError(null); // 연결 성공 시 에러 제거
                
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

                // 메시지 수신 구독
                client.subscribe(`/topic/messages/${roomId}`, (message: IMessage) => {
                    const msg: ChatMessageItem = JSON.parse(message.body);
                    setMessages((prev) => [...prev, msg]);

                    // 새 메시지 도착 시 페이지가 보이면 자동 읽음 처리
                    if (document.visibilityState === "visible") {
                        markAllMessagesAsRead(roomId, user!.id)
                            .then(() => console.log("새 메시지 자동 읽음 처리 완료"))
                            .catch((err) => console.error("자동 읽음 처리 실패", err));
                    }
                });

                // 타이핑 인디케이터 구독
                client.subscribe(`/topic/typing/${roomId}`, (message: IMessage) => {
                    const typingMsg: TypingIndicatorMessage = JSON.parse(message.body);
                    if (typingMsg.userId === user?.id) return;

                    setTypingUsers((prev) => {
                        const newSet = new Set(prev);
                        if (typingMsg.isTyping) newSet.add(typingMsg.userId);
                        else newSet.delete(typingMsg.userId);
                        return newSet;
                    });
                });
            },
            onDisconnect: () => {
                setConnectionError("WebSocket 연결이 끊겼습니다. 재접속 중..."); // 연결 끊김 시 에러 상태 설정
            },
            onStompError: (frame) => {
                setConnectionError("WebSocket 오류 발생: " + frame.body); // STOMP 오류 시 메시지 표시
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
    }, [roomId, user]);

    // 2) 메시지 목록 업데이트 시 자동 스크롤
    useEffect(() => {
        if (chatAreaRef.current) {
            chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
        }
    }, [messages]);

    // 3) 채팅방 진입 시 자동 "모두 읽음 처리" API 호출
    useEffect(() => {
        if (user && roomId) {
            markAllMessagesAsRead(roomId, user.id)
                .then(() => console.log("초기 모두 읽음 처리 완료"))
                .catch((err) => console.error("읽음 처리 실패", err));
        }
    }, [roomId, user]);

   // 4) Window focus 이벤트: 창이 포커스 될 때 자동 "모두 읽음 처리" 호출
    useEffect(() => {
        const handleFocus = () => {
            if (user && roomId) {
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
        if (!stompClient || !roomId || !user) return;
        const typingPayload: TypingIndicatorMessage = { roomId, userId: user.id, isTyping };
        stompClient.publish({
            destination: "/app/typing",
            body: JSON.stringify(typingPayload),
        });
    };

    // 입력값 변경 및 타이핑 디바운스 처리
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
        sendTypingIndicator(true);

        // redis에 TTL이 설정되어 만약 사용자가 활동(예: 입력, 스크롤)하면 TTL 갱신.
        if (!stompClient || !roomId || !user) return;
        stompClient.publish({
            destination: "/app/active",
            body: JSON.stringify({ userId: user.id, roomId, active: true })
        });

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            sendTypingIndicator(false);
        }, 2000);
    };

    // 메시지 전송
    const sendMessage = () => {
        if (!stompClient || input.trim() === "" || !roomId || !user) {
            console.error("전송 불가: 유효하지 않은 입력");
            return;
        }

        const chatMessage: ChatMessageItem = {
            id: "", // 서버에서 생성
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
            status: "SENT"
        };

        stompClient.publish({
            destination: "/app/chat",
            body: JSON.stringify(chatMessage),
        });

        setInput("");
        sendTypingIndicator(false);
    };

    // 우클릭: 컨텍스트 메뉴 표시 (메시지 전달 옵션)
    const handleContextMenu = (e: React.MouseEvent, message: ChatMessageItem) => {
        e.preventDefault();

        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            message,
        });
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

    const handleModalCancel = () => {
        setShowForwardModal(false);
        setTargetRoomId("");
    };

    return (
        <ChatContainer>
            {connectionError && <ErrorMessage>{connectionError}</ErrorMessage>} {/* 에러 메시지 표시 */}
            <ChatArea ref={chatAreaRef}>
                {messages.map((msg, idx) => {
                    const isOwn = msg.senderId === user?.id;
                    // 마지막 메시지에 ref 할당 (IntersectionObserver 용)
                    const refProp = idx === messages.length - 1 ? { ref: lastMessageRef } : {};
                return (
                    <div
                        key={idx}
                        {...refProp}
                        onContextMenu={(e) => handleContextMenu(e, msg)}
                        style={{ marginBottom: "10px", display: "flex", flexDirection: "column" }}
                    >
                        <ChatBubble isOwnMessage={isOwn}>
                            {msg.content.text}
                        </ChatBubble>
                        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                            {msg.createdAt && (
                                <Timestamp>{new Date(msg.createdAt).toLocaleTimeString()}</Timestamp>
                            )}
                            {isOwn && (
                                <MessageStatusIndicator>{msg.status}</MessageStatusIndicator>
                            )}
                        </div>
                    </div>
                );
                })}
                {typingUsers.size > 0 && (
                    <TypingIndicatorContainer>
                        {Array.from(typingUsers).join(", ")}님이 타이핑 중...
                    </TypingIndicatorContainer>
                )}
            </ChatArea>
            <ChatInputContainer>
                <Input
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    placeholder="메시지를 입력하세요"
                />
                <SendButton onClick={sendMessage}>전송</SendButton>
            </ChatInputContainer>
            <MarkAllReadButton onClick={() => { /* 디버그용 수동 호출 */ }}>
                모두 읽음 처리
            </MarkAllReadButton>
            {/* 컨텍스트 메뉴 */}
            {contextMenu.visible && (
                <ContextMenu style={{ top: contextMenu.y, left: contextMenu.x }}>
                    <ContextMenuItem onClick={handleForwardClick}>메시지 전달</ContextMenuItem>
                </ContextMenu>
            )}
            {/* 전달 모달 */}
            {showForwardModal && (
                <ModalOverlay>
                    <ModalContent>
                        <h3>메시지 전달</h3>
                        <p>전달할 대상 채팅방 ID를 입력하세요:</p>
                        <input
                            value={targetRoomId}
                            onChange={(e) => setTargetRoomId(e.target.value)}
                            placeholder="대상 채팅방 ID"
                        />
                        <ModalButtons>
                            <button onClick={handleModalSubmit}>전달</button>
                            <button onClick={handleModalCancel}>취소</button>
                        </ModalButtons>
                    </ModalContent>
                </ModalOverlay>
            )}
        </ChatContainer>
    );
};

export default ChatRoom;