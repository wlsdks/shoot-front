// 사용자의 채팅방 목록 페이지
import React, { useEffect, useState } from 'react';
import { getChatRooms } from '../services/api';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ChatRoom {
  roomId: string;
  title: string;
  lastMessage: string | null;
  unreadMessages: number;
}

const ChatList: React.FC = () => {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      getChatRooms(user.id)
        .then((res) => setRooms(res.data))
        .catch((err) => console.error('채팅방 목록 로드 실패', err));
    }
  }, [user]);

  return (
    <div>
      <h2>채팅목록</h2>
      {rooms.length === 0 ? (
        <p>참여 중인 채팅방이 없습니다.</p>
      ) : (
        <ul>
          {rooms.map((room) => (
            <li key={room.roomId}>
              <Link to={`/chatroom/${room.roomId}`}>
                {room.title} ({room.unreadMessages} unread)
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ChatList;