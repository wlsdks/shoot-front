// src/features/social/ui/FriendsTab.tsx
import React, { useState, useCallback } from "react";
import { useAuthContext } from "../../../shared";
import { useFriends } from "../model/hooks/useFriends";
import FriendSearch from "./FriendSearch";
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
import {
    ActionButton,
    ProfileSection,
    HeaderButtons
} from "../styles/FriendsTab.styles";

const FriendsTab: React.FC = () => {
    const { user, loading: authLoading } = useAuthContext();
    const [showSearch, setShowSearch] = useState<boolean>(false);
    const [showCode, setShowCode] = useState<boolean>(false);
    const navigate = useNavigate();

    const { data: friends, isLoading: friendsLoading } = useFriends(user?.id || 0);

    // 채팅방 생성: 친구 클릭 시 direct chat 생성 후 이동
    const handleFriendClick = useCallback(async (friendId: number) => {
        if (!user) return;
        try {
            const response = await createDirectChat(user.id, friendId);
            navigate(`/chatroom/${response.data.roomId}`);
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
                    <HeaderButtons>
                        <ActionButton onClick={() => setShowSearch((prev) => !prev)}>
                            <Icon name="search" />
                            검색
                        </ActionButton>
                        <ActionButton onClick={() => setShowCode((prev) => !prev)}>
                            <Icon name="add-square" />
                            코드로 찾기
                        </ActionButton>
                    </HeaderButtons>
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
                    <ProfileSection>
                        <FriendItem
                            friend={{
                                id: user.id,
                                username: user.username,
                                nickname: user.nickname || user.username,
                                status: "나",
                                profileImageUrl: user.profileImageUrl || undefined,
                                backgroundImageUrl: undefined,
                                bio: user.bio || undefined,
                                userCode: user.userCode || "",
                                lastSeenAt: undefined,
                                isFriend: false,
                                isPending: false,
                                isIncoming: false,
                                isOutgoing: false
                            }}
                            onChatClick={() => {}}
                        />
                    </ProfileSection>
                )}
                
                {/* 친구 섹션 헤더 */}
                <TabSectionHeader>
                    <TabSectionTitle>친구</TabSectionTitle>
                    <TabSectionCount>{friends?.length || 0}</TabSectionCount>
                </TabSectionHeader>
                
                {/* 친구 목록 */}
                {!friends || friends.length === 0 ? (
                    <EmptyState
                        icon={<Icon name="users" />}
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