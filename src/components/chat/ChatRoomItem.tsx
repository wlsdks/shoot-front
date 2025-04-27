import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { ChatRoom } from '../../types/chat.types';
import Icon from '../common/Icon';

interface ChatRoomItemProps {
    room: ChatRoom;
    onToggleFavorite: (roomId: number, currentFavorite: boolean, e: React.MouseEvent) => void;
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

const Avatar = styled.div`
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

const RoomDetails = styled.div`
    flex: 1;
    min-width: 0;
`;

const RoomHeaderRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.15rem;
`;

const TitleWrapper = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const RoomTitle = styled.div`
    font-weight: 600;
    font-size: 0.95rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const Timestamp = styled.div`
    font-size: 0.8rem;
    color: #666;
`;

const RoomFooterRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const LastMessage = styled.div`
    font-size: 0.8rem;
    color: #666;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    margin-right: 0.5rem;
`;

const UnreadBadge = styled.div`
    background-color: #007bff;
    color: white;
    font-size: 0.75rem;
    padding: 0.2rem 0.5rem;
    border-radius: 1rem;
    min-width: 1.5rem;
    text-align: center;
`;

const FavoriteButton = styled.button<{ $active: boolean }>`
    background: none;
    border: none;
    padding: 0.25rem;
    cursor: pointer;
    color: ${props => props.$active ? '#ffd700' : '#ccc'};
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s;

    &:hover {
        color: ${props => props.$active ? '#ffd700' : '#999'};
    }

    svg {
        width: 1rem;
        height: 1rem;
    }
`;

const ChatRoomItem: React.FC<ChatRoomItemProps> = ({ room, onToggleFavorite }) => {
    return (
        <RoomItem to={`/chatroom/${room.roomId}`}>
            <Avatar>
                {room.title.charAt(0).toUpperCase()}
            </Avatar>
            <RoomDetails>
                <RoomHeaderRow>
                    <TitleWrapper>
                        <RoomTitle>{room.title}</RoomTitle>
                        <FavoriteButton
                            $active={room.isPinned}
                            onClick={(e) => onToggleFavorite(room.roomId, room.isPinned, e)}
                        >
                            <Icon>
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </Icon>
                        </FavoriteButton>
                    </TitleWrapper>
                    <Timestamp>
                        {room.timestamp || ""}
                    </Timestamp>
                </RoomHeaderRow>
                <RoomFooterRow>
                    <LastMessage>
                        {room.lastMessage || "최근 메시지가 없습니다."}
                    </LastMessage>
                    {room.unreadMessages > 0 && (
                        <UnreadBadge>{room.unreadMessages}</UnreadBadge>
                    )}
                </RoomFooterRow>
            </RoomDetails>
        </RoomItem>
    );
};

export default ChatRoomItem; 