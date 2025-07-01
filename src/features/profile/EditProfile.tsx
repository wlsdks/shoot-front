import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/lib/context/AuthContext';
import { updateProfile, uploadProfileImage, changePassword } from './api/profile';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API_CONFIG } from '../../shared/api/config';
import {
  Form,
  ProfileImageSection,
  ProfileImageContainer,
  ProfileImage,
  UploadButton,
  FileInput,
  InputGroup,
  Label,
  Input,
  TextArea,
  PasswordToggle,
  ToggleTitle,
  PasswordSection,
  ButtonGroup,
  Button,
  ErrorMessage
} from './styles/EditProfile.styles';

// 프로필 인터페이스
interface EditProfileProps {
  onClose?: () => void; // 취소 버튼 클릭시 호출될 콜백
}

const EditProfile: React.FC<EditProfileProps> = ({ onClose }) => {
  const { user, fetchCurrentUser } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
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
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // 프로필 업데이트 mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { nickname: string; bio: string }) => {
      if (!user) throw new Error('사용자 정보가 없습니다.');
      return updateProfile(user.id, { nickname: data.nickname, bio: data.bio });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', user?.id] });
      fetchCurrentUser();
    },
    onError: (error: any) => {
      setError(error.message || '프로필 업데이트에 실패했습니다.');
    }
  });

  // 프로필 이미지 업로드 mutation
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error('사용자 정보가 없습니다.');
      const formData = new FormData();
      formData.append('image', file);
      return uploadProfileImage(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', user?.id] });
      fetchCurrentUser();
    },
    onError: (error: any) => {
      setError(error.message || '이미지 업로드에 실패했습니다.');
    }
  });

  // 비밀번호 변경 mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      if (!user) throw new Error('사용자 정보가 없습니다.');
      return changePassword(data.currentPassword, data.newPassword);
    },
    onSuccess: () => {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordSection(false);
    },
    onError: (error: any) => {
      setPasswordError(error.message || '비밀번호 변경에 실패했습니다.');
    }
  });
  
  // 초기 사용자 정보 로드
  useEffect(() => {
    if (user) {
      setNickname(user.nickname || '');
      setBio(user.bio || '');
      setProfileImage(user.profileImageUrl && user.profileImageUrl !== 'null' ? user.profileImageUrl : null);
    }
  }, [user]);
  
  // 이미지 파일 변경 핸들러
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // 파일 크기 체크
      if (file.size > API_CONFIG.MAX_FILE_SIZE) {
        setError('이미지 크기는 5MB 이하여야 합니다.');
        return;
      }
      
      // 이미지 파일 타입 체크
      if (!file.type.startsWith('image/')) {
        setError('이미지 파일만 업로드 가능합니다.');
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!user) {
      setError('사용자 정보가 없습니다.');
      return;
    }
    
    try {
      // 프로필 이미지 업로드
      if (imageFile) {
        await uploadImageMutation.mutateAsync(imageFile);
      }
      
      // 프로필 정보 업데이트
      await updateProfileMutation.mutateAsync({ nickname, bio });
      
      // 비밀번호 변경
      if (showPasswordSection && newPassword) {
        if (newPassword !== confirmPassword) {
          setPasswordError('새 비밀번호가 일치하지 않습니다.');
          return;
        }
        await changePasswordMutation.mutateAsync({
          currentPassword,
          newPassword
        });
      }
      
      if (onClose) {
        onClose();
      }
    } catch (err: any) {
      setError(err.message || '프로필 업데이트에 실패했습니다.');
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
          {profileImage && profileImage !== 'null' ? (
            <>
              <ProfileImage 
                src={profileImage} 
                alt="프로필 이미지"
              />
              <UploadButton htmlFor="profile-image">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
              </UploadButton>
            </>
          ) : (
            <UploadButton htmlFor="profile-image" className="add-button">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </UploadButton>
          )}
          <FileInput 
            id="profile-image" 
            type="file" 
            accept="image/*"
            onChange={handleImageChange} 
          />
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
      
      <ButtonGroup>
        <Button type="button" onClick={handleCancel}>취소</Button>
        <Button type="submit" $primary>저장하기</Button>
      </ButtonGroup>
    </Form>
  );
};

export default EditProfile;