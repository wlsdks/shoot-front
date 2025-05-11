// src/features/chat-room/ui/FriendListModal.tsx
import React, { useState, useEffect } from 'react';
import { getFriends } from '../../../features/social/api/friends';
import { useAuth } from '../../../shared/lib/context/AuthContext';
import { Friend, FriendResponse } from '../../../entities/friend';
import styled from 'styled-components';
import { fadeIn, slideUp } from '../../../shared/ui/commonStyles';

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    animation: ${fadeIn} 0.3s ease;
    backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
    background: white;
    width: 90%;
    max-width: 340px;
    max-height: 70vh;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    animation: ${slideUp} 0.3s ease-out;
`;

const ModalHeader = styled.div`
    padding: 1.2rem 1.5rem;
    background: linear-gradient(to right, #f2f8ff, #f8fafc);
    border-bottom: 1px solid #eaeaea;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const ModalTitle = styled.h3`
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
    text-align: center;
`;

const CloseButton = styled.button`
    position: absolute;
    left: 1.2rem;
    background: none;
    border: none;
    width: 30px;
    height: 30px;
    border-radius: 8px;
    color: #64748b;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    
    &:hover {
        background: rgba(255, 255, 255, 0.8);
        color: #4a6cf7;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }
    
    svg {
        width: 18px;
        height: 18px;
    }
`;

const SearchContainer = styled.div`
    padding: 1rem 1.5rem;
    position: relative;
    border-bottom: 1px solid #eaeaea;
`;

const SearchInput = styled.input`
    width: 100%;
    padding: 0.75rem 2.7rem 0.75rem 1rem;
    border: 1px solid #e1e8ed;
    border-radius: 12px;
    font-size: 0.9rem;
    background-color: #f8fafc;
    transition: all 0.3s;
    
    &:focus {
        outline: none;
        border-color: #4a6cf7;
        background-color: #fff;
        box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.1);
    }

    &::placeholder {
        color: #a0aec0;
    }
`;

const SearchIcon = styled.div`
    position: absolute;
    right: 2.3rem;
    top: 50%;
    transform: translateY(-50%);
    color: #a0aec0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
`;

const FriendListContainer = styled.div`
    max-height: 50vh;
    overflow-y: auto;
    padding: 0.8rem 0;
    
    &::-webkit-scrollbar {
        width: 5px;
    }
    
    &::-webkit-scrollbar-track {
        background: #f1f1f1;
    }
    
    &::-webkit-scrollbar-thumb {
        background: #ddd;
        border-radius: 5px;
    }
    
    &::-webkit-scrollbar-thumb:hover {
        background: #ccc;
    }
`;

const FriendItem = styled.div`
    display: flex;
    align-items: center;
    padding: 0.85rem 1.5rem;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
        background-color: #f0f7ff;
    }
    
    &:active {
        background-color: #e1eeff;
    }
`;

const ProfileContainer = styled.div`
    position: relative;
    margin-right: 1rem;
`;

const ProfileImage = styled.img`
    width: 45px;
    height: 45px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #e1ecff;
    background-color: #f0f5ff;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
    transition: all 0.2s;
    
    ${FriendItem}:hover & {
        border-color: #4a6cf7;
        transform: scale(1.05);
    }
