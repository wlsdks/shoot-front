// src/App.tsx 파일에서 라우터 부분을 다음과 같이 수정하세요

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/auth/Login';
import Signup from './pages/auth/SignUp';
import FindId from './pages/auth/FindId';
import FindPassword from './pages/auth/FindPassword';
import Navigation from './components/Navigation';
import BottomNavLayout from './components/layout/BottomNavLayout';
import PrivateRoute from './components/PrivateRoute';
import FriendCodePage from './pages/profile/FriendCodePage';
import ChatRoom from './pages/chat/ChatRoom';
import EditProfile from './pages/profile/EditProfile';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
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
            <Route path="/friend-code" element={<FriendCodePage />} />
            <Route path="/settings/edit-profile" element={<EditProfile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;