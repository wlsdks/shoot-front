import React, { useEffect, useState, useCallback, useRef } from "react";
import {
    getFriends,
    getIncomingRequests,
    getOutgoingRequests,
    getRecommendations,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
} from "../../services/friends";
import { useAuth } from "../../context/AuthContext";
import { Friend, FriendResponse } from "../../types/friend.types";
import TabContainer from "../../components/common/TabContainer";
import TabHeader from "../../components/common/TabHeader";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import Icon from "../../components/common/Icon";
import SocialItem from "../../components/social/SocialItem";
import {
    TabContent,
    TabSection,
    TabSectionHeader,
    TabSectionTitle,
    TabSectionCount,
} from "../../styles/tabStyles";

// API 응답을 Friend 타입으로 변환하는 함수
const convertToFriend = (response: FriendResponse): Friend => ({
    id: response.id,
    name: response.username,
    username: response.username,
    status: "온라인", // TODO: 실제 상태 정보로 대체
    profileImage: response.profileImageUrl
});

const SocialTab: React.FC = () => {
    const { user } = useAuth();
    const [friends, setFriends] = useState<Friend[]>([]);
    const [incoming, setIncoming] = useState<Friend[]>([]);
    const [outgoing, setOutgoing] = useState<Friend[]>([]);
    const [recommended, setRecommended] = useState<Friend[]>([]);
    const [skip, setSkip] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const limit = 10;
    
    // API 중복 호출 방지를 위한 초기화 플래그
    const initialized = useRef(false);

    // 기존 소셜 데이터 (친구 목록, 친구 요청) 로드
    const fetchSocialData = useCallback(async () => {
        if (!user?.id) return;
        try {
            setLoading(true);
            setError("");
            // 친구 목록, 받은 요청, 보낸 요청 모두 함께 조회
            const [friendsData, incData, outData] = await Promise.all([
                getFriends(user.id),
                getIncomingRequests(user.id),
                getOutgoingRequests(user.id),
            ]);
            
            // API 응답을 Friend 타입으로 변환
            setFriends(friendsData.map(convertToFriend));
            setIncoming(incData.map(convertToFriend));
            setOutgoing(outData.map(convertToFriend));
        } catch (e) {
            console.error(e);
            setError("소셜 데이터 로드 실패");
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    // 추천 친구 데이터 로드 (무한 스크롤)
    const fetchRecommended = useCallback(async () => {
        if (!user) return;
        try {
            const recData = await getRecommendations(user.id, limit, 2, skip);
            if (recData.length < limit) {
                setHasMore(false);
            }
            setRecommended(prev => [...prev, ...recData.map(convertToFriend)]);
            setSkip(skip + limit);
        } catch (e) {
            console.error(e);
        }
    }, [user, skip, limit]);

    // 최초 데이터 로드 (중복 호출 방지)
    useEffect(() => {
        if (initialized.current) return;
        
        if (user?.id) {
            initialized.current = true;
            fetchSocialData();
            fetchRecommended();
        }
    }, [user?.id, fetchSocialData, fetchRecommended]);

    // 친구 요청 보내기
    const handleSendFriendRequest = async (targetUserId: number) => {
        if (!user) return;
        try {
            await sendFriendRequest(user.id, targetUserId);
            
            // 추천 목록에서 해당 사용자를 보낸 요청 목록으로 이동
            const requestedUser = recommended.find(r => r.id === targetUserId);
            if (requestedUser) {
                setOutgoing(prev => [...prev, requestedUser]);
                setRecommended(prev => prev.filter(r => r.id !== targetUserId));
            }
        } catch (err) {
            console.error(err);
            setError("친구 요청 보내기에 실패했습니다.");
        }
    };

    // 친구 요청 수락
    const handleAcceptRequest = async (requesterId: number) => {
        if (!user) return;
        try {
            await acceptFriendRequest(user.id, requesterId);
            
            // 받은 요청에서 해당 사용자를 찾아 친구 목록으로 이동
            const acceptedUser = incoming.find(r => r.id === requesterId);
            if (acceptedUser) {
                setFriends(prev => [...prev, acceptedUser]);
                setIncoming(prev => prev.filter(r => r.id !== requesterId));
            }
        } catch (err) {
            console.error(err);
            setError("친구 요청 수락 실패");
        }
    };

    // 친구 요청 거절
    const handleRejectRequest = async (requesterId: number) => {
        if (!user) return;
        try {
            await rejectFriendRequest(user.id, requesterId);
            
            // 받은 요청에서 해당 사용자 제거
            setIncoming(prev => prev.filter(r => r.id !== requesterId));
        } catch (err) {
            console.error(err);
            setError("친구 요청 거절 실패");
        }
    };

    // 친구 요청 취소
    const handleCancelRequest = async (targetUserId: number) => {
        if (!user) return;
        try {
            await rejectFriendRequest(user.id, targetUserId);
            
            // 보낸 요청에서 해당 사용자 제거
            setOutgoing(prev => prev.filter(r => r.id !== targetUserId));
        } catch (err) {
            console.error(err);
            setError("친구 요청 취소 실패");
        }
    };

    if (loading && (friends.length === 0 && incoming.length === 0 && outgoing.length === 0)) {
        return (
            <TabContainer>
                <TabHeader title="소셜" />
                <LoadingSpinner text="소셜 데이터를 불러오는 중..." />
            </TabContainer>
        );
    }

    return (
        <TabContainer>
            <TabHeader 
                title="소셜"
                actions={
                    <Icon>
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </Icon>
                }
            />
            
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

                {/* 받은 친구 요청 섹션 */}
                <TabSection>
                    <TabSectionHeader>
                        <TabSectionTitle>받은 친구 요청</TabSectionTitle>
                        {incoming.length > 0 && <TabSectionCount>{incoming.length}</TabSectionCount>}
                    </TabSectionHeader>

                    {incoming.length === 0 ? (
                        <EmptyState
                            icon={
                                <Icon>
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <line x1="17" y1="8" x2="17" y2="14" />
                                    <line x1="14" y1="11" x2="20" y2="11" />
                                </Icon>
                            }
                            text="아직 받은 친구 요청이 없습니다."
                        />
                    ) : (
                        incoming.map((friend) => (
                            <SocialItem
                                key={friend.id}
                                friend={friend}
                                status="requested"
                                onAction={handleAcceptRequest}
                            />
                        ))
                    )}
                </TabSection>

                {/* 보낸 친구 요청 섹션 */}
                <TabSection>
                    <TabSectionHeader>
                        <TabSectionTitle>보낸 친구 요청</TabSectionTitle>
                        {outgoing.length > 0 && <TabSectionCount>{outgoing.length}</TabSectionCount>}
                    </TabSectionHeader>

                    {outgoing.length === 0 ? (
                        <EmptyState
                            icon={
                                <Icon>
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <line x1="17" y1="8" x2="17" y2="14" />
                                    <line x1="14" y1="11" x2="20" y2="11" />
                                </Icon>
                            }
                            text="보낸 친구 요청이 없습니다."
                        />
                    ) : (
                        outgoing.map((friend) => (
                            <SocialItem
                                key={friend.id}
                                friend={friend}
                                status="outgoing"
                                onAction={handleCancelRequest}
                            />
                        ))
                    )}
                </TabSection>

                {/* 추천 친구 섹션 */}
                <TabSection>
                    <TabSectionHeader>
                        <TabSectionTitle>추천 친구</TabSectionTitle>
                    </TabSectionHeader>

                    {recommended.length === 0 ? (
                        <EmptyState
                            icon={
                                <Icon>
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </Icon>
                            }
                            text="현재 추천할 친구가 없습니다."
                        />
                    ) : (
                        recommended.map((friend) => (
                            <SocialItem
                                key={friend.id}
                                friend={friend}
                                status="recommended"
                                onAction={handleSendFriendRequest}
                            />
                        ))
                    )}
                </TabSection>
            </TabContent>
        </TabContainer>
    );
};

export default SocialTab;