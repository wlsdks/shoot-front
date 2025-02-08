import React, { useEffect, useState } from 'react';
import { getChatRooms } from '../../services/api';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';

interface ChatRoom {
  roomId: string;
  title: string;
  lastMessage: string | null;
  unreadMessages: number;
  timestamp: string;
}

// 이미 영역 안에서 사용되기 때문에 추가적인 레이아웃 요소는 불필요
const RoomListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;
`;

const RoomItem = styled(Link)`
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: #f9f9f9;
  border-radius: 12px;
  margin-bottom: 12px;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
`;

const Avatar = styled.div`
  flex-shrink: 0;
  width: 50px;
  height: 50px;
  background-color: #ccc;
  border-radius: 50%;
  margin-right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  color: white;
`;

const RoomInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const RoomHeader = styled.div`
  display: flex;
  justify-content: space-between;
`;

const RoomTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Timestamp = styled.span`
  font-size: 0.8rem;
  color: #999;
`;

const LastMessage = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const UnreadBadge = styled.div<{ count: number }>`
  background-color: ${props => (props.count > 0 ? '#ff3b30' : 'transparent')};
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
  margin-left: 16px;
  display: ${props => (props.count > 0 ? 'block' : 'none')};
`;

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
    <RoomListContainer>
      {rooms.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666' }}>참여 중인 채팅방이 없습니다.</p>
      ) : (
        rooms.map((room) => (
          <RoomItem key={room.roomId} to={`/chatroom/${room.roomId}`}>
            <Avatar>{room.title.charAt(0).toUpperCase()}</Avatar>
            <RoomInfo>
              <RoomHeader>
                <RoomTitle>{room.title}</RoomTitle>
                <Timestamp>{room.timestamp}</Timestamp>
              </RoomHeader>
              <LastMessage>{room.lastMessage || '최근 메시지가 없습니다.'}</LastMessage>
            </RoomInfo>
            <UnreadBadge count={room.unreadMessages}>
              {room.unreadMessages}
            </UnreadBadge>
          </RoomItem>
        ))
      )}
    </RoomListContainer>
  );
};

export default ChatList;