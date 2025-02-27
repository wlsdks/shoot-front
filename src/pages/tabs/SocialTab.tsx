import React, { useEffect, useState, useCallback } from "react";
import styled from "styled-components";
import InfiniteScroll from "react-infinite-scroll-component";
import {
    getIncomingRequests,
    getOutgoingRequests,
    getRecommendations,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
} from "../../services/friends";
import { useAuth } from "../../context/AuthContext";

// Friend 인터페이스 정의 (타입 통일)
interface Friend {
    id: string;
    username: string;
}

const Container = styled.div`
    padding: 1rem;
`;

const SectionTitle = styled.h2`
    font-size: 1.1rem;
    margin-top: 0;
    margin-bottom: 0.75rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #e0e0e0;
    color: #333;
`;

const List = styled.ul`
    list-style: none;
    margin: 0;
    padding: 0;
`;

const ListItem = styled.li`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background-color: #fff;
    margin-bottom: 12px;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s;
    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
`;

const FriendName = styled.span`
    font-weight: 600;
    color: #333;
    font-size: 1rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const Actions = styled.div`
    display: flex;
    gap: 12px;
`;

const Button = styled.button`
    background: #007bff;
    color: #fff;
    padding: 6px 12px;
    font-size: 0.875rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s ease;
    &:hover {
        background: #0056b3;
    }
`;

const StatusText = styled.p`
    text-align: center;
    font-size: 0.875rem;
    color: #999;
    margin-top: 20px;
`;

const LoadingContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
`;

const SocialTab: React.FC = () => {
    const { user } = useAuth();
    const [incoming, setIncoming] = useState<Friend[]>([]);
    const [outgoing, setOutgoing] = useState<Friend[]>([]);
    const [recommended, setRecommended] = useState<Friend[]>([]);
    const [skip, setSkip] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const limit = 10;

     // 기존 친구 요청 데이터 로드
    const fetchSocialData = useCallback(async () => {
        if (!user) return;
        try {
            setLoading(true);
            setError("");
            const [incRes, outRes] = await Promise.all([
                getIncomingRequests(user.id),
                getOutgoingRequests(user.id),
            ]);
            setIncoming(incRes.data);
            setOutgoing(outRes.data);
        } catch (e) {
            console.error(e);
            setError("소셜 데이터 로드 실패");
        } finally {
            setLoading(false);
        }
    }, [user]);

    // 추천 친구 데이터 로드 (무한 스크롤)
    const fetchRecommendations = useCallback(async (currentSkip: number) => {
        if (!user) return;
        try {
            const recRes = await getRecommendations(user.id, limit, 2, currentSkip);
            if (recRes.data.length < limit) {
                setHasMore(false);  // 더 이상 데이터가 없으면 hasMore false 처리
            }
            setRecommended(prev => [...prev, ...recRes.data]);
            setSkip(currentSkip + limit);
        } catch (e) {
            console.error(e);
        }
    }, [user]);

    useEffect(() => {
        if (user?.id) {
            fetchSocialData();
            // 초기 추천 데이터 로드
            fetchRecommendations(0);
        }
    }, [user, fetchSocialData, fetchRecommendations]);

    // 친구 요청 보내기
    const handleSendFriendRequest = async (targetUserId: string) => {
        if (!user) return;
        try {
            const res = await sendFriendRequest(user.id, targetUserId);
            alert(`친구 요청 성공: ${res.data}`);
            // 요청 후 데이터를 새로 고침
            fetchSocialData();
            setRecommended([]); // 추천 목록 새로 로드
            setSkip(0);
            setHasMore(true);
            fetchRecommendations(0);
        } catch (err) {
            console.error(err);
            alert("친구 요청 보내기에 실패했습니다.");
        }
    };

    // 친구 요청 수락
    const handleAcceptRequest = async (requesterId: string) => {
        if (!user) return;
        try {
            await acceptFriendRequest(user.id, requesterId);
            alert("친구 요청을 수락했습니다.");
            fetchSocialData(); // 데이터 새로고침
        } catch (err) {
            console.error(err);
            alert("친구 요청 수락 실패");
        }
    };

    // 친구 요청 거절
    const handleRejectRequest = async (requesterId: string) => {
        if (!user) return;
        try {
            await rejectFriendRequest(user.id, requesterId);
            alert("친구 요청을 거절했습니다.");
            fetchSocialData(); // 데이터 새로고침
        } catch (err) {
            console.error(err);
            alert("친구 요청 거절 실패");
        }
    };

    if (loading) return <LoadingContainer>로딩중...</LoadingContainer>;
    if (error) return <Container>{error}</Container>;

    return (
        <Container>
            <SectionTitle>받은 친구 요청</SectionTitle>
            {incoming.length === 0 ? (
                <StatusText>받은 요청이 없습니다.</StatusText>
            ) : (
                <List>
                    {incoming.map((friend) => (
                        <ListItem key={friend.id}>
                            <FriendName>{friend.username}</FriendName>
                            <Actions>
                                <Button onClick={() => handleAcceptRequest(friend.id)}>수락</Button>
                                <Button onClick={() => handleRejectRequest(friend.id)}>거절</Button>
                            </Actions>
                        </ListItem>
                    ))}
                </List>
            )}

            <SectionTitle>보낸 친구 요청</SectionTitle>
            {outgoing.length === 0 ? (
                <StatusText>보낸 요청이 없습니다.</StatusText>
            ) : (
                <List>
                    {outgoing.map((friend) => (
                        <ListItem key={friend.id}>
                            <FriendName>{friend.username}</FriendName>
                            <StatusText style={{ color: "#888" }}>대기중</StatusText>
                        </ListItem>
                    ))}
                </List>
            )}

            <SectionTitle>추천 친구</SectionTitle>
            <InfiniteScroll
                dataLength={recommended.length}
                next={() => fetchRecommendations(skip)}
                hasMore={hasMore}
                loader={<StatusText>로딩중...</StatusText>}
                endMessage={<StatusText>더 이상 추천할 친구가 없습니다.</StatusText>}
            >
                {recommended.length === 0 ? (
                    <StatusText>추천할 친구가 없습니다.</StatusText>
                ) : (
                    <List>
                        {recommended.map((friend) => (
                            <ListItem key={friend.id}>
                                <FriendName>{friend.username}</FriendName>
                                <Button onClick={() => handleSendFriendRequest(friend.id)}>
                                    친구추가
                                </Button>
                            </ListItem>
                        ))}
                    </List>
                )}
            </InfiniteScroll>
        </Container>
    );
};

export default SocialTab;