import React from 'react';
import styled from 'styled-components';
import { Friend } from '../../types/friend.types';
import Icon from '../common/Icon';
import { fadeIn, commonColors, commonShadows, commonBorderRadius } from '../../styles/commonStyles';

const SocialItemContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background-color: ${commonColors.white};
    margin-bottom: 0.75rem;
    border-radius: ${commonBorderRadius.large};
    box-shadow: ${commonShadows.small};
    transition: all 0.3s ease;
    animation: ${fadeIn} 0.3s ease-out;
    
    &:hover {
        transform: translateY(-3px);
        box-shadow: ${commonShadows.medium};
    }
`;

const UserInfo = styled.div`
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
`;

const ProfileImageContainer = styled.div`
    width: 40px;
    height: 40px;
    border-radius: ${commonBorderRadius.circle};
    overflow: hidden;
    margin-right: 0.75rem;
    background-color: #e9ecef;
    flex-shrink: 0;
    border: 2px solid ${commonColors.white};
    box-shadow: ${commonShadows.small};
`;

const ProfileImage = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
`;

const ProfileInitial = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: ${commonColors.primary};
    color: ${commonColors.white};
    font-weight: 600;
    font-size: 1.2rem;
`;

const FriendInfo = styled.div`
    display: flex;
    flex-direction: column;
    min-width: 0;
`;

const FriendName = styled.span`
    font-weight: 600;
    color: ${commonColors.dark};
    font-size: 1rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const FriendStatus = styled.span`
    font-size: 0.8rem;
    color: ${commonColors.secondary};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const Actions = styled.div`
    display: flex;
    gap: 0.5rem;
    margin-left: 0.75rem;
`;

const ActionButton = styled.button<{ $primary?: boolean; $danger?: boolean; disabled?: boolean }>`
    background: ${(props) => 
        props.disabled ? '#f1f3f5' :
        props.$primary ? commonColors.primary : 
        props.$danger ? commonColors.danger : '#f8f9fa'};
    color: ${(props) => 
        props.disabled ? '#adb5bd' :
        (props.$primary || props.$danger) ? commonColors.white : commonColors.secondary};
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    border: none;
    border-radius: ${commonBorderRadius.medium};
    cursor: ${(props) => props.disabled ? 'default' : 'pointer'};
    font-weight: 500;
    display: flex;
    align-items: center;
    transition: all 0.2s ease;
    
    &:hover {
        background: ${(props) => 
            props.disabled ? '#f1f3f5' :
            props.$primary ? '#0069d9' : 
            props.$danger ? '#c82333' : '#e9ecef'};
        transform: ${(props) => props.disabled ? 'none' : 'translateY(-2px)'};
    }
    
    svg {
        margin-right: ${(props) => (props.children && props.children !== "친구" && props.children !== "요청됨") ? '0.4rem' : '0'};
    }
`;

interface SocialItemProps {
    friend: Friend;
    status: 'friend' | 'requested' | 'recommended';
    onAction: (friendId: number) => void;
}

const SocialItem: React.FC<SocialItemProps> = ({ friend, status, onAction }) => {
    const renderProfileImage = () => {
        if (friend.profileImageUrl) {
            return <ProfileImage src={friend.profileImageUrl} alt={friend.username} />;
        }
        return <ProfileInitial>{friend.username.charAt(0).toUpperCase()}</ProfileInitial>;
    };

    const renderActionButton = () => {
        switch (status) {
            case 'friend':
                return <ActionButton disabled>친구</ActionButton>;
            case 'requested':
                return <ActionButton disabled>요청됨</ActionButton>;
            case 'recommended':
                return (
                    <ActionButton $primary onClick={() => onAction(friend.id)}>
                        <Icon>
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <line x1="19" y1="8" x2="19" y2="14" />
                            <line x1="16" y1="11" x2="22" y2="11" />
                        </Icon>
                        친구 추가
                    </ActionButton>
                );
            default:
                return null;
        }
    };

    return (
        <SocialItemContainer>
            <UserInfo>
                <ProfileImageContainer>
                    {renderProfileImage()}
                </ProfileImageContainer>
                <FriendInfo>
                    <FriendName>{friend.username}</FriendName>
                    <FriendStatus>
                        {status === 'friend' 
                            ? '이미 친구입니다' 
                            : status === 'requested' 
                                ? '친구 요청 보냄' 
                                : '추천 친구'}
                    </FriendStatus>
                </FriendInfo>
            </UserInfo>
            <Actions>
                {renderActionButton()}
            </Actions>
        </SocialItemContainer>
    );
};

export default SocialItem; 