import React from 'react';
import styled from 'styled-components';
import { Friend } from '../types/friend.types';

interface FriendItemProps {
  friend: Friend;
  onChatClick: () => void;
  onClick: () => void;
}

const FriendItemComponent = styled.div`
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s;
  background-color: #ffffff;

  &:hover {
    background-color: #f8f9fa;
  }
`;

const ProfileImageContainer = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 1rem;
  background-color: #e9ecef;
  flex-shrink: 0;
  border: 1px solid #dee2e6;
`;

const ProfileImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ProfileInitial = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #007bff;
  color: white;
  font-weight: 600;
  font-size: 1.2rem;
`;

const UserInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const UserName = styled.div`
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 0.15rem;
`;

const UserStatus = styled.div`
  font-size: 0.8rem;
  color: #666;
`;

export const FriendItem: React.FC<FriendItemProps> = ({ friend, onChatClick, onClick }) => {
  const renderProfileImage = () => {
    if (friend.profileImageUrl) {
      return <ProfileImage src={friend.profileImageUrl} alt={friend.username} />;
    }
    return <ProfileInitial>{friend.username.charAt(0).toUpperCase()}</ProfileInitial>;
  };

  const displayName = friend.nickname || friend.name;

  return (
    <FriendItemComponent onClick={onClick}>
      <ProfileImageContainer>
        {renderProfileImage()}
      </ProfileImageContainer>
      <UserInfo>
        <UserName>{displayName}</UserName>
        <UserStatus>{friend.status}</UserStatus>
      </UserInfo>
    </FriendItemComponent>
  );
}; 