// 전체 레이아웃 및 라우터 설정
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ChatList from './pages/ChatList';
import ChatRoom from './pages/ChatRoom';
import { AuthProvider } from './context/AuthContext';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/chatlist" element={<ChatList />} />
          <Route path="/chatroom/:roomId" element={<ChatRoom />} />
          <Route path="*" element={<Login />} /> {/* 기본 페이지 */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
