import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getChatMessages, forwardMessage } from "../services/message";
import { markAllMessagesAsRead } from "../services/chatRoom";
import SockJS from "sockjs-client";
import { Client, IMessage } from "@stomp/stompjs";
import styled, { keyframes } from "styled-components";
import { throttle } from "lodash";

// 채팅 메시지 인터페이스
export interface ChatMessageItem {
    id: string;      // 메시지 식별자 (서버에서 생성)
    tempId?: string; // 추가: 임시 ID (상태 추적용)
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
    status: string; // "SAVED", "PROCESSED", "sending", "FAILED" 등
    readBy: { [userId: string]: boolean }; // 읽음 상태 추가
}

// 타이핑 인디케이터 메시지 인터페이스
interface TypingIndicatorMessage {
    roomId: string;
    userId: string;
    username: string;
    isTyping: boolean;
}

// 애니메이션 정의
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
`;

const bounce = keyframes`
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-3px); }
`;

// ============= 스타일 컴포넌트 정의 =============

// 채팅 컨테이너
const ChatWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 60px);
    padding-top: 60px;
    background-color: #f5f7fa;
    overflow: hidden;
`;

const ChatContainer = styled.div`
    width: 375px;
    height: 667px;
    background-color: #fff;
    border-radius: 20px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    border: 1px solid rgba(0, 0, 0, 0.05);
`;

// 헤더 스타일
const Header = styled.div`
    padding: 14px 16px;
    background: #fff;
    border-bottom: 1px solid #eee;
    display: flex;
    align-items: center;
    z-index: 10;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
`;

const BackButton = styled.button`
    background: #f0f7ff;
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    cursor: pointer;
    color: #007bff;
    margin-right: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    
    &:hover {
        background: #e1ecff;
        transform: translateX(-2px);
    }
`;

const HeaderTitle = styled.h2`
    font-size: 1.1rem;
    margin: 0;
    color: #333;
    font-weight: 600;
    flex: 1;
`;

// 채팅 영역 스타일
const ChatArea = styled.div`
    flex: 1;
    padding: 16px;
    background: #f8f9fa;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #ddd transparent;
    
    &::-webkit-scrollbar {
        width: 5px;
    }
    
    &::-webkit-scrollbar-thumb {
        background: #ddd;
        border-radius: 3px;
    }
    
    &::-webkit-scrollbar-track {
        background: transparent;
    }
`;

// 메시지 행: 채팅 말풍선과 시간/Indicator를 수평 배치
const MessageRow = styled.div<{ $isOwnMessage: boolean }>`
    display: flex;
    align-items: flex-end;
    justify-content: ${({ $isOwnMessage }) => ($isOwnMessage ? "flex-end" : "flex-start")};
    margin-bottom: 10px;
    animation: ${fadeIn} 0.3s ease-out;
`;

// 채팅 말풍선
const ChatBubble = styled.div<{ $isOwnMessage: boolean }>`
    max-width: 100%;
    padding: 10px 14px;
    border-radius: 18px;
    background: ${({ $isOwnMessage }) =>
        $isOwnMessage 
        ? "linear-gradient(135deg, #007bff, #0056b3)" 
        : "#ffffff"};
    color: ${({ $isOwnMessage }) => ($isOwnMessage ? "#fff" : "#333")};
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    font-size: 0.95rem;
    border: ${({ $isOwnMessage }) => $isOwnMessage ? "none" : "1px solid #eee"};
    cursor: pointer;
    transition: all 0.2s;
    word-break: break-word;
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
    }
`;

// 시간 및 상태 컨테이너
const TimeContainer = styled.div<{ $isOwnMessage: boolean }>`
    font-size: 0.7rem;
    color: #999;
    margin: 0 6px;
    display: flex;
    flex-direction: column;
    align-items: ${({ $isOwnMessage }) => ($isOwnMessage ? "flex-end" : "flex-start")};
`;

// 타이핑 인디케이터
const TypingIndicatorContainer = styled.div`
    padding: 8px 12px;
    font-size: 0.85rem;
    color: #666;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 18px;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    max-width: 75%;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const TypingDots = styled.div`
    display: flex;
    margin-left: 8px;
    
    span {
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background-color: #aaa;
        margin: 0 2px;
        animation: ${bounce} 1s infinite;
        
        &:nth-child(2) {
            animation-delay: 0.2s;
        }
        
        &:nth-child(3) {
            animation-delay: 0.4s;
        }
    }
