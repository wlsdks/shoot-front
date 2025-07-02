import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../../shared';
import EditProfile from '../../profile/EditProfile';
import UserCodeSettings from '../../user-code/ui/UserCodeSettings';
import TabContainer from "../../../shared/ui/TabContainer";
import TabHeader from "../../../shared/ui/TabHeader";
import {
    SettingsContent,
    SettingItem,
    IconContainer,
    SettingInfo,
    SettingTitle,
    SettingDescription,
    CategoryHeader,
    ModalOverlay,
    ModalContent,
    ModalTitle,
    ModalText,
    ModalButtonGroup,
    ModalButton,
    ArrowIcon
} from '../styles/settings.styles';
import {
    ProfileIcon,
    UserCodeIcon,
    NotificationIcon,
    SecurityIcon,
    ThemeIcon,
    LanguageIcon,
    HelpIcon,
    LogoutIcon,
    BackIcon,
    ArrowRightIcon
} from '../ui/icons/icons';

// 설정 탭 컴포넌트
const SettingsTab: React.FC = () => {
    const [activeSection, setActiveSection] = useState<string>('main');
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const { logout, user } = useAuthContext();
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
                            <ProfileIcon />
                        </IconContainer>
                        <SettingInfo>
                            <SettingTitle>프로필 관리</SettingTitle>
                            <SettingDescription>개인 정보 및 프로필 사진 수정</SettingDescription>
                        </SettingInfo>
                        <ArrowIcon>
                            <ArrowRightIcon />
                        </ArrowIcon>
                    </SettingItem>

                    <SettingItem onClick={() => setActiveSection('userCode')}>
                        <IconContainer>
                            <UserCodeIcon />
                        </IconContainer>
                        <SettingInfo>
                            <SettingTitle>유저코드 설정</SettingTitle>
                            <SettingDescription>친구 추가를 위한 유저코드 관리</SettingDescription>
                        </SettingInfo>
                        <ArrowIcon>
                            <ArrowRightIcon />
                        </ArrowIcon>
                    </SettingItem>
                    
                    <CategoryHeader>알림 및 보안</CategoryHeader>
                    
                    <SettingItem>
                        <IconContainer>
                            <NotificationIcon />
                        </IconContainer>
                        <SettingInfo>
                            <SettingTitle>알림 설정</SettingTitle>
                            <SettingDescription>알림 및 소리 설정 관리</SettingDescription>
                        </SettingInfo>
                        <ArrowIcon>
                            <ArrowRightIcon />
                        </ArrowIcon>
                    </SettingItem>
                    
                    <SettingItem>
                        <IconContainer>
                            <SecurityIcon />
                        </IconContainer>
                        <SettingInfo>
                            <SettingTitle>개인정보 보호</SettingTitle>
                            <SettingDescription>개인정보 보호 및 보안 설정</SettingDescription>
                        </SettingInfo>
                        <ArrowIcon>
                            <ArrowRightIcon />
                        </ArrowIcon>
                    </SettingItem>
                    
                    <CategoryHeader>앱 설정</CategoryHeader>
                    
                    <SettingItem>
                        <IconContainer>
                            <ThemeIcon />
                        </IconContainer>
                        <SettingInfo>
                            <SettingTitle>테마</SettingTitle>
                            <SettingDescription>앱 디자인 테마 변경</SettingDescription>
                        </SettingInfo>
                        <ArrowIcon>
                            <ArrowRightIcon />
                        </ArrowIcon>
                    </SettingItem>
                    
                    <SettingItem>
                        <IconContainer>
                            <LanguageIcon />
                        </IconContainer>
                        <SettingInfo>
                            <SettingTitle>언어</SettingTitle>
                            <SettingDescription>앱 언어 설정</SettingDescription>
                        </SettingInfo>
                        <ArrowIcon>
                            <ArrowRightIcon />
                        </ArrowIcon>
                    </SettingItem>
                    
                    <CategoryHeader>지원</CategoryHeader>
                    
                    <SettingItem>
                        <IconContainer>
                            <HelpIcon />
                        </IconContainer>
                        <SettingInfo>
                            <SettingTitle>도움말 및 지원</SettingTitle>
                            <SettingDescription>자주 묻는 질문 및 지원받기</SettingDescription>
                        </SettingInfo>
                        <ArrowIcon>
                            <ArrowRightIcon />
                        </ArrowIcon>
                    </SettingItem>
                    
                    <SettingItem onClick={() => setShowLogoutModal(true)}>
                        <IconContainer color="#dc3545">
                            <LogoutIcon />
                        </IconContainer>
                        <SettingInfo>
                            <SettingTitle>로그아웃</SettingTitle>
                            <SettingDescription>계정에서 로그아웃</SettingDescription>
                        </SettingInfo>
                        <ArrowIcon>
                            <ArrowRightIcon />
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
                            <BackIcon />
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
                            <BackIcon />
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