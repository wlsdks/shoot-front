// src/features/auth/Login.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../shared/lib/hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import {
    PageWrapper,
    MobileContainer,
    LoginContent,
    LogoArea,
    Logo,
    LogoTagline,
    FormTitle,
    Form,
    InputGroup,
    Label,
    InputWrapper,
    InputIcon,
    Input,
    RememberContainer,
    RememberMeLabel,
    CheckboxContainer,
    Checkbox,
    CheckboxControl,
    ForgotPasswordLink,
    Button,
    ErrorContainer,
    ErrorIcon,
    ErrorText,
    AccountLinks,
    AccountLink,
    SpinnerIcon
} from './styles/Login.styles';

const Login: React.FC = () => {
    const { login, isPending, error, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(null);

    useEffect(() => {
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
            setLoginError('아이디 또는 비밀번호가 일치하지 않습니다.');
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
                    
                    <FormTitle>로그인</FormTitle>
                    
                    <Form onSubmit={handleSubmit}>
                        <InputGroup>
                            <Label htmlFor="username">아이디</Label>
                            <InputWrapper>
                                <InputIcon>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </InputIcon>
                                <Input
                                    id="username"
                                    type="text"
                                    placeholder="아이디를 입력하세요"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    disabled={isPending}
                                    autoComplete="username"
                                />
                            </InputWrapper>
                        </InputGroup>
                        
                        <InputGroup>
                            <Label htmlFor="password">비밀번호</Label>
                            <InputWrapper>
                                <InputIcon>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </InputIcon>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="비밀번호를 입력하세요"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isPending}
                                    autoComplete="current-password"
                                />
                            </InputWrapper>
                        </InputGroup>
                        
                        <RememberContainer>
                            <RememberMeLabel>
                                <CheckboxContainer>
                                    <Checkbox
                                        checked={rememberMe}
                                        onChange={() => setRememberMe(!rememberMe)}
                                        disabled={isPending}
                                    />
                                    <CheckboxControl />
                                </CheckboxContainer>
                                자동 로그인
                            </RememberMeLabel>
                            <ForgotPasswordLink to="/find-password">비밀번호 찾기</ForgotPasswordLink>
                        </RememberContainer>
                        
                        <Button type="submit" disabled={isPending || !username || !password}>
                            {isPending ? (
                                <>
                                    <SpinnerIcon />
                                    로그인 중...
                                </>
                            ) : '로그인'}
                        </Button>
                    </Form>
                    
                    {(error || loginError) && (
                        <ErrorContainer>
                            <ErrorIcon>
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                    <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    <path d="M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </ErrorIcon>
                            <ErrorText>{loginError || error?.message}</ErrorText>
                        </ErrorContainer>
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