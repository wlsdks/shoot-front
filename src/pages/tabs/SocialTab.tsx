import React, { useEffect, useState } from "react";
import styled from "styled-components";
import {
    getIncomingRequests,
    getOutgoingRequests,
    getRecommendations,
    sendFriendRequest,
} from "../../services/friends";
import { useAuth } from "../../context/AuthContext";

interface RecommendedUser {
    id: string;      // 고유 식별자 (예: "67a78ebb3d560f73c0423666")
    username: string;
    nickname: string;
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
    const [incoming, setIncoming] = useState<string[]>([]);
    const [outgoing, setOutgoing] = useState<string[]>([]);
    const [recommended, setRecommended] = useState<RecommendedUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchData = async () => {
        if (!user) return;
        try {
            setLoading(true);
            setError("");
            const [incRes, outRes, recRes] = await Promise.all([
                getIncomingRequests(user.id),
                getOutgoingRequests(user.id),
                getRecommendations(user.id, 3),
            ]);
            setIncoming(incRes.data);
            setOutgoing(outRes.data);
            // recRes.data는 이제 RecommendedUser[]로 반환된다고 가정
            setRecommended(recRes.data);
        } catch (e) {
            console.error(e);
            setError("소셜 데이터 로드 실패");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.id) {
            fetchData();
        }
    }, [user]);

    // 추천 친구 목록에서 "친구추가" 버튼 클릭 시 친구 요청 API 호출
    const handleSendFriendRequest = async (targetUserId: string) => {
        if (!user) return;
        try {
            const res = await sendFriendRequest(user.id, targetUserId);
            alert(`친구 요청 성공: ${res.data}`);
            // 요청 후 데이터를 새로 고침
            fetchData();
        } catch (err) {
            console.error(err);
            alert("친구 요청 보내기에 실패했습니다.");
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
                    {incoming.map((uid) => (
                        <ListItem key={uid}>
                            <FriendName>{uid}</FriendName>
                            <Actions>
                                <Button onClick={() => alert(`수락: ${uid}`)}>수락</Button>
                                <Button onClick={() => alert(`거절: ${uid}`)}>거절</Button>
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
                {outgoing.map((uid) => (
                    <ListItem key={uid}>
                        <FriendName>{uid}</FriendName>
                        <StatusText style={{ color: "#888" }}>대기중</StatusText>
                    </ListItem>
                ))}
                </List>
            )}

            <SectionTitle>추천 친구</SectionTitle>
            {recommended.length === 0 ? (
                <StatusText>추천할 친구가 없습니다.</StatusText>
            ) : (
                <List>
                {recommended.map((recUser) => (
                    <ListItem key={recUser.id}>
                        <FriendName>
                            {recUser.nickname || recUser.username}
                        </FriendName>
                        <Button onClick={() => handleSendFriendRequest(recUser.id)}>
                            친구추가
                        </Button>
                    </ListItem>
                ))}
                </List>
            )}
        </Container>
    );
};

export default SocialTab;