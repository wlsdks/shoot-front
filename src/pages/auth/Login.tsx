import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { login as loginApi, fetchUserInfo } from '../../services/auth';
import axios from 'axios';
import {
  PageWrapper,
  MobileContainer,
  Form,
  InputGroup,
  Label,
  Input,
  Button,
  ErrorMessage,
  LinkContainer,
  StyledLink
} from '../../styles/auth/common';
import styled from 'styled-components';

const LoginContent = styled.div`
  display: flex;
  flex-direction: column;
  padding: 2rem;
  justify-content: center;
  align-items: center;
  height: 100%;
  background: linear-gradient(to bottom, #ffffff 0%, #f9f9f9 100%);
`;

const LogoArea = styled.div`
  margin-bottom: 2.5rem;
  text-align: center;
`;

const Logo = styled.div`
  font-size: 2.5rem;
  font-weight: 800;
  color: #007bff;
  letter-spacing: -1px;
  margin-bottom: 0.5rem;
`;

const LogoTagline = styled.div`
  font-size: 0.95rem;
  color: #666;
`;

const RememberContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.875rem;
  margin-top: -0.5rem;
`;

const RememberMeLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: #555;
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  cursor: pointer;
`;

const AccountLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
  width: 100%;
`;

const AccountLink = styled(Link)`
  font-size: 0.85rem;
  color: #555;
  text-decoration: none;
  position: relative;
  
  &:hover {
    color: #007bff;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
    height: 1px;
    background-color: #007bff;
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }
  
  &:hover::after {
    transform: scaleX(1);
  }
  
  &:not(:last-child)::before {
    content: '|';
    position: absolute;
    right: -0.6rem;
    color: #ddd;
  }
`;

const ErrorIcon = styled.div`
  margin-right: 0.5rem;
  display: flex;
  align-items: center;
`;

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    localStorage.clear();

    try {
      const loginResponse = await loginApi(username, password);
      const { accessToken, refreshToken } = loginResponse;
      localStorage.setItem("accessToken", accessToken);
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }
      
      axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
      
      try {
        const userData = await fetchUserInfo();
        login(userData, accessToken, refreshToken);
        navigate('/');
      } catch (userError) {
        console.error("Failed to fetch user data:", userError);
        setError('사용자 정보를 가져오는데 실패했습니다.');
      }
    } catch (err) {
      console.error("Login failed:", err);
      if (err instanceof Error) {
        setError(err.message || '아이디 또는 비밀번호가 올바르지 않습니다.');
      } else {
        setError('아이디 또는 비밀번호가 올바르지 않습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageWrapper>
      <MobileContainer>
        <LoginContent>
          <LogoArea>
            <Logo>SHOOT</Logo>
            <LogoTagline>친구들과 함께 대화하세요</LogoTagline>
          </LogoArea>
          
          <Form onSubmit={handleSubmit}>
            <InputGroup>
              <Label htmlFor="username">아이디</Label>
              <Input
                id="username"
                type="text"
                placeholder="아이디를 입력하세요"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                autoComplete="username"
              />
            </InputGroup>
            
            <InputGroup>
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="current-password"
              />
            </InputGroup>
            
            <RememberContainer>
              <RememberMeLabel>
                <Checkbox 
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  disabled={isLoading}
                />
                자동 로그인
              </RememberMeLabel>
            </RememberContainer>
            
            <Button type="submit" disabled={isLoading || !username || !password}>
              {isLoading ? '로그인 중...' : '로그인'}
            </Button>
          </Form>
          
          {error && (
            <ErrorMessage>
              <ErrorIcon>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </ErrorIcon>
              {error}
            </ErrorMessage>
          )}
          
          <AccountLinks>
            <AccountLink to="/find-id">아이디 찾기</AccountLink>
            <AccountLink to="/find-password">비밀번호 찾기</AccountLink>
            <AccountLink to="/signup">회원가입</AccountLink>
          </AccountLinks>
        </LoginContent>
      </MobileContainer>
    </PageWrapper>
  );
};

export default Login;