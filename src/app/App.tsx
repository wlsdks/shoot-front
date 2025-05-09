import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { AuthProvider } from '../shared/lib/context/AuthContext';
import Login from '../features/auth/Login';
import Signup from '../features/auth/SignUp';
import FindId from '../features/auth/FindId';
import FindPassword from '../features/auth/FindPassword';
import BottomNavLayout from '../widgets/layout/BottomNavLayout';
import PrivateRoute from '../app/routes/PrivateRoute';
import FriendCodePage from '../features/profile/FriendCodePage';
import ChatRoom from '../features/chat/ChatRoom';
import EditProfile from '../features/profile/EditProfile';
import { theme } from './styles/theme';

// FriendCodePage를 위한 래퍼 컴포넌트
const FriendCodePageWrapper = () => {
    const navigate = useNavigate();
    return <FriendCodePage onClose={() => navigate(-1)} />;
};

const App: React.FC = () => {
    return (
        <ThemeProvider theme={theme}>
            <AuthProvider>
                <Routes>
                    {/* 인증이 필요 없는 페이지 */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/find-id" element={<FindId />} />
                    <Route path="/find-password" element={<FindPassword />} />
                    
                    {/* 인증된 사용자만 접근 가능한 라우트 */}
                    <Route element={<PrivateRoute />}>
                        <Route path="/" element={<BottomNavLayout />} />
                        <Route path="/chatroom/:roomId" element={<ChatRoom />} />
                        <Route path="/friend-code" element={<FriendCodePageWrapper />} />
                        <Route path="/settings/edit-profile" element={<EditProfile />} />
                    </Route>
                </Routes>
            </AuthProvider>
        </ThemeProvider>
    );
};

export default App;