import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';             // 전역 인증 Provider 추가
import Login from './pages/Login';
import Signup from './pages/SignUp';
import Navigation from './components/Navigation';
import BottomNavLayout from './pages/BottomNavLayout';
import PrivateRoute from './components/PrivateRoute';
import FriendCodePage from './pages/FriendCodePage';
import ChatRoom from './pages/ChatRoom';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* 상단 네비게이션 바 */}
        <Navigation />
        <Routes>
          {/* 비로그인 접근 가능 */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          {/* 인증된 사용자만 접근 가능한 라우트 */}
          <Route element={<PrivateRoute />}>
            {/* 메인 페이지는 BottomNavLayout에 포함된 탭으로 구성 */}
            <Route path="/" element={<BottomNavLayout />} />
            <Route path="/chatroom/:roomId" element={<ChatRoom />} />
            <Route path="/friend-code" element={<FriendCodePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
