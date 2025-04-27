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
  padding: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.white};
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.light};
  }
`;

const ProfileImage = styled.div<{ imageUrl?: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary};
  margin-right: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.white};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  background-image: ${({ imageUrl }) => imageUrl ? `url(${imageUrl})` : 'none'};
  background-size: cover;
  background-position: center;
`;

const ChatButton = styled.button`
  margin-left: auto;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.white};
  }
`;

export const FriendItem: React.FC<FriendItemProps> = ({ friend, onChatClick, onClick }) => {
  const getInitial = (name: string) => {
    const firstChar = name.charAt(0);
    // 한글인 경우
    if (/[가-힣]/.test(firstChar)) {
      return firstChar;
    }
    // 영어인 경우 대문자로 변환
    return firstChar.toUpperCase();
  };

  return (
    <FriendItemComponent onClick={onClick}>
      <ProfileImage imageUrl={friend.profileImage}>
        {!friend.profileImage && getInitial(friend.name)}
      </ProfileImage>
      <div>
        <div style={{ fontWeight: 'bold' }}>{friend.name}</div>
        <div style={{ fontSize: '0.8rem', color: '#666' }}>{friend.status}</div>
      </div>
      <ChatButton onClick={(e) => {
        e.stopPropagation();
        onChatClick();
      }}>
        채팅
      </ChatButton>
    </FriendItemComponent>
  );
}; 