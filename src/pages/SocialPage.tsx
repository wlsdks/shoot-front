// src/pages/SocialPage.tsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";  // 전역에서 user 정보를 가져온다고 가정
import {
    getFriends,
    getIncomingRequests,
    getOutgoingRequests,
    getRecommendations,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    createDirectChat,
} from "../services/friendApi";
import { useNavigate } from "react-router-dom";

interface SocialPageProps {}

const SocialPage: React.FC<SocialPageProps> = () => {
    const { user } = useAuth();     // user.id 등을 가져옴
    const navigate = useNavigate();

    // 상태들
    const [friends, setFriends] = useState<string[]>([]);       // 친구 목록 (userId string 배열)
    const [incoming, setIncoming] = useState<string[]>([]);     // 내가 받은 요청
    const [outgoing, setOutgoing] = useState<string[]>([]);     // 내가 보낸 요청
    const [recommended, setRecommended] = useState<string[]>([]); // 추천 친구

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // 데이터 로드
    const fetchData = async () => {
        if (!user) return;
        try {
        setLoading(true);
        setError("");

        // 병렬 요청도 가능
        const [friendsRes, incRes, outRes, recRes] = await Promise.all([
            getFriends(user.id),
            getIncomingRequests(user.id),
            getOutgoingRequests(user.id),
            getRecommendations(user.id, 3),
        ]);

        setFriends(friendsRes.data);
        setIncoming(incRes.data);
        setOutgoing(outRes.data);
        setRecommended(recRes.data);
        } catch (err: any) {
        setError("데이터 로드 실패");
        console.error(err);
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.id) {
        fetchData();
        }
    }, [user]);

    // 친구 요청 보내기
    const handleSendRequest = async (targetUserId: string) => {
        if (!user) return;
        try {
        await sendFriendRequest(user.id, targetUserId);
        alert("친구 요청을 보냈습니다.");
        fetchData();  // 목록 갱신
        } catch (err) {
        console.error(err);
        alert("친구 요청 실패");
        }
    };

    // 친구 요청 수락
    const handleAccept = async (requesterId: string) => {
        if (!user) return;
        try {
        await acceptFriendRequest(user.id, requesterId);
        alert("친구 요청을 수락했습니다.");
        fetchData();
        } catch (err) {
        console.error(err);
        alert("수락 실패");
        }
    };

    // 친구 요청 거절
    const handleReject = async (requesterId: string) => {
        if (!user) return;
        try {
        await rejectFriendRequest(user.id, requesterId);
        alert("친구 요청을 거절했습니다.");
        fetchData();
        } catch (err) {
        console.error(err);
        alert("거절 실패");
        }
    };

    // 1:1 채팅 만들기
    const handleStartChat = async (friendId: string) => {
        if (!user) return;
        try {
        const res = await createDirectChat(user.id, friendId);
        // API가 ChatRoom 객체 반환한다고 가정
        const room = res.data;
        // room.id or room.roomId 등 필드 확인
        navigate(`/chatroom/${room.id}`);
        } catch (err) {
        console.error(err);
        alert("채팅방 생성 실패");
        }
    };

    if (!user) {
        return <div>로그인이 필요합니다.</div>;
    }

    if (loading) {
        return <div>로딩중...</div>;
    }

    return (
        <div style={{ maxWidth: "800px", margin: "20px auto" }}>
        <h1>소셜 페이지</h1>
        {error && <p style={{ color: "red" }}>{error}</p>}

        {/* 1. 내 친구 목록 */}
        <section style={{ marginBottom: "20px" }}>
            <h2>내 친구 목록</h2>
            {friends.length === 0 ? (
            <p>아직 친구가 없습니다.</p>
            ) : (
            <ul>
                {friends.map((fid) => (
                <li key={fid} style={{ marginBottom: "8px" }}>
                    친구 ID: {fid}
                    <button
                    style={{ marginLeft: "8px" }}
                    onClick={() => handleStartChat(fid)}
                    >
                    채팅하기
                    </button>
                </li>
                ))}
            </ul>
            )}
        </section>

        {/* 2. 받은 친구 요청 목록 (incoming) */}
        <section style={{ marginBottom: "20px" }}>
            <h2>받은 친구 요청</h2>
            {incoming.length === 0 ? (
            <p>받은 요청이 없습니다.</p>
            ) : (
            <ul>
                {incoming.map((rid) => (
                <li key={rid} style={{ marginBottom: "8px" }}>
                    요청 보낸 사람: {rid}
                    <button
                    style={{ marginLeft: "8px" }}
                    onClick={() => handleAccept(rid)}
                    >
                    수락
                    </button>
                    <button
                    style={{ marginLeft: "8px" }}
                    onClick={() => handleReject(rid)}
                    >
                    거절
                    </button>
                </li>
                ))}
            </ul>
            )}
        </section>

        {/* 3. 보낸 친구 요청 목록 (outgoing) */}
        <section style={{ marginBottom: "20px" }}>
            <h2>보낸 친구 요청</h2>
            {outgoing.length === 0 ? (
            <p>보낸 요청이 없습니다.</p>
            ) : (
            <ul>
                {outgoing.map((rid) => (
                <li key={rid} style={{ marginBottom: "8px" }}>
                    요청 대상: {rid}
                    {/* 필요하다면 '취소' 기능을 추가할 수도 있음 */}
                </li>
                ))}
            </ul>
            )}
        </section>

        {/* 4. 추천 친구 목록 */}
        <section>
            <h2>추천 친구</h2>
            {recommended.length === 0 ? (
            <p>추천할 친구가 없습니다.</p>
            ) : (
            <ul>
                {recommended.map((rc) => (
                <li key={rc} style={{ marginBottom: "8px" }}>
                    유저 ID: {rc}
                    <button
                    style={{ marginLeft: "8px" }}
                    onClick={() => handleSendRequest(rc)}
                    >
                    친구 요청
                    </button>
                </li>
                ))}
            </ul>
            )}
        </section>
        </div>
    );
};

export default SocialPage;