import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../shared/lib/context/AuthContext";
import { useChatRooms } from "../model/hooks/useChatRooms";
import { ChatRoom } from "../../message/types/ChatRoom.types";
import TabContainer from "../../../shared/ui/TabContainer";
import TabHeader from "../../../shared/ui/TabHeader";
import LoadingSpinner from "../../../shared/ui/LoadingSpinner";
import EmptyState from "../../../shared/ui/EmptyState";
import Icon from "../../../shared/ui/Icon";
import ChatRoomItem from "./ChatRoomItem";
import {
    TabContent,
    TabSection,
    TabSectionHeader,
    TabSectionTitle,
    TabSectionCount,
} from "../../../shared/ui/tabStyles";
import styled from "styled-components";
import { FriendListModal } from "./FriendListModal";

const ActionButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
    background-color: #f2f8ff;
    border: none;
    border-radius: 10px;
    color: #007bff;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    gap: 6px;
    height: 38px;
    
    &:hover {
        background-color: #e1eeff;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 123, 255, 0.15);
    }
`;

const ContextMenu = styled.div`
    position: fixed;
    background: white;
    border-radius: 14px;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    min-width: 150px;
    overflow: hidden;
`;

const ContextMenuItem = styled.div`
    padding: 0.8rem 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    color: #333;
    font-size: 0.9rem;
    transition: background-color 0.2s;

    &:hover {
        background-color: #f5f9ff;
        color: #007bff;
    }

    svg {
        width: 1rem;
        height: 1rem;
        color: #666;
    }

    &:hover svg {
        color: #007bff;
    }
`;

const ErrorContainer = styled.div`
    background-color: #fff5f5;
    color: #e53e3e;
    padding: 1rem;
    border-radius: 10px;
    margin: 0 0 1rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    box-shadow: 0 2px 5px rgba(229, 62, 62, 0.1);
    
    svg {
        flex-shrink: 0;
    }
`;

const SearchContainer = styled.div`
    padding: 0 0 1rem 0;
    position: relative;
`;

const SearchInput = styled.input`
    width: 100%;
    padding: 0.8rem 2.7rem 0.8rem 1rem;
    border: 1px solid #e1e8ed;
    border-radius: 12px;
    font-size: 0.9rem;
    background-color: #f8fafc;
    transition: all 0.3s;
    
    &:focus {
        outline: none;
        border-color: #4a6cf7;
        background-color: #fff;
        box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.1);
    }

    &::placeholder {
        color: #a0aec0;
    }
`;

const SearchIcon = styled.div`
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #a0aec0;
    pointer-events: none;
`;

const ChatRoomList: React.FC = () => {
    const { user } = useAuth();
    const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; room: ChatRoom | null }>({
        visible: false,
        x: 0,
        y: 0,
        room: null
    });
    const [showNewChatModal, setShowNewChatModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const location = useLocation();
    const navigate = useNavigate();

    const { chatRooms, isLoading, error, updateFavorite } = useChatRooms(user?.id || 0);

    // 뒤로 가기로 채팅방 목록에 들어올 때 자동 새로고침
    useEffect(() => {
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
    useEffect(() => {
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    // 검색 처리
    const filteredRooms = chatRooms?.data ? chatRooms.data.filter((room: ChatRoom) => 
        room.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (room.lastMessage && room.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()))
    ) : [];

    // 즐겨찾기된 채팅방과 일반 채팅방으로 분류
    const pinnedRooms = filteredRooms.filter((room: ChatRoom) => room.isPinned) || [];
    const normalRooms = filteredRooms.filter((room: ChatRoom) => !room.isPinned) || [];

    if (isLoading) {
        return (
            <TabContainer>
                <TabHeader title="채팅방" />
                <LoadingSpinner text="채팅방 목록을 불러오는 중..." />
            </TabContainer>
        );
    }

    return (
        <TabContainer>
            <TabHeader 
                title="채팅방" 
                actions={
                    <ActionButton onClick={() => setShowNewChatModal(true)}>
                        <Icon>
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            <line x1="12" y1="11" x2="12" y2="17" />
                            <line x1="9" y1="14" x2="15" y2="14" />
                        </Icon>
                        새 채팅
                    </ActionButton>
                }
            />
            <TabContent>
                {error && (
                    <ErrorContainer>
                        <Icon>
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </Icon>
                        {error.message}
                    </ErrorContainer>
                )}

                <SearchContainer>
                    <SearchInput
                        type="text"
                        placeholder="채팅방 검색"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <SearchIcon>
                        <Icon>
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </Icon>
                    </SearchIcon>
                </SearchContainer>

                {(!chatRooms?.data || chatRooms.data.length === 0 || filteredRooms.length === 0) ? (
                    <EmptyState
                        icon={
                            <Icon>
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </Icon>
                        }
                        text={chatRooms?.data?.length === 0 ? 
                            "참여 중인 채팅방이 없습니다." : 
                            "검색 결과가 없습니다."
                        }
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

                {showNewChatModal && (
                    <FriendListModal
                        onClose={() => setShowNewChatModal(false)}
                        onSelectFriend={(friendId) => {
                            if (user) {
                                navigate(`/chatroom/${friendId}`);
                                setShowNewChatModal(false);
                            }
                        }}
                    />
                )}
            </TabContent>
        </TabContainer>
    );
};

export default ChatRoomList;