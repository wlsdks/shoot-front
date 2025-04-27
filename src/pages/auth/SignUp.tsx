import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../../services/auth';
import {
  PageWrapper,
  MobileContainer,
  Header,
  BackButton,
  Title,
  Form,
  InputGroup,
  Label,
  Input,
  Button,
  ErrorMessage,
  SuccessMessage,
  LinkContainer,
  StyledLink
} from '../../styles/auth/common';
import styled from 'styled-components';

const ScrollContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
  
  &::-webkit-scrollbar {
    width: 5px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: #ddd;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-track {
    background-color: #f5f5f5;
  }
`;

const Section = styled.div`
  margin-bottom: 20px;
  width: 100%;
  box-sizing: border-box;
`;

const SectionTitle = styled.h2`
  font-size: 1rem;
  color: #555;
  margin: 0 0 12px 0;
  font-weight: 600;
  display: flex;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background-color: #eee;
    margin-left: 10px;
  }
`;

const OptionalTag = styled.span`
  color: #999;
  font-size: 0.75rem;
  font-weight: normal;
  margin-left: 6px;
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #ddd;
  border-radius: 12px;
  font-size: 1rem;
  background-color: #fafafa;
  min-height: 100px;
  resize: none;
  transition: all 0.2s ease;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
    background-color: #fff;
  }
  
  &::placeholder {
    color: #bbb;
  }
`;

const FileInputContainer = styled.div`
  position: relative;
  width: 100%;
  box-sizing: border-box;
`;

const FileInputLabel = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px 14px;
  border: 1px dashed #ccc;
  border-radius: 12px;
  background-color: #fafafa;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  color: #666;
  box-sizing: border-box;
  
  &:hover {
    border-color: #007bff;
    color: #007bff;
  }
  
  svg {
    color: #999;
    flex-shrink: 0;
  }
  
  &:hover svg {
    color: #007bff;
  }
  
  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;
  }
`;

const FileInput = styled.input`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
`;

const ValidationMessage = styled.div<{ isValid: boolean }>`
  font-size: 0.75rem;
  margin-top: 6px;
  color: ${(props) => (props.isValid ? '#28a745' : '#dc3545')};
  display: flex;
  align-items: center;
  gap: 5px;
  width: 100%;
  box-sizing: border-box;
  
  svg {
    flex-shrink: 0;
  }
  
  span {
    flex: 1;
    word-break: break-word;
  }
`;

const SuccessContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  height: 100%;
  text-align: center;
  width: 100%;
  box-sizing: border-box;
`;

const SuccessCircle = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #d4edda;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  color: #28a745;
  flex-shrink: 0;
`;

const SuccessTitle = styled.h2`
  font-size: 1.5rem;
  color: #333;
  margin: 0 0 16px 0;
  width: 100%;
`;

const SuccessText = styled.p`
  font-size: 1rem;
  color: #666;
  margin: 0 0 24px 0;
  line-height: 1.5;
  width: 100%;
`;

