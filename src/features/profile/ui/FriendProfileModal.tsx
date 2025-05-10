import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Friend } from '../../social/types/friend';
import { useMutation } from '@tanstack/react-query';
import { setBackgroundImage } from '../api/profile';

// 애니메이션 효과
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

const scaleIn = keyframes`
  from {
    transform: scale(0.95);
  }
  to {
    transform: scale(1);
  }
`;

// 모달 오버레이
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeIn} 0.25s ease-out;
  backdrop-filter: blur(3px);
`;

// 모달 컨텐츠
const ModalContent = styled.div`
  position: relative;
  width: 90%;
  max-width: 360px;
  height: 85vh;
  max-height: 600px;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: ${scaleIn} 0.25s ease-out;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);
`;

// 메인 비주얼 영역 (배경 이미지 + 프로필 영역)
const VisualSection = styled.div`
  position: relative;
  width: 100%;
  height: 240px;
`;

// 배경 이미지
const CoverPhoto = styled.div<{ $imageUrl: string | null }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: ${props => props.$imageUrl ? `url(${props.$imageUrl})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  background-size: cover;
  background-position: center;
`;

// 배경 이미지 오버레이 (어두운 그라데이션)
const CoverOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 70%;
  background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.7));
  z-index: 1;
`;

// 배경 이미지 편집 버튼
const EditCoverButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  border: none;
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  z-index: 5;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition: all 0.2s;
  
  &:hover {
    background: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

// 프로필 카드 영역
const ProfileCard = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 16px 20px;
  z-index: 2;
  display: flex;
  align-items: flex-end;
  gap: 15px;
`;

// 프로필 이미지
const ProfileImageWrapper = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid white;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
`;

// 프로필 이미지 내부
const ProfileImage = styled.div<{ $imageUrl: string | null }>`
  width: 100%;
  height: 100%;
  background-image: ${props => props.$imageUrl ? `url(${props.$imageUrl})` : 'none'};
  background-color: ${props => props.$imageUrl ? 'transparent' : '#e0e0e0'};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// 프로필 이니셜 (이미지 없을 때)
const ProfileInitial = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 600;
  color: #555;
`;

// 프로필 이미지 편집 버튼
const EditProfileButton = styled.button`
  position: absolute;
  bottom: -3px;
  right: -3px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #007AFF;
  color: white;
  border: 2px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s;
  
  &:hover {
    background: #0066CC;
    transform: scale(1.1);
  }

  svg {
    width: 12px;
    height: 12px;
  }
`;

// 사용자 기본 정보
const UserInfoBasic = styled.div`
  color: white;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  flex: 1;
`;

// 사용자 이름
const Username = styled.h2`
  font-size: 1.4rem;
  font-weight: 600;
  margin: 0 0 4px 0;
`;

// 온라인 상태
const OnlineStatus = styled.div`
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 5px;
`;

// 온라인 상태 표시기
const StatusIndicator = styled.div<{ $online?: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.$online ? '#4CAF50' : '#9e9e9e'};
`;

// 상세 정보 영역
const InfoSection = styled.div`
  padding: 20px;
  flex: 1;
  overflow-y: auto;
`;

// 섹션 제목
const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
`;

// 상세 정보 목록
const InfoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

// 상세 정보 항목
const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

// 상세 정보 아이콘
const InfoIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #555;
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

// 상세 정보 텍스트
const InfoText = styled.div`
  flex: 1;
`;

// 상세 정보 라벨
const InfoLabel = styled.div`
  font-size: 0.75rem;
  color: #777;
  margin-bottom: 2px;
`;

// 상세 정보 값
const InfoValue = styled.div`
  font-size: 0.9rem;
  color: #333;
  font-weight: 500;
`;

// 푸터 액션 영역
const ActionFooter = styled.div`
  padding: 14px 20px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 12px;
`;

// 액션 버튼
const ActionButton = styled.button<{ $primary?: boolean }>`
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  background: ${props => props.$primary ? '#007AFF' : '#f5f5f5'};
  color: ${props => props.$primary ? 'white' : '#333'};
  border: none;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  &:hover {
    background: ${props => props.$primary ? '#0066CC' : '#e5e5e5'};
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

// 닫기 버튼
const CloseButton = styled.button`
  position: absolute;
  top: 12px;
  left: 12px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.4);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 5;
  
  &:hover {
    background: rgba(0, 0, 0, 0.6);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

// Props 인터페이스
interface FriendProfileModalProps {
  friend: Friend;
  onClose: () => void;
  onChatClick: (friendId: number) => void;
}

const FriendProfileModal: React.FC<FriendProfileModalProps> = ({ friend, onClose, onChatClick }) => {
  const [isHoveringCover, setIsHoveringCover] = useState(false);
  
  const { mutate: updateBackgroundImage } = useMutation({
    mutationFn: setBackgroundImage,
    onSuccess: () => {
      // TODO: 프로필 정보 새로고침
    }
  });

  const handleChatClick = () => {
    onChatClick(friend.id);
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
    const name = friend.nickname || friend.username;
    return name.charAt(0).toUpperCase();
  };

  const isOnline = friend.status === '온라인' || true; // 예시로 기본값 설정

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <VisualSection 
          onMouseEnter={() => setIsHoveringCover(true)}
          onMouseLeave={() => setIsHoveringCover(false)}
        >
          <CoverPhoto $imageUrl={friend.backgroundImageUrl || null} />
          <CoverOverlay />
          
          {(isHoveringCover || !friend.backgroundImageUrl) && (
            <EditCoverButton onClick={handleEditCover}>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 8L16 9L9 16L8 15L15 8Z" fill="currentColor" />
                <path d="M16 8L17 7L18 8L17 9L16 8Z" fill="currentColor" />
                <path d="M8 16V17H7V16H8Z" fill="currentColor" />
                <path fillRule="evenodd" clipRule="evenodd" d="M3 6C3 4.34315 4.34315 3 6 3H18C19.6569 3 21 4.34315 21 6V18C21 19.6569 19.6569 21 18 21H6C4.34315 21 3 19.6569 3 18V6ZM6 5C5.44772 5 5 5.44772 5 6V18C5 18.5523 5.44772 19 6 19H18C18.5523 19 19 18.5523 19 18V6C19 5.44772 18.5523 5 18 5H6Z" fill="currentColor" />
              </svg>
              {friend.backgroundImageUrl ? '배경 편집' : '배경 추가'}
            </EditCoverButton>
          )}
          
          <ProfileCard>
            <ProfileImageWrapper>
              {friend.profileImageUrl ? (
                <ProfileImage $imageUrl={friend.profileImageUrl} />
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
              <Username>{friend.nickname || friend.username}</Username>
              <OnlineStatus>
                <StatusIndicator $online={isOnline} />
                {friend.status || (isOnline ? '온라인' : '오프라인')}
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