import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../auth';
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
    ArrowRightIcon
} from '../ui/icons/icons';

interface SettingsTabProps {
    EditProfileComponent?: React.ComponentType;
    UserCodeSettingsComponent?: React.ComponentType<{ userId: number }>;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ 
    EditProfileComponent, 
    UserCodeSettingsComponent 
}) => {
    const navigate = useNavigate();
    const { user, logout } = useAuthContext();
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const settingsItems = [
        {
            id: 'profile',
            icon: <ProfileIcon />,
            title: '프로필 편집',
            description: '닉네임, 상태 메시지 등을 변경할 수 있습니다',
            category: '계정',
            available: !!EditProfileComponent
        },
        {
            id: 'userCode',
            icon: <UserCodeIcon />,
            title: '유저 코드',
            description: '내 유저 코드를 관리하고 친구를 추가할 수 있습니다',
            category: '계정',
            available: !!UserCodeSettingsComponent
        },
        {
            id: 'notifications',
            icon: <NotificationIcon />,
            title: '알림',
            description: '메시지 알림 설정을 변경할 수 있습니다',
            category: '환경설정',
            available: false
        },
        {
            id: 'security',
            icon: <SecurityIcon />,
            title: '보안',
            description: '비밀번호 변경 및 보안 설정을 관리할 수 있습니다',
            category: '환경설정',
            available: false
        },
        {
            id: 'theme',
            icon: <ThemeIcon />,
            title: '테마',
            description: '어두운 모드 및 색상 설정을 변경할 수 있습니다',
            category: '환경설정',
            available: false
        },
        {
            id: 'language',
            icon: <LanguageIcon />,
            title: '언어',
            description: '앱 언어를 변경할 수 있습니다',
            category: '환경설정',
            available: false
        },
        {
            id: 'help',
            icon: <HelpIcon />,
            title: '도움말',
            description: '사용법 및 자주 묻는 질문을 확인할 수 있습니다',
            category: '기타',
            available: false
        }
    ];

    const handleItemClick = (itemId: string) => {
        const item = settingsItems.find(item => item.id === itemId);
        if (item?.available) {
            setActiveModal(itemId);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const renderModalContent = () => {
        switch (activeModal) {
            case 'profile':
                return EditProfileComponent ? <EditProfileComponent /> : null;
            case 'userCode':
                return UserCodeSettingsComponent && user?.id ? 
                    <UserCodeSettingsComponent userId={user.id} /> : null;
            default:
                return null;
        }
    };

    if (activeModal) {
        return (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <TabHeader
                    title={settingsItems.find(item => item.id === activeModal)?.title || ''}
                    showAppIcon={false}
                    showBackButton={true}
                    onBack={() => setActiveModal(null)}
                />
                <div style={{ flex: 1, overflow: 'auto' }}>
                    {renderModalContent()}
                </div>
            </div>
        );
    }

    return (
        <TabContainer>
            <TabHeader title="설정" />
            <SettingsContent>
                {['계정', '환경설정', '기타'].map(category => (
                    <div key={category}>
                        <CategoryHeader>{category}</CategoryHeader>
                        {settingsItems
                            .filter(item => item.category === category)
                            .map(item => (
                                <SettingItem 
                                    key={item.id} 
                                    onClick={() => handleItemClick(item.id)}
                                    style={{ 
                                        opacity: item.available ? 1 : 0.5,
                                        cursor: item.available ? 'pointer' : 'not-allowed'
                                    }}
                                >
                                    <IconContainer>{item.icon}</IconContainer>
                                    <SettingInfo>
                                        <SettingTitle>{item.title}</SettingTitle>
                                        <SettingDescription>{item.description}</SettingDescription>
                                    </SettingInfo>
                                    {item.available && (
                                        <ArrowIcon>
                                            <ArrowRightIcon />
                                        </ArrowIcon>
                                    )}
                                </SettingItem>
                            ))
                        }
                    </div>
                ))}

                <CategoryHeader>계정 관리</CategoryHeader>
                <SettingItem onClick={() => setShowLogoutConfirm(true)}>
                    <IconContainer><LogoutIcon /></IconContainer>
                    <SettingInfo>
                        <SettingTitle>로그아웃</SettingTitle>
                        <SettingDescription>현재 계정에서 로그아웃합니다</SettingDescription>
                    </SettingInfo>
                    <ArrowIcon><ArrowRightIcon /></ArrowIcon>
                </SettingItem>

                {showLogoutConfirm && (
                    <ModalOverlay onClick={() => setShowLogoutConfirm(false)}>
                        <ModalContent onClick={(e) => e.stopPropagation()}>
                            <ModalTitle>로그아웃</ModalTitle>
                            <ModalText>정말로 로그아웃하시겠습니까?</ModalText>
                            <ModalButtonGroup>
                                <ModalButton onClick={() => setShowLogoutConfirm(false)}>
                                    취소
                                </ModalButton>
                                <ModalButton 
                                    onClick={handleLogout}
                                    style={{ backgroundColor: '#ff4757', color: 'white' }}
                                >
                                    로그아웃
                                </ModalButton>
                            </ModalButtonGroup>
                        </ModalContent>
                    </ModalOverlay>
                )}
            </SettingsContent>
        </TabContainer>
    );
};

export default SettingsTab;