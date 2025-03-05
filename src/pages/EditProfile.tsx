import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { updateProfile, uploadProfileImage, changePassword } from '../services/profile';

// 애니메이션 정의
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  padding: 1rem;
  gap: 1rem;
  flex: 1;
  animation: ${fadeIn} 0.3s ease-out;
`;

const ProfileImageSection = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
`;

const ProfileImageContainer = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
`;

const ProfileImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const UploadButton = styled.label`
  position: absolute;
  bottom: 5px;
  right: 5px;
  background: #007bff;
  color: white;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  transition: all 0.2s;
  
  &:hover {
    background: #0056b3;
    transform: scale(1.1);
  }
`;

const FileInput = styled.input`
  display: none;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 0.85rem;
  color: #444;
  margin-bottom: 0.3rem;
  font-weight: 500;
`;

const Input = styled.input`
  padding: 0.7rem 0.9rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  background-color: #f9f9f9;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
    background-color: #fff;
  }
`;

const TextArea = styled.textarea`
  padding: 0.7rem 0.9rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  resize: vertical;
  min-height: 80px;
  max-height: 150px;
  background-color: #f9f9f9;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
    background-color: #fff;
  }
`;

const PasswordToggle = styled.div`
  margin-top: 0.5rem;
  border-top: 1px solid #eee;
  padding-top: 1rem;
`;

const ToggleTitle = styled.h3`
  font-size: 0.95rem;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  margin: 0;
  padding: 0.3rem 0;
  
  &:hover {
    color: #007bff;
  }
