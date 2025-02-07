// 네비게이션 바 (회원가입, 로그인, 채팅 목록 이동 등)
import React from 'react';
import { Link } from 'react-router-dom';

const Navigation: React.FC = () => {
  return (
    <nav style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
      <Link to="/login" style={{ marginRight: '10px' }}>로그인</Link>
      <Link to="/signup" style={{ marginRight: '10px' }}>회원가입</Link>
      <Link to="/chatlist">채팅목록</Link>
    </nav>
  );
};

export default Navigation;