// src/features/social/ui/SocialTab.tsx
import React, { useState } from "react";
import { useAuth } from "../../../shared/lib/context/AuthContext";
import { useSocialData } from "../model/hooks/useSocialData";
import TabContainer from "../../../shared/ui/TabContainer";
import TabHeader from "../../../shared/ui/TabHeader";
import LoadingSpinner from "../../../shared/ui/LoadingSpinner";
import EmptyState from "../../../shared/ui/EmptyState";
import Icon from "../../../shared/ui/Icon";
import SocialItem from "../ui/SocialItem";
import {
    TabContent,
    TabSection,
    TabSectionHeader,
    TabSectionTitle,
    TabSectionCount,
} from "../../../shared/ui/tabStyles";
import {
    ErrorContainer,
    LoadMoreButton
} from "../styles/SocialTab.styles";

const SocialTab: React.FC = () => {
    const { user } = useAuth();
    const [error, setError] = useState("");
    const [loadingMore, setLoadingMore] = useState(false);

    const {
        data: socialData,
        isLoading,
        sendFriendRequest,
        acceptRequest,
        cancelRequest,
        fetchMoreRecommended
    } = useSocialData(user?.id || 0);

    // 친구 요청 보내기
    const handleSendFriendRequest = async (targetUserId: number) => {
        if (!user) return;
        try {
            await sendFriendRequest.mutateAsync(targetUserId);
        } catch (err) {
            console.error(err);
            setError("친구 요청 보내기에 실패했습니다.");
        }
    };

    // 친구 요청 수락
    const handleAcceptRequest = async (requesterId: number) => {
        if (!user) return;
        try {
            await acceptRequest.mutateAsync(requesterId);
        } catch (err) {
            console.error(err);
            setError("친구 요청 수락 실패");
        }
    };

    // 친구 요청 취소
    const handleCancelRequest = async (targetUserId: number) => {
        if (!user) return;
        try {
            await cancelRequest.mutateAsync(targetUserId);
        } catch (err) {
            console.error(err);
            setError("친구 요청 취소 실패");
        }
    };

    // 더 많은 추천 친구 불러오기
    const handleLoadMoreRecommended = async () => {
        if (!socialData?.recommendedFriends) return;
        
        setLoadingMore(true);
        try {
            await fetchMoreRecommended(socialData.recommendedFriends.length);
        } catch (err) {
            console.error("추천 친구 불러오기 실패:", err);
            setError("추천 친구를 더 불러오지 못했습니다.");
        } finally {
            setLoadingMore(false);
        }
    };

    if (isLoading && (!socialData?.friends || socialData.friends.length === 0)) {
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
                    <Icon name="users" />
                }
            />
            
            <TabContent>
                {error && (
                    <ErrorContainer>
                        <Icon name="error-circle" />
                        {error}
                    </ErrorContainer>
                )}

                {/* 받은 친구 요청 섹션 */}
                <TabSection>
                    <TabSectionHeader>
                        <TabSectionTitle>받은 친구 요청</TabSectionTitle>
                        {socialData?.incomingRequests && socialData.incomingRequests.length > 0 && 
                            <TabSectionCount>{socialData.incomingRequests.length}</TabSectionCount>
                        }
                    </TabSectionHeader>

                    {!socialData?.incomingRequests || socialData.incomingRequests.length === 0 ? (
                        <EmptyState
                            icon={<Icon name="user-plus" />}
                            text="아직 받은 친구 요청이 없습니다."
                        />
                    ) : (
                        socialData.incomingRequests.map((friend) => (
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
                        {socialData?.outgoingRequests && socialData.outgoingRequests.length > 0 && 
                            <TabSectionCount>{socialData.outgoingRequests.length}</TabSectionCount>
                        }
                    </TabSectionHeader>

                    {!socialData?.outgoingRequests || socialData.outgoingRequests.length === 0 ? (
                        <EmptyState
                            icon={<Icon name="user-plus" />}
                            text="보낸 친구 요청이 없습니다."
                        />
                    ) : (
                        socialData.outgoingRequests.map((friend) => (
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
                        {socialData?.recommendedFriends && socialData.recommendedFriends.length > 0 && 
                            <TabSectionCount>{socialData.recommendedFriends.length}</TabSectionCount>
                        }
                    </TabSectionHeader>

                    {!socialData?.recommendedFriends || socialData.recommendedFriends.length === 0 ? (
                        <EmptyState
                            icon={<Icon name="users" />}
                            text="추천 친구가 없습니다."
                        />
                    ) : (
                        <>
                            {socialData.recommendedFriends.map((friend) => (
                                <SocialItem
                                    key={friend.id}
                                    friend={friend}
                                    status="recommended"
                                    onAction={handleSendFriendRequest}
                                />
                            ))}
                            
                            {socialData.recommendedFriends.length >= 5 && (
                                <LoadMoreButton 
                                    onClick={handleLoadMoreRecommended}
                                    disabled={loadingMore}
                                >
                                    {loadingMore ? '불러오는 중...' : '더 보기'}
                                </LoadMoreButton>
                            )}
                        </>
                    )}
                </TabSection>
            </TabContent>
        </TabContainer>
    );
};

export default SocialTab;