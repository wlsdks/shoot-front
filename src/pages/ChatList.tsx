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
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>내 채팅방</h2>
        {rooms.length === 0 ? (
            <p style={{ textAlign: 'center' }}>참여 중인 채팅방이 없습니다.</p>
        ) : (
            <div
            style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '20px',
                justifyContent: 'center'
            }}
            >
            {rooms.map((room) => (
                <Link
                key={room.roomId}
                to={`/chatroom/${room.roomId}`}
                style={{
                    display: 'block',
                    textDecoration: 'none',
                    color: '#333',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '15px',
                    width: 'calc(33.33% - 20px)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseOver={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
                    (e.currentTarget as HTMLElement).style.boxShadow =
                    '0 4px 8px rgba(0,0,0,0.2)';
                }}
                onMouseOut={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLElement).style.boxShadow =
                    '0 2px 4px rgba(0,0,0,0.1)';
                }}
                >
                <h3 style={{ margin: '0 0 10px' }}>{room.title}</h3>
                <p style={{ margin: '0 0 5px', color: '#666', fontSize: '0.9rem' }}>
                    마지막 메시지: {room.lastMessage ? room.lastMessage : '없음'}
                </p>
                <p style={{ margin: '0', fontWeight: 'bold', color: room.unreadMessages > 0 ? 'red' : '#333' }}>
                    미확인 메시지: {room.unreadMessages}
                </p>
                </Link>
            ))}
            </div>
        )}
        </div>
    );
};

export default ChatList;