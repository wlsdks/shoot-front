import React, { useEffect, useState, useCallback, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { useAuth } from "../../context/AuthContext";
import { getFriends } from "../../services/friends";
import FriendSearch from "../FriendSearch";
import FriendCodePage from "../FriendCodePage";
import { createDirectChat } from "../../services/chatRoom";
import { useNavigate } from "react-router-dom";
import isEqual from "lodash/isEqual";

// 애니메이션 정의
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
`;

const slideUp = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

// 메인 컨테이너 - 스크롤 이슈 수정
const TabContainer = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #f8f9fa;
`;

// 고정 헤더 영역
const Header = styled.div`
    padding: 1rem;
    background-color: #fff;
    border-bottom: 1px solid #e9ecef;
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const Title = styled.h2`
    font-size: 1.25rem;
    font-weight: 700;
    color: #333;
    margin: 0;
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 0.75rem;
    align-items: center;
`;

const IconButton = styled.button`
    background: #f0f5ff;
    border: none;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    color: #007bff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    transition: all 0.2s;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    
    &:hover {
        background: #e1ecff;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    
    &:active {
        transform: translateY(0);
    }
`;

const TextButton = styled.button`
    background: #007bff;
    color: white;
    border: none;
    border-radius: 18px;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    
    &:hover {
        background: #0056b3;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    
    &:active {
        transform: translateY(0);
    }
`;

// 스크롤 영역
const ContentArea = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    
    /* 스크롤바 스타일링 */
    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 10px;
    }

    &::-webkit-scrollbar-thumb {
        background: #ccc;
        border-radius: 10px;
    }

    &::-webkit-scrollbar-thumb:hover {
        background: #aaa;
    }
`;

// 검색 및 코드 컨테이너 - 애니메이션 추가
const SearchContainer = styled.div`
    margin-bottom: 1rem;
    animation: ${slideUp} 0.3s ease-out;
    background-color: #fff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

// 내 프로필 카드
const MyProfileCard = styled.div`
    display: flex;
    align-items: center;
    padding: 1.25rem;
    background: #fff;
    border-radius: 12px;
    margin-bottom: 1.25rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    border-left: 5px solid #007bff;
    animation: ${fadeIn} 0.3s ease-out;
`;

const UserInfo = styled.div`
    display: flex;
    align-items: center;
    flex: 1;
`;

const UserDetails = styled.div`
    display: flex;
    flex-direction: column;
`;

const Online = styled.div`
    width: 12px;
    height: 12px;
    background-color: #32CD32;
    border-radius: 50%;
    margin-right: 0.5rem;
`;

const UserStatus = styled.div`
    display: flex;
    align-items: center;
    margin-top: 0.3rem;
`;

const StatusText = styled.span`
    font-size: 0.75rem;
    color: #6c757d;
`;

// 친구 섹션 헤더
const SectionHeader = styled.div`
    display: flex;
    align-items: center;
    margin: 1.5rem 0 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #e0e0e0;
`;

const SectionTitle = styled.h3`
    font-size: 1rem;
    margin: 0;
    color: #333;
    flex: 1;
`;

const SectionCount = styled.span`
    background-color: #e9ecef;
    color: #495057;
    font-size: 0.8rem;
    padding: 0.2rem 0.5rem;
    border-radius: 1rem;
    font-weight: 600;
`;

// 친구 목록
const FriendList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
`;

// 친구 항목
const FriendItem = styled.li`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    background: #fff;
    border-radius: 12px;
    margin-bottom: 0.75rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;
    animation: ${fadeIn} 0.3s ease-out;
    cursor: pointer;
    
    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    }
    
    &:active {
        transform: translateY(-1px);
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
    }
`;

// 아바타 관련 스타일
const AvatarContainer = styled.div`
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: #007bff;
    margin-right: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    color: #fff;
    border: 2px solid #e1ecff;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    flex-shrink: 0;
`;

const AvatarImage = styled.img`
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
    margin-right: 1rem;
    border: 2px solid #e1ecff;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

// 이름 텍스트 영역
const FriendName = styled.div`
    font-size: 1rem;
    font-weight: 600;
    color: #333;
`;

const FriendStatus = styled.div`
    display: flex;
    align-items: center;
    margin-top: 0.3rem;
`;

const ChatButton = styled.button`
    background: #f0f5ff;
    color: #007bff;
    border: none;
    border-radius: 8px;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
        background: #d4e4ff;
        transform: translateY(-2px);
    }
    
    &:active {
        transform: translateY(0);
    }
    
    svg {
        width: 20px;
        height: 20px;
    }
`;

// 빈 상태 메시지
const EmptyState = styled.div`
    text-align: center;
    padding: 2rem 1rem;
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    margin: 1rem 0;
`;

const EmptyStateIcon = styled.div`
    color: #adb5bd;
    margin-bottom: 1rem;
    
    svg {
        width: 48px;
        height: 48px;
    }
`;

const EmptyStateText = styled.p`
    color: #6c757d;
    font-size: 0.95rem;
    margin: 0;
`;

// 로딩 인디케이터
const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    color: #6c757d;
`;

const Spinner = styled.div`
    border: 3px solid #f3f3f3;
    border-top: 3px solid #007bff;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

// 아이콘 컴포넌트
const Icon = ({ children }: { children: React.ReactNode }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        {children}
    </svg>
);

// Friend 인터페이스 정의
interface Friend {
    id: number; // string -> number로 변경
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
            const friendsData = await getFriends(user.id);
            setFriends((prevFriends) => {
                if (!isEqual(prevFriends, friendsData)) {
                    console.log("FriendTab: Friends fetched:", friendsData);
                    return friendsData;
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
            <Header>
            <Title>내 친구 목록</Title>
            </Header>
            <ContentArea>
            <LoadingContainer>
                <Spinner />
                <p>불러오는 중...</p>
            </LoadingContainer>
            </ContentArea>
        </TabContainer>
        );
    }

    return (
        <TabContainer>
        <Header>
            <Title>내 친구 목록</Title>
            <ButtonGroup>
            <IconButton onClick={() => setShowSearch((prev) => !prev)}>
                {showSearch ? 
                <Icon>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                </Icon> : 
                <Icon>
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </Icon>
                }
            </IconButton>
            <TextButton onClick={() => setShowCode((prev) => !prev)}>
                코드 등록/찾기
            </TextButton>
            </ButtonGroup>
        </Header>
        
        <ContentArea>
            {showSearch && (
            <SearchContainer>
                <FriendSearch />
            </SearchContainer>
            )}
            
            {showCode && (
            <SearchContainer>
                <FriendCodePage />
            </SearchContainer>
            )}
            
            {/* 내 프로필 카드 */}
            {user && (
            <MyProfileCard>
                <UserInfo>
                <AvatarContainer>
                    {user.username.charAt(0).toUpperCase()}
                </AvatarContainer>
                <UserDetails>
                    <FriendName>{user.username}</FriendName>
                    <UserStatus>
                    <Online />
                    <StatusText>온라인</StatusText>
                    </UserStatus>
                </UserDetails>
                </UserInfo>
            </MyProfileCard>
            )}
            
            {/* 친구 섹션 헤더 */}
            <SectionHeader>
            <SectionTitle>친구</SectionTitle>
            <SectionCount>{friends.length}</SectionCount>
            </SectionHeader>
            
            {/* 친구 목록 */}
            {friends.length === 0 ? (
            <EmptyState>
                <EmptyStateIcon>
                <Icon>
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </Icon>
                </EmptyStateIcon>
                <EmptyStateText>아직 친구가 없습니다. 친구를 추가해 보세요!</EmptyStateText>
            </EmptyState>
            ) : (
            <FriendList>
                {friends.map((friend) => (
                <FriendItem key={friend.id} onClick={() => handleFriendClick(friend.id)}>
                    <UserInfo>
                    {friend.avatarUrl ? (
                        <AvatarImage src={friend.avatarUrl} alt={friend.username} />
                    ) : (
                        <AvatarContainer>
                        {friend.username.charAt(0).toUpperCase()}
                        </AvatarContainer>
                    )}
                    <UserDetails>
                        <FriendName>{friend.username}</FriendName>
                        <FriendStatus>
                        <StatusText>{user?.bio}</StatusText>
                        </FriendStatus>
                    </UserDetails>
                    </UserInfo>
                    <ChatButton>
                    <Icon>
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </Icon>
                    </ChatButton>
                </FriendItem>
                ))}
            </FriendList>
            )}
        </ContentArea>
        </TabContainer>
    );
};

export default FriendTab;