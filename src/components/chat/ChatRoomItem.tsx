import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { ChatRoom } from '../../types/chat.types';
import Icon from '../common/Icon';
import { fadeIn, commonColors, commonShadows, commonBorderRadius } from '../../styles/commonStyles';

const RoomItem = styled(Link)`
    display: flex;
    align-items: center;
    padding: 1rem;
    background-color: ${commonColors.white};
    border-radius: ${commonBorderRadius.large};
    margin-bottom: 0.75rem;
    text-decoration: none;
    color: inherit;
    box-shadow: ${commonShadows.small};
    transition: all 0.3s ease;
    animation: ${fadeIn} 0.3s ease-out;
    position: relative;
    
    &:hover {
        transform: translateY(-3px);
        box-shadow: ${commonShadows.medium};
    }
    
    &:active {
        transform: translateY(-1px);
    }
    
    &:last-child {
        margin-bottom: 0;
    }
`;

const Avatar = styled.div`
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

const RoomDetails = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-width: 0;
`;

const RoomHeaderRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.4rem;
`;

const TitleWrapper = styled.div`
    display: flex;
    align-items: center;
    min-width: 0;
`;

const RoomTitle = styled.h3`
    font-size: 1rem;
    font-weight: 600;
    color: ${commonColors.dark};
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const FavoriteButton = styled.button<{ $active: boolean }>`
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    color: ${(props) => (props.$active ? "#FFD700" : "#ccc")};
    margin-left: 0.5rem;
    transition: transform 0.2s, color 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
        transform: scale(1.2);
        color: ${(props) => (props.$active ? "#FFD700" : "#FFD700")};
    }
`;

const Timestamp = styled.span`
    font-size: 0.75rem;
    color: ${commonColors.secondary};
    white-space: nowrap;
    margin-left: 0.75rem;
`;

const RoomFooterRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const LastMessage = styled.div`
    font-size: 0.85rem;
    color: ${commonColors.secondary};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 80%;
`;

const UnreadBadge = styled.div`
    background-color: #FF5722;
    color: ${commonColors.white};
    padding: 0.2rem 0.5rem;
    border-radius: ${commonBorderRadius.large};
    font-size: 0.75rem;
    font-weight: bold;
    min-width: 1.2rem;
    height: 1.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(255, 87, 34, 0.3);
`;

interface ChatRoomItemProps {
    room: ChatRoom;
    onToggleFavorite: (roomId: number, currentFavorite: boolean, e: React.MouseEvent) => void;
}

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