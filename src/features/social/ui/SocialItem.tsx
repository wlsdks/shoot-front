import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Friend } from '../model/types/friend.types';
import { commonColors, commonShadows, commonBorderRadius } from '../../../shared/ui/commonStyles';

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

const SocialItemContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background-color: white;
    border: 1px solid #e0e0e0;
    border-radius: ${commonBorderRadius.medium};
    margin-bottom: 0.6rem;
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

const UserInfo = styled.div`
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
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

    ${SocialItemContainer}:hover & {
        border-color: ${commonColors.primary};
        transform: scale(1.05);
    }
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
    background-color: ${commonColors.primary};
    color: white;
    font-weight: 600;
    font-size: 1rem;
    transition: all 0.3s ease;

    ${SocialItemContainer}:hover & {
        background-color: ${commonColors.primary};
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
    color: ${commonColors.dark};
    font-size: 0.85rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-bottom: 0.1rem;
    transition: color 0.3s ease;

    ${SocialItemContainer}:hover & {
        color: ${commonColors.primary};
    }
`;

const FriendStatus = styled.span`
    font-size: 0.75rem;
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
        props.$danger ? '#dc3545' : 'white'};
    color: ${(props) => 
        props.disabled ? '#adb5bd' :
        (props.$primary || props.$danger) ? '#ffffff' : commonColors.dark};
    padding: 0.4rem 0.8rem;
    font-size: 0.75rem;
    border: 1px solid ${(props) => 
        props.disabled ? '#e9ecef' :
        props.$primary ? commonColors.primary : 
        props.$danger ? '#dc3545' : '#e0e0e0'};
    border-radius: ${commonBorderRadius.medium};
    cursor: ${(props) => props.disabled ? 'default' : 'pointer'};
    font-weight: 500;
    display: flex;
    align-items: center;
    transition: all 0.3s ease;
    box-shadow: ${commonShadows.small};
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: ${commonShadows.medium};
        background: ${(props) => 
            props.disabled ? '#f1f3f5' :
            props.$primary ? '#0056b3' : 
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
                                ? '친구 요청 받음' 
                                : status === 'outgoing'
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