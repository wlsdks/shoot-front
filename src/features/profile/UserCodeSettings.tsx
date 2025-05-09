import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../shared/lib/context/AuthContext';
import { createMyCode, deleteMyCode, getMyCode } from '../../shared/api/userCode';
import { commonColors, commonShadows, commonBorderRadius } from '../../shared/ui/commonStyles';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const Container = styled.div`
    padding: 1.25rem;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    box-sizing: border-box;
    background-color: white;
`;

const Title = styled.h3`
    font-size: 1.1rem;
    font-weight: 700;
    color: ${commonColors.dark};
    margin-bottom: 0.6rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #e9ecef;

    &::before {
        content: '#';
        color: ${commonColors.primary};
        font-size: 1.2rem;
    }
`;

const Description = styled.h3`
    font-size: 1rem;
    font-weight: 600;
    color: ${commonColors.dark};
    margin-bottom: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &::before {
        content: '#';
        color: ${commonColors.primary};
        font-size: 1.1rem;
    }
`;

const InputGroup = styled.div`
    margin-bottom: 1rem;
    position: relative;
    width: 100%;
    box-sizing: border-box;
    padding-top: 0.75rem;
    border-top: 1px solid #e9ecef;
`;

const Label = styled.label`
    display: block;
    font-size: 0.8rem;
    font-weight: 600;
    color: ${commonColors.dark};
    margin-bottom: 0.35rem;
`;

const Input = styled.input`
    width: 100%;
    padding: 0.65rem 0.75rem;
    border: 1px solid #e0e0e0;
    border-radius: ${commonBorderRadius.medium};
    font-size: 0.8rem;
    transition: all 0.2s;
    background-color: white;
    box-sizing: border-box;

    &:focus {
        outline: none;
        border-color: ${commonColors.primary};
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
    }

    &::placeholder {
        color: #adb5bd;
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 0.65rem;
    margin-top: 1rem;
    width: 100%;
    box-sizing: border-box;
    padding-top: 0.75rem;
    border-top: 1px solid #e9ecef;
`;

const Button = styled.button<{ $primary?: boolean; $danger?: boolean }>`
    flex: 1;
    padding: 0.65rem 0.75rem;
    border: 1px solid ${props => 
        props.$danger ? '#dc3545' : 
        props.$primary ? commonColors.primary : '#e0e0e0'};
    border-radius: ${commonBorderRadius.medium};
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    background-color: ${props => 
        props.$danger ? '#dc3545' : 
        props.$primary ? commonColors.primary : 'white'};
    color: ${props => props.$primary || props.$danger ? '#fff' : commonColors.dark};
    min-width: 0;

    &:hover {
        transform: translateY(-1px);
        box-shadow: ${commonShadows.small};
    }

    &:active {
        transform: translateY(0);
    }

    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }
`;

const MessageContainer = styled.div`
    margin-top: 0.5rem;
    padding: 0.65rem;
    border-radius: ${commonBorderRadius.medium};
    font-size: 0.75rem;
    line-height: 1.3;
    opacity: 0;
    transform: translateY(-10px);
    animation: slideIn 0.3s ease forwards, fadeOut 0.3s ease 2.7s forwards;

    @keyframes slideIn {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes fadeOut {
        to {
            opacity: 0;
            transform: translateY(-10px);
        }
    }
`;

const ErrorMessage = styled(MessageContainer)`
    background-color: #fff5f5;
    border: 1px solid #ffd7d7;
    color: #dc3545;
`;

const SuccessMessage = styled(MessageContainer)`
    background-color: #f0fff4;
    border: 1px solid #c6f6d5;
    color: #28a745;
`;

const LoadingSpinner = styled.div`
    width: 16px;
    height: 16px;
    border: 2px solid #ffffff;
    border-top: 2px solid transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const CurrentCodeDisplay = styled.div`
    background-color: white;
    border: 1px solid #e0e0e0;
    border-radius: ${commonBorderRadius.medium};
    padding: 0.75rem;
    margin-bottom: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: all 0.2s ease;

    &:hover {
        border-color: ${commonColors.primary};
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
    }
