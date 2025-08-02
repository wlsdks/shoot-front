// src/features/social/ui/FriendItem.tsx
import React, { useState } from 'react';
import { Friend } from '../../../entities';
import FriendProfileModal from '../../profile/ui/FriendProfileModal';
import { ProfileAvatar } from '../../../shared/ui';
import {
    FriendItemContainer,
    ProfileImageContainer,
    UserInfo,
    UserName,
    UserStatus,
    Username,
    ChatButton
} from '../styles/FriendItem.styles';

interface FriendItemProps {
    friend: Friend;
    onChatClick: (friendId: number) => void;
}

const FriendItem: React.FC<FriendItemProps> = ({ friend, onChatClick }) => {
    const [showProfile, setShowProfile] = useState(false);

    const handleItemClick = () => {
        setShowProfile(true);
    };

    const handleChatClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onChatClick) {
            onChatClick(friend.id);
        }
    };

    const isOnline = friend.status === "온라인" || friend.status === "나";
    const displayName = friend.nickname || friend.username;

    return (
        <>
            <FriendItemContainer onClick={handleItemClick}>
                <ProfileImageContainer>
                    <ProfileAvatar
                        imageUrl={friend.profileImageUrl && friend.profileImageUrl !== 'null' ? friend.profileImageUrl : null}
                        name={displayName}
                        isOnline={isOnline}
                        showStatus={true}
                        fullSize={true}
                    />
                </ProfileImageContainer>
                <UserInfo>
                    <UserName>{displayName}</UserName>
                    <UserStatus>{friend.status}</UserStatus>
                    {friend.username && friend.nickname && friend.username !== friend.nickname && (
                        <Username>@{friend.username}</Username>
                    )}
                </UserInfo>
                <ChatButton onClick={handleChatClick}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                </ChatButton>
            </FriendItemContainer>
            {showProfile && (
                <FriendProfileModal
                    friend={friend}
                    onClose={() => setShowProfile(false)}
                    onChatClick={onChatClick}
                />
            )}
        </>
    );
};

export default FriendItem;