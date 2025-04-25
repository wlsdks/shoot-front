import React, { useEffect, useState, useCallback, useRef } from "react";
import styled, { keyframes } from "styled-components";
import InfiniteScroll from "react-infinite-scroll-component";
import {
    getFriends,
    getIncomingRequests,
    getOutgoingRequests,
    getRecommendations,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
} from "../../services/friends";
import { useAuth } from "../../context/AuthContext";

// 애니메이션 정의
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
`;

// Friend 인터페이스 정의
interface Friend {
    id: number; // string -> number로 변경
    username: string;
    profileImageUrl?: string; // 프로필 이미지 URL (옵션)
}

// 전체 컨테이너 - 스크롤바 문제 해결을 위해 수정
const Container = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #f8f9fa;
`;

// 고정된 헤더 - 다른 탭과 일관된 디자인으로 변경
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
const ScrollableContent = styled.div`
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

const SectionHeader = styled.div`
    display: flex;
    align-items: center;
    margin-top: 1rem;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #e0e0e0;
`;

const SectionIcon = styled.div`
    margin-right: 0.75rem;
    color: #007bff;
    display: flex;
    align-items: center;
`;

const SectionTitle = styled.h2`
    font-size: 1.1rem;
    margin: 0;
    color: #333;
    flex: 1;
`;

const Badge = styled.span`
    background-color: #007bff;
    color: white;
    font-size: 0.8rem;
    padding: 0.25rem 0.5rem;
    border-radius: 1rem;
    font-weight: 600;
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
    padding: 1rem;
    background-color: #fff;
    margin-bottom: 0.75rem;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;
    animation: ${fadeIn} 0.3s ease-out;
    
    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    }
`;

const UserInfo = styled.div`
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0; // 자식 요소의 text-overflow가 작동하도록
`;

const ProfileImageContainer = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 0.75rem;
    background-color: #e9ecef;
    flex-shrink: 0;
    border: 2px solid #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ProfileImage = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
`;

const ProfileInitial = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #007bff;
    color: white;
    font-weight: 600;
    font-size: 1.2rem;
`;

const FriendInfo = styled.div`
    display: flex;
    flex-direction: column;
    min-width: 0; // flex item이 0보다 작아질 수 있게 함
`;

const FriendName = styled.span`
    font-weight: 600;
    color: #333;
    font-size: 1rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const FriendStatus = styled.span`
    font-size: 0.8rem;
    color: #6c757d;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const Actions = styled.div`
    display: flex;
    gap: 0.5rem;
    margin-left: 0.75rem;
`;

const ActionButton = styled.button<{ $primary?: boolean; $danger?: boolean; disabled?: boolean }>`
    background: ${(props) => 
        props.disabled ? '#f1f3f5' :
        props.$primary ? '#007bff' : 
        props.$danger ? '#dc3545' : '#f8f9fa'};
    color: ${(props) => 
        props.disabled ? '#adb5bd' :
        (props.$primary || props.$danger) ? '#fff' : '#6c757d'};
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    border: none;
    border-radius: 8px;
    cursor: ${(props) => props.disabled ? 'default' : 'pointer'};
    font-weight: 500;
    display: flex;
    align-items: center;
    transition: all 0.2s ease;
    
    &:hover {
        background: ${(props) => 
            props.disabled ? '#f1f3f5' :
            props.$primary ? '#0069d9' : 
            props.$danger ? '#c82333' : '#e9ecef'};
        transform: ${(props) => props.disabled ? 'none' : 'translateY(-2px)'};
    }
    
    svg {
        margin-right: ${(props) => (props.children && props.children !== "친구" && props.children !== "요청됨") ? '0.4rem' : '0'};
    }
`;

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

const StatusText = styled.p`
    text-align: center;
    font-size: 0.875rem;
    color: #6c757d;
    margin: 1rem 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
`;

const ErrorContainer = styled.div`
    background-color: #f8d7da;
    color: #721c24;
    padding: 1rem;
    border-radius: 8px;
    margin: 1rem 0;
    display: flex;
    align-items: center;
    
    svg {
        margin-right: 0.75rem;
        flex-shrink: 0;
    }
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

