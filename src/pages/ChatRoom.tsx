// 특정 채팅방 페이지 (메시지 목록, 입력창 포함)
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
    const socket = new SockJS('http://localhost:8100/ws/chat');
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: (msg) => console.log(msg),
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
    if (!stompClient || input.trim() === '' || !roomId) return;
    // 메시지 전송 시, 백엔드에서 처리할 수 있는 형식으로 만듭니다.
    const chatMessage: ChatMessageItem = {
      roomId,
      senderId: '본인_아이디', // 실제 로그인 정보를 사용해야 합니다.
      content: { text: input, type: 'TEXT', attachments: [], isEdited: false, isDeleted: false },
      createdAt: new Date().toISOString(),
    };
    stompClient.publish({
      destination: '/app/chat', // 백엔드 @MessageMapping("/chat")에 대응
      body: JSON.stringify(chatMessage),
    });
    setInput('');
  };

  return (
    <div>
      <h2>채팅방 {roomId}</h2>
      <div style={{ border: '1px solid #ccc', padding: '10px', height: '300px', overflowY: 'scroll' }}>
        {messages.map((msg, idx) => (
          <ChatMessage
            key={idx}
            senderId={msg.senderId}
            content={msg.content}
            timestamp={msg.createdAt}
          />
        ))}
      </div>
      <div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="메시지를 입력하세요"
        />
        <button onClick={sendMessage}>전송</button>
      </div>
    </div>
  );
};

export default ChatRoom;