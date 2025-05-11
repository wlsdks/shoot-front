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
import styled from "styled-components";

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

const LoadMoreButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 0.75rem;
    background-color: #f2f8ff;
    border: none;
    border-radius: 10px;
    color: #007bff;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    margin-top: 1rem;
    
    &:hover {
        background-color: #e1eeff;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 123, 255, 0.15);
    }
    
    &:disabled {
        background-color: #f2f2f2;
        color: #aaa;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }
`;

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
                    <ErrorContainer>
                        <Icon>
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </Icon>
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
                            icon={
                                <Icon>
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </Icon>
                            }
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