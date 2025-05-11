import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/lib/context/AuthContext';
import EditProfile from '../../profile/EditProfile';
import UserCodeSettings from '../../user-code/ui/UserCodeSettings';
import TabContainer from "../../../shared/ui/TabContainer";
import TabHeader from "../../../shared/ui/TabHeader";
import styled from 'styled-components';
import { fadeIn, slideUp } from '../../../shared/ui/commonStyles';

const SettingsContent = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    
    /* 스크롤바 스타일링 */
    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 10px;
    }

    &::-webkit-scrollbar-thumb {
        background: #ccc;
        border-radius: 10px;
    }

    &::-webkit-scrollbar-thumb:hover {
        background: #aaa;
    }
`;

const SettingItem = styled.div`
    display: flex;
    align-items: center;
    padding: 1rem;
    background-color: white;
    border-radius: 14px;
    margin-bottom: 0.8rem;
    cursor: pointer;
    transition: all 0.3s ease;
    animation: ${fadeIn} 0.3s ease-out;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    
    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
    }
    
    &:active {
        transform: translateY(-1px);
    }
`;

const IconContainer = styled.div<{ color?: string }>`
    width: 45px;
    height: 45px;
    border-radius: 12px;
    background-color: ${props => props.color || '#f0f5ff'};
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 1rem;
    color: ${props => props.color ? 'white' : '#007bff'};
    transition: all 0.3s ease;
    
    ${SettingItem}:hover & {
        transform: scale(1.05);
    }
    
    svg {
        width: 22px;
        height: 22px;
    }
`;

const SettingInfo = styled.div`
    flex: 1;
`;

const SettingTitle = styled.div`
    font-weight: 600;
    font-size: 1rem;
    color: #333;
    margin-bottom: 0.2rem;
`;

const SettingDescription = styled.div`
    font-size: 0.8rem;
    color: #666;
