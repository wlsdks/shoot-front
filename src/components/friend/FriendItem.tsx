import React from 'react';
import styled from 'styled-components';
import { Friend } from '../../shared/types/friend.types';
import Icon from '../common/Icon';
import { fadeIn, commonColors, commonShadows, commonBorderRadius } from '../../shared/ui/commonStyles';

const FriendItem = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    background: ${commonColors.white};
    border-radius: ${commonBorderRadius.large};
    margin-bottom: 0.75rem;
    box-shadow: ${commonShadows.small};
    transition: all 0.3s ease;
    animation: ${fadeIn} 0.3s ease-out;
    cursor: pointer;
    
    &:hover {
        transform: translateY(-3px);
        box-shadow: ${commonShadows.medium};
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

const AvatarContainer = styled.div`
    width: 50px;
    height: 50px;
    border-radius: ${commonBorderRadius.circle};
    background-color: ${commonColors.primary};
    margin-right: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    color: ${commonColors.white};
    flex-shrink: 0;
    border: 2px solid #e1ecff;
    box-shadow: ${commonShadows.small};
`;

const AvatarImage = styled.img`
    width: 50px;
    height: 50px;
    border-radius: ${commonBorderRadius.circle};
    object-fit: cover;
    margin-right: 1rem;
    border: 2px solid #e1ecff;
    box-shadow: ${commonShadows.small};
`;

const UserDetails = styled.div`
    display: flex;
    flex-direction: column;
    min-width: 0;
`;

const FriendName = styled.div`
    font-size: 1rem;
    font-weight: 600;
    color: ${commonColors.dark};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const FriendStatus = styled.div`
    display: flex;
    align-items: center;
    margin-top: 0.3rem;
`;

const Online = styled.div`
    width: 12px;
    height: 12px;
    background-color: #32CD32;
    border-radius: ${commonBorderRadius.circle};
    margin-right: 0.5rem;
`;

const StatusText = styled.span`
    font-size: 0.75rem;
    color: ${commonColors.secondary};
`;

const ChatButton = styled.button`
    background: #f0f5ff;
    color: ${commonColors.primary};
    border: none;
    border-radius: ${commonBorderRadius.medium};
    padding: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
        background: #d4e4ff;
        transform: translateY(-2px);
    }
    
    &:active {
        transform: translateY(0);
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

const FriendItemComponent: React.FC<FriendItemProps> = ({ friend, onChatClick }) => {
    return (
        <FriendItem onClick={() => onChatClick(friend.id)}>
            <UserInfo>
                {friend.profileImageUrl ? (
                    <AvatarImage src={friend.profileImageUrl} alt={friend.username} />
                ) : (
                    <AvatarContainer>
                        {friend.username.charAt(0).toUpperCase()}
                    </AvatarContainer>
                )}
                <UserDetails>
                    <FriendName>{friend.username}</FriendName>
                    <FriendStatus>
                        <Online />
                        <StatusText>온라인</StatusText>
                    </FriendStatus>
                </UserDetails>
            </UserInfo>
            <ChatButton>
                <Icon>
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </Icon>
            </ChatButton>
        </FriendItem>
    );
};

export default FriendItemComponent; 