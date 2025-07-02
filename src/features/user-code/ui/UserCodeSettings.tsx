// src/features/user-code/ui/UserCodeSettings.tsx
import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../../shared';
import { useUserCode } from '../model/useUserCode';
import {
    Container,
    Title,
    Description,
    CurrentCodeCard,
    CodeLabel,
    CodeDisplay,
    CodePrefix,
    CodeActions,
    CodeButton,
    FormSection,
    FormTitle,
    InputGroup,
    Label,
    InputWrapper,
    InputPrefix,
    Input,
    HelpText,
    HelpTitle,
    HelpList,
    SubmitButton,
    Spinner,
    Message,
    MessageIcon
} from '../styles/userCodeSettings.styles';

interface UserCodeSettingsProps {
    userId: number;
}

const UserCodeSettings: React.FC<UserCodeSettingsProps> = ({ userId }) => {
    const { user } = useAuthContext();
    const [userCode, setUserCode] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    
    const {
        myCode,
        isLoadingMyCode,
        createCode,
        isCreatingCode
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