// src/features/social/ui/SocialItem.tsx
import React from 'react';
import styled from 'styled-components';
import { Friend } from '../../../entities/friend';
import { fadeIn } from '../../../shared/ui/commonStyles';

const SocialItemContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background-color: white;
    border-radius: 14px;
    margin-bottom: 0.8rem;
    transition: all 0.3s ease;
    animation: ${fadeIn} 0.3s ease-out;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
    }

    &:active {
        transform: translateY(-1px);
    }
`;

const UserInfo = styled.div`
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
`;

const ProfileImageContainer = styled.div`
    width: 48px;
    height: 48px;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 0.75rem;
    background-color: #f0f5ff;
    flex-shrink: 0;
    border: 2px solid #e1ecff;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
    position: relative;
`;

const ProfileImage = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;

    ${SocialItemContainer}:hover & {
        transform: scale(1.1);
    }
`;

const ProfileInitial = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #4a6cf7, #2a4cdf);
    color: white;
    font-weight: 600;
    font-size: 1.2rem;
    transition: all 0.3s ease;

    ${SocialItemContainer}:hover & {
        transform: scale(1.1);
    }
`;

const FriendInfo = styled.div`
    display: flex;
    flex-direction: column;
    min-width: 0;
`;

const FriendName = styled.span`
    font-weight: 600;
    color: #333;
    font-size: 0.95rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-bottom: 0.2rem;
    transition: color 0.3s ease;

    ${SocialItemContainer}:hover & {
        color: #007bff;
    }
`;

const FriendStatus = styled.span`
    font-size: 0.8rem;
    color: #666;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const FriendUsername = styled.span`
    font-size: 0.75rem;
    color: #888;
    margin-top: 0.1rem;
`;

const Actions = styled.div`
    display: flex;
    gap: 0.5rem;
    margin-left: 0.75rem;
`;

const ActionButton = styled.button<{ $primary?: boolean; $danger?: boolean; disabled?: boolean }>`
    background: ${(props) => 
        props.disabled ? '#f1f3f5' :
        props.$primary ? '#007bff' : 
        props.$danger ? '#dc3545' : 'white'};
    color: ${(props) => 
        props.disabled ? '#adb5bd' :
        (props.$primary || props.$danger) ? '#ffffff' : '#333'};
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
    border: 1px solid ${(props) => 
        props.disabled ? '#e9ecef' :
        props.$primary ? '#007bff' : 
        props.$danger ? '#dc3545' : '#e0e0e0'};
    border-radius: 10px;
    cursor: ${(props) => props.disabled ? 'default' : 'pointer'};
    font-weight: 500;
    display: flex;
    align-items: center;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    
    &:hover {
        transform: ${props => props.disabled ? 'none' : 'translateY(-2px)'};
        box-shadow: ${props => props.disabled ? 'none' : '0 4px 8px rgba(0, 0, 0, 0.1)'};
        background: ${(props) => 
            props.disabled ? '#f1f3f5' :
            props.$primary ? '#0069d9' : 
            props.$danger ? '#c82333' : '#f8f9fa'};
    }
    
    &:active {
        transform: translateY(-1px);
    }
    
    svg {
        margin-right: ${(props) => (props.children && props.children !== "친구" && props.children !== "요청됨") ? '0.3rem' : '0'};
        width: 14px;
        height: 14px;
    }
`;

interface SocialItemProps {
    friend: Friend;
    status: 'friend' | 'requested' | 'recommended' | 'outgoing';
    onAction: (friendId: number) => void;
}

const SocialItem: React.FC<SocialItemProps> = ({ friend, status, onAction }) => {
    const renderProfileImage = () => {
        if (friend.profileImageUrl && friend.profileImageUrl !== 'null') {
            return <ProfileImage src={friend.profileImageUrl} alt={friend.username} />;
        }
        return <ProfileInitial>{friend.username.charAt(0).toUpperCase()}</ProfileInitial>;
    };

    const renderActionButton = () => {
        switch (status) {
            case 'friend':
                return <ActionButton disabled>친구</ActionButton>;
            case 'requested':
                return (
                    <>
                        <ActionButton $primary onClick={() => onAction(friend.id)}>
                            수락
                        </ActionButton>
                        <ActionButton $danger onClick={() => onAction(friend.id)}>
                            거절
                        </ActionButton>
                    </>
                );
            case 'outgoing':
                return (
                    <ActionButton $danger onClick={() => onAction(friend.id)}>
                        취소
                    </ActionButton>
                );
            case 'recommended':
                return (
                    <ActionButton $primary onClick={() => onAction(friend.id)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="8.5" cy="7" r="4"></circle>
                            <line x1="20" y1="8" x2="20" y2="14"></line>
                            <line x1="23" y1="11" x2="17" y2="11"></line>
                        </svg>
                        친구 추가
                    </ActionButton>
                );
            default:
                return null;
        }
    };

    const getStatusText = () => {
        switch (status) {
            case 'friend':
                return '이미 친구입니다';
            case 'requested':
                return '친구 요청 받음';
            case 'outgoing':
                return '친구 요청 보냄';
            case 'recommended':
                return '추천 친구';
            default:
                return '';
        }
    };

    return (
        <SocialItemContainer>
            <UserInfo>
                <ProfileImageContainer>
                    {renderProfileImage()}
                </ProfileImageContainer>
                <FriendInfo>
                    <FriendName>{friend.nickname || friend.username}</FriendName>
                    <FriendStatus>{getStatusText()}</FriendStatus>
                    {friend.username && friend.nickname && friend.username !== friend.nickname && (
                        <FriendUsername>@{friend.username}</FriendUsername>
                    )}
                </FriendInfo>
            </UserInfo>
            <Actions>
                {renderActionButton()}
            </Actions>
        </SocialItemContainer>
    );
};

export default SocialItem;