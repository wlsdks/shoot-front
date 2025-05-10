import React from 'react';
import { ChatRoom } from '../../message/types/ChatRoom.types';
import {
    RoomItem,
    RoomDetails,
    LeftContainer,
    SenderName,
    LastMessage,
    RightContainer,
    Timestamp,
    UnreadBadge,
    ProfileImage,
    ProfileInitial
} from '../styles/ChatRoomItem.styles';

interface ChatRoomItemProps {
    room: ChatRoom;
    onContextMenu: (e: React.MouseEvent) => void;
}

const ChatRoomItem: React.FC<ChatRoomItemProps> = ({ room, onContextMenu }) => {
    const displayName = room.title.replace('님과의 대화', '');
    const firstLetter = displayName.charAt(0).toUpperCase();

    const renderProfileImage = () => {
        if (room.profileImageUrl) {
            return <ProfileImage src={room.profileImageUrl} alt={displayName} />;
        }
        return <ProfileInitial>{firstLetter}</ProfileInitial>;
    };

    return (
        <RoomItem to={`/chatroom/${room.roomId}`} onContextMenu={onContextMenu}>
            {renderProfileImage()}
            <RoomDetails>
                <LeftContainer>
                    <SenderName>{displayName}</SenderName>
                    <LastMessage>
                        {room.lastMessage || "최근 메시지가 없습니다."}
                    </LastMessage>
                </LeftContainer>
                <RightContainer>
                    <Timestamp>
                        {room.timestamp || ""}
                    </Timestamp>
                    {room.unreadMessages > 0 && (
                        <UnreadBadge>{room.unreadMessages}</UnreadBadge>
                    )}
                </RightContainer>
            </RoomDetails>
        </RoomItem>
    );
};

export default ChatRoomItem; 