const SocialTab: React.FC = () => {
    const { user } = useAuth();
    const [friends, setFriends] = useState<Friend[]>([]);
    const [incoming, setIncoming] = useState<Friend[]>([]);
    const [outgoing, setOutgoing] = useState<Friend[]>([]);
    const [recommended, setRecommended] = useState<Friend[]>([]);
    const [skip, setSkip] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const limit = 10;
    
    // API 중복 호출 방지를 위한 초기화 플래그
    const initialized = useRef(false);

   // 기존 소셜 데이터 (친구 목록, 친구 요청) 로드
    const fetchSocialData = useCallback(async () => {
        if (!user?.id) return;
        try {
            setLoading(true);
            setError("");
            // 친구 목록, 받은 요청, 보낸 요청 모두 함께 조회
            const [friendsData, incData, outData] = await Promise.all([
                getFriends(user.id),
                getIncomingRequests(user.id),
                getOutgoingRequests(user.id),
            ]);
            setFriends(friendsData);
            setIncoming(incData);
            setOutgoing(outData);
        } catch (e) {
            console.error(e);
            setError("소셜 데이터 로드 실패");
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    // 추천 친구 데이터 로드 (무한 스크롤)
    const fetchRecommendations = useCallback(async (currentSkip: number) => {
        if (!user?.id) return;
        try {
            const recData = await getRecommendations(user.id, limit, 2, currentSkip);
            if (recData.length < limit) {
                setHasMore(false);  // 더 이상 데이터가 없으면 hasMore false 처리
            }
            setRecommended(prev => [...prev, ...recData]);
            setSkip(currentSkip + limit);
        } catch (e) {
            console.error(e);
        }
    }, [user?.id, limit]);

    // 최초 데이터 로드 (중복 호출 방지)
    useEffect(() => {
        // 이미 초기화되었으면 더 이상 실행하지 않음
        if (initialized.current) return;
        
        // 사용자 정보가 있는 경우에만 데이터 로드
        if (user?.id) {
            // 초기화 플래그 설정
            initialized.current = true;
            
            // 데이터 로드
            fetchSocialData();
            fetchRecommendations(0);
        }
    }, [user?.id, fetchSocialData, fetchRecommendations]);

    // 친구 요청 보내기
    const handleSendFriendRequest = async (targetUserId: number) => {
        if (!user) return;
        try {
            await sendFriendRequest(user.id, targetUserId);
            
            // 추천 목록에서 해당 사용자를 보낸 요청 목록으로 이동
            const requestedUser = recommended.find(r => r.id === targetUserId);
            if (requestedUser) {
                setOutgoing(prev => [...prev, requestedUser]);
                setRecommended(prev => prev.filter(r => r.id !== targetUserId));
            }
            // 성공 메시지 없이 UI만 업데이트 (더 나은 UX)
        } catch (err) {
            console.error(err);
            setError("친구 요청 보내기에 실패했습니다.");
        }
    };

    // 친구 요청 수락
    const handleAcceptRequest = async (requesterId: number) => {
        if (!user) return;
        try {
            await acceptFriendRequest(user.id, requesterId);
        
            // 받은 요청에서 해당 사용자를 찾아 친구 목록으로 이동
            const acceptedUser = incoming.find(r => r.id === requesterId);
            if (acceptedUser) {
                setFriends(prev => [...prev, acceptedUser]);
                setIncoming(prev => prev.filter(r => r.id !== requesterId));
            }
        } catch (err) {
            console.error(err);
            setError("친구 요청 수락 실패");
        }
    };

    // 친구 요청 거절
    const handleRejectRequest = async (requesterId: number) => {
        if (!user) return;
        try {
            await rejectFriendRequest(user.id, requesterId);
        
            // 받은 요청에서 해당 사용자 제거
            setIncoming(prev => prev.filter(r => r.id !== requesterId));
        } catch (err) {
            console.error(err);
            setError("친구 요청 거절 실패");
        }
    };

    // 프로필 이미지가 없을 경우 이니셜로 대체
    const renderProfileImage = (friend: Friend) => {
        if (friend.profileImageUrl) {
            return <ProfileImage src={friend.profileImageUrl} alt={friend.username} />;
        }
        return <ProfileInitial>{friend.username.charAt(0).toUpperCase()}</ProfileInitial>;
    };

    // 로딩 중 표시
    if (loading && (friends.length === 0 && incoming.length === 0 && outgoing.length === 0)) {
        return (
            <Container>
                <Header>
                    <Title>소셜</Title>
                    <HeaderActions>
                        <IconButton>
                            <Icon>
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </Icon>
                        </IconButton>
                    </HeaderActions>
                </Header>
                <LoadingContainer>
                    <Spinner />
                    <p>소셜 데이터를 불러오는 중...</p>
                </LoadingContainer>
            </Container>
        );
    }

    return (
        <Container>
            <Header>
                <Title>소셜</Title>
                <HeaderActions>
                    <IconButton>
                        <Icon>
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </Icon>
                    </IconButton>
                </HeaderActions>
            </Header>
            
            <ScrollableContent id="scrollableContent">
                {error && (
                    <ErrorContainer>
                        <Icon>
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </Icon>
                        <span>{error}</span>
                    </ErrorContainer>
                )}

                {/* 받은 친구 요청 섹션 */}
                <SectionHeader>
                    <SectionIcon>
                        <Icon>
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <line x1="9" y1="1" x2="9" y2="4" />
                            <line x1="9" y1="10" x2="9" y2="13" />
                            <line x1="6" y1="7" x2="12" y2="7" />
                        </Icon>
                    </SectionIcon>
                    <SectionTitle>받은 친구 요청</SectionTitle>
                    {incoming.length > 0 && <Badge>{incoming.length}</Badge>}
                </SectionHeader>

                {incoming.length === 0 ? (
                    <EmptyState>
                        <EmptyStateIcon>
                            <Icon>
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <line x1="17" y1="8" x2="17" y2="14" />
                                <line x1="14" y1="11" x2="20" y2="11" />
                            </Icon>
                        </EmptyStateIcon>
                        <EmptyStateText>아직 받은 친구 요청이 없습니다.</EmptyStateText>
                    </EmptyState>
                ) : (
                    <List>
                        {incoming.map((friend) => (
                            <ListItem key={friend.id}>
                                <UserInfo>
                                    <ProfileImageContainer>
                                        {renderProfileImage(friend)}
                                    </ProfileImageContainer>
                                    <FriendInfo>
                                        <FriendName>{friend.username}</FriendName>
                                        <FriendStatus>친구 요청을 보냈습니다</FriendStatus>
                                    </FriendInfo>
                                </UserInfo>
                                <Actions>
                                    <ActionButton $primary onClick={() => handleAcceptRequest(friend.id)}>
                                        <Icon>
                                            <polyline points="20 6 9 17 4 12" />
                                        </Icon>
                                        수락
                                    </ActionButton>
                                    <ActionButton $danger onClick={() => handleRejectRequest(friend.id)}>
                                        <Icon>
                                            <line x1="18" y1="6" x2="6" y2="18" />
                                            <line x1="6" y1="6" x2="18" y2="18" />
                                        </Icon>
                                        거절
                                    </ActionButton>
                                </Actions>
                            </ListItem>
                        ))}
                    </List>
                )}

                {/* 보낸 친구 요청 섹션 */}
                <SectionHeader>
                    <SectionIcon>
                        <Icon>
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <polyline points="16 11 18 13 22 9" />
                        </Icon>
                    </SectionIcon>
                    <SectionTitle>보낸 친구 요청</SectionTitle>
                    {outgoing.length > 0 && <Badge>{outgoing.length}</Badge>}
                </SectionHeader>

                {outgoing.length === 0 ? (
                    <EmptyState>
                        <EmptyStateIcon>
                            <Icon>
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <line x1="17" y1="8" x2="17" y2="14" />
                                <line x1="14" y1="11" x2="20" y2="11" />
                            </Icon>
                        </EmptyStateIcon>
                        <EmptyStateText>보낸 친구 요청이 없습니다.</EmptyStateText>
                    </EmptyState>
                ) : (
                    <List>
                        {outgoing.map((friend) => (
                            <ListItem key={friend.id}>
                                <UserInfo>
                                    <ProfileImageContainer>
                                        {renderProfileImage(friend)}
                                    </ProfileImageContainer>
                                    <FriendInfo>
                                        <FriendName>{friend.username}</FriendName>
                                        <FriendStatus>친구 수락 대기중</FriendStatus>
                                    </FriendInfo>
                                </UserInfo>
                                <Actions>
                                    <IconButton>
                                        <Icon>
                                            <circle cx="12" cy="12" r="10" />
                                            <polyline points="12 6 12 12 16 14" />
                                        </Icon>
                                    </IconButton>
                                </Actions>
                            </ListItem>
                        ))}
                    </List>
                )}

                {/* 추천 친구 섹션 */}
                <SectionHeader>
                    <SectionIcon>
                        <Icon>
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                        </Icon>
                    </SectionIcon>
                    <SectionTitle>추천 친구</SectionTitle>
                </SectionHeader>

                <InfiniteScroll
                    dataLength={recommended.length}
                    next={() => fetchRecommendations(skip)}
                    hasMore={hasMore}
                    loader={
                        <StatusText>
                            <Icon>
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="6" x2="12" y2="12" />
                                <line x1="12" y1="18" x2="12.01" y2="18" />
                            </Icon>
                            더 많은 추천 친구를 불러오는 중...
                        </StatusText>
                    }
                    endMessage={<StatusText>더 이상 추천할 친구가 없습니다.</StatusText>}
                    scrollableTarget="scrollableContent"
                >
                    {recommended.length === 0 ? (
                        <EmptyState>
                            <EmptyStateIcon>
                                <Icon>
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </Icon>
                            </EmptyStateIcon>
                            <EmptyStateText>현재 추천할 친구가 없습니다.</EmptyStateText>
                        </EmptyState>
                    ) : (
                        <List>
                            {recommended.map((candidate) => {
                                // 현재 친구 목록에 이미 있는지 확인
                                const alreadyFriend = friends.some(friend => friend.id === candidate.id);
                                // 이미 요청을 보냈는지 확인
                                const alreadyRequested = outgoing.some(request => request.id === candidate.id);
                                
                                return (
                                    <ListItem key={candidate.id}>
                                        <UserInfo>
                                            <ProfileImageContainer>
                                                {renderProfileImage(candidate)}
                                            </ProfileImageContainer>
                                            <FriendInfo>
                                                <FriendName>{candidate.username}</FriendName>
                                                <FriendStatus>
                                                    {alreadyFriend 
                                                        ? '이미 친구입니다' 
                                                        : alreadyRequested 
                                                            ? '친구 요청 보냄' 
                                                            : '추천 친구'}
                                                </FriendStatus>
                                            </FriendInfo>
                                        </UserInfo>
                                        {alreadyFriend ? (
                                            <ActionButton disabled>친구</ActionButton>
                                        ) : alreadyRequested ? (
                                            <ActionButton disabled>요청됨</ActionButton>
                                        ) : (
                                            <ActionButton $primary onClick={() => handleSendFriendRequest(candidate.id)}>
                                                <Icon>
                                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                                    <circle cx="9" cy="7" r="4" />
                                                    <line x1="19" y1="8" x2="19" y2="14" />
                                                    <line x1="16" y1="11" x2="22" y2="11" />
                                                </Icon>
                                                친구 추가
                                            </ActionButton>
                                        )}
                                    </ListItem>
                                );
                            })}
                        </List>
                    )}
                </InfiniteScroll>
            </ScrollableContent>
        </Container>
    );
};

export default SocialTab;