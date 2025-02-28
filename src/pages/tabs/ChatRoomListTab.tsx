import React, { useEffect, useState, useCallback, useRef } from 'react';
import { getChatRooms, updateChatRoomFavorite } from '../../services/chatRoom';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';

// 채팅방 인터페이스 정의
interface ChatRoom {
    roomId: string;
    title: string;
    lastMessage: string | null;
    unreadMessages: number;
    isPinned: boolean;
    timestamp?: string; // API에서 내려오지 않으면 undefined 처리됨
}

// 전체 채팅방 목록 컨테이너
const RoomListContainer = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 10px 0;
`;

// 채팅방 아이템 카드 (Link로 감싸서 클릭 시 해당 채팅방으로 이동)
const RoomItem = styled(Link)`
    display: flex;
    align-items: center;
    padding: 10px;
    background-color: #f9f9f9;
    border-radius: 12px;
    margin-bottom: 10px;
    text-decoration: none;
    color: inherit;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
`;

// 좌측 아바타 영역: 이미지가 없으면 제목의 첫 글자를 사용
const Avatar = styled.div`
    flex-shrink: 0;
    width: 45px;
    height: 45px;
    background-color: #ccc;
    border-radius: 50%;
    margin-right: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    color: white;
    overflow: hidden;
`;

// 오른쪽 영역: 채팅방 정보를 세로로 나열
const RoomDetails = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
`;

// 상단 행: 채팅방 제목, 즐겨찾기 아이콘, 활동 시간
const RoomHeaderRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

// 제목과 즐겨찾기 아이콘을 감싸는 영역
const TitleWrapper = styled.div`
    display: flex;
    align-items: center;
`;

// 채팅방 제목 (글자 크기 약간 줄임)
const RoomTitle = styled.h3`
    font-size: 1rem;
    font-weight: 600;
    color: #333;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

// 즐겨찾기 버튼: 즐겨찾기 상태에 따라 채워진 별(★) 또는 빈 별(☆) 표시, 글자 크기 줄임
const FavoriteButton = styled.button<{ active: boolean }>`
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    margin-left: 6px;
    color: ${(props) => (props.active ? "#ffbb00" : "#ccc")};
`;

// 활동 시간 (글자 크기 약 0.7rem)
const Timestamp = styled.span`
    font-size: 0.7rem;
    color: #999;
`;

// 하단 행: 마지막 메시지와 안읽은 메시지 배지
const RoomFooterRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 4px;
`;

// 마지막 메시지 텍스트 (글자 크기 약 0.8rem)
const LastMessage = styled.div`
    font-size: 0.8rem;
    color: #666;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

// 안읽은 메시지 배지: 동그란 말풍선 형태, 주황색 배경, 글자 크기 약 0.7rem
const UnreadBadge = styled.div`
    background-color: #ffa500;
    color: white;
    padding: 3px 7px;
    border-radius: 12px;
    font-size: 0.7rem;
    font-weight: bold;
    min-width: 20px;
    text-align: center;
