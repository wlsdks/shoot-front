import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { createMyCode, deleteMyCode } from '../../services/userCode';
import { commonColors, commonShadows, commonBorderRadius } from '../../styles/commonStyles';

const Container = styled.div`
    padding: 1rem;
    width: 100%;
    box-sizing: border-box;
`;

const Card = styled.div`
    background-color: ${commonColors.white};
    border-radius: ${commonBorderRadius.large};
    padding: 1.5rem;
    box-shadow: ${commonShadows.medium};
    transition: all 0.3s ease;
    width: 100%;
    box-sizing: border-box;

    &:hover {
        box-shadow: ${commonShadows.large};
    }
`;

const Title = styled.h3`
    font-size: 1.25rem;
    font-weight: 700;
    color: ${commonColors.dark};
    margin-bottom: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &::before {
        content: '#';
        color: ${commonColors.primary};
        font-size: 1.4rem;
    }
`;

const Description = styled.p`
    font-size: 0.9rem;
    color: ${commonColors.secondary};
    margin-bottom: 1.5rem;
    line-height: 1.5;
    padding-left: 0.5rem;
    border-left: 2px solid ${commonColors.primary};
`;

const InputGroup = styled.div`
    margin-bottom: 1.25rem;
    position: relative;
    width: 100%;
    box-sizing: border-box;
`;

const Label = styled.label`
    display: block;
    font-size: 0.9rem;
    font-weight: 600;
    color: ${commonColors.dark};
    margin-bottom: 0.5rem;
`;

const Input = styled.input`
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid #e0e0e0;
    border-radius: ${commonBorderRadius.medium};
    font-size: 0.95rem;
    transition: all 0.2s;
    background-color: #f8f9fa;
    box-sizing: border-box;

    &:focus {
        outline: none;
        border-color: ${commonColors.primary};
        background-color: white;
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
    }

    &::placeholder {
        color: #adb5bd;
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 0.75rem;
    margin-top: 1.25rem;
    width: 100%;
    box-sizing: border-box;
`;

const Button = styled.button<{ $primary?: boolean; $danger?: boolean }>`
    flex: 1;
    padding: 0.75rem 1rem;
    border: none;
    border-radius: ${commonBorderRadius.medium};
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    background-color: ${props => 
        props.$danger ? '#dc3545' : 
        props.$primary ? commonColors.primary : '#f8f9fa'};
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
    margin-top: 0.75rem;
    padding: 0.75rem;
    border-radius: ${commonBorderRadius.medium};
    animation: fadeIn 0.3s ease;
    font-size: 0.85rem;
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

const UserCodeSettings: React.FC = () => {
    const { user } = useAuth();
    const [userCode, setUserCode] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleUpdateCode = async () => {
        if (!userCode.trim()) {
            setError('유저코드를 입력해주세요.');
            return;
        }

        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            await createMyCode(user?.id!, userCode);
            setSuccess('유저코드가 성공적으로 설정되었습니다.');
        } catch (err) {
            setError('유저코드 설정에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveCode = async () => {
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            await deleteMyCode(user?.id!);
            setUserCode('');
            setSuccess('유저코드가 삭제되었습니다.');
        } catch (err) {
            setError('유저코드 삭제에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container>
            <Card>
                <Title>유저코드 설정</Title>
                <Description>
                    다른 사용자들이 당신을 찾을 수 있도록 유저코드를 설정하세요.
                    유저코드는 친구 추가 시 사용됩니다.
                </Description>

                <InputGroup>
                    <Label htmlFor="userCode">유저코드</Label>
                    <Input
                        id="userCode"
                        type="text"
                        value={userCode}
                        onChange={(e) => setUserCode(e.target.value)}
                        placeholder="원하는 유저코드를 입력하세요"
                        disabled={isLoading}
                    />
                </InputGroup>

                {error && <ErrorMessage>{error}</ErrorMessage>}
                {success && <SuccessMessage>{success}</SuccessMessage>}

                <ButtonGroup>
                    <Button
                        $primary
                        onClick={handleUpdateCode}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <LoadingSpinner />
                                처리중...
                            </>
                        ) : (
                            '코드 설정'
                        )}
                    </Button>
                    <Button
                        $danger
                        onClick={handleRemoveCode}
                        disabled={isLoading}
                    >
                        코드 삭제
                    </Button>
                </ButtonGroup>
            </Card>
        </Container>
    );
};

export default UserCodeSettings; 