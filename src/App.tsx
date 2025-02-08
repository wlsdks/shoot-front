// 전체 레이아웃 및 라우터 설정
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Login from './pages/Login';
import Signup from './pages/SignUp';
import BottomNavLayout from './pages/BottomNavLayout';  // 바텀 네비게이션 레이아웃
import ChatRoom from './pages/ChatRoom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

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
          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;