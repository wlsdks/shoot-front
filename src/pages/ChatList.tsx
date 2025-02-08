// 사용자의 채팅방 목록 페이지
import React, { useEffect, useState } from 'react';
import { getChatRooms } from '../services/api';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

interface ChatRoom {
  roomId: string;
  title: string;
  lastMessage: string | null;
  unreadMessages: number;
  timestamp: string;
}

const Container = styled.div`
  max-width: 500px;
  margin: 2rem auto;
  padding: 1.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
  color: #333;
`;

// 채팅방 목록 영역을 고정 높이와 스크롤 처리 적용
const ListContainer = styled.div`
  max-height: 650px;
  overflow-y: auto;
`;

const RoomList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const RoomLink = styled(Link)`
  display: block;
  text-decoration: none;
  color: inherit;
`;

const RoomItem = styled.li`
  display: flex;
  align-items: center;
  height: 80px; /* 고정 높이 */
  padding: 12px 16px;
  border-bottom: 1px solid #ddd;
  transition: background-color 0.2s;
  &:hover {
    background-color: #f9f9f9;
  }
`;

const Avatar = styled.div`
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  background-color: #ccc;
  border-radius: 50%;
  margin-right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: #fff;
`;

const RoomInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
`;

const RoomHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
`;

const RoomTitle = styled.span`
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
  flex-shrink: 0;
  margin-left: 8px;
`;

const LastMessage = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const UnreadBadge = styled.div<{ count: number }>`
  background-color: ${props => (props.count > 0 ? '#ff3b30' : 'transparent')};
  color: #fff;
  padding: ${props => (props.count > 0 ? '4px 8px' : '0')};
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
    <Container>
      <Title>내 채팅방</Title>
      {rooms.length === 0 ? (
        <p style={{ textAlign: 'center' }}>참여 중인 채팅방이 없습니다.</p>
      ) : (
        <ListContainer>
          <RoomList>
            {rooms.map((room) => (
              <RoomLink key={room.roomId} to={`/chatroom/${room.roomId}`}>
                <RoomItem>
                  <Avatar>{room.title.charAt(0).toUpperCase()}</Avatar>
                  <RoomInfo>
                    <RoomHeader>
                      <RoomTitle>{room.title}</RoomTitle>
                      <Timestamp>{room.timestamp}</Timestamp>
                    </RoomHeader>
                    <LastMessage>
                      {room.lastMessage ? room.lastMessage : '최근 메시지가 없습니다.'}
                    </LastMessage>
                  </RoomInfo>
                  {room.unreadMessages > 0 && (
                    <UnreadBadge count={room.unreadMessages}>
                      {room.unreadMessages}
                    </UnreadBadge>
                  )}
                </RoomItem>
              </RoomLink>
            ))}
          </RoomList>
        </ListContainer>
      )}
    </Container>
  );
};

export default ChatList;