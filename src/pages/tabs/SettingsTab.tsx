import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';

// 스타일링 코드 (유지)
const Container = styled.div`
    padding: 1.5rem;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: #ffffff;
`;

const ProfileSection = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1.5rem;
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
    margin-bottom: 1.5rem;
`;

const ProfileImage = styled.img`
    width: 90px;
    height: 90px;
    border-radius: 50%;
    object-fit: cover;
    margin-bottom: 1rem;
    border: 2px solid #f0f0f0;
`;

const Nickname = styled.h2`
    font-size: 1.6rem;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0;
`;

const Bio = styled.p`
    font-size: 0.9rem;
    color: #606060;
    margin: 0.5rem 0 1rem;
    text-align: center;
    max-width: 80%;
`;

const StatusSelect = styled.select`
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
    background: #fafafa;
    color: #333;
    cursor: pointer;
    transition: all 0.2s ease;
    &:focus {
        border-color: #6366f1;
        box-shadow: 0 0 6px rgba(99, 102, 241, 0.2);
        outline: none;
    }
`;

const EditProfileButton = styled.button`
    padding: 0.6rem 1.4rem;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    margin-top: 1rem;
    transition: background 0.3s, transform 0.2s;
    &:hover {
        background: #4f46e5;
        transform: translateY(-2px);
    }
`;

const SettingsList = styled.ul`
    list-style: none;
    margin: 0;
    padding: 0;
    flex: 1;
`;

const ListItem = styled.li`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.2rem;
    background: #ffffff;
    margin-bottom: 0.8rem;
    border-radius: 12px;
    border: 1px solid #e8ecef;
    cursor: pointer;
    transition: background 0.2s ease, box-shadow 0.2s ease;
    &:hover {
        background: #f9fafb;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
    }
`;

const ItemText = styled.span`
    font-size: 1rem;
    color: #1a1a1a;
    font-weight: 500;
`;

const ActionButton = styled.button<{ danger?: boolean }>`
    padding: 0.5rem 1rem;
    background: ${(props) => (props.danger ? '#f43f5e' : '#10b981')};
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.3s, transform 0.2s;
    &:hover {
        background: ${(props) => (props.danger ? '#e11d48' : '#059669')};
        transform: translateY(-2px);
    }
`;

// 로딩 컴포넌트 추가
const LoadingSpinner = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    font-size: 1.2rem;
    color: #6366f1;
    padding: 2rem;
    
    &::after {
        content: '';
        width: 30px;
        height: 30px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #6366f1;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-left: 10px;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const SettingsTab: React.FC = () => {
    const { user, logout, deleteUser, updateStatus, fetchCurrentUser } = useAuth();
    const navigate = useNavigate();
    const [status, setStatus] = useState(user?.status || 'ONLINE');
    const [isLoading, setIsLoading] = useState(true); // 초기 로딩 상태 true로 설정

    // 컴포넌트가 마운트될 때 사용자 정보 가져오기
    useEffect(() => {
        const loadUserData = async () => {
            try {
                await fetchCurrentUser();
            } catch (error) {
                console.error('프로필 정보를 불러오는 데 실패했습니다:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadUserData();
    }, [fetchCurrentUser]);

    // user 상태가 업데이트되면 status 상태도 업데이트
    useEffect(() => {
        if (user?.status) {
            setStatus(user.status);
        }
    }, [user]);

    const handleLogout = () => {
        if (window.confirm('정말 로그아웃 하시겠습니까?')) {
            logout();
            navigate('/login');
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm('정말 회원 탈퇴 하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            try {
                await deleteUser();
                navigate('/login');
            } catch (error) {
                alert('회원 탈퇴에 실패했습니다.');
            }
        }
    };

    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value;
        setStatus(newStatus);

        try {
            if (!user?.id) throw new Error('User ID not available');
            await updateStatus(newStatus);
        } catch (error) {
            alert('상태 변경에 실패했습니다.');
            setStatus(user?.status || 'ONLINE');
        }
    };

    const handleEditProfile = () => {
        navigate('/settings/edit-profile');
    };

    // 로딩 중 상태 표시
    if (isLoading) {
        return (
            <Container>
                <LoadingSpinner>프로필 정보를 불러오는 중...</LoadingSpinner>
            </Container>
        );
    }

    return (
        <Container>
            <ProfileSection>
                <ProfileImage
                    src={user?.profileImageUrl || 'https://via.placeholder.com/90'}
                    alt="Profile"
                />
                <Nickname>{user?.nickname || '사용자'}</Nickname>
                <Bio>{user?.bio || '한줄 소개가 없습니다.'}</Bio>
                <StatusSelect value={status} onChange={handleStatusChange}>
                    <option value="ONLINE">온라인</option>
                    <option value="BUSY">바쁨</option>
                    <option value="AWAY">자리 비움</option>
                    <option value="INVISIBLE">보이지 않음</option>
                    <option value="DO_NOT_DISTURB">방해 금지</option>
                    <option value="IDLE">대기 중</option>
                    <option value="OFFLINE">오프라인</option>
                </StatusSelect>
                <EditProfileButton onClick={handleEditProfile}>회원정보 변경</EditProfileButton>
            </ProfileSection>

            <SettingsList>
                <ListItem onClick={handleLogout}>
                    <ItemText>로그아웃</ItemText>
                    <ActionButton>로그아웃</ActionButton>
                </ListItem>
                <ListItem onClick={handleDeleteAccount}>
                    <ItemText>회원 탈퇴</ItemText>
                    <ActionButton danger>탈퇴</ActionButton>
                </ListItem>
            </SettingsList>
        </Container>
    );
};

export default SettingsTab;