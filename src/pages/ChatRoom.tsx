// 특정 채팅방 페이지 (메시지 목록, 입력창 포함)
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getChatMessages } from '../services/api';
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';
import styled from 'styled-components';

// 채팅 메시지 내용 형식
export interface MessageContent {
    text: string;
    type: string;
    attachments: any[];
    isEdited: boolean;
    isDeleted: boolean;
}

// 채팅 메시지 항목
export interface ChatMessageItem {
    roomId: string;
    senderId: string;
    content: MessageContent;
    createdAt?: string;
}

// 전체 채팅방 페이지 컨테이너 (고정 높이 & 중앙 정렬)
const ChatContainer = styled.div`
    max-width: 500px;
    margin: 20px auto;
    display: flex;
    flex-direction: column;
    height: calc(100vh - 100px);
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
    background: #fff;
`;

// 채팅 메시지 영역 (내부 스크롤)
const ChatArea = styled.div`
    flex: 1;
    padding: 20px;
    background: #f8f8f8;
    overflow-y: auto;
`;

// 채팅 입력 및 전송 영역
const ChatInputContainer = styled.div`
    display: flex;
    padding: 10px;
    border-top: 1px solid #ddd;
    background: #fff;
`;

// 채팅 입력 필드
const Input = styled.input`
    flex: 1;
    padding: 10px;
    font-size: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
    &:focus {
        outline: none;
        border-color: #007bff;
    }
`;

// 전송 버튼
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

// 메시지 버블: 내가 보낸 메시지 vs. 상대방 메시지
interface ChatBubbleProps {
    isOwnMessage: boolean;
}

const ChatBubble = styled.div<ChatBubbleProps>`
    max-width: 70%;
    padding: 10px 15px;
    margin-bottom: 8px;
    border-radius: 15px;
    background-color: ${(props) => (props.isOwnMessage ? '#007bff' : '#e5e5ea')};
    color: ${(props) => (props.isOwnMessage ? '#fff' : '#000')};
    align-self: ${(props) => (props.isOwnMessage ? 'flex-end' : 'flex-start')};
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

// 메시지 타임스탬프 (버블 아래)
const Timestamp = styled.div`
    font-size: 0.75rem;
    color: #666;
    margin-top: 2px;
    text-align: right;
`;

const ChatRoom: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const { user } = useAuth();
    const [messages, setMessages] = useState<ChatMessageItem[]>([]);
    const [input, setInput] = useState('');
    const [stompClient, setStompClient] = useState<Client | null>(null);
    const chatAreaRef = useRef<HTMLDivElement>(null);

    // 1) 초기 메시지 로드 및 STOMP 소켓 연결
    useEffect(() => {
        if (!roomId) return;

        // 1-1) REST API로 기존 메시지 로드
        getChatMessages(roomId)
        .then((res) => setMessages(res.data))
        .catch((err) => console.error('메시지 로드 실패', err));

        // 1-2) SockJS + STOMP 연결 (JWT 토큰 사용)
        const token = localStorage.getItem('accessToken');
        const socket = new SockJS(`http://localhost:8100/ws/chat?token=${token}`);
        const client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            debug: (msg) => console.log('[STOMP]', msg),
            onConnect: () => {
                console.log('WebSocket 연결됨');
                // 특정 채팅방 토픽 구독
                client.subscribe(`/topic/messages/${roomId}`, (message: IMessage) => {
                    const msg: ChatMessageItem = JSON.parse(message.body);
                    setMessages((prev) => [...prev, msg]);
                });
            },
        });
        client.activate();
        setStompClient(client);

        // 언마운트 시 소켓 종료
        return () => {
            client.deactivate();
        };
    }, [roomId]);

    // 2) 메시지 목록이 업데이트될 때마다 자동 스크롤 (맨 하단)
    useEffect(() => {
        if (chatAreaRef.current) {
            chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
        }
    }, [messages]);

    // 3) 메시지 전송 함수
    const sendMessage = () => {
        if (!stompClient || input.trim() === '' || !roomId || !user) {
            console.error('전송 불가: 사용자 정보 또는 입력 값이 유효하지 않습니다.');
            return;
        }

        const chatMessage: ChatMessageItem = {
            roomId,
            senderId: user.id,
            content: {
                text: input,
                type: 'TEXT',
                attachments: [],
                isEdited: false,
                isDeleted: false,
            },
            createdAt: new Date().toISOString(),
        };

        stompClient.publish({
            destination: '/app/chat',
            body: JSON.stringify(chatMessage),
        });
        setInput('');
    };

    return (
        <ChatContainer>
            <ChatArea ref={chatAreaRef}>
                {messages.map((msg, idx) => {
                    const isOwn = msg.senderId === user?.id;
                    return (
                        <div
                            key={idx}
                            style={{ marginBottom: '10px', display: 'flex', flexDirection: 'column' }}
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
            </ChatArea>
            <ChatInputContainer>
                <Input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="메시지를 입력하세요"
                />
                <SendButton onClick={sendMessage}>전송</SendButton>
            </ChatInputContainer>
        </ChatContainer>
    );
};

export default ChatRoom;