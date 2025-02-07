// 네비게이션 바 (회원가입, 로그인, 채팅 목록 이동 등)
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation: React.FC = () => {
    const { isAuthenticated, logout } = useAuth();

    return (
        <nav style={{ padding: '10px', borderBottom: '1px solid #ccc', display: 'flex', alignItems: 'center' }}>
        <Link to="/" style={{ fontWeight: 'bold' }}>My Chat App</Link>
        <div style={{ marginLeft: 'auto' }}>
            {isAuthenticated ? (
            <>
                <Link to="/chatrooms" style={{ marginRight: '10px' }}>채팅방</Link>
                <button onClick={logout}>로그아웃</button>
            </>
            ) : (
            <>
                <Link to="/login" style={{ marginRight: '10px' }}>로그인</Link>
                <Link to="/signup">회원가입</Link>
            </>
            )}
        </div>
        </nav>
    );
};

export default Navigation;