import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getChatMessages, forwardMessage } from "../services/message";
import { markAllMessagesAsRead } from "../services/chatRoom";
import SockJS from "sockjs-client";
import { Client, IMessage } from "@stomp/stompjs";
import styled from "styled-components";
import { throttle } from "lodash";

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

// 전체 메시지 행: 채팅 말풍선과 시간/Indicator를 수평 배치 (보낸 사람에 따라 순서가 달라짐)
const MessageRow = styled.div<{ isOwnMessage: boolean }>`
    display: flex;
    align-items: flex-end;
    justify-content: ${({ isOwnMessage }) => (isOwnMessage ? "flex-end" : "flex-start")};
    margin-bottom: 10px;
`;

// 채팅 말풍선
const ChatBubble = styled.div.withConfig({
    shouldForwardProp: (prop) => prop !== "isOwnMessage"
})<{ isOwnMessage: boolean }>`
    max-width: 80%;
    padding: 8px 12px;
    border-radius: 16px;
    background: ${({ isOwnMessage }) =>
        isOwnMessage ? "linear-gradient(135deg, #007bff, #0056b3)" : "#e5e5ea"};
    color: ${({ isOwnMessage }) => (isOwnMessage ? "#fff" : "#000")};
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    font-size: 0.9rem;
    cursor: pointer;
    transition: transform 0.2s;
    &:hover {
        transform: translateY(-2px);
    }
`;

