import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Friend } from '../../shared/types/friend.types';
import { fadeIn, commonColors, commonShadows, commonBorderRadius } from '../../shared/ui/commonStyles';

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
  onChatClick: () => void;
  onClick: () => void;
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

export const FriendItem: React.FC<FriendItemProps> = ({ friend, onChatClick, onClick }) => {
  const renderProfileImage = () => {
    if (friend.profileImageUrl && friend.profileImageUrl !== 'null') {
      return <ProfileImage src={friend.profileImageUrl} alt={friend.username} />;
    }
    return <ProfileInitial>{friend.username.charAt(0).toUpperCase()}</ProfileInitial>;
  };

  const displayName = friend.nickname || friend.name;

  return (
    <FriendItemComponent onClick={onClick}>
      <ProfileImageContainer>
        {renderProfileImage()}
      </ProfileImageContainer>
      <UserInfo>
        <UserName>{displayName}</UserName>
        <UserStatus>{friend.status}</UserStatus>
      </UserInfo>
    </FriendItemComponent>
  );
}; 