`;

const ProfileInitial = styled.div`
    width: 45px;
    height: 45px;
    border-radius: 50%;
    background: linear-gradient(135deg, #4a6cf7, #2a4cdf);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 1.2rem;
    border: 2px solid #e1ecff;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
    transition: all 0.2s;
    
    ${FriendItem}:hover & {
        border-color: #4a6cf7;
        transform: scale(1.05);
    }
`;

const StatusIndicator = styled.div<{ isOnline: boolean }>`
    position: absolute;
    bottom: 0;
    right: 0;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: ${props => props.isOnline ? '#10b981' : '#94a3b8'};
    border: 2px solid white;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const FriendInfo = styled.div`
    flex: 1;
    min-width: 0;
`;

const FriendName = styled.div`
    font-size: 0.95rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 0.3rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const FriendUsername = styled.div`
    font-size: 0.8rem;
    color: #64748b;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    color: #64748b;
    gap: 1rem;
`;

const Spinner = styled.div`
    width: 30px;
    height: 30px;
    border: 3px solid #e2e8f0;
    border-radius: 50%;
    border-top-color: #4a6cf7;
    animation: spin 0.8s linear infinite;
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;

const EmptyState = styled.div`
    padding: 2.5rem 1rem;
    text-align: center;
    color: #64748b;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    
    svg {
        color: #cbd5e1;
        width: 48px;
        height: 48px;
        margin-bottom: 1rem;
    }
`;

const EmptyTitle = styled.h4`
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
    font-weight: 600;
    color: #475569;
`;

const EmptyMessage = styled.p`
    margin: 0;
    font-size: 0.85rem;
    color: #64748b;
    line-height: 1.5;
`;

interface FriendListModalProps {
    onClose: () => void;
    onSelectFriend: (friendId: number) => void;
}

export const FriendListModal: React.FC<FriendListModalProps> = ({
    onClose,
    onSelectFriend
}) => {
    const { user } = useAuth();
    const [friends, setFriends] = useState<Friend[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchFriends = async () => {
            if (!user) return;
            try {
                const friendsData = await getFriends(user.id);
                const formattedFriends = friendsData.map((friend: FriendResponse) => ({
                    id: friend.id,
                    username: friend.username,
                    nickname: friend.nickname,
                    profileImageUrl: friend.profileImageUrl || "",
                    status: friend.status || "온라인",
                    isFriend: true,
                    isPending: false,
                    isIncoming: false,
                    isOutgoing: false,
                    backgroundImageUrl: undefined,
                    bio: undefined,
                    userCode: undefined,
                    lastSeenAt: undefined
                }));
                setFriends(formattedFriends);
            } catch (error) {
                console.error('친구 목록을 불러오는데 실패했습니다:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFriends();
    }, [user]);

    const handleFriendClick = (friendId: number) => {
        onSelectFriend(friendId);
    };

    const filteredFriends = friends.filter(friend => 
        (friend.nickname && friend.nickname.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (friend.username && friend.username.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                    <CloseButton onClick={onClose}>
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </CloseButton>
                    <ModalTitle>친구 선택</ModalTitle>
                </ModalHeader>

                <SearchContainer>
                    <SearchInput
                        type="text"
                        placeholder="친구 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <SearchIcon>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </SearchIcon>
                </SearchContainer>

                {loading ? (
                    <LoadingContainer>
                        <Spinner />
                        <div>친구 목록을 불러오는 중...</div>
                    </LoadingContainer>
                ) : friends.length === 0 ? (
                    <EmptyState>
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M23 21V19C22.9986 17.1771 21.765 15.5857 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M16 3.13C17.7699 3.58317 19.0078 5.17999 19.0078 7.005C19.0078 8.83 17.7699 10.4268 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <EmptyTitle>친구가 없습니다</EmptyTitle>
                        <EmptyMessage>친구 추가 후 채팅을 시작해보세요</EmptyMessage>
                    </EmptyState>
                ) : filteredFriends.length === 0 ? (
                    <EmptyState>
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M23 21V19C22.9986 17.1771 21.765 15.5857 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M16 3.13C17.7699 3.58317 19.0078 5.17999 19.0078 7.005C19.0078 8.83 17.7699 10.4268 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M3 3L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <EmptyTitle>검색 결과가 없습니다</EmptyTitle>
                        <EmptyMessage>다른 검색어로 다시 시도해보세요</EmptyMessage>
                    </EmptyState>
                ) : (
                    <FriendListContainer>
                        {filteredFriends.map((friend) => (
                            <FriendItem key={friend.id} onClick={() => handleFriendClick(friend.id)}>
                                <ProfileContainer>
                                    {friend.profileImageUrl && friend.profileImageUrl !== 'null' ? (
                                        <>
                                            <ProfileImage src={friend.profileImageUrl} alt={friend.username} />
                                            <StatusIndicator isOnline={friend.status === '온라인'} />
                                        </>
                                    ) : (
                                        <>
                                            <ProfileInitial>{(friend.nickname || friend.username).charAt(0).toUpperCase()}</ProfileInitial>
                                            <StatusIndicator isOnline={friend.status === '온라인'} />
                                        </>
                                    )}
                                </ProfileContainer>
                                <FriendInfo>
                                    <FriendName>{friend.nickname || friend.username}</FriendName>
                                    {friend.username && friend.nickname && friend.username !== friend.nickname && (
                                        <FriendUsername>@{friend.username}</FriendUsername>
                                    )}
                                </FriendInfo>
                            </FriendItem>
                        ))}
                    </FriendListContainer>
                )}
            </ModalContent>
        </ModalOverlay>
    );
};