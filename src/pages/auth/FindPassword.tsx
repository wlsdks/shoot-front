import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

// 애니메이션 정의
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
    from { transform: translateX(50px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
`;

// 페이지 전체를 고정시키는 컨테이너
const PageWrapper = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f5f7fa;
    z-index: 1000;
    overflow: hidden;
`;

// 모바일 디바이스 크기에 맞는 컨테이너
const MobileContainer = styled.div`
    width: 375px;
    height: 667px;
    background-color: #fff;
    border-radius: 30px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    border: 2px solid #ddd;
    position: relative;
    animation: ${fadeIn} 0.5s ease-out;
    overflow: hidden;
`;

// 헤더 영역
const Header = styled.div`
    padding: 16px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #f0f0f0;
    position: relative;
`;

const BackButton = styled(Link)`
    position: absolute;
    left: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #555;
    text-decoration: none;
    
    &:hover {
        color: #007bff;
    }
`;

const Title = styled.h1`
    font-size: 1.25rem;
    color: #333;
    margin: 0;
    flex: 1;
    text-align: center;
    font-weight: 600;
`;

// 단계 표시기
const StepIndicator = styled.div`
    display: flex;
    justify-content: center;
    margin: 20px 0;
    padding: 0 20px;
`;

const Step = styled.div<{ active: boolean; completed: boolean }>`
    width: ${props => props.active ? '36px' : '10px'};
    height: 10px;
    background-color: ${props => 
        props.completed ? '#007bff' : 
        props.active ? '#b3d7ff' : '#e0e0e0'};
    border-radius: 10px;
    margin: 0 4px;
    transition: all 0.3s ease;
`;

// 콘텐츠 영역
const Content = styled.div`
    flex: 1;
    padding: 0 24px 24px;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    
    /* 스크롤바 커스텀 */
    &::-webkit-scrollbar {
        width: 5px;
    }
    
    &::-webkit-scrollbar-thumb {
        background-color: #ddd;
        border-radius: 3px;
    }
    
    &::-webkit-scrollbar-track {
        background-color: #f5f5f5;
    }
`;

const Description = styled.p`
    color: #666;
    font-size: 0.95rem;
    line-height: 1.5;
    margin-bottom: 24px;
`;

// 단계별 컨테이너
const StepContainer = styled.div<{ visible: boolean }>`
    display: ${props => props.visible ? 'block' : 'none'};
    animation: ${slideIn} 0.3s ease-out;
    width: 100%;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 100%;
`;

const InputGroup = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
`;

const Label = styled.label`
    font-size: 0.875rem;
    font-weight: 500;
    color: #555;
    margin-bottom: 8px;
`;

const Input = styled.input`
    padding: 12px 14px;
    border: 1px solid #ddd;
    border-radius: 12px;
    font-size: 1rem;
    background-color: #f9f9f9;
    transition: all 0.2s ease;
    width: 100%;
    box-sizing: border-box;
    
    &:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.15);
        background-color: #fff;
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 12px;
    margin-top: 16px;
    width: 100%;
`;

const Button = styled.button<{ secondary?: boolean }>`
    flex: ${props => props.secondary ? '1' : '2'};
    padding: 14px;
    background: ${props => 
        props.secondary ? '#f1f3f5' : 'linear-gradient(90deg, #007bff, #0062cc)'};
    color: ${props => props.secondary ? '#495057' : 'white'};
    border: none;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: ${props => 
        props.secondary ? 'none' : '0 4px 10px rgba(0, 123, 255, 0.2)'};
    
    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: ${props => 
        props.secondary ? '0 2px 5px rgba(0, 0, 0, 0.1)' : '0 6px 15px rgba(0, 123, 255, 0.3)'};
        background: ${props => 
        props.secondary ? '#e9ecef' : 'linear-gradient(90deg, #0069d9, #0056b3)'};
    }
    
    &:active:not(:disabled) {
        transform: translateY(0);
    }
    
    &:disabled {
        background: ${props => 
        props.secondary ? '#f8f9fa' : 'linear-gradient(90deg, #cccccc, #bbbbbb)'};
        color: ${props => props.secondary ? '#adb5bd' : '#f8f9fa'};
        cursor: not-allowed;
        box-shadow: none;
    }