// 타임스탬프 및 Indicator를 담는 컨테이너  
// 내 메시지일 경우 오른쪽 정렬, 상대방일 경우 왼쪽 정렬
const TimeContainer = styled.div<{ isOwnMessage: boolean }>`
    font-size: 0.65rem;
    color: #999;
    margin: 0 4px;
    display: flex;
    flex-direction: column;
    align-items: ${({ isOwnMessage }) => (isOwnMessage ? "flex-end" : "flex-start")};
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
    const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; message: ChatMessageItem | null }>({ visible: false, x: 0, y: 0, message: null });
    const [showForwardModal, setShowForwardModal] = useState(false);
    const [targetRoomId, setTargetRoomId] = useState("");
    const [isConnected, setIsConnected] = useState(true);
    const [isComposing, setIsComposing] = useState(false);

    // 조합 시작 시
    const handleCompositionStart = () => {
        setIsComposing(true);
    };
    
    // 조합 종료 시
    const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
        setIsComposing(false);
        // 조합 종료 후 최종 값이 변경되었으므로 필요하면 handleInputChange 호출
        // (이미 onChange가 발생할 수 있으므로 선택 사항)
    };  

    // Enter 키 처리: 조합 중이면 무시하도록 함
    // 엔터로 채팅 입력 (Shift+Enter는 줄바꿈 허용, Enter만 치면 전송.)
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey && !isComposing) {
            e.preventDefault();
            sendMessage();
        }
    };

    // 최하단 스크롤
    const scrollToBottom = useCallback(() => {
        if (chatAreaRef.current) {
            chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
        }
    }, []);

    // 방 입장 시 모든 메시지 읽음 처리 (REST 호출)
    const markAllRead = useCallback(() => {
        if (roomId && user) {
            markAllMessagesAsRead(roomId, user.id)
                .then(() => {
                    console.log("모든 메시지 읽음처리 완료");
                    // 읽음 처리 후, 서버에서 최신 메시지를 다시 불러와서 상태를 업데이트합니다.
                    getChatMessages(roomId).then((res) => {
                        const sortedMessages = res.data.reverse();
                        setMessages(sortedMessages);
                    });
                })
                .catch((err) =>
                    console.error("모든 메시지 읽음처리 실패 ㅠㅠ REST API!!", err)
                );
        }
    }, [roomId, user]);

    // 여러 메시지 읽음 업데이트 처리 함수
    const updateBulkMessageReadStatus = (messageIds: string[], userId: string) => {
        setMessages((prev) =>
            prev.map((msg) =>
                messageIds.includes(msg.id)
                    ? { ...msg, readBy: { ...msg.readBy, [userId]: true } }
                    : msg
            )
        );
    };

    // 1) 초기 메시지 로드 및 STOMP 연결
    useEffect(() => {
        if (!roomId || !user) return;

        // 초기 메시지 로드 및 읽음 처리
        const fetchInitialMessages = async () => {
            try {
                const res = await getChatMessages(roomId!); // before 파라미터 없음 → 최신 20개 (내림차순)
                // 백엔드에서 내림차순으로 반환되므로 reverse하여 오름차순으로 정렬
                const sortedMessages = res.data.reverse();
                setMessages(sortedMessages);
                markAllRead();
                setTimeout(scrollToBottom, 0);
            } catch (err) {
                console.error("메시지 로드 실패", err);
            }
        };
        
        fetchInitialMessages();

        // STOMP 연결
        const token = localStorage.getItem("accessToken");
        console.log("Token:", token); // 토큰 값 확인
        const socket = new SockJS(`http://localhost:8100/ws/chat?token=${token}`);
        const client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            // 메시지 내용 디버깅이 필요하면 주석 해제
            // debug: (msg) => console.log("[STOMP]", msg),
            onConnect: () => {
                console.log("WebSocket 연결됨");
                setConnectionError(null); // 연결 성공 시 에러 제거
                setIsConnected(true);
                // fetchMessages();          // 연결 복구 시 최신 메시지 동기화
                
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
                    console.log("Received full message:", msg); // 전체 메시지 확인
                    
                    setMessages((prev) => {
                        if (prev.some(m => m.id === msg.id)) {
                            return prev.map(m => m.id === msg.id ? msg : m); // 읽음 상태 업데이트
                        }
                        const updatedMessages = [...prev, msg].slice(-20); // 최신 20개 유지
                        setTimeout(scrollToBottom, 0);
                        return updatedMessages;
                    });

                    // 새 메시지 도착 시 내가 읽으면 실시간 처리
                    if (document.visibilityState === "visible" && !msg.readBy[user!.id] && msg.senderId !== user!.id) {
                        client.publish({
                            destination: "/app/read",
                            body: JSON.stringify({ messageId: msg.id, userId: user!.id }),
                        });
                    }
                });

                // 타이핑 인디케이터 구독
                client.subscribe(`/topic/typing/${roomId}`, (message: IMessage) => {
                    const typingMsg: TypingIndicatorMessage = JSON.parse(message.body);
                    if (typingMsg.userId === user?.id) return;

                    console.log("Received typing message:", typingMsg);
                    setTypingUsers((prev) => {
                        const newUsers = typingMsg.isTyping
                            ? prev.includes(typingMsg.username || typingMsg.userId) ? prev : [...prev, typingMsg.username || typingMsg.userId]
                            : prev.filter(u => u !== (typingMsg.username || typingMsg.userId));

                        console.log("Updated typingUsers:", newUsers);
                        if (newUsers.length > 0) scrollToBottom();
                        return newUsers;
                    });
                });

                // 예를 들어, WebSocket에서 read update 이벤트를 수신할 때
                // WebSocket 구독 부분에 Bulk 이벤트 수신 추가
                client.subscribe(`/topic/read-bulk/${roomId}`, (message: IMessage) => {
                    const { messageIds, userId } = JSON.parse(message.body);
                    updateBulkMessageReadStatus(messageIds, userId);
                });
            },
            onDisconnect: () => {
                setConnectionError("연결 끊김, 재접속 시도 중...");
                setIsConnected(false);
            },
            onStompError: (frame) => {
                setConnectionError("연결 오류, 재접속 시도 중...");
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
            if (heartbeatRef.current) clearInterval(heartbeatRef.current);
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [roomId, user, scrollToBottom, markAllRead]);
    

    // 이전 메시지 조회
    const fetchPreviousMessages = useCallback(async (lastId: string) => {
        try {
            // before 파라미터를 넘겨 API 호출 (내림차순으로 20개)
            const res = await getChatMessages(roomId!, lastId);
            if (res.data.length === 0) return; // 더 이상 데이터 없음
        
            // 받은 데이터를 reverse()하여 오름차순 정렬
            const previousMessages = res.data.reverse();
            
            // 스크롤 보정: 추가되기 전 스크롤 높이를 기억하고, prepend 후 차이만큼 스크롤 위치 보정
            const currentScrollHeight = chatAreaRef.current?.scrollHeight || 0;
            setMessages((prev) => [...previousMessages, ...prev]);
            setTimeout(() => {
            if (chatAreaRef.current) {
                const newScrollHeight = chatAreaRef.current.scrollHeight;
                chatAreaRef.current.scrollTop = newScrollHeight - currentScrollHeight;
            }
            }, 0);
        } catch (err) {
            console.error("이전 메시지 로드 실패", err);
        }
    }, [roomId]);

    // 2. 스크롤 이벤트 핸들러 (페이징)
    const handleScroll = useCallback(() => {
        if (!chatAreaRef.current) return;

        // ObjectId 기반 페이징 조회
        if (chatAreaRef.current.scrollTop < 50 && messages.length > 0) {
            const oldestMessage = messages[0];
            fetchPreviousMessages(oldestMessage.id);
        }
    }, [messages, fetchPreviousMessages]);

    // 3. ChatArea에 스크롤 이벤트 리스너 추가 (스크롤 이벤트가 너무 빈번하게 발생하는 것을 막기 위해 debounce나 throttle을 사용해 호출 빈도를 제한합니다.)
    useEffect(() => {
        const chatArea = chatAreaRef.current;
        if (!chatArea) return;
        
        const throttledHandleScroll = throttle(handleScroll, 500); // 500ms 간격으로 실행
        chatArea.addEventListener("scroll", throttledHandleScroll);
        return () => chatArea.removeEventListener("scroll", throttledHandleScroll);
    }, [handleScroll]);

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
            if (user && roomId && isConnected) {
                markAllRead();
            }
        };
        window.addEventListener("focus", handleFocus);
        return () => window.removeEventListener("focus", handleFocus);
    }, [roomId, user, isConnected, markAllRead]);

    // 타이핑 인디케이터 전송
    const sendTypingIndicator = (isTyping: boolean) => {
        if (!stompClient || !roomId || !user || !stompClient.connected) return;
        const typingPayload: TypingIndicatorMessage = { 
            roomId,
            userId: user.id,
            username: user.name || "Unknown",
            isTyping 
        };
        stompClient.publish({
            destination: "/app/typing",
            body: JSON.stringify(typingPayload),
        });
    };

    // 입력값 변경 및 타이핑 디바운스 처리
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInput(value);

        if (!stompClient || !roomId || !user || !stompClient.connected) return;

        // 입력값이 비어있으면 즉시 타이핑 인디케이터 끄기
        if (value.trim() === "") {
            sendTypingIndicator(false);
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = null;
            }
        }
    
        // 입력 중일 때는 타이핑 인디케이터 켜기
        sendTypingIndicator(true);

        // 활성 여부를 알림 (타이핑 아님)
        stompClient.publish({
            destination: "/app/active",
            body: JSON.stringify({ userId: user.id, roomId, active: true }),
        });

        // 기존 타이머 제거 후, 1초 후에 타이핑 인디케이터 끄기
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            sendTypingIndicator(false);
            typingTimeoutRef.current = null;
        }, 1000);
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
            // createdAt은 백엔드에서 설정하도록 제거
            status: "SENT",
            readBy: { [user.id]: true }
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

    // 오전/오후 및 12시간제 시:분 포맷팅 함수
    const formatTime = (dateString: string): string => {
        const date = new Date(dateString);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const period = hours < 12 ? "오전" : "오후";
        const hour12 = hours % 12 === 0 ? 12 : hours % 12;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        return `${period} ${hour12}:${formattedMinutes}`;
    };

    return (
        <ChatWrapper>
            <ChatContainer>
                <Header>
                    <BackButton onClick={() => navigate("/")}>←</BackButton>
                    <HeaderTitle>채팅방</HeaderTitle>
                </Header>
                {connectionError && <ErrorMessage>{connectionError}</ErrorMessage>}
                <ChatArea ref={chatAreaRef}>
                    {messages.map((msg, idx) => {
                        const isOwn = msg.senderId === user?.id;
                        
                        // 현재 메시지와 다음 메시지의 시간(분 단위) 계산
                        const currentTime = msg.createdAt ? formatTime(msg.createdAt) : "";
                        const nextMessage = messages[idx + 1];
                        const nextTime = nextMessage && nextMessage.createdAt ? formatTime(nextMessage.createdAt) : "";
                        // 그룹의 마지막 메시지이면 showTime은 true
                        const showTime = !nextMessage || currentTime !== nextTime;
                    
                        // 내 메시지의 Indicator ("1")는 unread 조건에 따라 항상 표시
                        const unreadByOpponent = isOwn && Object.entries(msg.readBy).some(
                        ([id, read]) => id !== user?.id && !read
                        );
                        const allOthersRead = isOwn && Object.entries(msg.readBy)
                        .filter(([id]) => id !== user?.id)
                        .every(([, read]) => read);
                        const indicatorText = (isOwn && !allOthersRead && unreadByOpponent) ? "1" : "";
                    
                        return (
                        <MessageRow key={idx} isOwnMessage={isOwn}>
                            {isOwn ? (
                            <>
                                {/* 내 메시지: Indicator와 시간이 왼쪽, 말풍선 오른쪽 */}
                                <TimeContainer isOwnMessage={true}>
                                {indicatorText && <div>{indicatorText}</div>}
                                {showTime && <div>{currentTime}</div>}
                                </TimeContainer>
                                <ChatBubble isOwnMessage={isOwn} onContextMenu={(e) => handleContextMenu(e, msg)}>
                                <div>{msg.content.text}</div>
                                </ChatBubble>
                            </>
                            ) : (
                            <>
                                {/* 상대 메시지: 말풍선 왼쪽, 시간 오른쪽 (Indicator 없음) */}
                                <ChatBubble isOwnMessage={isOwn} onContextMenu={(e) => handleContextMenu(e, msg)}>
                                <div>{msg.content.text}</div>
                                </ChatBubble>
                                <TimeContainer isOwnMessage={false}>
                                {showTime && <div>{currentTime}</div>}
                                </TimeContainer>
                            </>
                            )}
                        </MessageRow>
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
                        onKeyDown={handleKeyDown}
                        onCompositionStart={handleCompositionStart}
                        onCompositionEnd={handleCompositionEnd}
                        onBlur={() => {
                            sendTypingIndicator(false);
                            if (typingTimeoutRef.current) {
                                clearTimeout(typingTimeoutRef.current);
                                typingTimeoutRef.current = null;
                            }
                        }}
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