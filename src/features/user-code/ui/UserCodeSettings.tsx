import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useUserCode } from '../model/useUserCode';
import { UserCodeSettingsProps } from '../types';
import { commonColors, commonBorderRadius } from '../../../shared/styles/common';

const Container = styled.div`
  padding: 1.5rem;
`;

const Description = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: ${commonColors.dark};
`;

const CurrentCodeDisplay = styled.div`
  background-color: ${commonColors.light};
  padding: 1rem;
  border-radius: ${commonBorderRadius.medium};
  margin-bottom: 1.5rem;
`;

const CodeText = styled.span`
  font-family: monospace;
  font-size: 1.1rem;
  color: ${commonColors.primary};
`;

const InputGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: ${commonColors.dark};
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${commonColors.border};
  border-radius: ${commonBorderRadius.small};
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: ${commonColors.primary};
  }

  &:disabled {
    background-color: ${commonColors.light};
    cursor: not-allowed;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const Button = styled.button<{ variant?: 'primary' | 'danger' }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: ${commonBorderRadius.small};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  ${({ variant = 'primary' }) =>
    variant === 'primary'
      ? `
    background-color: ${commonColors.primary};
    color: white;
    &:hover {
      background-color: ${commonColors.primaryDark};
    }
  `
      : `
    background-color: ${commonColors.danger};
    color: white;
    &:hover {
      background-color: ${commonColors.dangerDark};
    }
  `}

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const Message = styled.div<{ type: 'success' | 'error' }>`
  padding: 0.75rem;
  border-radius: ${commonBorderRadius.small};
  margin-bottom: 1rem;
  background-color: ${({ type }) =>
    type === 'success' ? commonColors.successLight : commonColors.errorLight};
  color: ${({ type }) =>
    type === 'success' ? commonColors.success : commonColors.error};
`;

export const UserCodeSettings: React.FC<UserCodeSettingsProps> = ({ userId, onClose }) => {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const {
    myCode,
    isLoadingMyCode,
    createCode,
    isCreatingCode,
    createCodeError
  } = useUserCode(userId);

  useEffect(() => {
    if (createCodeError) {
      setMessage({
        type: 'error',
        text: createCodeError.message || '코드 생성에 실패했습니다.'
      });
    }
  }, [createCodeError]);

  const handleCreateCode = () => {
    if (!code.trim()) {
      setMessage({
        type: 'error',
        text: '코드를 입력해주세요.'
      });
      return;
    }

    createCode(code, {
      onSuccess: () => {
        setMessage({
          type: 'success',
          text: '코드가 성공적으로 생성되었습니다.'
        });
        setCode('');
      }
    });
  };

  if (isLoadingMyCode) {
    return <div>로딩 중...</div>;
  }

  return (
    <Container>
      <Description>내 유저코드</Description>

      {message && (
        <Message type={message.type}>{message.text}</Message>
      )}

      {myCode?.userCode && (
        <CurrentCodeDisplay>
          <CodeText>#{myCode.userCode}</CodeText>
        </CurrentCodeDisplay>
      )}

      <InputGroup>
        <Label htmlFor="userCode">새로운 유저코드</Label>
        <Input
          id="userCode"
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="원하는 유저코드를 입력하세요"
          disabled={isCreatingCode}
        />
      </InputGroup>

      <ButtonGroup>
        <Button
          onClick={handleCreateCode}
          disabled={isCreatingCode || !code.trim()}
        >
          {isCreatingCode ? '생성 중...' : '코드 생성'}
        </Button>
        {onClose && (
          <Button onClick={onClose} variant="danger">
            닫기
          </Button>
        )}
      </ButtonGroup>
    </Container>
  );
}; 