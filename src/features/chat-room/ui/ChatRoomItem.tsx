import React from 'react';
import { ChatRoom } from '../../message/types/ChatRoom.types';
import {
    RoomItemContainer,
    ProfileContainer,
    ProfileImage,
    ProfileInitial,
    RoomDetails,
    LeftContainer,
    RoomTitle,
    LastMessage,
    RightContainer,
    Timestamp,
    UnreadBadge,
    PinIndicator
} from '../styles/ChatRoomItem.styles';

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