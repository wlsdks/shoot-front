import React, { useState } from 'react';
import styled from 'styled-components';
import EditProfile from '../EditProfile'; // 수정된 EditProfile 컴포넌트 import

const TabContainer = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
`;

const Header = styled.div`
    padding: 1rem;
    border-bottom: 1px solid #eee;
    background-color: #fff;
`;

const Title = styled.h2`
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #333;
`;

const SettingsList = styled.div`
    flex: 1;
    overflow-y: auto;
    background-color: #f9f9f9;
`;

const SettingItem = styled.div`
    padding: 1rem;
    margin: 0.5rem;
    margin-bottom: 0;
    border-radius: 10px;
    background-color: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    
    &:hover {
        background-color: #f5f5f5;
        transform: translateY(-2px);
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
    }
    
    &:active {
        transform: translateY(0);
    }
`;

const SettingText = styled.div`
    display: flex;
    flex-direction: column;
`;

const SettingTitle = styled.span`
    font-weight: 500;
    color: #333;
`;

const SettingDescription = styled.span`
    font-size: 0.8rem;
    color: #777;
    margin-top: 0.25rem;
`;

const Icon = styled.div`
    color: #777;
    display: flex;
    align-items: center;
`;

// 프로필 섹션 컨테이너
const ProfileSection = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: #fff;
`;

const ProfileHeader = styled.div`
    padding: 1rem;
    border-bottom: 1px solid #eee;
    display: flex;
    align-items: center;
    background-color: #fff;
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.05);
    z-index: 10;
`;

const BackButton = styled.button`
    background: none;
    border: none;
    display: flex;
    align-items: center;
    font-weight: 500;
    color: #007bff;
    cursor: pointer;
    padding: 0.4rem;
    margin-right: 0.5rem;
    border-radius: 50%;
    transition: all 0.2s;
    
    &:hover {
        background-color: rgba(0, 123, 255, 0.1);
    }
    
    &:active {
        background-color: rgba(0, 123, 255, 0.2);
    }
`;

const ProfileContent = styled.div`
    flex: 1;
    overflow-y: auto;
`;

// 아이콘 컴포넌트
const IconSVG = ({ children }: { children: React.ReactNode }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        {children}
    </svg>
);

// 설정 탭 컴포넌트
const SettingsTab: React.FC = () => {
    const [activeSection, setActiveSection] = useState<string>('main');

    const handleBack = () => {
        setActiveSection('main');
    };

    // 메인 설정 화면
    if (activeSection === 'main') {
        return (
        <TabContainer>
            <Header>
            <Title>설정</Title>
            </Header>
            <SettingsList>
            <SettingItem onClick={() => setActiveSection('profile')}>
                <SettingText>
                <SettingTitle>프로필 관리</SettingTitle>
                <SettingDescription>개인 정보 및 프로필 사진 수정</SettingDescription>
                </SettingText>
                <Icon>
                <IconSVG>
                    <circle cx="12" cy="7" r="4" />
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                </IconSVG>
                </Icon>
            </SettingItem>
            
            <SettingItem>
                <SettingText>
                <SettingTitle>알림 설정</SettingTitle>
                <SettingDescription>알림 및 소리 설정 관리</SettingDescription>
                </SettingText>
                <Icon>
                <IconSVG>
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </IconSVG>
                </Icon>
            </SettingItem>
            
            <SettingItem>
                <SettingText>
                <SettingTitle>개인정보 보호</SettingTitle>
                <SettingDescription>개인정보 보호 및 보안 설정</SettingDescription>
                </SettingText>
                <Icon>
                <IconSVG>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </IconSVG>
                </Icon>
            </SettingItem>
            
            <SettingItem>
                <SettingText>
                <SettingTitle>테마</SettingTitle>
                <SettingDescription>앱 디자인 테마 변경</SettingDescription>
                </SettingText>
                <Icon>
                <IconSVG>
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </IconSVG>
                </Icon>
            </SettingItem>
            
            <SettingItem>
                <SettingText>
                <SettingTitle>언어</SettingTitle>
                <SettingDescription>앱 언어 설정</SettingDescription>
                </SettingText>
                <Icon>
                <IconSVG>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </IconSVG>
                </Icon>
            </SettingItem>
            
            <SettingItem>
                <SettingText>
                <SettingTitle>도움말 및 지원</SettingTitle>
                <SettingDescription>자주 묻는 질문 및 지원받기</SettingDescription>
                </SettingText>
                <Icon>
                <IconSVG>
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                </IconSVG>
                </Icon>
            </SettingItem>
            
            <SettingItem>
                <SettingText>
                <SettingTitle>로그아웃</SettingTitle>
                <SettingDescription>계정에서 로그아웃</SettingDescription>
                </SettingText>
                <Icon>
                <IconSVG>
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                </IconSVG>
                </Icon>
            </SettingItem>
            </SettingsList>
        </TabContainer>
        );
    }

    // 프로필 관리 화면
    if (activeSection === 'profile') {
        return (
        <ProfileSection>
            <ProfileHeader>
            <BackButton onClick={handleBack}>
                <IconSVG>
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
                </IconSVG>
            </BackButton>
            <Title>프로필 관리</Title>
            </ProfileHeader>
            <ProfileContent>
            <EditProfile onClose={handleBack} />
            </ProfileContent>
        </ProfileSection>
        );
    }

    return null;
};

export default SettingsTab;