import React, { useState } from 'react';
import { Friend } from '../../social/types/friend';
import { useMutation } from '@tanstack/react-query';
import { setBackgroundImage } from '../api/profile';
import { useFriendProfile } from '../model/hooks/useProfile';
import { useChatRooms } from '../../chat-room/model/hooks/useChatRooms';
import { useNavigate } from 'react-router-dom';
import { ChatRoomResponse } from '../../chat-room/types/chatRoom.types';
import {
  ModalOverlay,
  ModalContent,
  VisualSection,
  CoverPhoto,
  CoverOverlay,
  EditCoverButton,
  ProfileCard,
  ProfileImageWrapper,
  ProfileImage,
  ProfileInitial,
  EditProfileButton,
  UserInfoBasic,
  Username,
  OnlineStatus,
  StatusIndicator,
  InfoSection,
  SectionTitle,
  InfoList,
  InfoItem,
  InfoIcon,
  InfoText,
  InfoLabel,
  InfoValue,
  ActionFooter,
  ActionButton,
  CloseButton,
  LoadingText
} from '../styles/FriendProfileModal.styles';

// Props 인터페이스
interface FriendProfileModalProps {
  friend: Friend;
  onClose: () => void;
  onChatClick: (friendId: number) => void;
}

const FriendProfileModal: React.FC<FriendProfileModalProps> = ({ friend: initialFriend, onClose, onChatClick }) => {
  const [isHoveringCover, setIsHoveringCover] = useState(false);
  const { friend, isLoading } = useFriendProfile(initialFriend.id);
  const navigate = useNavigate();
  const { findDirectChatRoom } = useChatRooms(1); // TODO: 실제 로그인한 사용자의 ID로 대체
  
  const { mutate: updateBackgroundImage } = useMutation({
    mutationFn: setBackgroundImage,
    onSuccess: () => {
      // TODO: 성공 처리
    },
  });

  const handleChatClick = () => {
    findDirectChatRoom.mutate(
      { myId: 1, otherUserId: initialFriend.id },
      {
        onSuccess: (data: ChatRoomResponse) => {
          if (data) {
            navigate(`/chatroom/${data.roomId}`);
            onClose();
          }
        },
        onError: (error) => {
          console.error('채팅방을 찾을 수 없습니다:', error);
        }
      }
    );
  };

  const handleEditCover = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: 배경 이미지 업로드 로직
    const imageUrl = "업로드된 이미지 URL";
    updateBackgroundImage({ imageUrl });
  };

  const handleEditProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: 프로필 이미지 업로드 로직
  };

  const getInitial = () => {
    const name = friend?.nickname || friend?.username || initialFriend.nickname || initialFriend.username;
    return name.charAt(0).toUpperCase();
  };

  const isOnline = friend?.status === '온라인' || initialFriend.status === '온라인' || true;

  if (isLoading) {
    return (
      <ModalOverlay onClick={onClose}>
        <ModalContent onClick={e => e.stopPropagation()}>
          <LoadingText>로딩 중...</LoadingText>
        </ModalContent>
      </ModalOverlay>
    );
  }

  const displayFriend = friend || initialFriend;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <VisualSection 
          onMouseEnter={() => setIsHoveringCover(true)}
          onMouseLeave={() => setIsHoveringCover(false)}
        >
          <CoverPhoto $imageUrl={displayFriend.backgroundImageUrl || null} />
          <CoverOverlay />
          
          {(isHoveringCover || !displayFriend.backgroundImageUrl) && (
            <EditCoverButton onClick={handleEditCover}>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 8L16 9L9 16L8 15L15 8Z" fill="currentColor" />
                <path d="M16 8L17 7L18 8L17 9L16 8Z" fill="currentColor" />
                <path d="M8 16V17H7V16H8Z" fill="currentColor" />
                <path fillRule="evenodd" clipRule="evenodd" d="M3 6C3 4.34315 4.34315 3 6 3H18C19.6569 3 21 4.34315 21 6V18C21 19.6569 19.6569 21 18 21H6C4.34315 21 3 19.6569 3 18V6ZM6 5C5.44772 5 5 5.44772 5 6V18C5 18.5523 5.44772 19 6 19H18C18.5523 19 19 18.5523 19 18V6C19 5.44772 18.5523 5 18 5H6Z" fill="currentColor" />
              </svg>
              {displayFriend.backgroundImageUrl ? '배경 편집' : '배경 추가'}
            </EditCoverButton>
          )}
          
          <ProfileCard>
            <ProfileImageWrapper>
              {displayFriend.profileImageUrl ? (
                <ProfileImage $imageUrl={displayFriend.profileImageUrl} />
              ) : (
                <ProfileInitial>{getInitial()}</ProfileInitial>
              )}
              <EditProfileButton onClick={handleEditProfile}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 6C9.79 6 8 7.79 8 10C8 12.21 9.79 14 12 14C14.21 14 16 12.21 16 10C16 7.79 14.21 6 12 6Z" fill="currentColor" />
                  <path d="M12 16C9.33 16 4 17.34 4 20V22H20V20C20 17.34 14.67 16 12 16Z" fill="currentColor" />
                </svg>
              </EditProfileButton>
            </ProfileImageWrapper>
            
            <UserInfoBasic>
              <Username>{displayFriend.nickname || displayFriend.username}</Username>
              <OnlineStatus>
                <StatusIndicator $online={isOnline} />
                {displayFriend.status || (isOnline ? '온라인' : '오프라인')}
              </OnlineStatus>
            </UserInfoBasic>
          </ProfileCard>
          
          <CloseButton onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </CloseButton>
        </VisualSection>
        
        <InfoSection>
          <SectionTitle>친구 정보</SectionTitle>
          <InfoList>
            <InfoItem>
              <InfoIcon>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 18H4V6H20V18ZM4 0H20V2H4V0ZM4 22H20V24H4V22ZM12 12C14.21 12 16 10.21 16 8H8C8 10.21 9.79 12 12 12ZM12 7C12.55 7 13 7.45 13 8C13 8.55 12.55 9 12 9C11.45 9 11 8.55 11 8C11 7.45 11.45 7 12 7ZM17 15H7V14C7 12.67 10.33 12 12 12C13.67 12 17 12.67 17 14V15Z" fill="currentColor" />
                </svg>
              </InfoIcon>
              <InfoText>
                <InfoLabel>유저코드</InfoLabel>
                <InfoValue>{displayFriend.userCode || 'userCode'}</InfoValue>
              </InfoText>
            </InfoItem>
            
            <InfoItem>
              <InfoIcon>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM7 10H9V17H7V10ZM11 7H13V17H11V7ZM15 13H17V17H15V13Z" fill="currentColor" />
                </svg>
              </InfoIcon>
              <InfoText>
                <InfoLabel>활동 레벨</InfoLabel>
                <InfoValue>매우 활발함</InfoValue>
              </InfoText>
            </InfoItem>
            
            <InfoItem>
              <InfoIcon>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor" />
                  <path d="M12.5 7H11V13L16.2 16.2L17 14.9L12.5 12.2V7Z" fill="currentColor" />
                </svg>
              </InfoIcon>
              <InfoText>
                <InfoLabel>가입일</InfoLabel>
                <InfoValue>2023년 08월 15일</InfoValue>
              </InfoText>
            </InfoItem>
            
            <InfoItem>
              <InfoIcon>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V18H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V18H23V16.5C23 14.17 18.33 13 16 13Z" fill="currentColor" />
                </svg>
              </InfoIcon>
              <InfoText>
                <InfoLabel>공통 친구</InfoLabel>
                <InfoValue>3명</InfoValue>
              </InfoText>
            </InfoItem>
          </InfoList>
        </InfoSection>
        
        <ActionFooter>
          <ActionButton onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor" />
            </svg>
            닫기
          </ActionButton>
          <ActionButton $primary onClick={handleChatClick}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16Z" fill="currentColor" />
              <path d="M7 9H17V11H7V9Z" fill="currentColor" />
              <path d="M7 12H14V14H7V12Z" fill="currentColor" />
              <path d="M7 6H17V8H7V6Z" fill="currentColor" />
            </svg>
            채팅하기
          </ActionButton>
        </ActionFooter>
      </ModalContent>
    </ModalOverlay>
  );
};

export default FriendProfileModal;