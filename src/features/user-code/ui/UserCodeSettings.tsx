import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/lib/context/AuthContext';
import { useUserCode } from '../model/useUserCode';
import { UserCodeSettingsProps, Message } from '../types/types';
import {
    Container,
    Description,
    InputGroup,
    Label,
    Input,
    ButtonGroup,
    Button,
    ErrorMessage,
    SuccessMessage,
    LoadingSpinner,
    CurrentCodeDisplay,
    CodeText,
    HelpText,
    HelpTitle,
    HelpList,
    HelpItem
} from '../styles/userCodeSettings.styles';

const UserCodeSettings: React.FC<UserCodeSettingsProps> = ({ userId }) => {
    const { user } = useAuth();
    const [userCode, setUserCode] = useState('');
    const [message, setMessage] = useState<Message | null>(null);
    
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
            }, 3000);
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

    if (isLoadingMyCode) {
        return (
            <Container>
                <LoadingSpinner />
            </Container>
        );
    }

    return (
        <Container>
            <Description>
                내 유저코드
            </Description>

            {myCode && (
                <CurrentCodeDisplay>
                    <CodeText>
                        {myCode.userCode ? `#${myCode.userCode}` : '유저코드가 초기화되었습니다.'}
                    </CodeText>
                </CurrentCodeDisplay>
            )}

            <InputGroup>
                <Label htmlFor="userCode">
                    {myCode ? '새로운 유저코드' : '유저코드'}
                </Label>
                <Input
                    id="userCode"
                    type="text"
                    value={userCode}
                    onChange={(e) => {
                        setUserCode(e.target.value);
                        setMessage(null);
                    }}
                    placeholder={myCode ? "새로운 유저코드를 입력하세요" : "원하는 유저코드를 입력하세요"}
                    disabled={isCreatingCode}
                />
                <HelpText>
                    <HelpTitle>유저코드 안내</HelpTitle>
                    <HelpList>
                        <HelpItem>유저코드는 4~12자 사이로 설정해주세요.</HelpItem>
                        <HelpItem>영문, 숫자, 특수문자 사용이 가능합니다.</HelpItem>
                        <HelpItem>다른 사용자가 당신을 찾을 때 사용되는 고유한 코드입니다.</HelpItem>
                        <HelpItem>언제든지 재설정하거나 초기화할 수 있습니다.</HelpItem>
                    </HelpList>
                </HelpText>
            </InputGroup>

            {message && (
                message.type === 'error' ? 
                <ErrorMessage>{message.text}</ErrorMessage> : 
                <SuccessMessage>{message.text}</SuccessMessage>
            )}

            <ButtonGroup>
                <Button
                    $primary
                    onClick={handleUpdateCode}
                    disabled={isCreatingCode}
                >
                    {isCreatingCode ? (
                        <>
                            <LoadingSpinner />
                            처리중...
                        </>
                    ) : myCode ? (
                        '코드 재설정'
                    ) : (
                        '코드 설정'
                    )}
                </Button>
            </ButtonGroup>
        </Container>
    );
};

export default UserCodeSettings; 