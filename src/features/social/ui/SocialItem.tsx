// src/features/social/ui/SocialItem.tsx
import React from 'react';
import { Friend } from '../../../entities';
import {
    SocialItemContainer,
    UserInfo,
    ProfileImageContainer,
    ProfileImage,
    ProfileInitial,
    FriendInfo,
    FriendName,
    FriendStatus,
    FriendUsername,
    Actions,
    ActionButton
} from '../styles/SocialItem.styles';

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