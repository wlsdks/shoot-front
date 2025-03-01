import React, { useEffect, useState, useCallback, useRef } from "react";
import styled from "styled-components";
import { useAuth } from "../../context/AuthContext";
import { getFriends } from "../../services/friends";
import FriendSearch from "../FriendSearch";
import FriendCodePage from "../FriendCodePage";
import { createDirectChat } from "../../services/chatRoom";
import { useNavigate } from "react-router-dom";
import isEqual from "lodash/isEqual";

// FriendTab 컨테이너
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

const Title = styled.h2`
    font-size: 20px;
    font-weight: 600;
    color: #333;
    margin: 0;
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 8px;
`;

const IconButton = styled.button`
    background: transparent;
    border: none;
    font-size: 24px;
    color: #007bff;
    cursor: pointer;
`;

const TextButton = styled.button`
    background: transparent;
    border: none;
    font-size: 14px;
    color: #007bff;
    cursor: pointer;
`;

// 내 프로필 카드: 헤더 아래에 내 프로필을 표시하며, 테두리를 두껍게 처리
const MyProfileCard = styled.div`
    display: flex;
    align-items: center;
    padding: 12px;
    background: #fff;
    border-radius: 12px;
    margin-bottom: 16px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    border: 1px solid #404143;
`;

// 친구 목록 컨테이너
const FriendList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
`;

// 친구 아이템 (카드 형태)
// 왼쪽에 아바타, 오른쪽에 친구 이름을 배치 (일반 테두리)
const FriendItem = styled.li`
    display: flex;
    align-items: center;
    padding: 12px;
    background: #fff;
    border-radius: 12px;
    margin-bottom: 12px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s, box-shadow 0.2s;
    cursor: pointer;
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
`;

// 아바타 관련 스타일
// 이미지가 있는 경우 사용하는 컴포넌트
const AvatarImage = styled.img`
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
    margin-right: 12px;
    border: 1px solid #ddd;
`;

// 사진이 없을 때 username 첫 글자를 표시할 컨테이너
const AvatarContainer = styled.div`
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: #ccc;
    margin-right: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: #fff;
    border: 1px solid #ddd;
`;

// 이름 텍스트 영역
const FriendName = styled.div`
    font-size: 16px;
    font-weight: 500;
    color: #333;
`;

// Friend 인터페이스 정의 (avatarUrl는 선택사항)
// 주의: 친구 목록에서 받아오는 데이터는 username 필드를 사용합니다.
interface Friend {
    id: string;
    username: string;
    avatarUrl?: string;
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

    // 채팅방 생성: 친구 클릭 시 direct chat 생성 후 이동
    const handleFriendClick = useCallback(async (friendId: string) => {
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
            {/* 내 프로필 카드 - user에는 avatarUrl이 없으므로 항상 fallback 사용 */}
            {user && (
                <MyProfileCard>
                <AvatarContainer>
                    {user.username.charAt(0).toUpperCase()}
                </AvatarContainer>
                <FriendName>{user.username}</FriendName>
                </MyProfileCard>
            )}
            {friends.length === 0 ? (
                <p style={{ textAlign: "center", color: "#888", fontSize: "16px" }}>
                친구가 없습니다.
                </p>
            ) : (
                <FriendList>
                    {friends.map((friend) => (
                        <FriendItem key={friend.id} onClick={() => handleFriendClick(friend.id)}>
                            {friend.avatarUrl ? (
                                <AvatarImage src={friend.avatarUrl} alt={friend.username} />
                            ) : (
                                <AvatarContainer>
                                {friend.username.charAt(0).toUpperCase()}
                                </AvatarContainer>
                            )}
                            <FriendName>{friend.username}</FriendName>
                        </FriendItem>
                    ))}
                </FriendList>
            )}
        </TabContainer>
    );
};

export default FriendTab;