// 전체 레이아웃 및 라우터 설정
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/SignUp';
import ChatList from './pages/ChatList';
import ChatRoom from './pages/ChatRoom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* 아래 PrivateRoute가 보호하는 라우트들은 인증되지 않은 경우 로그인 페이지로 리디렉션됩니다. */}
          <Route element={<PrivateRoute />}>
            <Route path="/chatrooms" element={<ChatList />} />
            <Route path="/chatlist" element={<ChatList />} />
            <Route path="/chatroom/:roomId" element={<ChatRoom />} />
            {/* 필요한 다른 보호 페이지 추가 */}
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;