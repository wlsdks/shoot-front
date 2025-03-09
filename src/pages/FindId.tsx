import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

// 애니메이션 정의
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
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

// 콘텐츠 영역
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

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
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
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.15);
    background-color: #fff;
  }
`;

const Button = styled.button`
  padding: 14px;
  background: linear-gradient(90deg, #007bff, #0062cc);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 8px;
  box-shadow: 0 4px 10px rgba(0, 123, 255, 0.2);
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(0, 123, 255, 0.3);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    background: linear-gradient(90deg, #cccccc, #bbbbbb);
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
`;

const ResultBox = styled.div`
  margin-top: 24px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
`;

const ResultTitle = styled.div`
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 8px;
  color: #333;
`;

const ResultContent = styled.div`
  font-size: 1.1rem;
  color: #007bff;
  padding: 12px;
  background: #e8f4ff;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
`;

const LinkContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
`;

const StyledLink = styled(Link)`
  color: #007bff;
  text-decoration: none;
  font-size: 0.9rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

const FindId: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [foundId, setFoundId] = useState<string | null>(null);

  // 아이디 찾기 요청 함수
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('이메일을 입력해주세요.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // 실제 구현 시 여기에 API 호출 코드가 들어갑니다.
      // const response = await findUserId(email);
      // setFoundId(response.data.username);
      
      // 테스트용 지연 및 더미 데이터
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 이메일의 첫 부분을 아이디로 사용 (테스트용)
      const simulatedId = email.split('@')[0];
      setFoundId(simulatedId);
    } catch (err) {
      console.error('아이디 찾기 실패:', err);
      setError('아이디를 찾을 수 없습니다. 이메일을 확인해주세요.');
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
          <Title>아이디 찾기</Title>
        </Header>
        
        <Content>
          {foundId ? (
            // 아이디 찾기 성공 화면
            <>
              <SuccessMessage>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                회원님의 아이디를 찾았습니다
              </SuccessMessage>
              
              <ResultBox>
                <ResultTitle>회원님의 아이디</ResultTitle>
                <ResultContent>{foundId}</ResultContent>
              </ResultBox>
              
              <LinkContainer>
                <StyledLink to="/login">로그인하기</StyledLink>
                <StyledLink to="/find-password">비밀번호 찾기</StyledLink>
              </LinkContainer>
            </>
          ) : (
            // 아이디 찾기 폼
            <>
              <Description>
                가입 시 등록한 이메일을 입력하시면 아이디를 찾을 수 있습니다.
              </Description>
              
              <Form onSubmit={handleSubmit}>
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
                
                <Button type="submit" disabled={isLoading || !email}>
                  {isLoading ? '처리 중...' : '아이디 찾기'}
                </Button>
              </Form>
              
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
                <StyledLink to="/login">로그인하기</StyledLink>
                <StyledLink to="/find-password">비밀번호 찾기</StyledLink>
                <StyledLink to="/signup">회원가입</StyledLink>
              </LinkContainer>
            </>
          )}
        </Content>
      </MobileContainer>
    </PageWrapper>
  );
};

export default FindId;