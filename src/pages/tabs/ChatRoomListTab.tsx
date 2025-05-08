import React, { useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';
import { useChatRooms } from '../../hooks/useChatRooms';
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
    const { user } = useAuth();
    const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; room: ChatRoom | null }>({
        visible: false,
        x: 0,
        y: 0,
        room: null
    });
    const location = useLocation();
    const navigate = useNavigate();

    const { chatRooms, isLoading, error, updateFavorite } = useChatRooms(user?.id || 0);

    // 뒤로 가기로 채팅방 목록에 들어올 때 자동 새로고침
    React.useEffect(() => {
        if (location.state?.refresh) {
            navigate(".", { replace: true, state: {} });
        }
    }, [location, navigate]);

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
    React.useEffect(() => {
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    if (isLoading) {
        return (
            <TabContainer>
                <TabHeader title="채팅방" />
                <LoadingSpinner text="채팅방 목록을 불러오는 중..." />
            </TabContainer>
        );
    }

    // 즐겨찾기된 채팅방과 일반 채팅방으로 분류
    const pinnedRooms = chatRooms?.data?.filter((room: ChatRoom) => room.isPinned) || [];
    const normalRooms = chatRooms?.data?.filter((room: ChatRoom) => !room.isPinned) || [];

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
                        {error.message}
                    </div>
                )}

                {(!chatRooms?.data || chatRooms.data.length === 0) ? (
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
                                
                                {pinnedRooms.map((room: ChatRoom) => (
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
                                
                                {normalRooms.map((room: ChatRoom) => (
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
                            updateFavorite.mutate({ 
                                roomId: contextMenu.room!.roomId, 
                                isFavorite: !contextMenu.room!.isPinned 
                            });
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