const LoginButton = styled(Link)`
  display: inline-block;
  padding: 14px 24px;
  background: linear-gradient(90deg, #007bff, #0062cc);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.3s;
  box-shadow: 0 4px 10px rgba(0, 123, 255, 0.2);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(0, 123, 255, 0.3);
  }
`;

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImageName, setProfileImageName] = useState('');
  
  const [usernameValid, setUsernameValid] = useState<boolean | null>(null);
  const [passwordValid, setPasswordValid] = useState<boolean | null>(null);
  const [passwordMatch, setPasswordMatch] = useState<boolean | null>(null);
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const validateUsername = (value: string) => {
    const isValid = /^[a-zA-Z0-9]{4,12}$/.test(value);
    setUsernameValid(isValid);
    return isValid;
  };
  
  const validatePassword = (value: string) => {
    const isValid = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/.test(value);
    setPasswordValid(isValid);
    return isValid;
  };
  
  const checkPasswordMatch = useCallback(() => {
    if (password.length > 0 && confirmPassword.length > 0) {
      const isMatch = password === confirmPassword;
      setPasswordMatch(isMatch);
      return isMatch;
    }
    setPasswordMatch(null);
    return null;
  }, [password, confirmPassword]);
  
  const validateEmail = (value: string) => {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    setEmailValid(isValid);
    return isValid;
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (file.size > 5 * 1024 * 1024) {
        setError('이미지 크기는 5MB 이하여야 합니다.');
        return;
      }
      
      if (!file.type.match('image/*')) {
        setError('이미지 파일만 업로드 가능합니다.');
        return;
      }
      
      setProfileImage(file);
      setProfileImageName(file.name);
      setError(null);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const isUsernameValid = validateUsername(username);
    const isPasswordValid = validatePassword(password);
    const isPasswordsMatch = checkPasswordMatch();
    const isEmailValid = validateEmail(email);
    
    if (!isUsernameValid || !isPasswordValid || !isPasswordsMatch || !isEmailValid) {
      setError('필수 항목을 올바르게 입력해주세요.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('nickname', nickname || username);
      formData.append('password', password);
      formData.append('email', email);
      
      if (bio) formData.append('bio', bio);
      if (profileImage) formData.append('profileImage', profileImage);
      
      await signup(formData);
      setIsSuccess(true);
    } catch (err) {
      console.error('회원가입 실패:', err);
      setError('회원가입에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isSuccess) {
    return (
      <PageWrapper>
        <MobileContainer>
          <SuccessContainer>
            <SuccessCircle>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </SuccessCircle>
            <SuccessTitle>회원가입 완료!</SuccessTitle>
            <SuccessText>
              회원가입이 성공적으로 완료되었습니다.<br />
              이제 로그인하여 서비스를 이용하실 수 있습니다.
            </SuccessText>
            <LoginButton to="/login">로그인하기</LoginButton>
          </SuccessContainer>
        </MobileContainer>
      </PageWrapper>
    );
  }
  
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
          <Title>회원가입</Title>
        </Header>
        
        <ScrollContainer>
          <Form onSubmit={handleSubmit}>
            <Section>
              <SectionTitle>필수 정보</SectionTitle>
              
              <InputGroup>
                <Label htmlFor="username">아이디</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (e.target.value) validateUsername(e.target.value);
                  }}
                  placeholder="4~12자 영문, 숫자"
                />
                {usernameValid !== null && (
                  <ValidationMessage isValid={usernameValid}>
                    {usernameValid ? (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        <span>사용 가능한 아이디입니다</span>
                      </>
                    ) : (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="15" y1="9" x2="9" y2="15"></line>
                          <line x1="9" y1="9" x2="15" y2="15"></line>
                        </svg>
                        <span>아이디는 4~12자의 영문, 숫자만 가능합니다</span>
                      </>
                    )}
                  </ValidationMessage>
                )}
              </InputGroup>
              
              <InputGroup>
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    const newPassword = e.target.value;
                    setPassword(newPassword);
                    if (newPassword) validatePassword(newPassword);
                  }}
                  onBlur={() => {
                    if (confirmPassword) checkPasswordMatch();
                  }}
                  placeholder="8자 이상, 영문+숫자 조합"
                />
                {passwordValid !== null && (
                  <ValidationMessage isValid={passwordValid}>
                    {passwordValid ? (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        <span>안전한 비밀번호입니다</span>
                      </>
                    ) : (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="15" y1="9" x2="9" y2="15"></line>
                          <line x1="9" y1="9" x2="15" y2="15"></line>
                        </svg>
                        <span>비밀번호는 8자 이상, 영문과 숫자를 포함해야 합니다</span>
                      </>
                    )}
                  </ValidationMessage>
                )}
              </InputGroup>
              
              <InputGroup>
                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    const newConfirmPassword = e.target.value;
                    setConfirmPassword(newConfirmPassword);
                    if (password && newConfirmPassword) {
                      setPasswordMatch(password === newConfirmPassword);
                    }
                  }}
                  onBlur={checkPasswordMatch}
                  placeholder="비밀번호 재입력"
                />
                {passwordMatch !== null && (
                  <ValidationMessage isValid={passwordMatch}>
                    {passwordMatch ? (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        <span>비밀번호가 일치합니다</span>
                      </>
                    ) : (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="15" y1="9" x2="9" y2="15"></line>
                          <line x1="9" y1="9" x2="15" y2="15"></line>
                        </svg>
                        <span>비밀번호가 일치하지 않습니다</span>
                      </>
                    )}
                  </ValidationMessage>
                )}
              </InputGroup>
              
              <InputGroup>
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (e.target.value) validateEmail(e.target.value);
                  }}
                  placeholder="이메일 주소"
                />
                {emailValid !== null && (
                  <ValidationMessage isValid={emailValid}>
                    {emailValid ? (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        <span>올바른 이메일 형식입니다</span>
                      </>
                    ) : (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="15" y1="9" x2="9" y2="15"></line>
                          <line x1="9" y1="9" x2="15" y2="15"></line>
                        </svg>
                        <span>올바른 이메일 형식이 아닙니다</span>
                      </>
                    )}
                  </ValidationMessage>
                )}
              </InputGroup>
            </Section>
            
            <Section>
              <SectionTitle>프로필 정보</SectionTitle>
              
              <InputGroup>
                <Label htmlFor="nickname">
                  닉네임 <OptionalTag>(선택)</OptionalTag>
                </Label>
                <Input
                  id="nickname"
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="사용할 닉네임"
                />
              </InputGroup>
              
              <InputGroup>
                <Label htmlFor="profileImage">
                  프로필 이미지 <OptionalTag>(선택)</OptionalTag>
                </Label>
                <FileInputContainer>
                  <FileInputLabel htmlFor="profileImage">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    <span>{profileImageName || '이미지 선택하기'}</span>
                  </FileInputLabel>
                  <FileInput
                    id="profileImage"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </FileInputContainer>
              </InputGroup>
              
              <InputGroup>
                <Label htmlFor="bio">
                  자기소개 <OptionalTag>(선택)</OptionalTag>
                </Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="간단한 자기소개를 입력해주세요"
                />
              </InputGroup>
            </Section>
            
            <Button 
              type="submit" 
              disabled={isSubmitting || !username || !password || !confirmPassword || !email}
            >
              {isSubmitting ? '처리중...' : '회원가입'}
            </Button>
            
            {error && (
              <ErrorMessage>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>{error}</span>
              </ErrorMessage>
            )}
          </Form>
        </ScrollContainer>
      </MobileContainer>
    </PageWrapper>
  );
};

export default SignUp;