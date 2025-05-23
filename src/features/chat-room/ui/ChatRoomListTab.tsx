import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../shared/lib/context/AuthContext";
import { useChatRooms } from "../model/hooks/useChatRooms";
import { ChatRoom } from "../../message/types/ChatRoom.types";
import TabContainer from "../../../shared/ui/TabContainer";
import TabHeader from "../../../shared/ui/TabHeader";
import LoadingSpinner from "../../../shared/ui/LoadingSpinner";
import EmptyState from "../../../shared/ui/EmptyState";
import {
    NewChatIcon,
    ErrorIcon,
    SearchIcon,
    EmptyChatIcon,
    PinIcon
} from "./icons/ChatRoomIcons";
import ChatRoomItem from "./ChatRoomItem";
import {
    TabContent,
    TabSection,
    TabSectionHeader,
    TabSectionTitle,
    TabSectionCount,
} from "../../../shared/ui/tabStyles";
import { FriendListModal } from "./FriendListModal";
import {
    ActionButton,
    ContextMenu,
    ContextMenuItem,
    ErrorContainer,
    SearchContainer,
    SearchInput,
} from "../styles/ChatRoomListTab.styles";

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
                        <NewChatIcon />
                        새 채팅
                    </ActionButton>
                }
            />
            <TabContent>
                {error && (
                    <ErrorContainer>
                        <ErrorIcon />
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
                    <SearchIcon />
                </SearchContainer>

                {(!chatRooms?.data || chatRooms.data.length === 0 || filteredRooms.length === 0) ? (
                    <EmptyState
                        icon={<EmptyChatIcon />}
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
                                    <TabSectionTitle>고정된 채팅방</TabSectionTitle>
                                    <TabSectionCount>{pinnedRooms.length}</TabSectionCount>
                                </TabSectionHeader>
                                {pinnedRooms.map((room: ChatRoom) => (
                                    <ChatRoomItem
                                        key={room.roomId}
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
                                        key={room.roomId}
                                        room={room}
                                        onContextMenu={(e) => handleContextMenu(e, room)}
                                    />
                                ))}
                            </TabSection>
                        )}
                    </>
                )}

                {contextMenu.visible && contextMenu.room && (
                    <ContextMenu
                        style={{
                            top: contextMenu.y,
                            left: contextMenu.x
                        }}
                    >
                        <ContextMenuItem onClick={() => {
                            updateFavorite.mutate({ 
                                roomId: contextMenu.room!.roomId, 
                                isFavorite: !contextMenu.room!.isPinned 
                            });
                            setContextMenu({ visible: false, x: 0, y: 0, room: null });
                        }}>
                            <PinIcon />
                            {contextMenu.room.isPinned ? "고정 해제" : "고정하기"}
                        </ContextMenuItem>
                    </ContextMenu>
                )}

                {showNewChatModal && (
                    <FriendListModal
                        onClose={() => setShowNewChatModal(false)}
                        onSelectFriend={(friendId) => {
                            // TODO: 선택된 친구와의 채팅방 생성 로직 구현
                            setShowNewChatModal(false);
                        }}
                    />
                )}
            </TabContent>
        </TabContainer>
    );
};

export default ChatRoomList;