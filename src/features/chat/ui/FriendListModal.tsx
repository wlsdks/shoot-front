import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getFriends } from '../../../shared/api/friends';
import { useAuth } from '../../../shared/lib/context/AuthContext';
import { Friend, FriendResponse } from '../../../shared/types/friend.types';
import { createDirectChat } from '../../../shared/api/chatRoom';

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
  max-width: 320px;
  max-height: 60vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h3`
  margin: 0 0 15px 0;
  font-size: 1.1rem;
  color: #333;
`;

const FriendList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FriendItem = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f5f5f5;
  }
`;

const ProfileImage = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  margin-right: 10px;
  object-fit: cover;
`;

const ProfileInitial = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #007bff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.1rem;
  margin-right: 10px;
`;

const FriendInfo = styled.div`
  flex: 1;
`;

const Username = styled.div`
  font-weight: 500;
  color: #333;
  font-size: 0.9rem;
`;

const Nickname = styled.div`
  font-size: 0.8rem;
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
        const friendsData = await getFriends(user.id);
        const formattedFriends = friendsData.map((friend: FriendResponse) => ({
          id: friend.id,
          name: friend.username,
          username: friend.username,
          nickname: friend.nickname,
          profileImageUrl: friend.profileImageUrl || undefined
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
      onSelectFriend(friendId);
      onClose();
    } catch (error) {
      console.error('친구 선택에 실패했습니다:', error);
    }
  };

  const renderProfileImage = (friend: Friend) => {
    if (friend.profileImageUrl && friend.profileImageUrl !== 'null') {
      return <ProfileImage src={friend.profileImageUrl} alt={friend.username} />;
    }
    return <ProfileInitial>{friend.username.charAt(0).toUpperCase()}</ProfileInitial>;
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
                {renderProfileImage(friend)}
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