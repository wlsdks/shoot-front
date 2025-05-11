// src/features/user-code/ui/UserCodeSettings.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/lib/context/AuthContext';
import { useUserCode } from '../model/useUserCode';
import styled from 'styled-components';
import { fadeIn } from '../../../shared/ui/commonStyles';

const Container = styled.div`
    background-color: #fff;
    border-radius: 14px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    padding: 1.5rem;
    animation: ${fadeIn} 0.3s ease-out;
`;

const Title = styled.h3`
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
    margin: 0 0 1.2rem 0;
    position: relative;
    padding-left: 0.8rem;
    
    &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 18px;
        background: #4a6cf7;
        border-radius: 3px;
    }
`;

const Description = styled.p`
    font-size: 0.9rem;
    color: #64748b;
    line-height: 1.6;
    margin: 0 0 1.5rem 0;
`;

const CurrentCodeCard = styled.div`
    background: linear-gradient(145deg, #f0f7ff, #f8fafc);
    border-radius: 12px;
    padding: 1.2rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    border: 1px solid #d9e6ff;
    position: relative;
    
    &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(to right, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.5));
        border-radius: 12px;
        pointer-events: none;
    }
`;

const CodeLabel = styled.div`
    font-size: 0.8rem;
    color: #64748b;
    margin-bottom: 0.5rem;
    font-weight: 500;
`;

const CodeDisplay = styled.div`
    display: flex;
    align-items: center;
    font-size: 1.5rem;
    font-weight: 700;
    color: #4a6cf7;
    font-family: 'Courier New', monospace;
    letter-spacing: 1px;
`;

const CodePrefix = styled.span`
    color: #94a3b8;
    margin-right: 0.2rem;
`;

const CodeActions = styled.div`
    display: flex;
    gap: 0.8rem;
    margin-top: 1rem;
`;

const CodeButton = styled.button<{ $primary?: boolean }>`
    background: ${props => props.$primary ? '#4a6cf7' : 'white'};
    color: ${props => props.$primary ? 'white' : '#475569'};
    border: 1px solid ${props => props.$primary ? '#4a6cf7' : '#e2e8f0'};
    border-radius: 8px;
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    transition: all 0.2s;
    
    &:hover {
        background: ${props => props.$primary ? '#3a5be0' : '#f8fafc'};
        transform: translateY(-2px);
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }
    
    svg {
        width: 14px;
        height: 14px;
    }
`;

const FormSection = styled.div`
    margin-top: 1.5rem;
`;

const FormTitle = styled.h4`
    font-size: 1rem;
    font-weight: 600;
    color: #333;
    margin: 0 0 1rem 0;
    position: relative;
`;

const InputGroup = styled.div`
    margin-bottom: 1.2rem;
`;

const Label = styled.label`
    display: block;
    font-size: 0.85rem;
    color: #475569;
    margin-bottom: 0.5rem;
    font-weight: 500;
`;

const InputWrapper = styled.div`
    position: relative;
`;

const InputPrefix = styled.div`
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #4a6cf7;
    font-weight: 600;
    font-size: 1rem;
`;

const Input = styled.input`
    width: 100%;
    padding: 0.8rem 1rem 0.8rem 2.2rem;
    border: 1px solid #e1e8ed;
    border-radius: 10px;
    font-size: 0.95rem;
    background: #f8fafc;
    transition: all 0.3s;
    
    &:focus {
        outline: none;
        border-color: #4a6cf7;
        background: #fff;
        box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.1);
    }
    
    &::placeholder {
        color: #a0aec0;
    }
`;

const HelpText = styled.div`
    background: #f8fafc;
    border-radius: 10px;
    padding: 1rem;
    font-size: 0.8rem;
    color: #64748b;
    margin-bottom: 1.5rem;
    border-left: 3px solid #4a6cf7;
`;

const HelpTitle = styled.div`
    font-weight: 600;
    color: #475569;
    margin-bottom: 0.5rem;
`;

const HelpList = styled.ul`
    margin: 0;
    padding-left: 1.2rem;
    
    li {
        margin-bottom: 0.4rem;
        line-height: 1.5;
        
        &:last-child {
            margin-bottom: 0;
        }
    }
`;

const SubmitButton = styled.button`
    width: 100%;
    background: #4a6cf7;
    color: white;
    border: none;
    border-radius: 10px;
    padding: 0.9rem;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.3s;
    
    &:hover {
        background: #3a5be0;
        transform: translateY(-2px);
        box-shadow: 0 4px 10px rgba(74, 108, 247, 0.15);
    }
    
    &:disabled {
        background: #a0aef0;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }
`;

const Spinner = styled.div`
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 0.7s linear infinite;
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;

const Message = styled.div<{ $type: 'success' | 'error' }>`
    margin: 1rem 0;
    padding: 0.8rem 1rem;
    border-radius: 10px;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    animation: ${fadeIn} 0.3s ease;
    
    ${props => props.$type === 'success' 
        ? `
        background: #ecfdf5;
        border: 1px solid #d1fae5;
        color: #059669;
        `
        : `
        background: #fef2f2;
        border: 1px solid #fee2e2;
        color: #dc2626;
        `
    }