`;

// 입력 영역
const ChatInputContainer = styled.div`
    display: flex;
    padding: 12px 16px;
    background: #fff;
    border-top: 1px solid #eee;
    z-index: 10;
`;

const Input = styled.input`
    flex: 1;
    padding: 12px 16px;
    font-size: 0.95rem;
    border: none;
    border-radius: 20px;
    background: #f0f2f5;
    
    &:focus {
        outline: none;
        background: #e8eaed;
        box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.2);
    }
    
    &::placeholder {
        color: #aaa;
    }
`;

const SendButton = styled.button`
    padding: 0;
    width: 40px;
    height: 40px;
    margin-left: 8px;
    background: linear-gradient(135deg, #007bff, #0056b3);
    color: #fff;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
        transform: scale(1.05);
        box-shadow: 0 2px 5px rgba(0, 123, 255, 0.4);
    }
    
    &:disabled {
        background: #ccc;
        cursor: not-allowed;
    }
`;

const ErrorMessage = styled.div`
    padding: 10px;
    background: #ffebee;
    color: #c62828;
    text-align: center;
    font-size: 0.9rem;
    border-radius: 10px;
    margin: 8px 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    
    svg {
        margin-right: 6px;
    }
`;

const ContextMenu = styled.div`
    position: absolute;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    overflow: hidden;
    border: 1px solid #eee;
`;

const ContextMenuItem = styled.div`
    padding: 10px 14px;
    cursor: pointer;
    transition: background 0.2s;
    display: flex;
    align-items: center;
    
    svg {
        margin-right: 8px;
        color: #666;
    }
    
    &:hover {
        background: #f5f9ff;
    }
`;

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1001;
`;

const ModalContent = styled.div`
    background: white;
    padding: 20px;
    border-radius: 10px;
    min-width: 300px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    
    h3 {
        margin-top: 0;
        color: #333;
    }
    
    input {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 6px;
        margin: 10px 0;
        font-size: 0.95rem;
        
        &:focus {
            outline: none;
            border-color: #007bff;
        }
    }
`;

const ModalButtons = styled.div`
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    
    button {
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 0.95rem;
        cursor: pointer;
        transition: all 0.2s;
        
        &:first-child {
            background: #f0f0f0;
            border: none;
            color: #333;
            
            &:hover {
                background: #e0e0e0;
            }
        }
        
        &:last-child {
            background: #007bff;
            border: none;
            color: white;
            
            &:hover {
                background: #0056b3;
            }
        }
    }
`;

// ============= 아이콘 컴포넌트 =============
const BackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
);

const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
);

const ForwardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="17 8 22 12 17 16"></polyline>
        <line x1="4" y1="12" x2="22" y2="12"></line>
    </svg>
);

const ErrorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
);

