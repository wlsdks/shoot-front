import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { AuthProvider } from '../features/auth';
import {
    LoginPage,
    SignUpPage,
    FindIdPage,
    FindPasswordPage,
    FriendCodePage,
    ChatRoomPage,
    EditProfilePage,
} from '../pages';
import BottomNavLayout from '../widgets/layout/BottomNavLayout';
import PrivateRoute from './routes/PrivateRoute';
import { theme } from './styles/theme';
import GlobalStyles from './styles/GlobalStyles';

// Widgets imports for proper composition
import { SocialWidget, SettingsWidget } from '../widgets';
import { ChatRoomListTab } from '../features/chat-room';

// FriendCodePage를 위한 래퍼 컴포넌트
const FriendCodePageWrapper = () => {
    const navigate = useNavigate();
    // AuthProvider 내부에 있으므로 useAuthContext 대신 FriendCodePage 컴포넌트에서 처리
    return <FriendCodePage onClose={() => navigate(-1)} />;
};

const App: React.FC = () => {
    // Tab configuration using widgets for proper FSD composition
    const tabs = [
        {
            component: (props: any) => <SocialWidget activeTab="friends" {...props} />,
            label: '친구',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
            )
        },
        {
            component: (props: any) => <SocialWidget activeTab="social" {...props} />,
            label: '소셜',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
            )
        },
        {
            component: ChatRoomListTab,
            label: '채팅',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
            )
        },
        {
            component: (props: any) => <SettingsWidget {...props} />,
            label: '설정',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
            )
        }
    ];

    return (
        <ThemeProvider theme={theme}>
            <GlobalStyles />
            <AuthProvider>
                <Routes>
                    {/* 인증이 필요 없는 페이지 */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignUpPage />} />
                    <Route path="/find-id" element={<FindIdPage />} />
                    <Route path="/find-password" element={<FindPasswordPage />} />
                    
                    {/* 인증된 사용자만 접근 가능한 라우트 */}
                    <Route element={<PrivateRoute />}>
                        <Route path="/" element={<BottomNavLayout tabs={tabs} />} />
                        <Route path="/chatroom/:roomId" element={<ChatRoomPage />} />
                        <Route path="/friend-code" element={<FriendCodePageWrapper />} />
                        <Route path="/settings/edit-profile" element={<EditProfilePage />} />
                    </Route>
                </Routes>
            </AuthProvider>
        </ThemeProvider>
    );
};

export default App;