// 전체 레이아웃 및 라우터 설정
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/SignUp';
import FriendListPage from './pages/FriendListPage'; // 이 페이지가 로그인 후 메인
import ChatList from './pages/ChatList';
import ChatRoom from './pages/ChatRoom';
import SocialPage from "./pages/SocialPage";
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

          {/* PrivateRoute: 인증 필요 */}
          <Route element={<PrivateRoute />}>
            {/* 이제 "/" 경로 자체가 Private 하에 있으므로
                로그인 안 하면 접근 X,
                로그인 하면 FriendListPage 표시 */}
            <Route path="/" element={<FriendListPage />} />

            {/* 친구 목록이 메인이 된 상태에서, 
                채팅방 목록, 소셜 페이지 등도 동일하게 보호 */}
            <Route path="/chatlist" element={<ChatList />} />
            <Route path="/chatrooms" element={<ChatList />} />
            <Route path="/chatroom/:roomId" element={<ChatRoom />} />
            <Route path="/social" element={<SocialPage />} />
          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;