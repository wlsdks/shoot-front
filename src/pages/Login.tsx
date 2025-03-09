import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { login as loginApi, fetchUserInfo } from '../services/auth';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';

// Animation definitions
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Main container with fixed height and no scrolling
const PageContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  background-color: #f5f7fa;
  overflow: hidden;
`;

// Mobile screen container - matches BottomNavLayout dimensions
const MobileScreen = styled.div`
  width: 375px;
  height: 667px;
  background-color: #fff;
  border-radius: 30px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  border: 2px solid #ddd;
  position: relative;
  animation: ${fadeIn} 0.5s ease-out;
  overflow: hidden;
`;

// Login content container
const LoginContent = styled.div`
  display: flex;
  flex-direction: column;
  padding: 2rem;
  justify-content: center;
  align-items: center;
  height: 100%;
  background: linear-gradient(to bottom, #ffffff 0%, #f9f9f9 100%);
`;

// Logo area
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

// Form styling
const Form = styled.form`
  width: 100%;
  max-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #555;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  padding: 0.9rem 1rem;
  border: 1px solid #ddd;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background-color: #f9f9f9;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.15);
    background-color: #fff;
  }
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

const ForgotPassword = styled.a`
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

const Button = styled.button`
  padding: 1rem;
  background: linear-gradient(90deg, #007bff, #0062cc);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  margin-top: 0.75rem;
  box-shadow: 0 4px 15px rgba(0, 123, 255, 0.25);
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 7px 15px rgba(0, 123, 255, 0.3);
    background: linear-gradient(90deg, #0069d9, #0056b3);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 4px 10px rgba(0, 123, 255, 0.2);
  }
  
  &:disabled {
    background: linear-gradient(90deg, #cccccc, #bbbbbb);
    cursor: not-allowed;
    box-shadow: none;
  }
  
  &:focus {
    outline: none;
  }
`;

const RegisterPrompt = styled.div`
  margin-top: 2rem;
  text-align: center;
  font-size: 0.95rem;
  color: #666;
`;

const RegisterLink = styled(Link)`
  color: #007bff;
  text-decoration: none;
  font-weight: 600;
  margin-left: 0.25rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ErrorMessage = styled.div`
  color: #e53935;
  text-align: center;
  margin-top: 1rem;
  font-size: 0.9rem;
  background-color: rgba(229, 57, 53, 0.1);
  padding: 0.75rem 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 300px;
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
      // Login request
      const loginResponse = await loginApi(username, password);
      
      // Store tokens
      const { accessToken, refreshToken } = loginResponse;
      localStorage.setItem("accessToken", accessToken);
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }
      
      // Set API headers
      axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
      
      try {
        // Fetch user info
        const userData = await fetchUserInfo();
        
        // Login and redirect
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
    <PageContainer>
      <MobileScreen>
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
              <ForgotPassword href="#">비밀번호 찾기</ForgotPassword>
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
          
          <RegisterPrompt>
            계정이 없으신가요?
            <RegisterLink to="/signup">회원가입</RegisterLink>
          </RegisterPrompt>
        </LoginContent>
      </MobileScreen>
    </PageContainer>
  );
};

export default Login;