`;

const ErrorMessage = styled.div`
    color: #e53935;
    text-align: center;
    margin-top: 16px;
    font-size: 0.9rem;
    background-color: rgba(229, 57, 53, 0.1);
    padding: 12px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    box-sizing: border-box;
`;

const SuccessMessage = styled.div`
    color: #28a745;
    text-align: center;
    margin-top: 16px;
    font-size: 0.9rem;
    background-color: rgba(40, 167, 69, 0.1);
    padding: 12px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    width: 100%;
    box-sizing: border-box;
`;

const VerificationCodeInput = styled.div`
    display: flex;
    gap: 8px;
    justify-content: center;
    margin-top: 8px;
    width: 100%;
`;

const CodeInput = styled.input`
    width: 40px;
    height: 50px;
    text-align: center;
    font-size: 1.2rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #f9f9f9;
    
    &:focus {
        outline: none;
        border-color: #007bff;
        background-color: #fff;
    }
`;

const ResendButton = styled.button`
    background: none;
    border: none;
    color: #007bff;
    font-size: 0.9rem;
    padding: 8px;
    cursor: pointer;
    margin-top: 16px;
    text-decoration: underline;
    
    &:hover {
        color: #0056b3;
    }
`;

const LinkContainer = styled.div`
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 24px;
    width: 100%;
`;

const StyledLink = styled(Link)`
    color: #007bff;
    text-decoration: none;
    font-size: 0.9rem;
    
    &:hover {
        text-decoration: underline;
    }
`;

// 인증 방법 라디오 버튼 스타일 컴포넌트
const RadioContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
`;

const RadioOption = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const RadioInput = styled.input`
    cursor: pointer;
`;

const RadioLabel = styled.label`
    cursor: pointer;
    font-size: 0.95rem;
    color: #333;
`;