`;

const CodeText = styled.div`
    font-size: 0.9rem;
    font-weight: 600;
    color: ${commonColors.primary};
    font-family: monospace;
    letter-spacing: 0.5px;
`;

const HelpText = styled.div`
    font-size: 0.75rem;
    color: ${commonColors.secondary};
    margin-top: 1rem;
    padding: 0.75rem;
    background-color: white;
    border-radius: ${commonBorderRadius.medium};
    border: 1px solid #e0e0e0;
    border-left: 2px solid ${commonColors.primary};
`;

const HelpTitle = styled.div`
    font-weight: 600;
    margin-bottom: 0.35rem;
    color: ${commonColors.dark};
    font-size: 0.8rem;
`;

const HelpList = styled.ul`
    margin: 0;
    padding-left: 1rem;
    list-style-type: disc;
`;

const HelpItem = styled.li`
    margin-bottom: 0.2rem;
    line-height: 1.3;
    &:last-child {
        margin-bottom: 0;
    }
`;

const UserCodeSettings: React.FC = () => {
    const { user } = useAuth();
    const [userCode, setUserCode] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const queryClient = useQueryClient();

    // 현재 코드 조회 쿼리
    const { data: currentCode, isLoading: isInitialLoading } = useQuery({
        queryKey: ['userCode', user?.id],
        queryFn: async () => {
            if (!user?.id) throw new Error('사용자 정보가 없습니다.');
            const response = await getMyCode(user.id);
            return response.userCode || null;
        },
        enabled: !!user?.id
    });

    // 코드 설정/수정 mutation
    const updateCodeMutation = useMutation({
        mutationFn: async () => {
            if (!user?.id) throw new Error('사용자 정보가 없습니다.');
            if (!userCode.trim()) throw new Error('유저코드를 입력해주세요.');
            return createMyCode(user.id, userCode);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userCode', user?.id] });
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

    // 코드 삭제 mutation
    const deleteCodeMutation = useMutation({
        mutationFn: async () => {
            if (!user?.id) throw new Error('사용자 정보가 없습니다.');
            return deleteMyCode(user.id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userCode', user?.id] });
            setMessage({ type: 'success', text: '유저코드가 초기화되었습니다.' });
        },
        onError: (error: any) => {
            setMessage({ 
                type: 'error', 
                text: error.response?.data?.message || '유저코드 초기화에 실패했습니다. 다시 시도해주세요.' 
            });
        }
    });

    // 메시지 자동 제거
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
        updateCodeMutation.mutate();
    };

    const handleRemoveCode = () => {
        setMessage(null);
        deleteCodeMutation.mutate();
    };

    if (isInitialLoading) {
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

            {currentCode !== null && (
                <CurrentCodeDisplay>
                    <CodeText>
                        {currentCode ? `#${currentCode}` : '유저코드가 초기화되었습니다.'}
                    </CodeText>
                </CurrentCodeDisplay>
            )}

            <InputGroup>
                <Label htmlFor="userCode">
                    {currentCode ? '새로운 유저코드' : '유저코드'}
                </Label>
                <Input
                    id="userCode"
                    type="text"
                    value={userCode}
                    onChange={(e) => {
                        setUserCode(e.target.value);
                        setMessage(null);
                    }}
                    placeholder={currentCode ? "새로운 유저코드를 입력하세요" : "원하는 유저코드를 입력하세요"}
                    disabled={updateCodeMutation.isPending || deleteCodeMutation.isPending}
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
                    disabled={updateCodeMutation.isPending || deleteCodeMutation.isPending}
                >
                    {updateCodeMutation.isPending ? (
                        <>
                            <LoadingSpinner />
                            처리중...
                        </>
                    ) : currentCode ? (
                        '코드 재설정'
                    ) : (
                        '코드 설정'
                    )}
                </Button>
                {currentCode && (
                    <Button
                        $danger
                        onClick={handleRemoveCode}
                        disabled={updateCodeMutation.isPending || deleteCodeMutation.isPending}
                    >
                        코드 초기화
                    </Button>
                )}
            </ButtonGroup>
        </Container>
    );
};

export default UserCodeSettings; 