// ============= ChatRoom 컴포넌트 =============
const ChatRoom: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const { user } = useAuth();
    const [messages, setMessages] = useState<ChatMessageItem[]>([]);
    const [input, setInput] = useState("");
    const [typingUsers, setTypingUsers] = useState<string[]>([]);
    const [stompClient, setStompClient] = useState<Client | null>(null);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [showForwardModal, setShowForwardModal] = useState(false);
    const [targetRoomId, setTargetRoomId] = useState("");
    const [isConnected, setIsConnected] = useState(true);
    const [isComposing, setIsComposing] = useState(false);
    const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; message: ChatMessageItem | null }>({ visible: false, x: 0, y: 0, message: null });
    const navigate = useNavigate();
    const chatAreaRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const messagesRef = useRef<ChatMessageItem[]>([]);

    // 메시지 상태 추적
    const [messageStatuses, setMessageStatuses] = useState<{
        [tempId: string]: { status: string; persistedId: string | null }
    }>({});

    // 최신 메시지를 유지하기 위함
    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    // 스크롤 하단 이동
    const scrollToBottom = useCallback(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    // 조합 시작 시
    const handleCompositionStart = () => {
        setIsComposing(true);
    };
    
    // 조합 종료 시
    const handleCompositionEnd = () => {
        setIsComposing(false);
    };

    // Enter 키 처리
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey && !isComposing) {
            e.preventDefault();
            sendMessage();
        }
    };

    // 읽음 처리를 위한 세션 ID
    const [sessionId] = useState<string>(() => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);
    const lastReadTimeRef = useRef<number>(0);

    // 모든 메시지 읽음 처리 (API refresh 호출 제거)
    const markAllRead = useCallback(() => {
        if (!roomId || !user) return;
        const now = Date.now();
        if (now - lastReadTimeRef.current < 2000) {
            return;
        }
        lastReadTimeRef.current = now;
        markAllMessagesAsRead(roomId, user.id, sessionId)
            .catch((err) => console.error("모든 메시지 읽음처리 실패", err));
        // 이제 백엔드의 동기화(sync) 응답을 통해 누락 메시지가 자동 반영됨
    }, [roomId, user, sessionId]);

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

    // 뒤로가기 클릭시 동작
    const handleBack = () => {
        navigate("/", { state: { refresh: true } });
    };

    // 초기 메시지 로드 및 STOMP 연결
    useEffect(() => {
        if (!roomId || !user) return;

        // 초기 메시지 로드 (최초 접속 시 API 호출)
        const fetchInitialMessages = async () => {
            try {
                const res = await getChatMessages(roomId);
                const sortedMessages = res.data.reverse();
                setMessages(sortedMessages);
                // 최초 로드 후, 읽음 처리만 수행 (이후 동기화로 업데이트)
                markAllRead();
                // 메시지 설정 직후 즉시 스크롤 다운
                requestAnimationFrame(() => {
                    if (chatAreaRef.current) {
                        chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
                    }
                });
            } catch (err) {
                console.error("메시지 로드 실패", err);
            }
        };

        fetchInitialMessages();

        // STOMP 연결
        const token = localStorage.getItem("accessToken");
        const socket = new SockJS(`http://localhost:8100/ws/chat?token=${token}`);
        const client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            onConnect: () => {
                console.log("WebSocket 연결됨");
                setConnectionError(null);
                setIsConnected(true);

                // 활성 상태 전송
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
                }, 30000);

                // 메시지 수신 구독 (실시간 신규 메시지 처리)
                client.subscribe(`/topic/messages/${roomId}`, (message: IMessage) => {
                    const msg: ChatMessageItem = JSON.parse(message.body);
                    setMessages((prev) => {
                        if (prev.some(m => m.id === msg.id)) {
                            return prev.map(m => m.id === msg.id ? msg : m);
                        }
                        const updatedMessages = [...prev, msg].slice(-50);
                        // 내가 보낸 메시지가 아니고 새 메시지일 때만 스크롤
                        if (msg.senderId !== user!.id) {
                            setTimeout(() => scrollToBottom(), 0);
                        }
                        return updatedMessages;
                    });

                    // 새 메시지 도착 시 내가 읽으면 실시간 처리
                    const persistedId = msg.tempId ? messageStatuses[msg.tempId]?.persistedId : null;
                    if (
                        document.visibilityState === "visible" &&
                        !msg.readBy[user!.id] &&
                        msg.senderId !== user!.id &&
                        persistedId 
                    ) {
                        client.publish({
                            destination: "/app/read",
                            body: JSON.stringify({ messageId: persistedId, userId: user!.id }),
                        });
                    }
                });

                // 타이핑 인디케이터 구독
                client.subscribe(`/topic/typing/${roomId}`, (message: IMessage) => {
                    const typingMsg: TypingIndicatorMessage = JSON.parse(message.body);
                    if (typingMsg.userId === user?.id) return;
                    setTypingUsers((prev) => {
                        const newUsers = typingMsg.isTyping
                            ? prev.includes(typingMsg.username || typingMsg.userId)
                                ? prev 
                                : [...prev, typingMsg.username || typingMsg.userId]
                            : prev.filter(u => u !== (typingMsg.username || typingMsg.userId));
                        if (newUsers.length > 0) scrollToBottom();
                        return newUsers;
                    });
                });

                // 메시지 상태 채널 구독
                client.subscribe(`/topic/message/status/${roomId}`, (message: IMessage) => {
                    const statusUpdate = JSON.parse(message.body);
                    setMessageStatuses((prev) => ({
                        ...prev,
                        [statusUpdate.tempId]: {
                            status: statusUpdate.status,
                            persistedId: statusUpdate.persistedId
                        }
                    }));
                    setMessages((prev) =>
                        prev.map((msg) =>
                            msg.tempId === statusUpdate.tempId
                                ? {
                                    ...msg,
                                    status: statusUpdate.status,
                                    id: statusUpdate.persistedId || msg.id,
                                    createdAt: statusUpdate.createdAt || (statusUpdate.status === "SAVED" ? new Date().toISOString() : msg.createdAt)
                                }
                                : msg
                        )
                    );
                    if (statusUpdate.status === "SAVED" && statusUpdate.persistedId) {
                        const currentMsg = messagesRef.current.find(m => m.tempId === statusUpdate.tempId);
                        if (currentMsg && !currentMsg.readBy[user!.id] && currentMsg.senderId !== user!.id) {
                            client.publish({
                                destination: "/app/read",
                                body: JSON.stringify({ messageId: statusUpdate.persistedId, userId: user!.id }),
                            });
                        }
                    }
                    if (statusUpdate.status === 'failed') {
                        setConnectionError(`메시지 저장 실패: ${statusUpdate.errorMessage || '알 수 없는 오류'}`);
                        setTimeout(() => setConnectionError(null), 3000);
                    }
                });

                // 읽음 처리 상태 구독
                client.subscribe(`/topic/read-bulk/${roomId}`, (message: IMessage) => {
                    const { messageIds, userId } = JSON.parse(message.body);
                    updateBulkMessageReadStatus(messageIds, userId);
                });

                // << 동기화 구독 추가 >>
                // 재연결 시 백엔드에서 누락 메시지를 sync 응답으로 보내면, 기존 메시지와 병합하여 업데이트함
                client.subscribe(`/user/queue/sync`, (message: IMessage) => {
                    const syncResponse = JSON.parse(message.body);
                    setMessages((prevMessages) => {
                        const syncMessages: ChatMessageItem[] = syncResponse.messages;
                        const messageMap = new Map<string, ChatMessageItem>();
                        prevMessages.forEach((msg) => {
                            messageMap.set(msg.id, msg);
                        });
                        syncMessages.forEach((msg) => {
                            messageMap.set(msg.id, msg);
                        });
                        const merged = Array.from(messageMap.values());
                        merged.sort((a, b) =>
                            new Date(a.createdAt || "").getTime() - new Date(b.createdAt || "").getTime()
                        );
                        return merged;
                    });
                });

            },
            onDisconnect: () => {
                setConnectionError("연결 끊김, 재접속 시도 중...");
                setIsConnected(false);
            },
            onStompError: () => {
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
        // eslint-disable-next-line
    }, [roomId, user, scrollToBottom, markAllRead]);

    // 이전 메시지 조회 (페이징)
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

    // 스크롤 이벤트 핸들러 (페이징)
    useEffect(() => {
        const chatArea = chatAreaRef.current;
        if (!chatArea) return;
        
        const throttledHandleScroll = throttle(() => {
            if (chatArea.scrollTop < 50 && messages.length > 0) {
                const oldestMessage = messages[0];
                fetchPreviousMessages(oldestMessage.id);
            }
        }, 500);
        chatArea.addEventListener("scroll", throttledHandleScroll);
        return () => chatArea.removeEventListener("scroll", throttledHandleScroll);
    }, [messages, fetchPreviousMessages]);

    // 타이핑 상태에 따른 스크롤 조정
    useEffect(() => {
        if (typingUsers.length > 0) {
            scrollToBottom();
        }
    }, [typingUsers, scrollToBottom]);

    // Window focus 이벤트: 창이 포커스 될 때 읽음 처리 (이전 API 새로고침 호출 제거됨)
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
            username: user.username || "Unknown",
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
            return;
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
        // tempId 생성      
        const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
        // 메시지 세팅
        const chatMessage: ChatMessageItem = {
            id: tempId, // 임시 ID 사용
            tempId: tempId, // tempId 속성 추가
            roomId,
            senderId: user.id,
            content: {
                text: input,
                type: "TEXT",
                attachments: [],
                isEdited: false,
                isDeleted: false,
            },
            status: "sending", // 초기 상태는 sending
            readBy: { [user.id]: true }
        };
        // 상태 추적을 위해 messageStatuses에 추가
        setMessageStatuses((prev) => ({
            ...prev,
            [tempId]: { status: "sending", persistedId: null }
        }));
        // 메시지를 로컬 상태에 먼저 추가 (UI에 즉시 반영)
        setMessages((prev) => {
            const updatedMessages = [...prev, chatMessage];
            setTimeout(() => scrollToBottom(), 0);
            return updatedMessages;
        });
        // 실제 전송
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
                    <BackButton onClick={handleBack}>
                        <BackIcon />
                    </BackButton>
                    <HeaderTitle>채팅방</HeaderTitle>
                </Header>
                {connectionError && 
                    <ErrorMessage>
                        <ErrorIcon />{connectionError}
                    </ErrorMessage>
                }
                <ChatArea ref={chatAreaRef}>
                    {messages.map((msg, idx) => {
                        // 내 메시지인가?
                        const isOwn = msg.senderId === user?.id;
                        // 우선, 웹소켓 업데이트 상태가 있다면 사용, 없으면 API의 상태 사용
                        const currentStatus = msg.tempId
                            ? messageStatuses[msg.tempId]?.status || msg.status
                            : msg.status;
                        // 저장된 상태로 간주
                        const isPersisted = currentStatus && currentStatus.toUpperCase() === "SAVED";
                        // 내 메시지의 경우, 참여자가 읽은 항목이 있는지 확인
                        const otherHasRead = Object.entries(msg.readBy)
                            .filter(([id]) => id !== user?.id)
                            .some(([, read]) => read === true);
                        // indicatorText: 읽지 않았으면 "1" 
                        const indicatorText = isOwn && isPersisted && !otherHasRead ? "1" : "";
                        // 상태표시
                        const statusIndicator = isOwn && currentStatus && !isPersisted ? (
                            <div className="status-indicator">
                                {currentStatus === "sending" && "전송 중..."}
                                {currentStatus === "SENT_TO_KAFKA" && "서버로 전송됨"}
                                {currentStatus === "FAILED" && "전송 실패"}
                            </div>
                        ) : null;
                        // 시간 표시 여부
                        const nextMessage = messages[idx + 1];
                        const showTime = !nextMessage || (msg.createdAt && nextMessage.createdAt && 
                                        formatTime(msg.createdAt) !== formatTime(nextMessage.createdAt));
                        const currentTime = msg.createdAt ? formatTime(msg.createdAt) : "";
                    
                        return (
                            <MessageRow key={idx} $isOwnMessage={isOwn}>
                                {isOwn ? (
                                    <>
                                        <TimeContainer $isOwnMessage={true}>
                                            {statusIndicator}
                                            {indicatorText && <div>{indicatorText}</div>}
                                            {showTime && <div>{currentTime}</div>}
                                        </TimeContainer>
                                        <ChatBubble $isOwnMessage={isOwn} onContextMenu={(e) => handleContextMenu(e, msg)}>
                                            <div>{msg.content.text}</div>
                                        </ChatBubble>
                                    </>
                                ) : (
                                    <>
                                        <ChatBubble $isOwnMessage={isOwn} onContextMenu={(e) => handleContextMenu(e, msg)}>
                                            <div>{msg.content.text}</div>
                                        </ChatBubble>
                                        <TimeContainer $isOwnMessage={false}>
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
                            <TypingDots>
                                <span></span>
                                <span></span>
                                <span></span>
                            </TypingDots>
                        </TypingIndicatorContainer>
                    )}
                    <div ref={bottomRef} />
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
                    <SendButton onClick={sendMessage} disabled={!isConnected}>
                        <SendIcon />
                    </SendButton>
                </ChatInputContainer>
                {contextMenu.visible && (
                    <ContextMenu style={{ top: contextMenu.y, left: contextMenu.x }}>
                        <ContextMenuItem onClick={handleForwardClick}>
                            <ForwardIcon /> 메시지 전달
                        </ContextMenuItem>
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