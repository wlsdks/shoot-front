// 특정 채팅방 페이지 (메시지 목록, 입력창 포함)
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';  // AuthContext에서 user 정보를 가져옵니다.
import { getChatMessages } from '../services/api';
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';
import ChatMessage, { MessageContent } from '../components/chatroom/ChatMessage';

export interface ChatMessageItem {
    roomId: string;
    senderId: string;
    content: MessageContent;
    createdAt?: string;
}

const ChatRoom: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const { user } = useAuth();  // AuthContext에서 로그인된 사용자 정보 가져오기
    const [messages, setMessages] = useState<ChatMessageItem[]>([]);
    const [input, setInput] = useState('');
    const [stompClient, setStompClient] = useState<Client | null>(null);

    useEffect(() => {
        if (!roomId) return;

        // 초기 메시지 로드
        getChatMessages(roomId)
            .then((res) => setMessages(res.data))
            .catch((err) => console.error('메시지 로드 실패', err));

        // STOMP 웹소켓 연결 (백엔드가 8100번 포트에서 실행 중이라고 가정)
        const token = localStorage.getItem("accessToken"); // 예시: 저장된 JWT 토큰
        const socket = new SockJS(`http://localhost:8100/ws/chat?token=${token}`);
        const client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            debug: (msg) => console.log('[STOMP]', msg),
            onConnect: () => {
                    console.log('WebSocket 연결됨');
                    client.subscribe(`/topic/messages/${roomId}`, (message: IMessage) => {
                    const msg: ChatMessageItem = JSON.parse(message.body);
                    setMessages((prev) => [...prev, msg]);
                });
            },
        });
        client.activate();
        setStompClient(client);

        return () => {
            client.deactivate();
        };
    }, [roomId]);

    const sendMessage = () => {
        // user가 null일 때는 메시지를 보내지 않도록 처리
        if (!stompClient || input.trim() === '' || !roomId || !user) {
            console.error("사용자가 로그인되어 있지 않습니다.");
            return;
        }
        
        // 메시지 전송 시, 백엔드에서 처리할 수 있는 형식으로 만듭니다.
        const chatMessage: ChatMessageItem = {
            roomId,
            senderId: user.id,  // 로그인된 사용자의 id를 senderId로 사용
            content: { text: input, type: 'TEXT', attachments: [], isEdited: false, isDeleted: false },
        };

        stompClient.publish({
            destination: '/app/chat', // 백엔드 @MessageMapping("/chat")에 대응
            body: JSON.stringify(chatMessage),
        });
        setInput('');
    };

    return (
        <div style={{ maxWidth: '600px', margin: '20px auto' }}>
            <h2>채팅방 {roomId}</h2>
            <div style={{ border: '1px solid #ccc', padding: '10px', height: '400px', overflowY: 'scroll', marginBottom: '10px' }}>
                {messages.map((msg, idx) => (
                    <ChatMessage
                        key={idx}
                        senderId={msg.senderId}
                        content={msg.content}
                        timestamp={msg.createdAt}
                    />
                ))}
            </div>
            <div style={{ display: 'flex' }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="메시지를 입력하세요"
                    style={{ flex: 1, padding: '10px' }}
                />
                <button onClick={sendMessage} style={{ padding: '10px 20px' }}>전송</button>
            </div>
        </div>
    );
};

export default ChatRoom;