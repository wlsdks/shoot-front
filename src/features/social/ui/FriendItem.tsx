// src/features/social/ui/FriendItem.tsx
import React, { useState } from 'react';
import { Friend } from '../types/friend';
import FriendProfileModal from '../../profile/ui/FriendProfileModal';
import styled from 'styled-components';
import { fadeIn } from '../../../shared/ui/commonStyles';

const FriendItemContainer = styled.div`
    display: flex;
    align-items: center;
    padding: 0.85rem;
    background-color: white;
    border-radius: 14px;
    margin-bottom: 0.8rem;
    cursor: pointer;
    transition: all 0.3s ease;
    animation: ${fadeIn} 0.3s ease-out;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    position: relative;

    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
    }

    &:active {
        transform: translateY(-1px);
    }
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
`;

const StatusIndicator = styled.div<{ isOnline: boolean }>`
    position: absolute;
    bottom: 0;
    right: 0;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: ${props => props.isOnline ? '#4CAF50' : '#9e9e9e'};
    border: 2px solid white;
`;

const UserInfo = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-width: 0;
`;

const UserName = styled.div`
    font-weight: 600;
    font-size: 0.95rem;
    margin-bottom: 0.2rem;
    color: #333;
`;

const UserStatus = styled.div`
    font-size: 0.8rem;
    color: #666;
    display: flex;
    align-items: center;
`;

const Username = styled.span`
    font-size: 0.75rem;
    color: #888;
    margin-top: 0.1rem;
`;

const ChatButton = styled.button`
    background: #f0f7ff;
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #007bff;
    cursor: pointer;
    transition: all 0.2s;
    flex-shrink: 0;
    
    &:hover {
        background: #007bff;
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 123, 255, 0.25);
    }
    
    &:active {
        transform: translateY(-1px);
    }
    
    svg {
        width: 20px;
        height: 20px;
    }
`;

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

    const renderProfileImage = () => {
        if (friend.profileImageUrl && friend.profileImageUrl !== 'null') {
            return (
                <>
                    <ProfileImage src={friend.profileImageUrl} alt={displayName} />
                    <StatusIndicator isOnline={isOnline} />
                </>
            );
        }
        return (
            <>
                <ProfileInitial>{displayName.charAt(0).toUpperCase()}</ProfileInitial>
                <StatusIndicator isOnline={isOnline} />
            </>
        );
    };

    return (
        <>
            <FriendItemContainer onClick={handleItemClick}>
                <ProfileImageContainer>
                    {renderProfileImage()}
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