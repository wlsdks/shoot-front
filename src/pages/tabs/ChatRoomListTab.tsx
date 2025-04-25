import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { getChatRooms, updateChatRoomFavorite } from '../../services/chatRoom';
import { Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../../context/AuthContext';

// 애니메이션 정의
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
`;


// 채팅방 인터페이스 정의
interface ChatRoom {
    roomId: number; // string -> number로 변경
    title: string;
    lastMessage: string | null;
    unreadMessages: number;
    isPinned: boolean;
    timestamp?: string; // API에서 내려오지 않으면 undefined 처리됨
}

// 메인 컨테이너 - 스크롤 이슈 수정
const Container = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #f8f9fa;
`;

// 헤더 영역
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

const HeaderActions = styled.div`
    display: flex;
    gap: 0.5rem;
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
`;

// 스크롤 영역
const ScrollContent = styled.div`
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

// 전체 채팅방 목록 컨테이너
const RoomListContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
`;

// 채팅방 리스트 섹션 (즐겨찾기/일반)
const RoomSection = styled.div`
    margin-bottom: 1rem;
`;

const SectionHeader = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 0.75rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #e0e0e0;
`;

const SectionIcon = styled.div`
    margin-right: 0.75rem;
    color: #007bff;
    display: flex;
    align-items: center;
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

// 채팅방 아이템 카드
const RoomItem = styled(Link)`
    display: flex;
    align-items: center;
    padding: 1rem;
    background-color: #fff;
    border-radius: 12px;
    margin-bottom: 0.75rem;
    text-decoration: none;
    color: inherit;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;
    animation: ${fadeIn} 0.3s ease-out;
    position: relative;
    
    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    }
    
    &:active {
        transform: translateY(-1px);
    }
    
    &:last-child {
        margin-bottom: 0;
    }
`;

// 좌측 아바타 영역
const Avatar = styled.div`
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: #007bff;
    margin-right: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    color: white;
    flex-shrink: 0;
    border: 2px solid #e1ecff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

// 오른쪽 영역
const RoomDetails = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-width: 0; // 텍스트 overflow 처리를 위함
`;

// 상단 행
const RoomHeaderRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.4rem;
`;

// 제목 래퍼
const TitleWrapper = styled.div`
    display: flex;
    align-items: center;
    min-width: 0; // 오버플로우 처리
`;

// 채팅방 제목
const RoomTitle = styled.h3`
    font-size: 1rem;
    font-weight: 600;
    color: #333;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

// 즐겨찾기 버튼
const FavoriteButton = styled.button<{ $active: boolean }>`
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    color: ${(props) => (props.$active ? "#FFD700" : "#ccc")};
    margin-left: 0.5rem;
    transition: transform 0.2s, color 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
        transform: scale(1.2);
        color: ${(props) => (props.$active ? "#FFD700" : "#FFD700")};
    }
`;

// 활동 시간
const Timestamp = styled.span`
    font-size: 0.75rem;
    color: #6c757d;
    white-space: nowrap;
    margin-left: 0.75rem;
`;

// 하단 행
const RoomFooterRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

// 마지막 메시지
const LastMessage = styled.div`
    font-size: 0.85rem;
    color: #6c757d;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 80%;
`;

// 안읽은 메시지 배지
const UnreadBadge = styled.div`
    background-color: #FF5722;
    color: white;
    padding: 0.2rem 0.5rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: bold;
    min-width: 1.2rem;
    height: 1.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(255, 87, 34, 0.3);
`;

// 에러 메시지
const ErrorMessage = styled.div`
    padding: 1rem;
    background-color: #fdeeee;
    color: #e53935;
    border-radius: 8px;
    margin: 1rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    svg {
        color: #e53935;
    }
`;

// 로딩 상태
const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    color: #6c757d;
    height: 100%;
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

// 빈 상태
const EmptyState = styled.div`
    text-align: center;
    padding: 2rem 1rem;
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    margin-top: 1rem;
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

// 아이콘 컴포넌트
const Icon = ({ children }: { children: React.ReactNode }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
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

const ChatRoomList: React.FC = () => {
    const { user, subscribeToSse, unsubscribeFromSse, reconnectSse } = useAuth();
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const updatesReceivedRef = useRef(false);
    const location = useLocation();
    const navigate = useNavigate();

    // 채팅방 목록 조회 함수
    const fetchRooms = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            console.log("ChatRoomList: Fetching rooms for user:", user.id);
            const response = await getChatRooms(user.id);
            const roomsData = response.data; // getChatRooms에서 이미 데이터 추출 처리
            console.log("ChatRoomList: Received rooms:", roomsData);
            setRooms(roomsData);
            updatesReceivedRef.current = false;
        } catch (err) {
            console.error("ChatRoomList: Failed to fetch rooms:", err);
            setError("채팅방 목록 로드 실패");
        } finally {
            setLoading(false);
        }
    }, [user]);

    // 뒤로 가기로 채팅방 목록에 들어올 때 자동 새로고침 및 SSE 재연결
    useEffect(() => {
        if (location.state?.refresh) {
        console.log("뒤로 가기 감지됨, 채팅방 목록 새로고침");
        fetchRooms();
        
        // 상태 초기화 (무한 새로고침 방지)
        navigate(".", { replace: true, state: {} });
        }

        // 마운트될 때도 SSE 재연결 시도
        reconnectSse();
    }, [location, fetchRooms, navigate, reconnectSse]);

    // SSE 이벤트를 통해 채팅방 목록을 실시간으로 업데이트
    useEffect(() => {
        if (!user?.id) {
            console.log("ChatRoomList: No user ID, skipping fetchRooms");
            setRooms([]);
            return;
        }
        
        fetchRooms();

        // 메시지 수신 시 해당 채팅방의 마지막 메시지와 안읽은 수 업데이트
        const handleMessage = (event: MessageEvent) => {
            try {
                console.log("ChatRoomList: Raw message event received:", event.data);
                
                let data;
                if (typeof event.data === 'string') {
                    try {
                        data = JSON.parse(event.data);
                    } catch (e) {
                        console.error("ChatRoomList: Failed to parse message data:", e);
                        return;
                    }
                } else {
                    data = event.data;
                }
                
                console.log("ChatRoomList: Parsed message data:", data);
                
                // roomId 필드 확인
                if (!data.roomId) {
                    console.warn("ChatRoomList: Missing roomId in SSE data:", data);
                    return;
                }
                
                const { roomId, unreadCount, lastMessage } = data;
                console.log("ChatRoomList: Message received:", { roomId, unreadCount, lastMessage });

                // lastMessage가 null이거나 비어있는 경우의 처리
                if (lastMessage === null || lastMessage === undefined || lastMessage === "") {
                    console.log(`ChatRoomList: 메시지 없음 (null/empty) - roomId: ${roomId}`);
                    
                    // unreadCount만 업데이트하고 lastMessage는 변경하지 않음
                    if (unreadCount !== undefined) {
                        setRooms((prev) => 
                            prev.map((room) =>
                                room.roomId === roomId 
                                ? { ...room, unreadMessages: unreadCount } 
                                : room
                            )
                        );
                    }
                    return;
                }

                // 정상 메시지가 있는 경우 모든 필드 업데이트
                setRooms((prev) => {
                    // 기존 방 찾기
                    const roomIndex = prev.findIndex(r => r.roomId === roomId);
                    if (roomIndex === -1) return prev; // 방이 없으면 무시
                    
                    // 새 배열 생성
                    const newRooms = [...prev];
                    newRooms[roomIndex] = {
                        ...newRooms[roomIndex],
                        unreadMessages: unreadCount !== undefined ? unreadCount : newRooms[roomIndex].unreadMessages,
                        lastMessage
                    };
                    
                    return newRooms;
                });
            } catch (error) {
                console.error("ChatRoomList: Error processing message event:", error);
            }
        };

        // 채팅방 생성 이벤트 발생 시 목록 새로고침
        const handleChatRoomCreated = (event: MessageEvent) => {
            console.log("ChatRoomList: Chat room created event received:", event);
            fetchRooms();
        };

        // 하트비트 이벤트 (로그용)
        const handleHeartbeat = (event: MessageEvent) => {
            console.log("ChatRoomList: Heartbeat received:", event);
        };

        // 주기적으로 채팅방 목록 새로고침
        const refreshInterval = setInterval(() => {
            if (!updatesReceivedRef.current) {
                console.log("ChatRoomList: Periodic refresh (no updates received)");
                fetchRooms();
            }
        }, 30000); // 30초마다

        subscribeToSse("message", handleMessage);
        subscribeToSse("chatRoomCreated", handleChatRoomCreated);
        subscribeToSse("heartbeat", handleHeartbeat);

        return () => {
            clearInterval(refreshInterval);
            unsubscribeFromSse("message", handleMessage);
            unsubscribeFromSse("chatRoomCreated", handleChatRoomCreated);
            unsubscribeFromSse("heartbeat", handleHeartbeat);
        };
    }, [user?.id, fetchRooms, subscribeToSse, unsubscribeFromSse]);

    // 즐겨찾기 토글 함수
    const toggleFavorite = async (roomId: number, currentFavorite: boolean, e: React.MouseEvent) => {
        e.preventDefault(); // 이벤트 전파 방지
        try {
            await updateChatRoomFavorite(roomId, user!.id, !currentFavorite);
            fetchRooms();
        } catch (err) {
            console.error("즐겨찾기 업데이트 실패", err);
            setError("즐겨찾기 업데이트 실패");
        }
    };

    // 즐겨찾기된 채팅방과 일반 채팅방으로 분류
    const pinnedRooms = rooms.filter(room => room.isPinned);
    const normalRooms = rooms.filter(room => !room.isPinned);

    if (loading && rooms.length === 0) {
        return (
        <Container>
            <Header>
            <Title>채팅방</Title>
            <HeaderActions>
                <IconButton>
                <Icon>
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    <line x1="9" y1="10" x2="15" y2="10" />
                    <line x1="12" y1="7" x2="12" y2="13" />
                </Icon>
                </IconButton>
            </HeaderActions>
            </Header>
            <LoadingContainer>
            <Spinner />
            <p>채팅방 목록을 불러오는 중...</p>
            </LoadingContainer>
        </Container>
        );
    }

    return (
        <Container>
        <Header>
            <Title>채팅방</Title>
            <HeaderActions>
            <IconButton>
                <Icon>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                <line x1="9" y1="10" x2="15" y2="10" />
                <line x1="12" y1="7" x2="12" y2="13" />
                </Icon>
            </IconButton>
            </HeaderActions>
        </Header>
        
        <ScrollContent>
            {error && (
            <ErrorMessage>
                <Icon>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
                </Icon>
                {error}
            </ErrorMessage>
            )}
            
            <RoomListContainer>
            {rooms.length === 0 ? (
                <EmptyState>
                <EmptyStateIcon>
                    <Icon>
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </Icon>
                </EmptyStateIcon>
                <EmptyStateText>참여 중인 채팅방이 없습니다.</EmptyStateText>
                </EmptyState>
            ) : (
                <>
                {pinnedRooms.length > 0 && (
                    <RoomSection>
                    <SectionHeader>
                        <SectionIcon>
                        <Icon>
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </Icon>
                        </SectionIcon>
                        <SectionTitle>즐겨찾기</SectionTitle>
                        <SectionCount>{pinnedRooms.length}</SectionCount>
                    </SectionHeader>
                    
                    {pinnedRooms.map((room) => (
                        <RoomItem key={`pinned-${room.roomId}`} to={`/chatroom/${room.roomId}`}>
                        <Avatar>
                            {room.title.charAt(0).toUpperCase()}
                        </Avatar>
                        <RoomDetails>
                            <RoomHeaderRow>
                            <TitleWrapper>
                                <RoomTitle>{room.title}</RoomTitle>
                                <FavoriteButton
                                $active={room.isPinned}
                                onClick={(e) => toggleFavorite(room.roomId, room.isPinned, e)}
                                >
                                <Icon>
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </Icon>
                                </FavoriteButton>
                            </TitleWrapper>
                            <Timestamp>
                                {room.timestamp || ""}
                            </Timestamp>
                            </RoomHeaderRow>
                            <RoomFooterRow>
                            <LastMessage>
                                {room.lastMessage || "최근 메시지가 없습니다."}
                            </LastMessage>
                            {room.unreadMessages > 0 && (
                                <UnreadBadge>{room.unreadMessages}</UnreadBadge>
                            )}
                            </RoomFooterRow>
                        </RoomDetails>
                        </RoomItem>
                    ))}
                    </RoomSection>
                )}
                
                {normalRooms.length > 0 && (
                    <RoomSection>
                    <SectionHeader>
                        <SectionIcon>
                        <Icon>
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </Icon>
                        </SectionIcon>
                        <SectionTitle>채팅방</SectionTitle>
                        <SectionCount>{normalRooms.length}</SectionCount>
                    </SectionHeader>
                    
                    {normalRooms.map((room) => (
                        <RoomItem key={`normal-${room.roomId}`} to={`/chatroom/${room.roomId}`}>
                        <Avatar>
                            {room.title.charAt(0).toUpperCase()}
                        </Avatar>
                        <RoomDetails>
                            <RoomHeaderRow>
                            <TitleWrapper>
                                <RoomTitle>{room.title}</RoomTitle>
                                <FavoriteButton
                                $active={room.isPinned}
                                onClick={(e) => toggleFavorite(room.roomId, room.isPinned, e)}
                                >
                                <Icon>
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </Icon>
                                </FavoriteButton>
                            </TitleWrapper>
                            <Timestamp>
                                {room.timestamp || ""}
                            </Timestamp>
                            </RoomHeaderRow>
                            <RoomFooterRow>
                            <LastMessage>
                                {room.lastMessage || "최근 메시지가 없습니다."}
                            </LastMessage>
                            {room.unreadMessages > 0 && (
                                <UnreadBadge>{room.unreadMessages}</UnreadBadge>
                            )}
                            </RoomFooterRow>
                        </RoomDetails>
                        </RoomItem>
                    ))}
                    </RoomSection>
                )}
                </>
            )}
            </RoomListContainer>
        </ScrollContent>
        </Container>
    );
};

export default ChatRoomList;