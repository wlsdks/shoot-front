import React, { useEffect, useState, useCallback, useRef } from "react";
import styled from "styled-components";
import { useAuth } from "../../context/AuthContext";
import { getFriends } from "../../services/friends";
import FriendSearch from "../FriendSearch";
import FriendCodePage from "../FriendCodePage";
import { createDirectChat } from "../../services/chatRoom"
import { useNavigate } from "react-router-dom";

// FriendTab 컨테이너 (ContentArea에 채워질 카드)
const TabContainer = styled.div`
    padding: 16px;
`;

// 헤더 영역: 제목과 버튼 그룹
const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
`;

// 제목 스타일
const Title = styled.h2`
    font-size: 20px;
    font-weight: 600;
    color: #333;
    margin: 0;
`;

// 버튼 그룹
const ButtonGroup = styled.div`
    display: flex;
    gap: 8px;
`;

// 아이콘 버튼 (검색 토글)
const IconButton = styled.button`
    background: transparent;
    border: none;
    font-size: 24px;
    color: #007bff;
    cursor: pointer;
`;

// 텍스트 버튼 (코드 등록/찾기)
const TextButton = styled.button`
    background: transparent;
    border: none;
    font-size: 14px;
    color: #007bff;
    cursor: pointer;
`;

// 친구 목록 (카드 스타일)
const FriendList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
`;

const FriendItem = styled.li`
    padding: 12px;
    background: #f9f9f9;
    border-radius: 12px;
    margin-bottom: 12px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    font-size: 16px;
    color: #333;
    transition: transform 0.2s, box-shadow 0.2s;
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
`;

// 친구 인터페이스 정의
interface Friend {
    id: string;
    username: string;
}

const FriendTab: React.FC = () => {
    const { user, loading, subscribeToSse, unsubscribeFromSse } = useAuth();
    const [friends, setFriends] = useState<Friend[]>([]);
    const [showSearch, setShowSearch] = useState<boolean>(false);
    const [showCode, setShowCode] = useState<boolean>(false);
    const navigate = useNavigate();

    const fetchFriends = useCallback(async () => {
        if (!user) {
            console.log("FriendTab: No user, skipping fetchFriends");
            return;
        }

        console.log("FriendTab: Fetching friends for user:", user.id);

        try {
            const response = await getFriends(user.id);
            console.log("FriendTab: Friends fetched:", response.data);
            setFriends(response.data);
        } catch (err) {
            console.error("FriendTab: Fetch friends failed:", err);
        }
    }, [user]);

    // 초기 친구 목록 로드
    useEffect(() => {
        if (!user?.id) {
            console.log("FriendTab: No user ID or already loaded, skipping initial fetch");
            return;
        }

        console.log("FriendTab: Initializing friends...");
        fetchFriends();
    }, [user?.id, fetchFriends]);

    // friendAdded 이벤트 수신 → 친구 추가 시 fetchFriends 호출 → 목록 실시간 갱신.
    useEffect(() => {
        if (!user?.id) {
            console.log("FriendTab: No user ID, skipping fetch");
            setFriends([]);
            return;
        }
        console.log("FriendTab: Initializing friends...");
        fetchFriends();

        const handleFriendAdded = (event: MessageEvent) => {
            console.log("FriendTab: Friend added event:", event);
            fetchFriends();
        };
        const handleHeartbeat = (event: MessageEvent) => {
            console.log("FriendTab: Heartbeat received:", event);
        };

        subscribeToSse("friendAdded", handleFriendAdded);
        subscribeToSse("heartbeat", handleHeartbeat);

        return () => {
            unsubscribeFromSse("friendAdded", handleFriendAdded);
            unsubscribeFromSse("heartbeat", handleHeartbeat);
        };
    }, [user?.id, fetchFriends, subscribeToSse, unsubscribeFromSse]);

    // 친구 클릭 시 채팅방 생성 및 이동
    const handleFriendClick = useCallback(async (friendId: string) => {
        console.log("FriendTab: Friend clicked:", friendId);
        if (!user) return;

        try {
            const response = await createDirectChat(user.id, friendId);
            console.log("FriendTab: Chat created, roomId:", response.data.id);
            const roomId = response.data.id; // 응답에서 roomId 추출 (ChatRoom 객체 반환 가정)
            navigate(`/chatroom/${roomId}`); // 채팅방으로 이동
        } catch (err) {
            console.error("FriendTab: Chat Room creation failed:", err);
            alert("채팅방 생성에 실패했습니다.");
        }
    }, [user, navigate]);

    // 렌더링 조건문은 Hook 호출 후
    if (loading) {
        console.log("FriendTab: Auth loading...");
        return <div>Loading...</div>;
    }

    console.log("FriendTab: Rendering, friends:", friends);
    return (
        <TabContainer>
            <Header>
                <Title>내 친구 목록</Title>
                <ButtonGroup>
                    <IconButton onClick={() => setShowSearch((prev) => !prev)}>
                        {showSearch ? "✖" : "🔍"}
                    </IconButton>
                    <TextButton onClick={() => setShowCode((prev) => !prev)}>
                        코드 등록/찾기
                    </TextButton>
                </ButtonGroup>
            </Header>
            {showSearch && <FriendSearch />}
            {showCode && <FriendCodePage />}
            {friends.length === 0 ? (
                <p style={{ textAlign: "center", color: "#888", fontSize: "16px" }}>
                    친구가 없습니다.
                </p>
            ) : (
                <FriendList>
                    {friends.map((friend) => (
                        <FriendItem
                            key={friend.id}
                            onClick={() => handleFriendClick(friend.id)} // 클릭 이벤트 추가
                        >
                            {friend.username}
                        </FriendItem>
                    ))}
                </FriendList>
            )}
        </TabContainer>
    );
};

export default FriendTab;