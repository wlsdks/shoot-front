import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { login as loginApi, fetchUserInfo } from '../services/auth';
import styled, { keyframes } from 'styled-components';
import axios from 'axios'; // axios import 추가

// 스타일 컴포넌트는 그대로 유지
const backgroundAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const FullScreenContainer = styled.div`
  width: 100vw;
  height: 100vh;
  background: linear-gradient(270deg, #ff9a9e, #fad0c4, #fad0c4, #ff9a9e);
  background-size: 400% 400%;
  animation: ${backgroundAnimation} 15s ease infinite;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Card = styled.div`
  background: #ffffff;
  padding: 2rem 2.5rem;
  border-radius: 16px;
  box-shadow: 0px 10px 30px rgba(0,0,0,0.2);
  width: 100%;
  max-width: 400px;
  position: relative;
  transition: transform 0.3s;
  &:hover {
    transform: translateY(-5px);
  }
`;

const CardHeader = styled.div`
  text-align: center;
  margin-bottom: 1.5rem;
`;

const Title = styled.h2`
  margin: 0;
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
  padding: 0.85rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s, box-shadow 0.3s;
  &:focus {
    border-color: #007bff;
    outline: none;
    box-shadow: 0 0 8px rgba(0,123,255,0.3);
  }
`;

const Button = styled.button`
  padding: 0.85rem;
  background: linear-gradient(90deg, #007bff, #00d2ff);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
  &:hover {
    background: linear-gradient(90deg, #0056b3, #0099cc);
  }
  &:disabled {
    background: linear-gradient(90deg, #cccccc, #bbbbbb);
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #ff4d4f;
  text-align: center;
  margin-top: 0.5rem;
  font-size: 0.95rem;
`;

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    localStorage.clear();

    try {
      // 로그인 요청
      const response = await loginApi(username, password);
      console.log("Login response:", response);
      
      // response 구조 확인 - userId 속성이 있는지 확인
      if ('userId' in response) {
        try {
          // 토큰을 저장
          const { accessToken, refreshToken } = response;
          localStorage.setItem("accessToken", accessToken);
          if (refreshToken) {
            localStorage.setItem("refreshToken", refreshToken);
          }
          
          // API 헤더 설정
          axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
          
          // 사용자 정보 가져오기
          const userData = await fetchUserInfo();
          
          // 로그인 처리
          login(userData, accessToken, refreshToken);
          navigate('/');
        } catch (userError) {
          console.error("Failed to fetch user data:", userError);
          setError('사용자 정보를 가져오는데 실패했습니다.');
        }
      } 
      // user 속성이 있는지 확인
      else if ('user' in response) {
        // TypeScript에게 이 속성이 존재함을 알려주기 위한 타입 단언
        const loginResp = response as unknown as { user: any, accessToken: string, refreshToken: string };
        login(loginResp.user, loginResp.accessToken, loginResp.refreshToken);
        navigate('/');
      }
      else {
        console.error("Unexpected login response format:", response);
        setError('로그인 응답 형식이 올바르지 않습니다.');
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError('아이디 또는 비밀번호가 올바르지 않습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FullScreenContainer>
      <Card>
        <CardHeader>
          <Title>로그인</Title>
        </CardHeader>
        <Form onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="아이디"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
          />
          <Input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? '로그인 중...' : '로그인'}
          </Button>
        </Form>
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </Card>
    </FullScreenContainer>
  );
};

export default Login;