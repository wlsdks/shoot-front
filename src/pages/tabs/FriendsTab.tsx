import React, { useEffect, useState, useCallback, useRef } from "react";
import styled from "styled-components";
import { useAuth } from "../../context/AuthContext";
import { getFriends } from "../../services/friends";
import FriendSearch from "../FriendSearch";
import FriendCodePage from "../FriendCodePage";
import { createDirectChat } from "../../services/chatRoom"
import { useNavigate } from "react-router-dom";
import isEqual from 'lodash/isEqual';

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

    // 친구 목록을 가져오는 함수
    const fetchFriends = useCallback(async () => {
        if (!user) return;
        try {
            const response = await getFriends(user.id);
            // 이전 상태는 함수형 업데이트로 가져오기
            setFriends((prevFriends) => {
                if (!isEqual(prevFriends, response.data)) {
                    console.log("FriendTab: Friends fetched:", response.data);
                    return response.data;
                }
                return prevFriends;
            });
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

    // 채팅방 생성
    const handleFriendClick = useCallback(async (friendId: string) => {
        console.log("FriendTab: Friend clicked:", friendId);
        if (!user) return;
        try {
            const response = await createDirectChat(user.id, friendId);
            console.log("FriendTab: Chat created, roomId:", response.data.id);
            const roomId = response.data.id;
            navigate(`/chatroom/${roomId}`);
        } catch (err) {
            console.error("FriendTab: Chat Room creation failed:", err);
            alert("채팅방 생성에 실패했습니다.");
        }
    }, [user, navigate]);

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