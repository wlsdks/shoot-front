// src/App.tsx 파일에서 라우터 부분을 다음과 같이 수정하세요

import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { AuthProvider } from '../shared/lib/context/AuthContext';
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/SignUp';
import FindId from '../pages/auth/FindId';
import FindPassword from '../pages/auth/FindPassword';
import BottomNavLayout from '../widgets/layout/BottomNavLayout';
import PrivateRoute from '../features/PrivateRoute';
import FriendCodePage from '../pages/profile/FriendCodePage';
import ChatRoom from '../pages/chat/ChatRoom';
import EditProfile from '../pages/profile/EditProfile';
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
        {/* <Navigation /> */}
        <Routes>
          {/* 인증이 필요 없는 페이지 */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/find-id" element={<FindId />} />  {/* 아이디 찾기 라우트 */}
          <Route path="/find-password" element={<FindPassword />} />  {/* 비밀번호 찾기 라우트 */}
          
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