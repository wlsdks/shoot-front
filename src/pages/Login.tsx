// 로그인 페이지
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { login as loginApi } from '../services/api';

const Login: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // 로그인 API 호출 (예: /auth/login)
            const response = await loginApi(username, password);
            // API 응답 데이터 예시: { userId: "1", accessToken: "jwt-token-string" }
            const { userId, accessToken } = response.data;
            // JWT 토큰을 로컬 스토리지에 저장 (axios 인터셉터가 사용)
            localStorage.setItem('accessToken', accessToken);
            // AuthContext에 로그인 정보 업데이트
            login({ id: userId, name: username });
            // 로그인 성공 시 채팅방 페이지로 이동
            navigate('/chatlist');
        } catch (err) {
            setError('아이디 또는 비밀번호가 올바르지 않습니다.');
        }
    };
    

    return (
        <div style={{
            maxWidth: '400px', margin: '50px auto', padding: '20px',
            border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
        }}>
            <h2 style={{ textAlign: 'center' }}>로그인</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '10px' }}>
                    <label>아이디</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label>비밀번호</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>
                <button type="submit" style={{
                    width: '100%', padding: '10px',
                    backgroundColor: '#007bff', color: '#fff', border: 'none',
                    borderRadius: '4px', cursor: 'pointer'
                    }}>
                로그인
                </button>
            </form>
            {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
        </div>
    );
};

export default Login;