`;

const CategoryHeader = styled.div`
    font-weight: 600;
    color: #666;
    font-size: 0.9rem;
    padding: 0.5rem 0.5rem 0.5rem 0.75rem;
    margin: 1.5rem 0 0.75rem 0;
    position: relative;
    
    &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 70%;
        background-color: #007bff;
        border-radius: 3px;
    }
    
    &:first-of-type {
        margin-top: 0.5rem;
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
    justify-content: center;
    align-items: center;
    z-index: 1000;
    animation: ${fadeIn} 0.2s ease-out;
`;

const ModalContent = styled.div`
    background: white;
    padding: 1.5rem;
    border-radius: 16px;
    width: 300px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    animation: ${slideUp} 0.3s ease-out;
`;

const ModalTitle = styled.h2`
    font-size: 1.2rem;
    font-weight: 600;
    color: #333;
    margin: 0 0 1rem 0;
    text-align: center;
`;

const ModalText = styled.p`
    font-size: 0.95rem;
    color: #666;
    margin: 0 0 1.5rem 0;
    text-align: center;
    line-height: 1.5;
`;

const ModalButtonGroup = styled.div`
    display: flex;
    gap: 0.75rem;
    justify-content: center;
`;

const ModalButton = styled.button<{ $primary?: boolean }>`
    padding: 0.75rem 1.2rem;
    border: none;
    border-radius: 12px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    flex: 1;
    
    background: ${props => props.$primary ? '#007bff' : '#f1f3f5'};
    color: ${props => props.$primary ? 'white' : '#666'};
    
    &:hover {
        background: ${props => props.$primary ? '#0069d9' : '#e9ecef'};
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    
    &:active {
        transform: translateY(-1px);
    }
`;

const ArrowIcon = styled.div`
    color: #ccc;
    display: flex;
    align-items: center;
    justify-content: center;
    
    svg {
        width: 20px;
        height: 20px;
    }
    
    ${SettingItem}:hover & {
        color: #007bff;
    }
`;

// 설정 탭 컴포넌트
const SettingsTab: React.FC = () => {
    const [activeSection, setActiveSection] = useState<string>('main');
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleBack = () => {
        setActiveSection('main');
    };

    // 로그아웃 처리 함수
    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('로그아웃 실패:', error);
        } finally {
            setShowLogoutModal(false);
        }
    };

    // 로그아웃 확인 모달
    const LogoutConfirmModal = () => (
        <ModalOverlay onClick={() => setShowLogoutModal(false)}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
                <ModalTitle>로그아웃</ModalTitle>
                <ModalText>정말 로그아웃 하시겠습니까?</ModalText>
                <ModalButtonGroup>
                    <ModalButton onClick={() => setShowLogoutModal(false)}>
                        취소
                    </ModalButton>
                    <ModalButton $primary onClick={handleLogout}>
                        로그아웃
                    </ModalButton>
                </ModalButtonGroup>
            </ModalContent>
        </ModalOverlay>
    );

    // 메인 설정 화면
    if (activeSection === 'main') {
        return (
            <TabContainer>
                <TabHeader title="설정" />
                
                <SettingsContent>
                    <CategoryHeader>계정 관리</CategoryHeader>
                    
                    <SettingItem onClick={() => setActiveSection('profile')}>
                        <IconContainer>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                        </IconContainer>
                        <SettingInfo>
                            <SettingTitle>프로필 관리</SettingTitle>
                            <SettingDescription>개인 정보 및 프로필 사진 수정</SettingDescription>
                        </SettingInfo>
                        <ArrowIcon>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 18l6-6-6-6"/>
                            </svg>
                        </ArrowIcon>
                    </SettingItem>

                    <SettingItem onClick={() => setActiveSection('userCode')}>
                        <IconContainer>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="8.5" cy="7" r="4"></circle>
                                <line x1="20" y1="8" x2="20" y2="14"></line>
                                <line x1="23" y1="11" x2="17" y2="11"></line>
                            </svg>
                        </IconContainer>
                        <SettingInfo>
                            <SettingTitle>유저코드 설정</SettingTitle>
                            <SettingDescription>친구 추가를 위한 유저코드 관리</SettingDescription>
                        </SettingInfo>
                        <ArrowIcon>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 18l6-6-6-6"/>
                            </svg>
                        </ArrowIcon>
                    </SettingItem>
                    
                    <CategoryHeader>알림 및 보안</CategoryHeader>
                    
                    <SettingItem>
                        <IconContainer>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                            </svg>
                        </IconContainer>
                        <SettingInfo>
                            <SettingTitle>알림 설정</SettingTitle>
                            <SettingDescription>알림 및 소리 설정 관리</SettingDescription>
                        </SettingInfo>
                        <ArrowIcon>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 18l6-6-6-6"/>
                            </svg>
                        </ArrowIcon>
                    </SettingItem>
                    
                    <SettingItem>
                        <IconContainer>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                        </IconContainer>
                        <SettingInfo>
                            <SettingTitle>개인정보 보호</SettingTitle>
                            <SettingDescription>개인정보 보호 및 보안 설정</SettingDescription>
                        </SettingInfo>
                        <ArrowIcon>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 18l6-6-6-6"/>
                            </svg>
                        </ArrowIcon>
                    </SettingItem>
                    
                    <CategoryHeader>앱 설정</CategoryHeader>
                    
                    <SettingItem>
                        <IconContainer>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="5"></circle>
                                <line x1="12" y1="1" x2="12" y2="3"></line>
                                <line x1="12" y1="21" x2="12" y2="23"></line>
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                                <line x1="1" y1="12" x2="3" y2="12"></line>
                                <line x1="21" y1="12" x2="23" y2="12"></line>
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                            </svg>
                        </IconContainer>
                        <SettingInfo>
                            <SettingTitle>테마</SettingTitle>
                            <SettingDescription>앱 디자인 테마 변경</SettingDescription>
                        </SettingInfo>
                        <ArrowIcon>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 18l6-6-6-6"/>
                            </svg>
                        </ArrowIcon>
                    </SettingItem>
                    
                    <SettingItem>
                        <IconContainer>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="2" y1="12" x2="22" y2="12"></line>
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                            </svg>
                        </IconContainer>
                        <SettingInfo>
                            <SettingTitle>언어</SettingTitle>
                            <SettingDescription>앱 언어 설정</SettingDescription>
                        </SettingInfo>
                        <ArrowIcon>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 18l6-6-6-6"/>
                            </svg>
                        </ArrowIcon>
                    </SettingItem>
                    
                    <CategoryHeader>지원</CategoryHeader>
                    
                    <SettingItem>
                        <IconContainer>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                                <line x1="12" y1="17" x2="12.01" y2="17"></line>
                            </svg>
                        </IconContainer>
                        <SettingInfo>
                            <SettingTitle>도움말 및 지원</SettingTitle>
                            <SettingDescription>자주 묻는 질문 및 지원받기</SettingDescription>
                        </SettingInfo>
                        <ArrowIcon>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 18l6-6-6-6"/>
                            </svg>
                        </ArrowIcon>
                    </SettingItem>
                    
                    <SettingItem onClick={() => setShowLogoutModal(true)}>
                        <IconContainer color="#dc3545">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                        </IconContainer>
                        <SettingInfo>
                            <SettingTitle>로그아웃</SettingTitle>
                            <SettingDescription>계정에서 로그아웃</SettingDescription>
                        </SettingInfo>
                        <ArrowIcon>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 18l6-6-6-6"/>
                            </svg>
                        </ArrowIcon>
                    </SettingItem>
                </SettingsContent>
                
                {/* 로그아웃 확인 모달 */}
                {showLogoutModal && <LogoutConfirmModal />}
            </TabContainer>
        );
    }

    // 프로필 관리 화면
    if (activeSection === 'profile') {
        return (
            <TabContainer>
                <TabHeader 
                    title="프로필 관리"
                    actions={
                        <IconContainer onClick={handleBack} style={{ margin: 0, cursor: 'pointer' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 12H5M12 19l-7-7 7-7"/>
                            </svg>
                        </IconContainer>
                    }
                />
                <SettingsContent>
                    <EditProfile onClose={handleBack} />
                </SettingsContent>
            </TabContainer>
        );
    }

    // 유저코드 설정 화면
    if (activeSection === 'userCode') {
        return (
            <TabContainer>
                <TabHeader 
                    title="유저코드 설정"
                    actions={
                        <IconContainer onClick={handleBack} style={{ margin: 0, cursor: 'pointer' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 12H5M12 19l-7-7 7-7"/>
                            </svg>
                        </IconContainer>
                    }
                />
                <SettingsContent>
                    <UserCodeSettings userId={user?.id || 0} />
                </SettingsContent>
            </TabContainer>
        );
    }

    return null;
};

export default SettingsTab;