import React from 'react';
import styled from 'styled-components';
import { Friend } from '../../types/friend.types';
import Icon from '../common/Icon';
import { fadeIn, commonColors, commonShadows, commonBorderRadius } from '../../styles/commonStyles';

const SocialItemContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background-color: #ffffff;
    border-bottom: 1px solid #eee;
    transition: background-color 0.2s;
    
    &:hover {
        background-color: #f8f9fa;
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
    border-radius: 50%;
    overflow: hidden;
    margin-right: 1rem;
    background-color: #e9ecef;
    flex-shrink: 0;
    border: 1px solid #dee2e6;
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
    background-color: #007bff;
    color: white;
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
    color: #333;
    font-size: 0.95rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-bottom: 0.15rem;
`;

const FriendStatus = styled.span`
    font-size: 0.8rem;
    color: #666;
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
        props.$primary ? '#4CAF50' : 
        props.$danger ? '#f44336' : '#f8f9fa'};
    color: ${(props) => 
        props.disabled ? '#adb5bd' :
        (props.$primary || props.$danger) ? '#ffffff' : '#666'};
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
    border: none;
    border-radius: 20px;
    cursor: ${(props) => props.disabled ? 'default' : 'pointer'};
    font-weight: 500;
    display: flex;
    align-items: center;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    
    &:hover {
        background: ${(props) => 
            props.disabled ? '#f1f3f5' :
            props.$primary ? '#43A047' : 
            props.$danger ? '#E53935' : '#e9ecef'};
        transform: translateY(-1px);
        box-shadow: 0 3px 6px rgba(0,0,0,0.15);
    }
    
    &:active {
        transform: translateY(0);
        box-shadow: 0 1px 2px rgba(0,0,0,0.1);
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