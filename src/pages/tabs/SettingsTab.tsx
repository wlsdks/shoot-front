import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import EditProfile from '../../pages/profile/EditProfile';
import TabContainer from '../../components/common/TabContainer';
import TabHeader from '../../components/common/TabHeader';
import Icon from '../../components/common/Icon';
import {
    TabContent,
    TabSection
} from '../../styles/tabStyles';
import styled from 'styled-components';

const SettingsItem = styled.div`
    display: flex;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    cursor: pointer;
    
    &:hover {
        background-color: ${({ theme }) => theme.colors.background};
    }
`;

const SettingsItemIcon = styled.div`
    margin-right: 1rem;
    color: ${({ theme }) => theme.colors.text};
`;

const SettingsItemText = styled.div`
    flex: 1;
    color: ${({ theme }) => theme.colors.text};
`;

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
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000,
            }}
            onClick={() => setShowLogoutModal(false)}
        >
            <div
                style={{
                    backgroundColor: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 5px 20px rgba(0, 0, 0, 0.2)',
                    width: '80%',
                    maxWidth: '320px',
                    textAlign: 'center',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.2rem', color: '#333', fontWeight: 600 }}>
                    로그아웃
                </h3>
                <p style={{ marginBottom: '1.5rem', color: '#6c757d', fontSize: '0.95rem' }}>
                    정말 로그아웃 하시겠습니까?
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.8rem' }}>
                    <button
                        onClick={() => setShowLogoutModal(false)}
                        style={{
                            padding: '0.7rem 1.2rem',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            fontSize: '0.95rem',
                            background: '#f0f0f0',
                            color: '#333',
                        }}
                    >
                        취소
                    </button>
                    <button
                        onClick={handleLogout}
                        style={{
                            padding: '0.7rem 1.2rem',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            fontSize: '0.95rem',
                            background: '#dc3545',
                            color: 'white',
                        }}
                    >
                        로그아웃
                    </button>
                </div>
            </div>
        </div>
    );

    // 메인 설정 화면
    if (activeSection === 'main') {
        return (
            <TabContainer>
                <TabHeader title="설정" />
                <TabContent>
                    <TabSection>
                        <SettingsItem onClick={() => setActiveSection('profile')}>
                            <SettingsItemIcon>
                                <Icon>
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </Icon>
                            </SettingsItemIcon>
                            <SettingsItemText>프로필 설정</SettingsItemText>
                        </SettingsItem>
                        
                        <SettingsItem onClick={() => navigate("/notifications")}>
                            <SettingsItemIcon>
                                <Icon>
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                                </Icon>
                            </SettingsItemIcon>
                            <SettingsItemText>알림 설정</SettingsItemText>
                        </SettingsItem>
                        
                        <SettingsItem onClick={() => navigate("/privacy")}>
                            <SettingsItemIcon>
                                <Icon>
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </Icon>
                            </SettingsItemIcon>
                            <SettingsItemText>개인정보 보호</SettingsItemText>
                        </SettingsItem>
                        
                        <SettingsItem onClick={() => setShowLogoutModal(true)}>
                            <SettingsItemIcon>
                                <Icon>
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                    <polyline points="16 17 21 12 16 7" />
                                    <line x1="21" y1="12" x2="9" y2="12" />
                                </Icon>
                            </SettingsItemIcon>
                            <SettingsItemText>로그아웃</SettingsItemText>
                        </SettingsItem>
                    </TabSection>
                </TabContent>
            </TabContainer>
        );
    }

    // 프로필 관리 화면
    if (activeSection === 'profile') {
        return (
            <TabContainer>
                <TabHeader title="프로필 관리" />
                <TabContent>
                    <TabSection>
                        <EditProfile onClose={handleBack} />
                    </TabSection>
                </TabContent>
            </TabContainer>
        );
    }

    // 로그아웃 확인 모달
    if (showLogoutModal) {
        return <LogoutConfirmModal />;
    }

    return null;
};

export default SettingsTab;