`;

// 에러 메시지 스타일
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
    const updatesReceivedRef = useRef(false);

    // 채팅방 목록을 불러오는 함수
    const fetchRooms = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            console.log("ChatRoomList: Fetching rooms for user:", user.id);
            const response = await getChatRooms(user.id);
            const roomsData: ChatRoom[] = response.data;
            console.log("ChatRoomList: Received rooms:", roomsData);
            setRooms(roomsData);
            updatesReceivedRef.current = false; // 새로운 데이터를 로드했으므로 플래그 초기화
        } catch (err) {
            console.error("ChatRoomList: Failed to fetch rooms:", err);
            setError("채팅방 목록 로드 실패");
        } finally {
            setLoading(false);
        }
    }, [user]);

    // SSE 이벤트를 통해 채팅방 목록을 실시간으로 업데이트
    useEffect(() => {
        if (!user?.id) {
            console.log("ChatRoomList: No user ID, skipping fetchRooms");
            setRooms([]);
            return;
        }
        
        fetchRooms();

        // 메시지 수신 시 해당 채팅방의 마지막 메시지와 안읽은 수 업데이트
        const handleMessage = (event: MessageEvent) => {
            try {
                console.log("ChatRoomList: Raw message event received:", event.data);
                
                let data;
                if (typeof event.data === 'string') {
                    try {
                        data = JSON.parse(event.data);
                    } catch (e) {
                        console.error("ChatRoomList: Failed to parse message data:", e);
                        return;
                    }
                } else {
                    data = event.data;
                }
                
                console.log("ChatRoomList: Parsed message data:", data);
                
                // roomId 필드 확인
                if (!data.roomId) {
                    console.warn("ChatRoomList: Missing roomId in SSE data:", data);
                    return;
                }
                
                const { roomId, unreadCount, lastMessage } = data;
                console.log("ChatRoomList: Message received:", { roomId, unreadCount, lastMessage });
                
                setRooms((prev) => {
                    // 해당 roomId를 가진 채팅방 찾기
                    const roomIndex = prev.findIndex(room => room.roomId === roomId);
                    
                    // 해당 채팅방이 없으면 업데이트할 필요 없음
                    if (roomIndex === -1) {
                        console.log(`ChatRoomList: Room ${roomId} not found in current list`);
                        // 새 채팅방이라면 전체 목록을 새로고침
                        if (!updatesReceivedRef.current) {
                            setTimeout(fetchRooms, 300);
                            updatesReceivedRef.current = true;
                        }
                        return prev;
                    }
                    
                    // 현재 채팅방 정보
                    const currentRoom = prev[roomIndex];
                    
                    // 업데이트할 필요가 있는지 확인
                    const needsUpdate = 
                        (unreadCount !== undefined && currentRoom.unreadMessages !== unreadCount) ||
                        (lastMessage !== undefined && currentRoom.lastMessage !== lastMessage);
                    
                    if (!needsUpdate) {
                        console.log(`ChatRoomList: No changes needed for room ${roomId}`);
                        return prev;
                    }
                    
                    console.log(`ChatRoomList: Updating room ${roomId}`, {
                        before: { unread: currentRoom.unreadMessages, lastMessage: currentRoom.lastMessage },
                        after: { unread: unreadCount, lastMessage }
                    });
                    
                    // 새 배열 생성 (React 상태 업데이트를 위해)
                    const newRooms = [...prev];
                    
                    // 해당 채팅방 정보 업데이트
                    newRooms[roomIndex] = {
                        ...currentRoom,
                        unreadMessages: unreadCount !== undefined ? unreadCount : currentRoom.unreadMessages,
                        lastMessage: lastMessage !== undefined ? lastMessage : currentRoom.lastMessage
                    };
                    
                    return newRooms;
                });
            } catch (error) {
                console.error("ChatRoomList: Error processing message event:", error);
            }
        };

        // 채팅방 생성 이벤트 발생 시 목록 새로고침
        const handleChatRoomCreated = (event: MessageEvent) => {
            console.log("ChatRoomList: Chat room created event received:", event);
            fetchRooms();
        };

        // 하트비트 이벤트 (로그용)
        const handleHeartbeat = (event: MessageEvent) => {
            console.log("ChatRoomList: Heartbeat received:", event);
        };

        // 주기적으로 채팅방 목록 새로고침 (SSE가 제대로 동작하지 않을 경우를 대비)
        const refreshInterval = setInterval(() => {
            if (!updatesReceivedRef.current) {
                console.log("ChatRoomList: Periodic refresh (no updates received)");
                fetchRooms();
            }
        }, 30000); // 30초마다

        subscribeToSse("message", handleMessage);
        subscribeToSse("chatRoomCreated", handleChatRoomCreated);
        subscribeToSse("heartbeat", handleHeartbeat);

        return () => {
            clearInterval(refreshInterval);
            unsubscribeFromSse("message", handleMessage);
            unsubscribeFromSse("chatRoomCreated", handleChatRoomCreated);
            unsubscribeFromSse("heartbeat", handleHeartbeat);
        };
    }, [user?.id, fetchRooms, subscribeToSse, unsubscribeFromSse]);

    // 즐겨찾기 토글 함수: updateChatRoomFavorite API 호출 후 목록 새로고침
    const toggleFavorite = async (roomId: string, currentFavorite: boolean) => {
        try {
            await updateChatRoomFavorite(roomId, user!.id, !currentFavorite);
            fetchRooms();
        } catch (err) {
            console.error("즐겨찾기 업데이트 실패", err);
            alert("즐겨찾기 업데이트 실패");
        }
    };

    if (loading && rooms.length === 0) return <p>로딩중...</p>;
    if (error) return <ErrorMessage>{error}</ErrorMessage>;

    return (
        <RoomListContainer>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            {rooms.length === 0 ? (
                <p style={{ textAlign: "center", color: "#0b0a0a" }}>
                    참여 중인 채팅방이 없습니다.
                </p>
            ) : (
                rooms.map((room) => (
                    <RoomItem key={room.roomId} to={`/chatroom/${room.roomId}`}>
                        <Avatar>
                            {room.title.charAt(0).toUpperCase()}
                        </Avatar>
                        <RoomDetails>
                            <RoomHeaderRow>
                                <TitleWrapper>
                                    <RoomTitle>{room.title}</RoomTitle>
                                    <FavoriteButton
                                        active={room.isPinned}
                                        onClick={(e) => {
                                            e.preventDefault(); // 즐겨찾기 클릭 시 페이지 이동 방지
                                            toggleFavorite(room.roomId, room.isPinned);
                                        }}
                                    >
                                        {room.isPinned ? "★" : "☆"}
                                    </FavoriteButton>
                                </TitleWrapper>
                                <Timestamp>
                                    {room.timestamp ? room.timestamp : ""}
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
                ))
            )}
        </RoomListContainer>
    );
};

export default ChatRoomList;