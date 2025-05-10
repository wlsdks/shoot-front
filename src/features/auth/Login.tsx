import React, { useState } from 'react';
import { useAuth } from '../../shared/lib/hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import {
  PageWrapper,
  MobileContainer,
  Form,
  InputGroup,
  Label,
  Input,
  Button,
  ErrorMessage
} from '../auth/styles/Auth.styles';
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
  const { login, isPending, error, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    
    try {
      await login({ username, password });
    } catch (err) {
      console.error('로그인 실패:', err);
      setLoginError('로그인에 실패했습니다. 다시 시도해주세요.');
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
                disabled={isPending}
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
                disabled={isPending}
                autoComplete="current-password"
              />
            </InputGroup>
            
            <RememberContainer>
              <RememberMeLabel>
                <Checkbox 
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  disabled={isPending}
                />
                자동 로그인
              </RememberMeLabel>
            </RememberContainer>
            
            <Button type="submit" disabled={isPending || !username || !password}>
              {isPending ? '로그인 중...' : '로그인'}
            </Button>
          </Form>
          
          {(error || loginError) && (
            <ErrorMessage>
              <ErrorIcon>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </ErrorIcon>
              {loginError || error?.message}
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