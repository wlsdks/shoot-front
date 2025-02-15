import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getChatMessages } from "../services/message";
import SockJS from "sockjs-client";
import { Client, IMessage } from "@stomp/stompjs";
import styled from "styled-components";

// 채팅 메시지 항목
export interface ChatMessageItem {
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
}

// 타이핑 인디케이터 메시지 인터페이스
interface TypingIndicatorMessage {
    roomId: string;
    userId: string;
    isTyping: boolean;
}

// 채팅방 레이아웃 구성
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
`;

const Timestamp = styled.div`
    font-size: 0.75rem;
    color: #666;
    margin-top: 2px;
    text-align: right;
`;

const TypingIndicatorContainer = styled.div`
    padding: 5px 10px;
    font-size: 0.9rem;
    color: #555;
`;

const ChatRoom: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const { user } = useAuth();
    const [messages, setMessages] = useState<ChatMessageItem[]>([]);
    const [input, setInput] = useState("");
    const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
    const [stompClient, setStompClient] = useState<Client | null>(null);
    const chatAreaRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // 1) 초기 메시지 로드 및 STOMP 소켓 연결
    useEffect(() => {
        if (!roomId) return;

        // 1-1) REST API로 기존 메시지 로드
        getChatMessages(roomId)
            .then((res) => setMessages(res.data))
            .catch((err) => console.error("메시지 로드 실패", err));

        // 1-2) SockJS + STOMP 연결 (JWT 토큰 사용)
        const token = localStorage.getItem("accessToken");
        const socket = new SockJS(`http://localhost:8100/ws/chat?token=${token}`);
        const client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            debug: (msg) => console.log("[STOMP]", msg),
            onConnect: () => {
                console.log("WebSocket 연결됨");

                // 메시지 수신 구독
                client.subscribe(`/topic/messages/${roomId}`, (message: IMessage) => {
                    const msg: ChatMessageItem = JSON.parse(message.body);
                    setMessages((prev) => [...prev, msg]);
                });

                // 타이핑 인디케이터 구독
                client.subscribe(`/topic/typing/${roomId}`, (message: IMessage) => {
                    const typingMsg: TypingIndicatorMessage = JSON.parse(message.body);
                    // 자신의 타이핑 이벤트는 무시
                    if (typingMsg.userId === user?.id) return;
        
                    setTypingUsers((prev) => {
                    const newSet = new Set(prev);
                    if (typingMsg.isTyping) {
                        newSet.add(typingMsg.userId);
                    } else {
                        newSet.delete(typingMsg.userId);
                    }
                    return newSet;
                    });
                });
            },
        });
        client.activate();
        setStompClient(client);

        // 컴포넌트 언마운트 시 STOMP 연결 해제
        return () => {
            client.deactivate();
        };
    }, [roomId, user]);


    // 2) 메시지 목록이 업데이트될 때마다 자동 스크롤 (맨 하단)
    useEffect(() => {
        if (chatAreaRef.current) {
            chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
        }
    }, [messages]);

    // 타이핑 인디케이터 전송 함수
    const sendTypingIndicator = (isTyping: boolean) => {
        if (!stompClient || !roomId || !user) return;

        const typingPayload: TypingIndicatorMessage = {
            roomId,
            userId: user.id,
            isTyping,
        };

        stompClient.publish({
            destination: "/app/typing",
            body: JSON.stringify(typingPayload),
        });
    };

    // 입력값 변경 시 타이핑 상태 전송 및 타이머 설정
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
        // 사용자가 입력 시작하면 타이핑 시작 전송
        sendTypingIndicator(true);

        // 이전 타이머가 있다면 초기화
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // 2초 동안 입력이 없으면 타이핑 종료 전송
        typingTimeoutRef.current = setTimeout(() => {
            sendTypingIndicator(false);
        }, 2000);
    };

    // 3) 메시지 전송 함수
    const sendMessage = () => {
        if (!stompClient || input.trim() === "" || !roomId || !user) {
            console.error("전송 불가: 사용자 정보 또는 입력 값이 유효하지 않습니다.");
            return;
        }

        const chatMessage: ChatMessageItem = {
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
        };

        stompClient.publish({
            destination: "/app/chat",
            body: JSON.stringify(chatMessage),
        });

        setInput("");
        // 메시지 전송 시 타이핑 종료 전송
        sendTypingIndicator(false);
    };

    return (
        <ChatContainer>
            <ChatArea ref={chatAreaRef}>
                {messages.map((msg, idx) => {
                    const isOwn = msg.senderId === user?.id;
                    return (
                        <div
                            key={idx}
                            style={{
                                marginBottom: "10px",
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            <ChatBubble isOwnMessage={isOwn}>
                                {msg.content.text}
                            </ChatBubble>
                            {msg.createdAt && (
                                <Timestamp>
                                {new Date(msg.createdAt).toLocaleTimeString()}
                                </Timestamp>
                            )}
                        </div>
                    );
                })}
                {/* 타이핑 인디케이터 UI */}
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
        </ChatContainer>
    );
};

export default ChatRoom;