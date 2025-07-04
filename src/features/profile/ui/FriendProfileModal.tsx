import React, { useState } from 'react';
import { Friend } from '../../../entities';
import { useMutation } from '@tanstack/react-query';
import { setBackgroundImage } from '../api/profile';
import { useFriendProfile } from '../model/hooks/useProfile';
import {
  EditCoverIcon,
  EditProfileIcon,
  CloseIcon,
  UserCodeIcon,
  ActivityLevelIcon,
  JoinDateIcon,
  CommonFriendsIcon,
  ChatIcon
} from './icons/ProfileIcons';
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
  onDirectChatClick?: (friendId: number) => void; // 직접 채팅방 이동 핸들러
}

const FriendProfileModal: React.FC<FriendProfileModalProps> = ({ 
  friend: initialFriend, 
  onClose, 
  onChatClick,
  onDirectChatClick 
}) => {
  const [isHoveringCover, setIsHoveringCover] = useState(false);
  const { friend, isLoading } = useFriendProfile(initialFriend.id);
  
  const { mutate: updateBackgroundImage } = useMutation({
    mutationFn: setBackgroundImage,
    onSuccess: () => {
      // TODO: 성공 처리
    },
  });

  const handleChatClick = () => {
    // FSD 원칙에 따라 상위 컴포넌트에서 처리하도록 위임
    if (onDirectChatClick) {
      onDirectChatClick(initialFriend.id);
    } else {
      onChatClick(initialFriend.id);
    }
    onClose();
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
              <EditCoverIcon />
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
                <EditProfileIcon />
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
            <CloseIcon />
          </CloseButton>
        </VisualSection>
        
        <InfoSection>
          <SectionTitle>친구 정보</SectionTitle>
          <InfoList>
            <InfoItem>
              <InfoIcon>
                <UserCodeIcon />
              </InfoIcon>
              <InfoText>
                <InfoLabel>유저코드</InfoLabel>
                <InfoValue>{displayFriend.userCode || 'userCode'}</InfoValue>
              </InfoText>
            </InfoItem>
            
            <InfoItem>
              <InfoIcon>
                <ActivityLevelIcon />
              </InfoIcon>
              <InfoText>
                <InfoLabel>활동 레벨</InfoLabel>
                <InfoValue>매우 활발함</InfoValue>
              </InfoText>
            </InfoItem>
            
            <InfoItem>
              <InfoIcon>
                <JoinDateIcon />
              </InfoIcon>
              <InfoText>
                <InfoLabel>가입일</InfoLabel>
                <InfoValue>2023년 08월 15일</InfoValue>
              </InfoText>
            </InfoItem>
            
            <InfoItem>
              <InfoIcon>
                <CommonFriendsIcon />
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
            <CloseIcon />
            닫기
          </ActionButton>
          <ActionButton $primary onClick={handleChatClick}>
            <ChatIcon />
            채팅하기
          </ActionButton>
        </ActionFooter>
      </ModalContent>
    </ModalOverlay>
  );
};

export default FriendProfileModal;