import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup } from '../services/auth';
import styled, { keyframes } from 'styled-components';

// 배경 그라데이션 애니메이션
const backgroundAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// 전체 화면을 채우는 컨테이너
const FullScreen = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(-45deg, #ff9a9e, #fad0c4, #fad0c4, #ff9a9e);
  background-size: 400% 400%;
  animation: ${backgroundAnimation} 15s ease infinite;
`;

// 카드가 등장하는 애니메이션
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// 회원가입 카드 (글래스모픽 효과 적용)
const Card = styled.div`
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
  padding: 2rem 2.5rem;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  max-width: 400px;
  width: 90%;
  animation: ${fadeIn} 0.8s ease-out;
`;

// 제목 스타일
const Title = styled.h2`
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 2.2rem;
  color: #333;
  font-weight: bold;
`;

// 폼 레이아웃
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

// 입력창 스타일
const Input = styled.input`
  padding: 0.85rem 1rem;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f9f9f9;
  transition: border-color 0.3s, box-shadow 0.3s;
  &:focus {
    border-color: #007bff;
    outline: none;
    box-shadow: 0 0 10px rgba(0,123,255,0.3);
  }
`;

// 버튼 스타일 (hover 시 살짝 떠오르는 효과)
const Button = styled.button`
  padding: 0.85rem;
  background: linear-gradient(90deg, #28a745, #218838);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s, background 0.3s;
  &:hover {
    transform: translateY(-3px);
    background: linear-gradient(90deg, #218838, #1e7e34);
  }
`;

// 오류 메시지 스타일
const ErrorMessage = styled.div`
  color: #d9534f;
  text-align: center;
  margin-top: 1rem;
  font-size: 0.95rem;
`;

const Signup: React.FC = () => {
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signup(username, nickname);
      alert('회원가입 성공! 로그인 페이지로 이동합니다.');
      navigate('/login');
    } catch (error) {
      console.error('회원가입 실패', error);
      setError('회원가입에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  return (
    <FullScreen>
      <Card>
        <Title>회원가입</Title>
        <Form onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="아이디"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <Input
            type="text"
            placeholder="닉네임"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
          />
          <Button type="submit">회원가입</Button>
        </Form>
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </Card>
    </FullScreen>
  );
};

export default Signup;