`;

const MessageIcon = styled.div`
    display: flex;
    
    svg {
        width: 16px;
        height: 16px;
    }
`;

interface UserCodeSettingsProps {
    userId: number;
}

const UserCodeSettings: React.FC<UserCodeSettingsProps> = ({ userId }) => {
    const { user } = useAuth();
    const [userCode, setUserCode] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    
    const {
        myCode,
        isLoadingMyCode,
        createCode,
        isCreatingCode,
        createCodeError
    } = useUserCode(user?.id || 0);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        if (message) {
            timeoutId = setTimeout(() => {
                setMessage(null);
            }, 5000);
        }
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [message]);
 
    const handleUpdateCode = () => {
        setMessage(null);
        createCode(userCode, {
            onSuccess: () => {
                setUserCode('');
                setMessage({ type: 'success', text: '유저코드가 성공적으로 설정되었습니다.' });
            },
            onError: (error: any) => {
                setMessage({ 
                    type: 'error', 
                    text: error.response?.data?.message || '유저코드 설정에 실패했습니다. 다시 시도해주세요.' 
                });
            }
        });
    };
 
    const handleCopyCode = () => {
        if (myCode?.userCode) {
            navigator.clipboard.writeText(myCode.userCode);
            setMessage({ type: 'success', text: '유저코드가 클립보드에 복사되었습니다.' });
        }
    };
 
    const handleGenerateRandomCode = () => {
        // 랜덤 코드 생성 (영문 대문자 + 숫자 조합)
        const randomCode = Array.from({ length: 8 }, () => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            return chars.charAt(Math.floor(Math.random() * chars.length));
        }).join('');
        
        setUserCode(randomCode);
    };
 
    if (isLoadingMyCode) {
        return (
            <Container>
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <Spinner style={{ margin: '0 auto', borderColor: '#e2e8f0', borderTopColor: '#4a6cf7' }} />
                    <div style={{ marginTop: '1rem', color: '#64748b' }}>유저코드 정보를 불러오는 중...</div>
                </div>
            </Container>
        );
    }
 
    return (
        <Container>
            <Title>내 유저코드</Title>
            <Description>
                유저코드는 친구가 당신을 쉽게 찾을 수 있게 해주는 고유한 식별자입니다.
                친구에게 유저코드를 공유하여 손쉽게 친구 추가를 할 수 있습니다.
            </Description>
 
            {myCode?.userCode && (
                <CurrentCodeCard>
                    <CodeLabel>현재 코드</CodeLabel>
                    <CodeDisplay>
                        <CodePrefix>#</CodePrefix>
                        {myCode.userCode}
                    </CodeDisplay>
                    
                    <CodeActions>
                        <CodeButton onClick={handleCopyCode}>
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M5 15H4C2.89543 15 2 14.1046 2 13V4C2 2.89543 2.89543 2 4 2H13C14.1046 2 15 2.89543 15 4V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            코드 복사
                        </CodeButton>
                        <CodeButton $primary onClick={handleGenerateRandomCode}>
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <polyline points="17 8 12 3 7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            새 코드 생성
                        </CodeButton>
                    </CodeActions>
                </CurrentCodeCard>
            )}
 
            <FormSection>
                <FormTitle>{myCode?.userCode ? '코드 변경' : '코드 설정'}</FormTitle>
                
                <InputGroup>
                    <Label htmlFor="userCode">새 유저코드</Label>
                    <InputWrapper>
                        <InputPrefix>#</InputPrefix>
                        <Input
                            id="userCode"
                            type="text"
                            value={userCode}
                            onChange={(e) => {
                                setUserCode(e.target.value);
                                setMessage(null);
                            }}
                            placeholder="원하는 유저코드를 입력하세요"
                            disabled={isCreatingCode}
                        />
                    </InputWrapper>
                </InputGroup>
                
                <HelpText>
                    <HelpTitle>유저코드 안내</HelpTitle>
                    <HelpList>
                        <li>유저코드는 4~12자 사이로 설정해주세요.</li>
                        <li>영문(대/소문자), 숫자, 특수문자(_) 사용이 가능합니다.</li>
                        <li>다른 사용자가 당신을 찾을 때 사용되는 고유한 코드입니다.</li>
                        <li>언제든지 재설정하거나 새로 생성할 수 있습니다.</li>
                    </HelpList>
                </HelpText>
                
                {message && (
                    <Message $type={message.type}>
                        <MessageIcon>
                            {message.type === 'success' ? (
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            ) : (
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                    <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            )}
                        </MessageIcon>
                        {message.text}
                    </Message>
                )}
                
                <SubmitButton
                    onClick={handleUpdateCode}
                    disabled={isCreatingCode || !userCode}
                >
                    {isCreatingCode ? (
                        <>
                            <Spinner />
                            처리중...
                        </>
                    ) : (
                        <>
                            {myCode?.userCode ? '코드 변경하기' : '코드 설정하기'}
                        </>
                    )}
                </SubmitButton>
            </FormSection>
        </Container>
    );
};

export default UserCodeSettings;