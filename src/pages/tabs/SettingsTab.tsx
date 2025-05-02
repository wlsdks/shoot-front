import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import EditProfile from '../../pages/profile/EditProfile';
import UserCodeSettings from '../../pages/profile/UserCodeSettings';
import {
    TabContainer,
    Header,
    Title,
    HeaderActions,
    IconButton,
    ScrollArea,
    Card,
    TextArea,
    CardTitle,
    CardDescription,
    IconContainer,
    ModalOverlay,
    ModalContent,
    ModalTitle,
    ModalText,
    ModalButtonGroup,
    ModalButton
} from '../../styles/commonStyles';

// 아이콘 SVG 컴포넌트
const IconSVG = ({ children }: { children: React.ReactNode }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
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
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const { logout } = useAuth();
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
                <Header>
                    <Title>설정</Title>
                    <HeaderActions>
                        <IconButton>
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
                        </IconButton>
                    </HeaderActions>
                </Header>
                
                <ScrollArea>
                    <Card onClick={() => setActiveSection('profile')}>
                        <TextArea>
                            <CardTitle>프로필 관리</CardTitle>
                            <CardDescription>개인 정보 및 프로필 사진 수정</CardDescription>
                        </TextArea>
                        <IconContainer>
                            <IconSVG>
                                <circle cx="12" cy="7" r="4" />
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            </IconSVG>
                        </IconContainer>
                    </Card>

                    <Card onClick={() => setActiveSection('userCode')}>
                        <TextArea>
                            <CardTitle>유저코드 설정</CardTitle>
                            <CardDescription>친구 추가를 위한 유저코드 관리</CardDescription>
                        </TextArea>
                        <IconContainer>
                            <IconSVG>
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="8.5" cy="7" r="4" />
                                <line x1="20" y1="8" x2="20" y2="14" />
                                <line x1="23" y1="11" x2="17" y2="11" />
                            </IconSVG>
                        </IconContainer>
                    </Card>
                    
                    <Card>
                        <TextArea>
                            <CardTitle>알림 설정</CardTitle>
                            <CardDescription>알림 및 소리 설정 관리</CardDescription>
                        </TextArea>
                        <IconContainer>
                            <IconSVG>
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </IconSVG>
                        </IconContainer>
                    </Card>
                    
                    <Card>
                        <TextArea>
                            <CardTitle>개인정보 보호</CardTitle>
                            <CardDescription>개인정보 보호 및 보안 설정</CardDescription>
                        </TextArea>
                        <IconContainer>
                            <IconSVG>
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </IconSVG>
                        </IconContainer>
                    </Card>
                    
                    <Card>
                        <TextArea>
                            <CardTitle>테마</CardTitle>
                            <CardDescription>앱 디자인 테마 변경</CardDescription>
                        </TextArea>
                        <IconContainer>
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
                        </IconContainer>
                    </Card>
                    
                    <Card>
                        <TextArea>
                            <CardTitle>언어</CardTitle>
                            <CardDescription>앱 언어 설정</CardDescription>
                        </TextArea>
                        <IconContainer>
                            <IconSVG>
                                <circle cx="12" cy="12" r="10" />
                                <line x1="2" y1="12" x2="22" y2="12" />
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                            </IconSVG>
                        </IconContainer>
                    </Card>
                    
                    <Card>
                        <TextArea>
                            <CardTitle>도움말 및 지원</CardTitle>
                            <CardDescription>자주 묻는 질문 및 지원받기</CardDescription>
                        </TextArea>
                        <IconContainer>
                            <IconSVG>
                                <circle cx="12" cy="12" r="10" />
                                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                                <line x1="12" y1="17" x2="12.01" y2="17" />
                            </IconSVG>
                        </IconContainer>
                    </Card>
                    
                    <Card onClick={() => setShowLogoutModal(true)}>
                        <TextArea>
                            <CardTitle>로그아웃</CardTitle>
                            <CardDescription>계정에서 로그아웃</CardDescription>
                        </TextArea>
                        <IconContainer style={{ color: '#dc3545' }}>
                            <IconSVG>
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </IconSVG>
                        </IconContainer>
                    </Card>
                </ScrollArea>
                
                {/* 로그아웃 확인 모달 */}
                {showLogoutModal && <LogoutConfirmModal />}
            </TabContainer>
        );
    }

    // 프로필 관리 화면
    if (activeSection === 'profile') {
        return (
            <TabContainer>
                <Header>
                    <IconButton onClick={handleBack}>
                        <IconSVG>
                            <line x1="19" y1="12" x2="5" y2="12" />
                            <polyline points="12 19 5 12 12 5" />
                        </IconSVG>
                    </IconButton>
                    <Title>프로필 관리</Title>
                </Header>
                <ScrollArea>
                    <EditProfile onClose={handleBack} />
                </ScrollArea>
            </TabContainer>
        );
    }

    // 유저코드 설정 화면
    if (activeSection === 'userCode') {
        return (
            <TabContainer>
                <Header>
                    <IconButton onClick={handleBack}>
                        <IconSVG>
                            <line x1="19" y1="12" x2="5" y2="12" />
                            <polyline points="12 19 5 12 12 5" />
                        </IconSVG>
                    </IconButton>
                    <Title>유저코드 설정</Title>
                </Header>
                <ScrollArea>
                    <UserCodeSettings />
                </ScrollArea>
            </TabContainer>
        );
    }

    return null;
};

export default SettingsTab;