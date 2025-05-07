import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { ChatRoom } from '../../types/chat.types';

interface ChatRoomItemProps {
    room: ChatRoom;
    onContextMenu: (e: React.MouseEvent) => void;
}

const RoomItem = styled(Link)`
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #eee;
    text-decoration: none;
    color: inherit;
    background-color: #ffffff;
    transition: background-color 0.2s;

    &:hover {
        background-color: #f8f9fa;
    }
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

const SenderName = styled.div`
    font-size: 0.75rem;
    color: #666;
    font-weight: 600;
    margin-bottom: 0.15rem;
`;

const LastMessage = styled.div`
    font-size: 0.9rem;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const RightContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.25rem;
`;

const Timestamp = styled.div`
    font-size: 0.75rem;
    color: #666;
`;

const UnreadBadge = styled.div`
    background-color: #007bff;
    color: white;
    font-size: 0.75rem;
    padding: 0.2rem 0.5rem;
    border-radius: 1rem;
    min-width: 1.5rem;
    text-align: center;
    font-weight: 600;
`;

const ProfileImage = styled.img`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    margin-right: 1rem;
`;

const ProfileInitial = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #007bff;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 1.2rem;
    margin-right: 1rem;
`;

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