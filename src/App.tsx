// src/App.tsx 파일에서 라우터 부분을 다음과 같이 수정하세요

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/SignUp';
import FindId from './pages/FindId';  // 새로 추가된 컴포넌트
import FindPassword from './pages/FindPassword';  // 새로 추가된 컴포넌트
import Navigation from './components/Navigation';
import BottomNavLayout from './pages/BottomNavLayout';
import PrivateRoute from './components/PrivateRoute';
import FriendCodePage from './pages/FriendCodePage';
import ChatRoom from './pages/ChatRoom';
import EditProfile from './pages/EditProfile';

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