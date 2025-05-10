import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Friend } from '../../../entities/friend';
import { commonColors, commonShadows, commonBorderRadius } from '../../../shared/ui/commonStyles';
import { useNavigate } from 'react-router-dom';
import FriendProfileModal from '../../profile/ui/FriendProfileModal';

const fadeInUp = keyframes`
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
`;

interface FriendItemProps {
    friend: Friend;
    onChatClick: (friendId: number) => void;
}

const FriendItemComponent = styled.div`
    display: flex;
    align-items: center;
    padding: 0.75rem;
    background-color: white;
    border: 1px solid #e0e0e0;
    border-radius: ${commonBorderRadius.medium};
    margin-bottom: 0.6rem;
    cursor: pointer;
    transition: all 0.3s ease;
    animation: ${fadeInUp} 0.3s ease-out;
    box-shadow: ${commonShadows.small};

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${commonShadows.medium};
        border-color: ${commonColors.primary};
    }

    &:active {
        transform: translateY(-1px);
    }
`;

const ProfileImageContainer = styled.div`
    width: 38px;
    height: 38px;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 0.75rem;
    background-color: #e9ecef;
    flex-shrink: 0;
    border: 2px solid #e1ecff;
    box-shadow: ${commonShadows.small};
    transition: all 0.3s ease;

    ${FriendItemComponent}:hover & {
        border-color: ${commonColors.primary};
        transform: scale(1.05);
    }
`;

const ProfileImage = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;

    ${FriendItemComponent}:hover & {
        transform: scale(1.1);
    }
`;

const ProfileInitial = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: ${commonColors.primary};
    color: white;
    font-weight: 600;
    font-size: 1rem;
    transition: all 0.3s ease;

    ${FriendItemComponent}:hover & {
        background-color: ${commonColors.primary};
        transform: scale(1.1);
    }
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
    font-size: 0.85rem;
    margin-bottom: 0.1rem;
    color: ${commonColors.dark};
    transition: color 0.3s ease;

    ${FriendItemComponent}:hover & {
        color: ${commonColors.primary};
    }
`;

const UserStatus = styled.div`
    font-size: 0.75rem;
    color: ${commonColors.secondary};
    display: flex;
    align-items: center;
    gap: 0.3rem;

    &::before {
        content: '';
        display: inline-block;
        width: 6px;
        height: 6px;
        background-color: #32CD32;
        border-radius: 50%;
    }
`;

const ChatButton = styled.button`
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    margin-left: auto;

    &:hover {
        svg {
            stroke: ${commonColors.primary};
        }
    }

    &:active {
        transform: translateY(-1px);
    }
`;

const FriendItem: React.FC<FriendItemProps> = ({ friend, onChatClick }) => {
    const navigate = useNavigate();
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