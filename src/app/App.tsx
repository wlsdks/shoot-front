import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { AuthProvider } from '../shared/lib/context/AuthContext';
import LoginPage from '../pages/auth/LoginPage';
import SignUpPage from '../pages/auth/SignUpPage';
import FindIdPage from '../pages/auth/FindIdPage';
import FindPasswordPage from '../pages/auth/FindPasswordPage';
import BottomNavLayout from '../widgets/layout/BottomNavLayout';
import PrivateRoute from '../app/routes/PrivateRoute';
import FriendCodePage from '../pages/user-code/FriendCodePage';
import ChatRoomPage from '../pages/chat/ChatRoomPage';
import EditProfilePage from '../pages/profile/EditProfilePage';
import { theme } from './styles/theme';
import GlobalStyles from './styles/GlobalStyles';

// FriendCodePage를 위한 래퍼 컴포넌트
const FriendCodePageWrapper = () => {
    const navigate = useNavigate();
    return <FriendCodePage onClose={() => navigate(-1)} />;
};

const App: React.FC = () => {
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
                        <Route path="/" element={<BottomNavLayout />} />
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