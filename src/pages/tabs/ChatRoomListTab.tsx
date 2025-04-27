import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { getChatRooms, updateChatRoomFavorite } from '../../services/chatRoom';
import { useAuth } from '../../context/AuthContext';
import { ChatRoom } from '../../types/chat.types';
import TabContainer from '../../components/common/TabContainer';
import TabHeader from '../../components/common/TabHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Icon from '../../components/common/Icon';
import ChatRoomItem from '../../components/chat/ChatRoomItem';
import {
    TabContent,
    TabSection,
    TabSectionHeader,
    TabSectionTitle,
    TabSectionCount,
} from '../../styles/tabStyles';
import styled from 'styled-components';

const ChatRoomList: React.FC = () => {
    const { user, subscribeToSse, unsubscribeFromSse, reconnectSse } = useAuth();
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; room: ChatRoom | null }>({
        visible: false,
        x: 0,
        y: 0,
        room: null
    });
    const updatesReceivedRef = useRef(false);
    const location = useLocation();
    const navigate = useNavigate();

    // 채팅방 목록 조회 함수
    const fetchRooms = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            console.log("ChatRoomList: Fetching rooms for user:", user.id);
            const response = await getChatRooms(user.id);
            const roomsData = response.data;
            console.log("ChatRoomList: Received rooms:", roomsData);
            setRooms(roomsData);
            updatesReceivedRef.current = false;
        } catch (err) {
            console.error("ChatRoomList: Failed to fetch rooms:", err);
            setError("채팅방 목록 로드 실패");
        } finally {
            setLoading(false);
        }
    }, [user]);

    // 뒤로 가기로 채팅방 목록에 들어올 때 자동 새로고침 및 SSE 재연결
    useEffect(() => {
        if (location.state?.refresh) {
            console.log("뒤로 가기 감지됨, 채팅방 목록 새로고침");
            fetchRooms();
            navigate(".", { replace: true, state: {} });
        }
        reconnectSse();
    }, [location, fetchRooms, navigate, reconnectSse]);

    // SSE 이벤트를 통해 채팅방 목록을 실시간으로 업데이트
    useEffect(() => {
        if (!user?.id) {
            console.log("ChatRoomList: No user ID, skipping fetchRooms");
            setRooms([]);
            return;
        }
        
        fetchRooms();

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
                
                if (!data.roomId) {
                    console.warn("ChatRoomList: Missing roomId in SSE data:", data);
                    return;
                }
                
                const { roomId, unreadCount, lastMessage } = data;
                console.log("ChatRoomList: Message received:", { roomId, unreadCount, lastMessage });

                if (lastMessage === null || lastMessage === undefined || lastMessage === "") {
                    console.log(`ChatRoomList: 메시지 없음 (null/empty) - roomId: ${roomId}`);
                    
                    if (unreadCount !== undefined) {
                        setRooms((prev) => 
                            prev.map((room) =>
                                room.roomId === roomId 
                                ? { ...room, unreadMessages: unreadCount } 
                                : room
                            )
                        );
                    }
                    return;
                }

                setRooms((prev) => {
                    const roomIndex = prev.findIndex(r => r.roomId === roomId);
                    if (roomIndex === -1) return prev;
                    
                    const newRooms = [...prev];
                    newRooms[roomIndex] = {
                        ...newRooms[roomIndex],
                        unreadMessages: unreadCount !== undefined ? unreadCount : newRooms[roomIndex].unreadMessages,
                        lastMessage
                    };
                    
                    return newRooms;
                });
            } catch (error) {
                console.error("ChatRoomList: Error processing message event:", error);
            }
        };

        const handleChatRoomCreated = (event: MessageEvent) => {
            console.log("ChatRoomList: Chat room created event received:", event);
            fetchRooms();
        };

        const handleHeartbeat = (event: MessageEvent) => {
            console.log("ChatRoomList: Heartbeat received:", event);
        };

        const refreshInterval = setInterval(() => {
            if (!updatesReceivedRef.current) {
                console.log("ChatRoomList: Periodic refresh (no updates received)");
                fetchRooms();
            }
        }, 30000);

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

    // 즐겨찾기 토글 함수
    const toggleFavorite = async (roomId: number, currentFavorite: boolean) => {
        try {
            await updateChatRoomFavorite(roomId, user!.id, !currentFavorite);
            fetchRooms();
        } catch (err) {
            console.error("즐겨찾기 업데이트 실패", err);
            setError("즐겨찾기 업데이트 실패");
        }
    };

    // 우클릭 메뉴 처리
    const handleContextMenu = (e: React.MouseEvent, room: ChatRoom) => {
        e.preventDefault();
        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            room
        });
    };

    // 우클릭 메뉴 닫기
    const handleClickOutside = () => {
        setContextMenu({ visible: false, x: 0, y: 0, room: null });
    };

    // 우클릭 메뉴 이벤트 리스너 등록
    useEffect(() => {
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    // 즐겨찾기된 채팅방과 일반 채팅방으로 분류
    const pinnedRooms = rooms.filter(room => room.isPinned);
    const normalRooms = rooms.filter(room => !room.isPinned);

    if (loading && rooms.length === 0) {
        return (
            <TabContainer>
                <TabHeader title="채팅방" />
                <LoadingSpinner text="채팅방 목록을 불러오는 중..." />
            </TabContainer>
        );
    }

    return (
        <TabContainer>
            <TabHeader title="채팅방" />
            <TabContent>
                {error && (
                    <div style={{ color: 'red', padding: '1rem' }}>
                        <Icon>
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </Icon>
                        {error}
                    </div>
                )}

                {rooms.length === 0 ? (
                    <EmptyState
                        icon={
                            <Icon>
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </Icon>
                        }
                        text="참여 중인 채팅방이 없습니다."
                    />
                ) : (
                    <>
                        {pinnedRooms.length > 0 && (
                            <TabSection>
                                <TabSectionHeader>
                                    <TabSectionTitle>즐겨찾기</TabSectionTitle>
                                    <TabSectionCount>{pinnedRooms.length}</TabSectionCount>
                                </TabSectionHeader>
                                
                                {pinnedRooms.map((room) => (
                                    <ChatRoomItem
                                        key={`pinned-${room.roomId}`}
                                        room={room}
                                        onContextMenu={(e) => handleContextMenu(e, room)}
                                    />
                                ))}
                            </TabSection>
                        )}
                        
                        {normalRooms.length > 0 && (
                            <TabSection>
                                <TabSectionHeader>
                                    <TabSectionTitle>채팅방</TabSectionTitle>
                                    <TabSectionCount>{normalRooms.length}</TabSectionCount>
                                </TabSectionHeader>
                                
                                {normalRooms.map((room) => (
                                    <ChatRoomItem
                                        key={`normal-${room.roomId}`}
                                        room={room}
                                        onContextMenu={(e) => handleContextMenu(e, room)}
                                    />
                                ))}
                            </TabSection>
                        )}
                    </>
                )}

                {contextMenu.visible && contextMenu.room && (
                    <ContextMenu style={{ top: contextMenu.y, left: contextMenu.x }}>
                        <ContextMenuItem onClick={() => {
                            toggleFavorite(contextMenu.room!.roomId, contextMenu.room!.isPinned);
                            setContextMenu({ visible: false, x: 0, y: 0, room: null });
                        }}>
                            <Icon>
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </Icon>
                            {contextMenu.room.isPinned ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                        </ContextMenuItem>
                    </ContextMenu>
                )}
            </TabContent>
        </TabContainer>
    );
};

const ContextMenu = styled.div`
    position: fixed;
    background: white;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    min-width: 150px;
`;

const ContextMenuItem = styled.div`
    padding: 0.5rem 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    color: #333;
    font-size: 0.9rem;

    &:hover {
        background-color: #f5f5f5;
    }

    svg {
        width: 1rem;
        height: 1rem;
        color: #666;
    }
`;

export default ChatRoomList;