`;

const PasswordSection = styled.div<{ isVisible: boolean }>`
  max-height: ${props => props.isVisible ? '300px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out;
  opacity: ${props => props.isVisible ? '1' : '0'};
  margin-top: ${props => props.isVisible ? '0.8rem' : '0'};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.8rem;
  margin-top: auto;
  padding-top: 1.5rem;
`;

const Button = styled.button<{ $primary?: boolean }>`
  flex: 1;
  padding: 0.8rem;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  
  background: ${props => props.$primary ? '#007bff' : '#f0f0f0'};
  color: ${props => props.$primary ? 'white' : '#333'};
  
  &:hover {
    background: ${props => props.$primary ? '#0056b3' : '#e0e0e0'};
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 3px rgba(0, 0, 0, 0.1);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ErrorMessage = styled.p`
  color: #e53935;
  font-size: 0.8rem;
  margin: 0.3rem 0 0;
  background-color: #ffebee;
  padding: 0.4rem 0.6rem;
  border-radius: 4px;
  border-left: 3px solid #e53935;
`;

const SuccessMessage = styled.p`
  color: #2e7d32;
  font-size: 0.8rem;
  margin: 0.5rem 0;
  text-align: center;
  background-color: #e8f5e9;
  padding: 0.6rem;
  border-radius: 4px;
  border-left: 3px solid #2e7d32;
  animation: ${fadeIn} 0.3s ease-out;
`;

// 프로필 인터페이스
interface EditProfileProps {
  onClose?: () => void; // 취소 버튼 클릭시 호출될 콜백
}

const EditProfile: React.FC<EditProfileProps> = ({ onClose }) => {
  const { user, fetchCurrentUser } = useAuth();
  const navigate = useNavigate();
  
  // 프로필 정보 상태
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  // 비밀번호 변경 상태
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // 유효성 검사 및 상태 메시지
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  
  // 초기 사용자 정보 로드
  useEffect(() => {
    if (user) {
      setNickname(user.nickname || '');
      setBio(user.bio || '');
      setProfileImage(user.profileImageUrl || null);
    }
  }, [user]);
  
  // 이미지 파일 변경 핸들러
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // 파일 크기 체크 (5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        setError('이미지 크기는 5MB 이하여야 합니다.');
        return;
      }
      
      // 파일 타입 체크
      if (!file.type.match('image/*')) {
        setError('이미지 파일만 업로드 가능합니다.');
        return;
      }
      
      // 미리보기 URL 생성
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          setProfileImage(event.target.result);
        }
      };
      reader.readAsDataURL(file);
      
      setImageFile(file);
      setError(null);
    }
  };
  
  // 비밀번호 유효성 검사
  const validatePassword = useCallback(() => {
    if (newPassword !== confirmPassword) {
      setPasswordError('새 비밀번호가 일치하지 않습니다.');
      return false;
    }
    
    if (newPassword.length < 8) {
      setPasswordError('비밀번호는 8자 이상이어야 합니다.');
      return false;
    }
    
    setPasswordError(null);
    return true;
  }, [newPassword, confirmPassword]);
  
  // 비밀번호 입력 필드 변경 시 유효성 검사
  useEffect(() => {
    if (newPassword || confirmPassword) {
      validatePassword();
    }
  }, [newPassword, confirmPassword, validatePassword]);
  
  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    
    try {
      // 1. 이미지 업로드 (변경된 경우)
      let imageUrl = user?.profileImageUrl;
      
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        
        try {
          const response = await uploadProfileImage(formData);
          // 응답 구조 변경: response.data.data에서 이미지 URL 추출
          if (response.data.success && response.data.data) {
            imageUrl = response.data.data.imageUrl;
          } else {
            throw new Error(response.data.message || '이미지 업로드에 실패했습니다.');
          }
        } catch (error) {
          console.error('이미지 업로드 실패', error);
          setError('이미지 업로드에 실패했습니다.');
          setLoading(false);
          return;
        }
      }
      
      // 2. 프로필 정보 업데이트
      if (user?.id) {
        await updateProfile(user.id, {
          nickname,
          bio,
          profileImageUrl: imageUrl
        });
      }
      
      // 3. 비밀번호 변경 (입력된 경우)
      if (showPasswordSection && currentPassword && newPassword) {
        if (!validatePassword()) {
          setLoading(false);
          return;
        }
        
        try {
          await changePassword(currentPassword, newPassword);
          
          // 비밀번호 필드 초기화
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setShowPasswordSection(false);
        } catch (error) {
          console.error('비밀번호 변경 실패', error);
          setPasswordError('현재 비밀번호가 올바르지 않습니다.');
          setLoading(false);
          return;
        }
      }
      
      // 4. 사용자 정보 새로고침
      await fetchCurrentUser();
      
      setSuccess('프로필이 성공적으로 업데이트되었습니다.');
      setTimeout(() => {
        setSuccess(null);
        if (onClose) {
          onClose(); // 성공 후 선택적으로 프로필 수정 화면 닫기
        }
      }, 1500);
    } catch (error) {
      console.error('프로필 업데이트 실패', error);
      setError('프로필 업데이트에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  // 취소 버튼 핸들러
  const handleCancel = () => {
    if (onClose) {
      onClose(); // 부모로부터 전달받은 onClose 함수 호출
    } else {
      navigate('/'); // 대체 경로로 이동
    }
  };
  
  if (!user) {
    return (
      <div style={{ padding: '1.5rem', textAlign: 'center', color: '#666' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 1rem', display: 'block', color: '#999' }}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
        <p>로그인이 필요합니다.</p>
      </div>
    );
  }
  
  return (
    <Form onSubmit={handleSubmit}>
      <ProfileImageSection>
        <ProfileImageContainer>
          <ProfileImage 
            src={profileImage || 'https://via.placeholder.com/100?text=사용자'} 
            alt="프로필 이미지" 
          />
          <UploadButton htmlFor="profile-image">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <FileInput 
              id="profile-image" 
              type="file" 
              accept="image/*"
              onChange={handleImageChange} 
            />
          </UploadButton>
        </ProfileImageContainer>
      </ProfileImageSection>
      
      <InputGroup>
        <Label htmlFor="nickname">닉네임</Label>
        <Input 
          id="nickname"
          type="text" 
          value={nickname} 
          onChange={(e) => setNickname(e.target.value)}
          placeholder="닉네임을 입력하세요"
        />
      </InputGroup>
      
      <InputGroup>
        <Label htmlFor="bio">자기소개</Label>
        <TextArea 
          id="bio"
          value={bio} 
          onChange={(e) => setBio(e.target.value)}
          placeholder="자기소개를 입력하세요"
        />
      </InputGroup>
      
      <PasswordToggle>
        <ToggleTitle onClick={() => setShowPasswordSection(!showPasswordSection)}>
          <span>비밀번호 변경</span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            style={{ transform: showPasswordSection ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s' }}
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </ToggleTitle>
        
        <PasswordSection isVisible={showPasswordSection}>
          <InputGroup>
            <Label htmlFor="current-password">현재 비밀번호</Label>
            <Input 
              id="current-password"
              type="password" 
              value={currentPassword} 
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="현재 비밀번호"
            />
          </InputGroup>
          
          <InputGroup>
            <Label htmlFor="new-password">새 비밀번호</Label>
            <Input 
              id="new-password"
              type="password" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="새 비밀번호 (8자 이상)"
            />
          </InputGroup>
          
          <InputGroup>
            <Label htmlFor="confirm-password">새 비밀번호 확인</Label>
            <Input 
              id="confirm-password"
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="새 비밀번호 확인"
            />
          </InputGroup>
          
          {passwordError && <ErrorMessage>{passwordError}</ErrorMessage>}
        </PasswordSection>
      </PasswordToggle>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}
      
      <ButtonGroup>
        <Button type="button" onClick={handleCancel}>취소</Button>
        <Button type="submit" $primary disabled={loading}>
          {loading ? '저장 중...' : '저장하기'}
        </Button>
      </ButtonGroup>
    </Form>
  );
};

export default EditProfile;