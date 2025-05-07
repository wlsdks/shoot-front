import React, { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { getFriends } from "../../services/friends";
import FriendSearch from "../../pages/profile/FriendSearch";
import FriendCodePage from "../../pages/profile/FriendCodePage";
import { createDirectChat } from "../../services/chatRoom";
import { useNavigate } from "react-router-dom";
import { Friend, FriendResponse } from "../../types/friend.types";
import TabContainer from "../../components/common/TabContainer";
import TabHeader from "../../components/common/TabHeader";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import Icon from "../../components/common/Icon";
import { FriendItem } from "../../components/FriendItem";
import {
    TabContent,
    TabSection,
    TabSectionHeader,
    TabSectionTitle,
    TabSectionCount,
} from "../../styles/tabStyles";
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
    const { user, loading, subscribeToSse, unsubscribeFromSse } = useAuth();
    const [friends, setFriends] = useState<Friend[]>([]);
    const [showSearch, setShowSearch] = useState<boolean>(false);
    const [showCode, setShowCode] = useState<boolean>(false);
    const navigate = useNavigate();

    // 친구 목록을 가져오는 함수
    const fetchFriends = useCallback(async () => {
        if (!user) return;
        try {
            const friendsData: FriendResponse[] = await getFriends(user.id);
            // API 응답을 Friend 타입에 맞게 변환
            const formattedFriends: Friend[] = friendsData.map(friend => ({
                id: friend.id,
                name: friend.username,
                username: friend.username,
                nickname: friend.nickname,
                status: "온라인", // TODO: 실제 상태 정보로 대체
                profileImageUrl: friend.profileImageUrl
            }));
            setFriends(formattedFriends);
        } catch (err) {
            console.error("FriendTab: Fetch friends failed:", err);
        }
    }, [user]);

    // 초기 로드 시 친구 목록 불러오기
    useEffect(() => {
        if (!user?.id) return;
        console.log("FriendTab: Initializing friends...");
        fetchFriends();
    }, [user?.id, fetchFriends]);

    // friendAdded 이벤트는 너무 자주 호출될 수 있으므로 throttle 적용
    const friendAddedThrottleRef = useRef<NodeJS.Timeout | null>(null);
    const handleFriendAdded = useCallback((event: MessageEvent) => {
        if (friendAddedThrottleRef.current) return;
        friendAddedThrottleRef.current = setTimeout(() => {
            console.log("FriendTab: Throttled friendAdded event, fetching friends...");
            fetchFriends();
            friendAddedThrottleRef.current = null;
        }, 1000); // 1초 간격
    }, [fetchFriends]);

    const handleHeartbeat = useCallback((event: MessageEvent) => {
        console.log("FriendTab: Heartbeat received:", event);
    }, []);

    useEffect(() => {
        if (!user?.id) return;
        subscribeToSse("friendAdded", handleFriendAdded);
        subscribeToSse("heartbeat", handleHeartbeat);

        return () => {
            unsubscribeFromSse("friendAdded", handleFriendAdded);
            unsubscribeFromSse("heartbeat", handleHeartbeat);
        };
    }, [user?.id, subscribeToSse, unsubscribeFromSse, handleFriendAdded, handleHeartbeat]);

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

    if (loading) {
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
                                name: user.username,
                                username: user.username,
                                nickname: user.nickname,
                                status: "나",
                                profileImageUrl: user.profileImageUrl
                            }}
                            onChatClick={() => {}}
                            onClick={() => {}}
                        />
                    </MySection>
                )}
                
                {/* 친구 섹션 헤더 */}
                <TabSectionHeader>
                    <TabSectionTitle>친구</TabSectionTitle>
                    <TabSectionCount>{friends.length}</TabSectionCount>
                </TabSectionHeader>
                
                {/* 친구 목록 */}
                {friends.length === 0 ? (
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
                                onClick={() => handleFriendClick(friend.id)}
                            />
                        ))}
                    </TabSection>
                )}
            </TabContent>
        </TabContainer>
    );
};

export default FriendsTab;