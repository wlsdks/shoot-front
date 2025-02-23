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

const ErrorMessage = styled.div`
    padding: 10px;
    background: #ffebee;
    color: #c62828;
    text-align: center;
    font-size: 0.9rem;
`;

const ChatRoomList: React.FC = () => {
    const { user, subscribeToSse, unsubscribeFromSse } = useAuth();
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // 채팅방 목록 불러오기
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

    // SSE 이벤트 처리
    useEffect(() => {
        if (!user?.id) {
            console.log("ChatRoomList: No user ID, skipping fetchRooms");
            setRooms([]);
            return;
        }
        fetchRooms();

        // SSE로 받은 메시지 처리 (친구가 메시지 보내면 받아서 내 채팅방 업데이트)
        const handleMessage = (event: MessageEvent) => {
            const { roomId, unreadCount, lastMessage } = JSON.parse(event.data);
            console.log("ChatRoomList: Message received:", { roomId, unreadCount, lastMessage });

            // 채팅방에 표시 업데이트
            setRooms((prev) =>
                prev.map((room) =>
                    room.roomId === roomId ? { ...room, unreadMessages: unreadCount, lastMessage } : room
                )
            );
        };

        // 채팅방 생성 SSE 이벤트 (새로고침 진행)
        const handleChatRoomCreated = (event: MessageEvent) => {
            console.log("ChatRoomList: Chat room created event:", event);
            fetchRooms();
        };

        // SSE 하트비트 (로그만 남김)
        const handleHeartbeat = (event: MessageEvent) => {
            console.log("ChatRoomList: Heartbeat received:", event);
        };

        subscribeToSse("message", handleMessage);
        subscribeToSse("chatRoomCreated", handleChatRoomCreated);
        subscribeToSse("heartbeat", handleHeartbeat);

        return () => {
            unsubscribeFromSse("message", handleMessage);
            unsubscribeFromSse("chatRoomCreated", handleChatRoomCreated);
            unsubscribeFromSse("heartbeat", handleHeartbeat);
        };
    }, [user?.id, fetchRooms, subscribeToSse, unsubscribeFromSse]);

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
    if (error) return <ErrorMessage>{error}</ErrorMessage>;

    return (
        <RoomListContainer>
            {error && <ErrorMessage>{error}</ErrorMessage>} {/* 에러 메시지 표시 */}
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