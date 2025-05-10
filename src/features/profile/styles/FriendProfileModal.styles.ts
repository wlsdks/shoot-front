import styled, { keyframes } from 'styled-components';

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
export const ModalOverlay = styled.div`
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
export const ModalContent = styled.div`
    position: relative;
    width: 90%;
    max-width: 320px;
    height: 75vh;
    max-height: 500px;
    background: white;
    border-radius: 16px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    animation: ${scaleIn} 0.25s ease-out;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);
`;

// 메인 비주얼 영역 (배경 이미지 + 프로필 영역)
export const VisualSection = styled.div`
    position: relative;
    width: 100%;
    height: 200px;
`;

// 배경 이미지
export const CoverPhoto = styled.div<{ $imageUrl: string | null }>`
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
export const CoverOverlay = styled.div`
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 70%;
    background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.7));
    z-index: 1;
`;

// 배경 이미지 편집 버튼
export const EditCoverButton = styled.button`
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
export const ProfileCard = styled.div`
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
export const ProfileImageWrapper = styled.div`
    position: relative;
    width: 70px;
    height: 70px;
    border-radius: 50%;
    border: 3px solid white;
    background: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    overflow: hidden;
`;

// 프로필 이미지 내부
export const ProfileImage = styled.div<{ $imageUrl: string | null }>`
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
export const ProfileInitial = styled.div`
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
export const EditProfileButton = styled.button`
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
export const UserInfoBasic = styled.div`
    color: white;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    flex: 1;
`;

// 사용자 이름
export const Username = styled.h2`
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0 0 4px 0;
`;

// 온라인 상태
export const OnlineStatus = styled.div`
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    gap: 5px;
`;

// 온라인 상태 표시기
export const StatusIndicator = styled.div<{ $online?: boolean }>`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${props => props.$online ? '#4CAF50' : '#9e9e9e'};
`;

// 상세 정보 영역
export const InfoSection = styled.div`
    padding: 15px;
    flex: 1;
    overflow-y: auto;
`;

// 섹션 제목
export const SectionTitle = styled.h3`
    font-size: 0.9rem;
    font-weight: 600;
    color: #333;
    margin: 0 0 10px 0;
    padding-bottom: 6px;
    border-bottom: 1px solid #eee;
`;

// 상세 정보 목록
export const InfoList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

// 상세 정보 항목
export const InfoItem = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

// 상세 정보 아이콘
export const InfoIcon = styled.div`
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #555;
    
    svg {
        width: 16px;
        height: 16px;
    }
`;

// 상세 정보 텍스트
export const InfoText = styled.div`
    flex: 1;
`;

// 상세 정보 라벨
export const InfoLabel = styled.div`
    font-size: 0.7rem;
    color: #777;
    margin-bottom: 2px;
`;

// 상세 정보 값
export const InfoValue = styled.div`
    font-size: 0.85rem;
    color: #333;
    font-weight: 500;
`;

// 푸터 액션 영역
export const ActionFooter = styled.div`
    padding: 12px 15px;
    border-top: 1px solid #eee;
    display: flex;
    gap: 10px;
`;

// 액션 버튼
export const ActionButton = styled.button<{ $primary?: boolean }>`
  flex: 1;
    padding: 10px;
    border-radius: 8px;
    background: ${props => props.$primary ? '#007AFF' : '#f5f5f5'};
    color: ${props => props.$primary ? 'white' : '#333'};
    border: none;
    font-size: 0.9rem;
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
        width: 16px;
        height: 16px;
    }
`;

// 닫기 버튼
export const CloseButton = styled.button`
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

export const LoadingText = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-size: 1rem;
    color: #666;
`; 