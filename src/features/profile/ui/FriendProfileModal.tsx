import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Friend } from '../../social/types/friend';
import { useMutation } from '@tanstack/react-query';
import { setBackgroundImage } from '../api/profile';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeIn} 0.3s ease-out;
`;

const ModalContent = styled.div`
  position: relative;
  width: 90%;
  max-width: 320px;
  height: 85vh;
  max-height: 500px;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: ${fadeIn} 0.3s ease-out;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
`;

const HeaderImage = styled.div<{ $imageUrl: string | null }>`
  width: 100%;
  height: 35vh;
  max-height: 200px;
  background-image: ${props => props.$imageUrl ? `url(${props.$imageUrl})` : 'none'};
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: ${props => props.$imageUrl ? 'transparent' : '#f5f5f5'};
`;

const HeaderInitial = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #666;
  margin-bottom: 8px;
`;

const AddBackgroundText = styled.div`
  font-size: 14px;
  color: #666;
`;

const BorderLine = styled.div`
  position: absolute;
  top: 66.67%;
  left: 0;
  right: 0;
  height: 1px;
  background: #eee;
  z-index: 1;
`;

const ProfileImageContainer = styled.div`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  overflow: hidden;
  position: absolute;
  top: 66.67%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 3px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
`;

const ProfileImage = styled.div<{ $imageUrl: string | null }>`
  width: 100%;
  height: 100%;
  background-image: ${props => props.$imageUrl ? `url(${props.$imageUrl})` : 'none'};
  background-size: cover;
  background-position: center;
`;

const ProfileInitial = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e0e0e0;
  color: #666;
  font-size: 2rem;
  font-weight: 600;
`;

const UserInfo = styled.div`
  position: absolute;
  top: calc(66.67% + 50px);
  left: 0;
  right: 0;
  text-align: center;
  width: 100%;
  padding: 0 20px;
  background: white;
`;

const Username = styled.h2`
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const Status = styled.p`
  font-size: 0.8rem;
  color: #666;
  margin: 4px 0 0;
`;

const ContentSection = styled.div`
  flex: 1;
  padding: 20px;
  padding-top: 100px;
  overflow-y: auto;
`;

const ActionButton = styled.button`
  margin: 0;
  padding: 14px;
  background: #007AFF;
  color: white;
  border: none;
  border-radius: 0;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;

  &:hover {
    background: #0066CC;
  }

  &:active {
    background: #0056b3;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
  z-index: 1;

  &:hover {
    background: white;
    transform: scale(1.1);
  }

  svg {
    width: 18px;
    height: 18px;
    color: #333;
  }
`;

interface FriendProfileModalProps {
  friend: Friend;
  onClose: () => void;
  onChatClick: (friendId: number) => void;
}

const FriendProfileModal: React.FC<FriendProfileModalProps> = ({ friend, onClose, onChatClick }) => {
  const handleChatClick = () => {
    onChatClick(friend.id);
    onClose();
  };

  const { mutate: updateBackgroundImage } = useMutation({
    mutationFn: setBackgroundImage,
    onSuccess: () => {
      // TODO: 프로필 정보 새로고침
    }
  });

  const handleBackgroundClick = () => {
    // TODO: 이미지 업로드 로직 구현
    const imageUrl = "업로드된 이미지 URL";
    updateBackgroundImage({ imageUrl });
  };

  const getInitial = () => {
    const name = friend.nickname || friend.username;
    return name.charAt(0).toUpperCase();
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <HeaderImage $imageUrl={friend.backgroundImageUrl || null}>
          {!friend.backgroundImageUrl && (
            <>
              <HeaderInitial>+</HeaderInitial>
              <AddBackgroundText>프로필 배경 추가하기</AddBackgroundText>
            </>
          )}
        </HeaderImage>
        <BorderLine />
        <ProfileImageContainer>
          {friend.profileImageUrl ? (
            <ProfileImage $imageUrl={friend.profileImageUrl} />
          ) : (
            <ProfileInitial>+</ProfileInitial>
          )}
        </ProfileImageContainer>
        <UserInfo>
          <Username>{friend.nickname || friend.username}</Username>
          <Status>{friend.status || '온라인'}</Status>
        </UserInfo>
        <ContentSection>
          {/* 추가 정보나 내용을 여기에 넣을 수 있습니다 */}
        </ContentSection>
        <ActionButton onClick={handleChatClick}>
          채팅하기
        </ActionButton>
      </ModalContent>
    </ModalOverlay>
  );
};

export default FriendProfileModal; 