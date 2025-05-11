// src/features/auth/Login.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../shared/lib/hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const slideUp = keyframes`
    from { opacity: 0; transform: translateY(40px); }
    to { opacity: 1; transform: translateY(0); }
`;

const PageWrapper = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(145deg, #f8fafc, #e2e8f0);
    z-index: 1000;
    overflow: hidden;
`;

const MobileContainer = styled.div`
    width: 100%;
    max-width: 375px;
    height: 100%;
    max-height: 667px;
    background-color: #fff;
    border-radius: 30px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: ${fadeIn} 0.5s ease-out;
    position: relative;
    border: 1px solid #eaeaea;
`;

const LoginContent = styled.div`
    display: flex;
    flex-direction: column;
    padding: 2.5rem;
    height: 100%;
    background: white;
    overflow-y: auto;
`;

const LogoArea = styled.div`
    margin-bottom: 3rem;
    text-align: center;
    animation: ${slideUp} 0.5s ease-out;
`;

const Logo = styled.div`
    font-size: 3rem;
    font-weight: 800;
    color: #4a6cf7;
    letter-spacing: -1px;
    margin-bottom: 0.8rem;
    position: relative;
    display: inline-block;
    
    &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 5px;
        background: linear-gradient(to right, #4a6cf7, #3a5be0);
        border-radius: 5px;
        transform: scaleX(0.7);
        transform-origin: left;
        transition: transform 0.3s;
    }
    
    &:hover::after {
        transform: scaleX(1);
    }
`;

const LogoTagline = styled.div`
    font-size: 1rem;
    color: #64748b;
    font-weight: 500;
`;

const FormTitle = styled.h2`
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 1.5rem;
    text-align: center;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
    animation: ${slideUp} 0.5s ease-out;
    animation-delay: 0.1s;
    animation-fill-mode: both;
`;

const InputGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const Label = styled.label`
    font-size: 0.9rem;
    font-weight: 600;
    color: #475569;
`;

const InputWrapper = styled.div`
    position: relative;
`;

const InputIcon = styled.div`
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const Input = styled.input`
    width: 100%;
    padding: 0.9rem 1rem 0.9rem 2.8rem;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    font-size: 0.95rem;
    background-color: #f8fafc;
    transition: all 0.3s;
    
    &:focus {
        outline: none;
        border-color: #4a6cf7;
        background-color: #fff;
        box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.1);
    }
    
    &::placeholder {
        color: #cbd5e1;
    }
`;

const RememberContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.85rem;
    margin-top: -0.5rem;
`;

const RememberMeLabel = styled.label`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    color: #475569;
    font-weight: 500;
`;

const CheckboxContainer = styled.div`
    position: relative;
    width: 18px;
    height: 18px;
    flex-shrink: 0;
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
    position: absolute;
    opacity: 0;
    width: 18px;
    height: 18px;
    cursor: pointer;
    
    &:checked + span {
        background-color: #4a6cf7;
        border-color: #4a6cf7;
    }
    
    &:checked + span::after {
        opacity: 1;
    }
`;

const CheckboxControl = styled.span`
    position: absolute;
    top: 0;
    left: 0;
    width: 18px;
    height: 18px;
    border-radius: 4px;
    border: 2px solid #cbd5e1;
    background: white;
    transition: all 0.2s;
    pointer-events: none;
    
    &::after {
        content: '';
        position: absolute;
        left: 5px;
        top: 2px;
        width: 5px;
        height: 9px;
        border: solid white;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
        opacity: 0;
        transition: opacity 0.2s;
    }
`;

const ForgotPasswordLink = styled(Link)`
    color: #4a6cf7;
    font-size: 0.85rem;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.2s;
    
    &:hover {
        color: #3a5be0;
        text-decoration: underline;
    }
`;

const Button = styled.button`
    padding: 1rem 1.5rem;
    background: linear-gradient(to right, #4a6cf7, #3a5be0);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    margin-top: 1rem;
    box-shadow: 0 4px 10px rgba(74, 108, 247, 0.2);
    
    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 15px rgba(74, 108, 247, 0.3);
    }
    
    &:active:not(:disabled) {
        transform: translateY(-1px);
    }
    
    &:disabled {
        background: linear-gradient(to right, #a0aef0, #94a3b8);
        cursor: not-allowed;
        box-shadow: none;
    }
`;

const ErrorContainer = styled.div`
    padding: 1rem;
    margin-top: 1rem;
    background-color: #fef2f2;
    border-radius: 10px;
    border-left: 4px solid #dc2626;
    display: flex;
    align-items: center;
    gap: 0.8rem;
    animation: ${fadeIn} 0.3s ease;
`;

const ErrorIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    color: #dc2626;
    flex-shrink: 0;
    
    svg {
        width: 20px;
        height: 20px;
    }
`;

const ErrorText = styled.div`
    color: #b91c1c;
    font-size: 0.9rem;
    font-weight: 500;
    flex: 1;
`;

const AccountLinks = styled.div`
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 2rem;
    position: relative;
    padding-top: 1.5rem;
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 1px;
        background: #e2e8f0;
    }
`;

const AccountLink = styled(Link)`
    font-size: 0.85rem;
    color: #64748b;
    text-decoration: none;
    position: relative;
    font-weight: 500;
    
    &:hover {
        color: #4a6cf7;
    }
    
    &::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        width: 100%;
        height: 1px;
        background-color: #4a6cf7;
        transform: scaleX(0);
        transition: transform 0.3s ease;
    }
    
    &:hover::after {
        transform: scaleX(1);
    }
    
    &:not(:last-child) {
        padding-right: 1rem;
    }
    
    &:not(:last-child)::before {
        content: '';
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 1px;
        height: 12px;
        background-color: #e2e8f0;
    }
`;

const SpinnerIcon = styled.div`
    display: inline-block;
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 0.8s linear infinite;
    margin-right: 8px;
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;

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