const FindPassword: React.FC = () => {
    // 단계 상태
    const [currentStep, setCurrentStep] = useState(1);

    // 입력 데이터 상태
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [verificationType, setVerificationType] = useState<'email' | 'sms'>('email');
    const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // UI 상태
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // 코드 입력 필드 참조
    const codeInputRefs = [
        React.useRef<HTMLInputElement>(null),
        React.useRef<HTMLInputElement>(null),
        React.useRef<HTMLInputElement>(null),
        React.useRef<HTMLInputElement>(null),
        React.useRef<HTMLInputElement>(null),
        React.useRef<HTMLInputElement>(null),
    ];

    // 첫 번째 단계: 사용자 확인
    const handleStep1Submit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!username || !email) {
            setError('모든 필드를 입력해주세요.');
            return;
        }
        
        setIsLoading(true);
        setError(null);
        
        try {
            // 실제 구현 시 여기에 API 호출 코드가 들어갑니다.
            // const response = await checkUserExists(username, email);
            
            // 테스트용 지연
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 성공 후 다음 단계로
            setCurrentStep(2);
        } catch (err) {
            console.error('사용자 확인 실패:', err);
            setError('입력하신 정보와 일치하는 계정을 찾을 수 없습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    // 두 번째 단계: 인증번호 전송
    const handleStep2Submit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        setIsLoading(true);
        setError(null);
        
        try {
            // 실제 구현 시 여기에 API 호출 코드가 들어갑니다.
            // const response = await sendVerificationCode(username, email, verificationType);
            
            // 테스트용 지연
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 성공 후 다음 단계로
            setCurrentStep(3);
        } catch (err) {
            console.error('인증번호 전송 실패:', err);
            setError('인증번호 전송에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    // 세 번째 단계: 인증번호 확인
    const handleStep3Submit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const code = verificationCode.join('');
        if (code.length !== 6) {
            setError('6자리 인증번호를 입력해주세요.');
            return;
        }
        
        setIsLoading(true);
        setError(null);
        
        try {
            // 실제 구현 시 여기에 API 호출 코드가 들어갑니다.
            // const response = await verifyCode(username, code);
            
            // 테스트용 지연
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 성공 후 다음 단계로
            setCurrentStep(4);
        } catch (err) {
            console.error('인증번호 확인 실패:', err);
            setError('인증번호가 올바르지 않습니다. 다시 확인해주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    // 네 번째 단계: 새 비밀번호 설정
    const handleStep4Submit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!newPassword || !confirmPassword) {
            setError('모든 필드를 입력해주세요.');
            return;
        }
        
        if (newPassword.length < 8) {
            setError('비밀번호는 8자 이상이어야 합니다.');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }
        
        setIsLoading(true);
        setError(null);
        
        try {
            // 실제 구현 시 여기에 API 호출 코드가 들어갑니다.
            // const response = await resetPassword(username, newPassword);
            
            // 테스트용 지연
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 성공 처리
            setSuccess(true);
        } catch (err) {
            console.error('비밀번호 변경 실패:', err);
            setError('비밀번호 변경에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    // 인증번호 입력 핸들러
    const handleCodeChange = (index: number, value: string) => {
        if (value.length > 1) {
            value = value.charAt(0);
        }
        
        const newCode = [...verificationCode];
        newCode[index] = value;
        setVerificationCode(newCode);
        
        // 자동으로 다음 입력란으로 포커스 이동
        if (value && index < 5) {
            codeInputRefs[index + 1].current?.focus();
        }
    };

    // 인증번호 재전송
    const handleResendCode = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            // 실제 구현 시 여기에 API 호출 코드가 들어갑니다.
            // const response = await sendVerificationCode(username, email, verificationType);
            
            // 테스트용 지연
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 성공 메시지
            setError('인증번호가 재전송되었습니다.');
        } catch (err) {
            console.error('인증번호 재전송 실패:', err);
            setError('인증번호 재전송에 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    // 이전 단계로 이동
    const goToPreviousStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            setError(null);
        }
    };

    // 성공 화면
    if (success) {
        return (
        <PageWrapper>
            <MobileContainer>
            <Header>
                <BackButton to="/login">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                </BackButton>
                <Title>비밀번호 찾기</Title>
            </Header>
            
            <Content>
                <SuccessMessage>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <p>비밀번호가 성공적으로 변경되었습니다.</p>
                </SuccessMessage>
                
                <Description style={{ textAlign: 'center', marginTop: '24px' }}>
                    새로운 비밀번호로 로그인하여 서비스를 이용하실 수 있습니다.
                </Description>
                
                <Button 
                    style={{ marginTop: '32px', width: '100%' }}
                    onClick={() => window.location.href = '/login'}
                >
                로그인 하기
                </Button>
            </Content>
            </MobileContainer>
        </PageWrapper>
        );
    }

    return (
        <PageWrapper>
        <MobileContainer>
            <Header>
            <BackButton to="/login">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
            </BackButton>
            <Title>비밀번호 찾기</Title>
            </Header>
            
            <StepIndicator>
                <Step active={currentStep === 1} completed={currentStep > 1} />
                <Step active={currentStep === 2} completed={currentStep > 2} />
                <Step active={currentStep === 3} completed={currentStep > 3} />
                <Step active={currentStep === 4} completed={currentStep > 4} />
            </StepIndicator>
            
            <Content>
            {/* 1단계: 사용자 확인 */}
            <StepContainer visible={currentStep === 1}>
                <Description>
                    비밀번호를 찾기 위해 아이디와 가입 시 등록한 이메일을 입력해주세요.
                </Description>
                
                <Form onSubmit={handleStep1Submit}>
                <InputGroup>
                    <Label htmlFor="username">아이디</Label>
                    <Input
                        id="username"
                        type="text"
                        placeholder="아이디 입력"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={isLoading}
                    />
                </InputGroup>
                
                <InputGroup>
                    <Label htmlFor="email">이메일</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="가입 시 등록한 이메일"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                    />
                </InputGroup>
                
                <Button type="submit" disabled={isLoading || !username || !email}>
                    {isLoading ? '확인 중...' : '다음'}
                </Button>
                </Form>
            </StepContainer>
            
            {/* 2단계: 인증 방법 선택 */}
            <StepContainer visible={currentStep === 2}>
                <Description>
                본인 확인을 위한 인증 방법을 선택해주세요.
                </Description>
                
                <Form onSubmit={handleStep2Submit}>
                <InputGroup>
                    <Label>인증 방법</Label>
                    <RadioContainer>
                    <RadioOption>
                        <RadioInput 
                            type="radio" 
                            id="email-verification" 
                            name="verification-type"
                            checked={verificationType === 'email'}
                            onChange={() => setVerificationType('email')}
                        />
                        <RadioLabel htmlFor="email-verification">
                            이메일로 인증번호 받기 ({email})
                        </RadioLabel>
                    </RadioOption>
                    
                    <RadioOption>
                        <RadioInput 
                            type="radio" 
                            id="sms-verification" 
                            name="verification-type"
                            checked={verificationType === 'sms'}
                            onChange={() => setVerificationType('sms')}
                        />
                        <RadioLabel htmlFor="sms-verification">
                            휴대폰으로 인증번호 받기
                        </RadioLabel>
                    </RadioOption>
                    </RadioContainer>
                </InputGroup>
                
                <ButtonGroup>
                    <Button 
                        type="button" 
                        secondary 
                        onClick={goToPreviousStep}
                        disabled={isLoading}
                    >
                        이전
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? '전송 중...' : '인증번호 받기'}
                    </Button>
                </ButtonGroup>
                </Form>
            </StepContainer>
            
            {/* 3단계: 인증번호 확인 */}
            <StepContainer visible={currentStep === 3}>
                <Description>
                {verificationType === 'email' 
                    ? `${email}로 전송된 6자리 인증번호를 입력해주세요.`
                    : '휴대폰으로 전송된 6자리 인증번호를 입력해주세요.'}
                </Description>
                
                <Form onSubmit={handleStep3Submit}>
                <InputGroup>
                    <Label>인증번호</Label>
                    <VerificationCodeInput>
                        {verificationCode.map((digit, index) => (
                            <CodeInput
                            key={index}
                            ref={codeInputRefs[index]}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleCodeChange(index, e.target.value)}
                            disabled={isLoading}
                            />
                        ))}
                    </VerificationCodeInput>
                    <ResendButton 
                        type="button" 
                        onClick={handleResendCode}
                        disabled={isLoading}
                    >
                        인증번호 재전송
                    </ResendButton>
                </InputGroup>
                
                <ButtonGroup>
                    <Button 
                        type="button" 
                        secondary 
                        onClick={goToPreviousStep}
                        disabled={isLoading}
                    >
                        이전
                    </Button>
                    <Button 
                        type="submit" 
                        disabled={isLoading || verificationCode.join('').length !== 6}
                    >
                        {isLoading ? '확인 중...' : '확인'}
                    </Button>
                </ButtonGroup>
                </Form>
            </StepContainer>
            
            {/* 4단계: 새 비밀번호 설정 */}
            <StepContainer visible={currentStep === 4}>
                <Description>
                    새로운 비밀번호를 입력해주세요.
                </Description>
                
                <Form onSubmit={handleStep4Submit}>
                <InputGroup>
                    <Label htmlFor="new-password">새 비밀번호</Label>
                    <Input
                        id="new-password"
                        type="password"
                        placeholder="8자 이상 입력"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={isLoading}
                    />
                </InputGroup>
                
                <InputGroup>
                    <Label htmlFor="confirm-password">새 비밀번호 확인</Label>
                    <Input
                        id="confirm-password"
                        type="password"
                        placeholder="비밀번호 재입력"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isLoading}
                    />
                </InputGroup>
                
                <ButtonGroup>
                    <Button 
                        type="button" 
                        secondary 
                        onClick={goToPreviousStep}
                        disabled={isLoading}
                    >
                        이전
                    </Button>
                    <Button 
                        type="submit" 
                        disabled={isLoading || !newPassword || !confirmPassword}
                    >
                        {isLoading ? '변경 중...' : '비밀번호 변경'}
                    </Button>
                </ButtonGroup>
                </Form>
            </StepContainer>
            
            {error && (
                <ErrorMessage>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    {error}
                </ErrorMessage>
            )}
            
            <LinkContainer>
                <StyledLink to="/login">로그인</StyledLink>
                <StyledLink to="/find-id">아이디 찾기</StyledLink>
                <StyledLink to="/signup">회원가입</StyledLink>
            </LinkContainer>
            </Content>
        </MobileContainer>
        </PageWrapper>
    );
};

export default FindPassword;