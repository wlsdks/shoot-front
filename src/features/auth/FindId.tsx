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
  AuthLink as StyledLink
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