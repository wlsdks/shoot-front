// 네비게이션 바 (회원가입, 로그인, 채팅 목록 이동 등)
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';

const NavBar = styled.nav`
    background: linear-gradient(90deg, #4b6cb7, #182848);
    padding: 1rem 2rem;
    display: flex;
    align-items: center;
    color: #fff;
`;

const Brand = styled(Link)`
    font-size: 1.5rem;
    font-weight: bold;
    color: #fff;
    text-decoration: none;
`;

const NavMenu = styled.div`
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 1.5rem;
`;

const NavLink = styled(Link)`
    color: #fff;
    text-decoration: none;
    font-size: 1rem;
    transition: color 0.2s;
    &:hover {
        color: #ffd700;
    }
`;

const LogoutButton = styled.button`
    background: transparent;
    border: 1px solid #fff;
    border-radius: 4px;
    color: #fff;
    padding: 0.5rem 1rem;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
    &:hover {
        background: #fff;
        color: #182848;
    }
`;

const Navigation: React.FC = () => {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    // 로그아웃 버튼 클릭 시 실행되는 핸들러
    const handleLogout = () => {
        // 전역 인증 상태 업데이트 (토큰 제거도 AuthContext.logout() 내부에서 처리할 수 있음)
        logout();
        // localStorage에서 accessToken 제거 (만약 logout() 내부에서 처리되지 않았다면)
        localStorage.removeItem('accessToken');
        // 로그인 페이지로 리디렉션
        navigate('/login');
    };

    return (
        <NavBar>
            <Brand to="/">Shoot</Brand>
            <NavMenu>
                {isAuthenticated ? (
                <>
                    <NavLink to="/chatrooms">채팅방</NavLink>
                    <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
                </>
                ) : (
                <>
                    <NavLink to="/login">로그인</NavLink>
                    <NavLink to="/signup">회원가입</NavLink>
                </>
                )}
            </NavMenu>
        </NavBar>
    );
};

export default Navigation;