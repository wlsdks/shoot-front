import React, { useState } from 'react';
import { Friend } from '../types/friend';
import FriendProfileModal from '../../profile/ui/FriendProfileModal';
import {
    FriendItemComponent,
    ProfileImageContainer,
    ProfileImage,
    ProfileInitial,
    UserInfo,
    UserName,
    UserStatus,
    ChatButton
} from '../styles/friendItem.styles';

interface FriendItemProps {
    friend: Friend;
    onChatClick: (friendId: number) => void;
}

const FriendItem: React.FC<FriendItemProps> = ({ friend, onChatClick }) => {
    const [showProfile, setShowProfile] = useState(false);

    const handleItemClick = () => {
        setShowProfile(true);
    };

    const handleChatClick = (friendId: number) => {
        if (onChatClick) {
            onChatClick(friendId);
        }
    };

    const renderProfileImage = () => {
        if (friend.profileImageUrl && friend.profileImageUrl !== 'null') {
            return <ProfileImage src={friend.profileImageUrl} alt={friend.nickname || friend.username} />;
        }
        return <ProfileInitial>{friend.nickname?.charAt(0) || friend.username.charAt(0).toUpperCase()}</ProfileInitial>;
    };

    const displayName = friend.nickname || friend.username;

    return (
        <>
            <FriendItemComponent onClick={handleItemClick}>
                <ProfileImageContainer>
                    {renderProfileImage()}
                </ProfileImageContainer>
                <UserInfo>
                    <UserName>{displayName}</UserName>
                    <UserStatus>{friend.status || '온라인'}</UserStatus>
                </UserInfo>
                <ChatButton onClick={(e) => {
                    e.stopPropagation();
                    handleChatClick(friend.id);
                }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                </ChatButton>
            </FriendItemComponent>
            {showProfile && (
                <FriendProfileModal
                    friend={friend}
                    onClose={() => setShowProfile(false)}
                    onChatClick={handleChatClick}
                />
            )}
        </>
    );
};

export default FriendItem; 