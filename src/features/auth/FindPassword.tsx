import React, { useState } from 'react';
import {
    PageWrapper,
    MobileContainer,
    AuthHeader as Header,
    BackButton,
    AuthTitle as Title,
    Form,
    InputGroup,
    Label,
    Input,
    Button,
    ErrorMessage,
    AuthSuccessMessage as SuccessMessage,
    AuthLinkContainer as LinkContainer,
    AuthLink as StyledLink,
} from './ui/common';
import styled from 'styled-components';

const Content = styled.div`
    flex: 1;
    padding: 24px;
    display: flex;
    flex-direction: column;
`;

const Description = styled.p`
    color: #666;
    font-size: 0.95rem;
    line-height: 1.5;
    margin-bottom: 24px;
`;

const StepIndicator = styled.div`
    display: flex;
    justify-content: space-between;
    margin-bottom: 32px;
    position: relative;
    
    &::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        height: 2px;
        background: #e9ecef;
        z-index: 0;
    }
`;

const Step = styled.div<{ active?: boolean; completed?: boolean }>`
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: ${props => props.completed ? '#007bff' : props.active ? '#fff' : '#e9ecef'};
    border: 2px solid ${props => props.completed || props.active ? '#007bff' : '#e9ecef'};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.completed ? '#fff' : props.active ? '#007bff' : '#adb5bd'};
    font-weight: 600;
    position: relative;
    z-index: 1;
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 12px;
    margin-top: 24px;
`;

const SecondaryButton = styled(Button)`
    background: #e9ecef;
    color: #495057;
    
    &:hover {
        background: #dee2e6;
    }
`;

const VerificationCodeInput = styled.div`
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
`;

const CodeInput = styled(Input)`
    width: 48px;
    text-align: center;
    padding: 12px 0;
    font-size: 1.2rem;
    
    &::-webkit-inner-spin-button,
    &::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
`;

const ResendButton = styled.button`
    background: none;
    border: none;
    color: #007bff;
    font-size: 0.9rem;
    text-decoration: underline;
    cursor: pointer;
    margin-top: 8px;
    
    &:disabled {
        color: #adb5bd;
        cursor: not-allowed;
    }
`;

const RadioContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 24px;
`;

const RadioOption = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const RadioInput = styled.input`
    width: 20px;
    height: 20px;
    margin: 0;
`;

const RadioLabel = styled.label`
    font-size: 1rem;
    color: #495057;
`;

const FindPassword: React.FC = () => {
    const [step, setStep] = useState(1);
    const [userId, setUserId] = useState('');
    const [verificationMethod, setVerificationMethod] = useState<'email' | 'phone'>('email');
    const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleVerificationCodeChange = (index: number, value: string) => {
        if (value.length <= 1 && /^\d*$/.test(value)) {
            const newCode = [...verificationCode];
            newCode[index] = value;
            setVerificationCode(newCode);
            
            // 자동으로 다음 입력란으로 포커스 이동
            if (value && index < 5) {
                const nextInput = document.getElementById(`code-${index + 1}`);
                nextInput?.focus();
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        
        try {
            switch (step) {
                case 1:
                    if (!userId) {
                        throw new Error('아이디를 입력해주세요.');
                    }
                    // API 호출 대신 임시 지연
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    setStep(2);
                    break;
                    
                case 2:
                    if (!verificationMethod) {
                        throw new Error('인증 방법을 선택해주세요.');
                    }
                    // API 호출 대신 임시 지연
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    setStep(3);
                    break;
                    
                case 3:
                    const code = verificationCode.join('');
                    if (code.length !== 6) {
                        throw new Error('인증번호 6자리를 입력해주세요.');
                    }
                    // API 호출 대신 임시 지연
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    setSuccess(true);
                    break;
            }
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('오류가 발생했습니다. 다시 시도해주세요.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        setIsLoading(true);
        try {
            // API 호출 대신 임시 지연
            await new Promise(resolve => setTimeout(resolve, 1000));
            setVerificationCode(['', '', '', '', '', '']);
            // 성공 메시지 표시
        } catch (err) {
            setError('인증번호 재전송에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setIsLoading(false);
        }
    };

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
                    {!success ? (
                        <>
                            <StepIndicator>
                                <Step active={step === 1} completed={step > 1}>1</Step>
                                <Step active={step === 2} completed={step > 2}>2</Step>
                                <Step active={step === 3}>3</Step>
                            </StepIndicator>
                            
                            <Form onSubmit={handleSubmit}>
                                {step === 1 && (
                                    <>
                                        <Description>
                                            가입하신 아이디를 입력해주세요.
                                        </Description>
                                        <InputGroup>
                                            <Label htmlFor="userId">아이디</Label>
                                            <Input
                                                id="userId"
                                                type="text"
                                                placeholder="아이디 입력"
                                                value={userId}
                                                onChange={(e) => setUserId(e.target.value)}
                                                disabled={isLoading}
                                            />
                                        </InputGroup>
                                    </>
                                )}
                                
                                {step === 2 && (
                                    <>
                                        <Description>
                                            비밀번호를 찾기 위한 인증 방법을 선택해주세요.
                                        </Description>
                                        <RadioContainer>
                                            <RadioOption>
                                                <RadioInput
                                                    type="radio"
                                                    id="email"
                                                    name="verificationMethod"
                                                    value="email"
                                                    checked={verificationMethod === 'email'}
                                                    onChange={() => setVerificationMethod('email')}
                                                />
                                                <RadioLabel htmlFor="email">이메일로 인증하기</RadioLabel>
                                            </RadioOption>
                                            <RadioOption>
                                                <RadioInput
                                                    type="radio"
                                                    id="phone"
                                                    name="verificationMethod"
                                                    value="phone"
                                                    checked={verificationMethod === 'phone'}
                                                    onChange={() => setVerificationMethod('phone')}
                                                />
                                                <RadioLabel htmlFor="phone">휴대폰으로 인증하기</RadioLabel>
                                            </RadioOption>
                                        </RadioContainer>
                                    </>
                                )}
                                
                                {step === 3 && (
                                    <>
                                        <Description>
                                            {verificationMethod === 'email' ? '이메일' : '휴대폰'}로 전송된 인증번호 6자리를 입력해주세요.
                                        </Description>
                                        <VerificationCodeInput>
                                            {verificationCode.map((digit, index) => (
                                                <CodeInput
                                                    key={index}
                                                    id={`code-${index}`}
                                                    type="number"
                                                    value={digit}
                                                    onChange={(e) => handleVerificationCodeChange(index, e.target.value)}
                                                    maxLength={1}
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
                                    </>
                                )}
                                
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
                                
                                <ButtonGroup>
                                    {step > 1 && (
                                        <SecondaryButton
                                            type="button"
                                            onClick={() => setStep(step - 1)}
                                            disabled={isLoading}
                                        >
                                            이전
                                        </SecondaryButton>
                                    )}
                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading ? '처리 중...' : step === 3 ? '확인' : '다음'}
                                    </Button>
                                </ButtonGroup>
                            </Form>
                        </>
                    ) : (
                        <>
                            <SuccessMessage>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                                인증이 완료되었습니다
                            </SuccessMessage>
                            
                            <Description>
                                새로운 비밀번호를 설정할 수 있는 링크를 {verificationMethod === 'email' ? '이메일' : '휴대폰'}로 전송했습니다.
                            </Description>
                            
                            <LinkContainer>
                                <StyledLink to="/login">로그인하기</StyledLink>
                            </LinkContainer>
                        </>
                    )}
                </Content>
            </MobileContainer>
        </PageWrapper>
    );
};

export default FindPassword;