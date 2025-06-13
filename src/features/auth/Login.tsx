// src/features/auth/Login.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../shared/lib/hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { Icon, Button, Input, Checkbox } from '../../shared/ui';
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
    RememberContainer,
    RememberMeLabel,
    ForgotPasswordLink,
    ErrorContainer,
    ErrorIcon,
    ErrorText,
    AccountLinks,
    AccountLink,
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
                            <Input
                                id="username"
                                type="text"
                                placeholder="아이디를 입력하세요"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={isPending}
                                autoComplete="username"
                                icon={<Icon name="user" />}
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
                                icon={<Icon name="lock" />}
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
                            <ForgotPasswordLink to="/find-password">비밀번호 찾기</ForgotPasswordLink>
                        </RememberContainer>
                        
                        <Button
                            type="submit"
                            disabled={isPending || !username || !password}
                            isLoading={isPending}
                            loadingText="로그인 중..."
                        >
                            로그인
                        </Button>
                    </Form>
                    
                    {(error || loginError) && (
                        <ErrorContainer>
                            <ErrorIcon>
                                <Icon name="error" />
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