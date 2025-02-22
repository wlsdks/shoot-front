import React, { useEffect, useState, useCallback } from 'react';
import { getChatRooms, updateChatRoomFavorite } from '../../services/chatRoom';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';

interface ChatRoom {
    roomId: string;
    title: string;
    lastMessage: string | null;
    unreadMessages: number;
    isPinned: boolean;
    timestamp: string; // 마지막 활동 시간 등
}

// 이미 영역 안에서 사용되기 때문에 추가적인 레이아웃 요소는 불필요
const RoomListContainer = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 10px 0;
`;

const RoomItem = styled(Link)`
    display: flex;
    align-items: center;
    padding: 12px;
    background-color: #f9f9f9;
    border-radius: 12px;
    margin-bottom: 12px;
    text-decoration: none;
    color: inherit;
    transition: all 0.3s ease;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
`;

const Avatar = styled.div`
    flex-shrink: 0;
    width: 50px;
    height: 50px;
    background-color: #ccc;
    border-radius: 50%;
    margin-right: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.3rem;
    color: white;
`;

const RoomInfo = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
`;

const RoomHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const RoomTitle = styled.h3`
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const Timestamp = styled.span`
    font-size: 0.8rem;
    color: #999;
`;

const LastMessage = styled.p`
    font-size: 0.9rem;
    color: #666;
    margin-top: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const UnreadBadge = styled.div<{ count: number }>`
    background-color: ${props => (props.count > 0 ? '#ff3b30' : 'transparent')};
    color: white;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: bold;
    margin-left: 16px;
    display: ${props => (props.count > 0 ? 'block' : 'none')};
`;

const FavoriteButton = styled.button<{ active: boolean }>`
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.5rem;
    margin-left: 8px;
    color: ${(props) => (props.active ? "#ffbb00" : "#ccc")};
`;

const ChatRoomList: React.FC = () => {
    const { user } = useAuth();
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // 채팅방 목록 불러오기
    // fetchRooms를 useCallback으로 감싸기
    const fetchRooms = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const response = await getChatRooms(user.id);
            const roomsData: ChatRoom[] = response.data;
            setRooms(roomsData);
        } catch (err) {
            console.error(err);
            setError("채팅방 목록 로드 실패");
        } finally {
            setLoading(false);
        }
    }, [user]); // 의존성: user만 필요 (setRooms 등은 컴포넌트 상태라 안 넣어도 OK)

    useEffect(() => {
        fetchRooms();

        if (!user) return;
        const source = new EventSource(`http://localhost:8100/api/v1/chatrooms/updates/${user.id}`);
        source.onmessage = (event) => {
            // roomId (어떤 채팅방인지), unreadCount (새 숫자), lastMessage (마지막 메시지 내용)
            const { roomId, unreadCount, lastMessage } = JSON.parse(event.data);
            setRooms((prev) =>
                prev.map((room) =>
                    room.roomId === roomId ? { ...room, unreadMessages: unreadCount, lastMessage } : room
                )
            );
        };
        source.onerror = () => console.error("SSE 연결 오류");
        return () => source.close();
    }, [user, fetchRooms]);

     // 즐겨찾기 토글 함수
    const toggleFavorite = async (roomId: string, currentFavorite: boolean) => {
        try {
            await updateChatRoomFavorite(roomId, user!.id, !currentFavorite);
            fetchRooms();
        } catch (err) {
            console.error("즐겨찾기 업데이트 실패", err);
            alert("즐겨찾기 업데이트 실패");
        }
    };
    
    if (loading) return <p>로딩중...</p>;
    if (error) return <p>{error}</p>;

    return (
        <RoomListContainer>
            {rooms.length === 0 ? (
                <p style={{ textAlign: "center", color: "#0b0a0a" }}>
                    참여 중인 채팅방이 없습니다.
                </p>
            ) : (
                rooms.map((room) => (
                    <RoomItem key={room.roomId} to={`/chatroom/${room.roomId}`}>
                        <Avatar>{room.title.charAt(0).toUpperCase()}</Avatar>
                        <RoomInfo>
                            <RoomHeader>
                                <RoomTitle>{room.title}</RoomTitle>
                                <div>
                                    <Timestamp>{room.timestamp}</Timestamp>
                                    <FavoriteButton
                                        active={room.isPinned}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            toggleFavorite(room.roomId, room.isPinned);
                                        }}
                                    >
                                        {room.isPinned ? "★" : "☆"}
                                    </FavoriteButton>
                                </div>
                            </RoomHeader>
                            <LastMessage>
                                {room.lastMessage || "최근 메시지가 없습니다."}
                            </LastMessage>
                        </RoomInfo>
                        <UnreadBadge count={room.unreadMessages}>
                            {room.unreadMessages}
                        </UnreadBadge>
                    </RoomItem>
                ))
            )}
        </RoomListContainer>
    );
};


export default ChatRoomList;