// 로그인 페이지
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login: setAuth } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await login(username, password);
            // 예: 백엔드에서 응답 데이터에 { userId, accessToken } 형식으로 JWT 토큰이 포함되어 있다고 가정
            const { userId, accessToken } = response.data;
            // 토큰은 localStorage 또는 Context에 저장할 수 있습니다.
            localStorage.setItem('accessToken', accessToken);
            setAuth({ id: userId, username });
            navigate('/chatlist');
        } catch (error) {
            console.error('로그인 실패', error);
        }
    };

    return (
        <div>
        <h2>로그인</h2>
        <form onSubmit={handleSubmit}>
            <div>
            <label>아이디: </label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div>
            <label>비밀번호: </label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit">로그인</button>
        </form>
        </div>
    );
};

export default Login;