import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styled, { keyframes } from 'styled-components';

// 슬라이드 다운 애니메이션
const slideDown = keyframes`
    from { transform: translateY(-100%); }
    to { transform: translateY(0); }
`;

const NavBar = styled.nav`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: #ffffff;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 2rem;
    z-index: 1100;
    animation: ${slideDown} 0.5s ease-out;
`;

const Brand = styled(Link)`
    font-size: 1.8rem;
    font-weight: bold;
    color: #007bff;
    text-decoration: none;
`;

const NavLinks = styled.div`
    display: flex;
    gap: 1.5rem;
`;

const NavLink = styled(Link)`
    font-size: 1rem;
    color: #333;
    text-decoration: none;
    transition: color 0.3s;
    &:hover {
        color: #007bff;
    }
`;

const LogoutButton = styled.button`
    border: none;
    background: transparent;
    font-size: 1rem;
    color: #333;
    cursor: pointer;
    transition: color 0.3s;
    &:hover {
        color: #007bff;
    }
`;

const Navigation: React.FC = () => {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <NavBar>
        <Brand to="/">SHOOT</Brand>
        <NavLinks>
            {isAuthenticated ? (
            <>
                <NavLink to="/">채팅방</NavLink>
                <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
            </>
            ) : (
            <>
                <NavLink to="/login">로그인</NavLink>
                <NavLink to="/signup">회원가입</NavLink>
            </>
            )}
        </NavLinks>
        </NavBar>
    );
};

export default Navigation;