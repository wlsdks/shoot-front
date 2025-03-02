import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup } from '../services/auth'; // signup 함수가 FormData를 처리한다고 가정
import styled, { keyframes } from 'styled-components';

// 배경 그라데이션 애니메이션
const backgroundAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// 전체 화면 컨테이너
const FullScreen = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(-45deg, #ff9a9e, #fad0c4, #fad0c4, #ff9a9e);
  background-size: 400% 400%;
  animation: ${backgroundAnimation} 15s ease infinite;
`;

// 카드 애니메이션
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// 글래스모픽 카드
const Card = styled.div`
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  max-width: 450px;
  width: 90%;
  animation: ${fadeIn} 0.8s ease-out;
`;

// 제목
const Title = styled.h2`
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2.2rem;
  color: #333;
  font-weight: bold;
`;

// 폼 스타일
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

// 입력 그룹 스타일
const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

// 입력 필드 스타일
const Input = styled.input`
  padding: 0.9rem 1rem;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f9f9f9;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.3s, box-shadow 0.3s;
  &:focus {
    border-color: #007bff;
    outline: none;
    box-shadow: 0 0 10px rgba(0, 123, 255, 0.3);
  }
`;

// 파일 입력 스타일
const FileInput = styled.input`
  padding: 0.5rem;
  font-size: 0.95rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f9f9f9;
  width: 100%;
  box-sizing: border-box;
`;

// 버튼 스타일
const Button = styled.button<{ disabled?: boolean }>`
  padding: 0.9rem;
  background: linear-gradient(90deg, #28a745, #218838);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
  transition: transform 0.3s, background 0.3s;
  &:hover:not(:disabled) {
    transform: translateY(-3px);
    background: linear-gradient(90deg, #218838, #1e7e34);
  }
`;

// 오류 메시지
const ErrorMessage = styled.div`
  color: #d9534f;
  text-align: center;
  margin-top: 1rem;
  font-size: 0.95rem;
`;

// 유효성 검사 메시지
const ValidationMessage = styled.div<{ isValid: boolean }>`
  font-size: 0.85rem;
  margin-top: 0.3rem;
  color: ${({ isValid }) => (isValid ? '#28a745' : '#d9534f')};
  text-align: left;
`;

const Signup = () => {
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [bio, setBio] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // 유효성 검사 상태
  const [isUsernameValid, setIsUsernameValid] = useState<boolean | null>(null);
  const [isPasswordValid, setIsPasswordValid] = useState<boolean | null>(null);
  const [isPasswordMatch, setIsPasswordMatch] = useState<boolean | null>(null);
  const [isEmailValid, setIsEmailValid] = useState<boolean | null>(null);

  // 유효성 검사 함수
  const validateUsername = (value: string) => {
    const isValid = /^[a-zA-Z0-9]{4,12}$/.test(value);
    setIsUsernameValid(isValid);
    return isValid;
  };

  const validatePassword = (value: string) => {
    const isValid = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/.test(value);
    setIsPasswordValid(isValid);
    return isValid;
  };

  const validatePasswordMatch = () => {
    const isMatch = password === confirmPassword && password.length > 0;
    setIsPasswordMatch(isMatch);
    return isMatch;
  };

  const validateEmail = (value: string) => {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    setIsEmailValid(isValid);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 유효성 검사
    const isUsernameOk = validateUsername(username);
    const isPasswordOk = validatePassword(password);
    const isPasswordMatchOk = validatePasswordMatch();
    const isEmailOk = validateEmail(email);

    if (!isUsernameOk || !isPasswordOk || !isPasswordMatchOk || !isEmailOk) {
      setError('입력값을 확인해 주세요.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('nickname', nickname);
      formData.append('password', password);
      formData.append('email', email);
      formData.append('bio', bio);
      if (profileImage) {
        formData.append('profileImage', profileImage);
      }

      await signup(formData); // signup 호출
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
          <InputGroup>
            <Input
              type="text"
              placeholder="아이디 (4~12자, 영문+숫자)"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                validateUsername(e.target.value);
              }}
              required
            />
            {isUsernameValid === false && (
              <ValidationMessage isValid={false}>
                아이디는 4~12자 영문과 숫자만 가능합니다.
              </ValidationMessage>
            )}
          </InputGroup>

          <InputGroup>
            <Input
              type="text"
              placeholder="닉네임"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
            />
          </InputGroup>

          <InputGroup>
            <Input
              type="password"
              placeholder="비밀번호 (8자 이상, 영문+숫자)"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                validatePassword(e.target.value);
                validatePasswordMatch();
              }}
              required
            />
            {isPasswordValid === false && (
              <ValidationMessage isValid={false}>
                비밀번호는 8자 이상, 영문과 숫자를 포함해야 합니다.
              </ValidationMessage>
            )}
          </InputGroup>

          <InputGroup>
            <Input
              type="password"
              placeholder="비밀번호 확인"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                validatePasswordMatch();
              }}
              required
            />
            {isPasswordMatch === false && (
              <ValidationMessage isValid={false}>
                비밀번호가 일치하지 않습니다.
              </ValidationMessage>
            )}
          </InputGroup>

          <InputGroup>
            <Input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                validateEmail(e.target.value);
              }}
              required
            />
            {isEmailValid === false && (
              <ValidationMessage isValid={false}>
                유효한 이메일 형식을 입력해 주세요.
              </ValidationMessage>
            )}
          </InputGroup>

          <InputGroup>
            <FileInput
              type="file"
              accept="image/*"
              onChange={(e) => setProfileImage(e.target.files?.[0] || null)}
            />
          </InputGroup>

          <InputGroup>
            <Input
              type="text"
              placeholder="한줄 소개 (선택)"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </InputGroup>

          <Button type="submit" disabled={!username || !nickname || !password || !confirmPassword || !email}>
            회원가입
          </Button>
        </Form>
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </Card>
    </FullScreen>
  );
};

export default Signup;