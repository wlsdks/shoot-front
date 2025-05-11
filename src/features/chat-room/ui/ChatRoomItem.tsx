import React from 'react';
import { ChatRoom } from '../../message/types/ChatRoom.types';
import styled from 'styled-components';
import { fadeIn } from '../../../shared/ui/commonStyles';

const RoomItemContainer = styled.div`
    display: flex;
    align-items: center;
    padding: 0.85rem;
    background-color: white;
    border-radius: 14px;
    margin-bottom: 0.8rem;
    transition: all 0.3s ease;
    animation: ${fadeIn} 0.3s ease-out;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    position: relative;
    cursor: pointer;
    
    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
    }
    
    &:active {
        transform: translateY(-1px);
    }
`;

const ProfileContainer = styled.div`
    position: relative;
    margin-right: 1rem;
`;

const ProfileImage = styled.img`
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #e1ecff;
    background-color: #f0f5ff;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
`;

const ProfileInitial = styled.div`
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: linear-gradient(135deg, #4a6cf7, #2a4cdf);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 1.3rem;
    border: 2px solid #e1ecff;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
`;

const RoomDetails = styled.div`
    flex: 1;
    min-width: 0;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
`;

const LeftContainer = styled.div`
    flex: 1;
    min-width: 0;
    margin-right: 0.5rem;
`;

const RoomTitle = styled.div`
    font-size: 0.95rem;
    color: #333;
    font-weight: 600;
    margin-bottom: 0.3rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const LastMessage = styled.div`
    font-size: 0.8rem;
    color: #666;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 250px;
`;

const RightContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.35rem;
`;

const Timestamp = styled.div`
    font-size: 0.7rem;
    color: #888;
`;

const UnreadBadge = styled.div`
    background-color: #007bff;
    color: white;
    font-size: 0.7rem;
    padding: 0.2rem 0.5rem;
    border-radius: 10px;
    min-width: 1.5rem;
    text-align: center;
    font-weight: 600;
    box-shadow: 0 2px 4px rgba(0, 123, 255, 0.2);
`;

const PinIndicator = styled.div`
    position: absolute;
    top: -5px;
    right: -5px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background-color: #4a6cf7;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

interface ChatRoomItemProps {
    room: ChatRoom;
    onContextMenu: (e: React.MouseEvent) => void;
}

const ChatRoomItem: React.FC<ChatRoomItemProps> = ({ room, onContextMenu }) => {
    const displayName = room.title.replace('님과의 대화', '');
    const firstLetter = displayName.charAt(0).toUpperCase();
    
    const handleClick = () => {
        window.location.href = `/chatroom/${room.roomId}`;
    };

    const renderProfileImage = () => {
        if (room.profileImageUrl) {
            return (
                <ProfileContainer>
                    <ProfileImage src={room.profileImageUrl} alt={displayName} />
                    {room.isPinned && (
                        <PinIndicator>
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                <circle cx="12" cy="10" r="3"/>
                            </svg>
                        </PinIndicator>
                    )}
                </ProfileContainer>
            );
        }
        return (
            <ProfileContainer>
                <ProfileInitial>{firstLetter}</ProfileInitial>
                {room.isPinned && (
                    <PinIndicator>
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                        </svg>
                    </PinIndicator>
                )}
            </ProfileContainer>
        );
    };

    const formatTimestamp = (timestamp?: string) => {
        if (!timestamp) return "";
        
        const date = new Date(timestamp);
        const now = new Date();
        
        // 오늘인 경우 시간만 표시
        if (date.toDateString() === now.toDateString()) {
            return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: true });
        }
        
        // 어제인 경우 '어제'로 표시
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) {
            return '어제';
        }
        
        // 올해인 경우 월/일 표시
        if (date.getFullYear() === now.getFullYear()) {
            return `${date.getMonth() + 1}/${date.getDate()}`;
        }
        
        // 그 외에는 연/월/일 표시
        return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
    };

    return (
        <RoomItemContainer onClick={handleClick} onContextMenu={onContextMenu}>
            {renderProfileImage()}
            <RoomDetails>
                <LeftContainer>
                    <RoomTitle>{displayName}</RoomTitle>
                    <LastMessage>
                        {room.lastMessage || "최근 메시지가 없습니다."}
                    </LastMessage>
                </LeftContainer>
                <RightContainer>
                    <Timestamp>
                        {formatTimestamp(room.timestamp)}
                    </Timestamp>
                    {room.unreadMessages > 0 && (
                        <UnreadBadge>{room.unreadMessages}</UnreadBadge>
                    )}
                </RightContainer>
            </RoomDetails>
        </RoomItemContainer>
    );
};

export default ChatRoomItem;