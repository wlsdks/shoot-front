import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getFriends } from '../../../services/friends';
import { useAuth } from '../../../context/AuthContext';
import { Friend, FriendResponse } from '../../../types/friend.types';
import { createDirectChat } from '../../../services/chatRoom';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h3`
  margin: 0 0 20px 0;
  font-size: 1.2rem;
  color: #333;
`;

const FriendList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const FriendItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f5f5f5;
  }
`;

const ProfileImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
  object-fit: cover;
`;

const FriendInfo = styled.div`
  flex: 1;
`;

const Username = styled.div`
  font-weight: 500;
  color: #333;
`;

const Nickname = styled.div`
  font-size: 0.9rem;
  color: #666;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 5px;

  &:hover {
    color: #333;
  }
`;

interface FriendListModalProps {
  onClose: () => void;
  onSelectFriend: (roomId: number) => void;
}

export const FriendListModal: React.FC<FriendListModalProps> = ({
  onClose,
  onSelectFriend
}) => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFriends = async () => {
      if (!user) return;
      try {
        const friendsData: FriendResponse[] = await getFriends(user.id);
        const formattedFriends: Friend[] = friendsData.map(friend => ({
          id: friend.id,
          name: friend.username,
          username: friend.username,
          nickname: friend.nickname,
          profileImageUrl: friend.profileImageUrl,
          status: "온라인" // TODO: 실제 상태 정보로 대체
        }));
        setFriends(formattedFriends);
      } catch (error) {
        console.error('친구 목록을 불러오는데 실패했습니다:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, [user]);

  const handleFriendClick = async (friendId: number) => {
    if (!user) return;
    try {
      const response = await createDirectChat(user.id, friendId);
      onSelectFriend(response.data.id);
    } catch (error) {
      console.error('채팅방 생성에 실패했습니다:', error);
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose}>&times;</CloseButton>
        <Title>친구 선택</Title>
        {loading ? (
          <div>로딩 중...</div>
        ) : friends.length === 0 ? (
          <div>친구가 없습니다.</div>
        ) : (
          <FriendList>
            {friends.map(friend => (
              <FriendItem
                key={friend.id}
                onClick={() => handleFriendClick(friend.id)}
              >
                <ProfileImage
                  src={friend.profileImageUrl || '/default-profile.png'}
                  alt={friend.username}
                />
                <FriendInfo>
                  <Username>{friend.username}</Username>
                  {friend.nickname && <Nickname>{friend.nickname}</Nickname>}
                </FriendInfo>
              </FriendItem>
            ))}
          </FriendList>
        )}
      </ModalContent>
    </ModalOverlay>
  );
}; 