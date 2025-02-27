// src/pages/Login.tsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { login as loginApi } from '../services/auth';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
    from {
        opacity: 0;
        transform: translateY(-10%);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
`;

const rotateBackground = keyframes`
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
`;

const Container = styled.div`
    max-width: 400px;
    margin: 5rem auto;
    padding: 2rem;
    border: 1px solid rgba(238, 238, 238, 0.5);
    border-radius: 12px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    background: #fff;
    position: relative;
    overflow: hidden;
    animation: ${fadeIn} 0.8s ease-out;
`;

const AnimatedBackground = styled.div`
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(45deg, rgba(75, 108, 183, 0.15), rgba(24, 40, 72, 0.15));
    animation: ${rotateBackground} 20s linear infinite;
    z-index: -1;
`;

const Title = styled.h2`
    text-align: center;
    margin-bottom: 1.5rem;
    font-size: 2rem;
    color: #333;
    font-weight: 600;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const Input = styled.input`
    box-sizing: border-box; /* 이 속성이 추가되어 padding과 border가 너비에 포함됩니다. */
    width: 100%;
    padding: 0.8rem 1rem;
    font-size: 1rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    transition: border-color 0.2s, box-shadow 0.2s;
    &:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 0 8px rgba(0, 123, 255, 0.3);
    }
`;

const Button = styled.button`
    width: 100%;
    padding: 0.8rem;
    background-color: #007bff;
    border: none;
    border-radius: 6px;
    color: #fff;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.3s, transform 0.2s;
    &:hover {
        background-color: #0056b3;
        transform: scale(1.02);
    }
`;

const ErrorMessage = styled.div`
    color: #ff3333;
    text-align: center;
    margin-top: 1rem;
    font-size: 0.9rem;
`;

const Login: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    // 로그인 클릭시 동작
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // 기존의 localStorage 데이터 클리어 (토큰 등)
        localStorage.clear();

        try {
            const response = await loginApi(username, password); // 로그인 API 호출 (예: /auth/login)
            console.log("Login response:", response.data);
            const { userId, accessToken } = response.data;
            login({ id: userId, username: username }, accessToken); // AuthContext에 로그인 정보 업데이트
            navigate('/');
        } catch (err) {
            console.error("Login failed:", err);
            setError('아이디 또는 비밀번호가 올바르지 않습니다.');
        }
    };

    return (
        <Container>
            <AnimatedBackground />
            <Title>로그인</Title>
            <Form onSubmit={handleSubmit}>
                <Input
                    type="text"
                    placeholder="아이디"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <Input
                    type="password"
                    placeholder="비밀번호"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <Button type="submit">로그인</Button>
            </Form>
            {error && <ErrorMessage>{error}</ErrorMessage>}
        </Container>
    );
};

export default Login;