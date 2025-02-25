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
    position: fixed; /* 상단 고정 */
    top: 0;
    left: 0;
    right: 0;
    height: 30px; /* 고정 높이 설정 */
    z-index: 1000;
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

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <NavBar>
            <Brand to="/">Shoot</Brand>
            <NavMenu>
                {isAuthenticated ? (
                    <>
                        <NavLink to="/">채팅방</NavLink> {/* 경로 수정 */}
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