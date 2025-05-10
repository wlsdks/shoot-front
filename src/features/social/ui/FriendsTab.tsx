import React, { useState, useCallback } from "react";
import { useAuth } from "../../../shared/lib/context/AuthContext";
import { useFriends } from "../model/hooks/useFriends";
import { Friend } from "../types/friend";
import FriendSearch from "../../user-code/ui/friendSearch";
import FriendCodePage from "../../user-code/ui/friendCodePage";
import { createDirectChat } from "../../chat-room/api/chatRoom";
import { useNavigate } from "react-router-dom";
import TabContainer from "../../../shared/ui/TabContainer";
import TabHeader from "../../../shared/ui/TabHeader";
import LoadingSpinner from "../../../shared/ui/LoadingSpinner";
import EmptyState from "../../../shared/ui/EmptyState";
import Icon from "../../../shared/ui/Icon";
import FriendItem from "./FriendItem";
import {
    TabContent,
    TabSection,
    TabSectionHeader,
    TabSectionTitle,
    TabSectionCount,
} from "../../../shared/ui/tabStyles";
import styled from "styled-components";

const SearchButton = styled.button`
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    
    &:hover {
        opacity: 0.8;
    }
`;

const MySection = styled.div`
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #e0e0e0;
`;

const FriendsTab: React.FC = () => {
    const { user, loading: authLoading } = useAuth();
    const [showSearch, setShowSearch] = useState<boolean>(false);
    const [showCode, setShowCode] = useState<boolean>(false);
    const navigate = useNavigate();

    const { data: friends, isLoading: friendsLoading } = useFriends(user?.id || 0);

    // 채팅방 생성: 친구 클릭 시 direct chat 생성 후 이동
    const handleFriendClick = useCallback(async (friendId: number) => {
        console.log("FriendTab: Friend clicked:", friendId);
        if (!user) return;
        try {
            const response = await createDirectChat(user.id, friendId);
            console.log("FriendTab: Chat created, roomId:", response.data.id);
            navigate(`/chatroom/${response.data.id}`);
        } catch (err) {
            console.error("FriendTab: Chat Room creation failed:", err);
            alert("채팅방 생성에 실패했습니다.");
        }
    }, [user, navigate]);

    if (authLoading || friendsLoading) {
        return (
            <TabContainer>
                <TabHeader title="내 친구 목록" />
                <LoadingSpinner text="불러오는 중..." />
            </TabContainer>
        );
    }

    return (
        <TabContainer>
            <TabHeader 
                title="내 친구 목록"
                actions={
                    <>
                        <SearchButton onClick={() => setShowSearch((prev) => !prev)}>
                            <Icon>
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </Icon>
                        </SearchButton>
                        <SearchButton onClick={() => setShowCode((prev) => !prev)}>
                            코드 등록/찾기
                        </SearchButton>
                    </>
                }
            />
            
            <TabContent>
                {showSearch && (
                    <TabSection>
                        <FriendSearch onClose={() => setShowSearch(false)} />
                    </TabSection>
                )}
                
                {showCode && (
                    <TabSection>
                        <FriendCodePage onClose={() => setShowCode(false)} />
                    </TabSection>
                )}
                
                {/* 내 프로필 카드 */}
                {user && (
                    <MySection>
                        <FriendItem
                            friend={{
                                id: user.id,
                                username: user.username,
                                nickname: user.nickname || user.username,
                                status: "나",
                                profileImageUrl: user.profileImageUrl || null,
                                backgroundImageUrl: null,
                                bio: null,
                                userCode: "",
                                lastSeenAt: null
                            }}
                            onChatClick={() => {}}
                        />
                    </MySection>
                )}
                
                {/* 친구 섹션 헤더 */}
                <TabSectionHeader>
                    <TabSectionTitle>친구</TabSectionTitle>
                    <TabSectionCount>{friends?.length || 0}</TabSectionCount>
                </TabSectionHeader>
                
                {/* 친구 목록 */}
                {!friends || friends.length === 0 ? (
                    <EmptyState
                        icon={
                            <Icon>
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </Icon>
                        }
                        text="아직 친구가 없습니다. 친구를 추가해 보세요!"
                    />
                ) : (
                    <TabSection>
                        {friends.map((friend) => (
                            <FriendItem
                                key={friend.id}
                                friend={friend}
                                onChatClick={() => handleFriendClick(friend.id)}
                            />
                        ))}
                    </TabSection>
                )}
            </TabContent>
        </TabContainer>
    );
};

export default FriendsTab;