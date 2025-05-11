// src/features/chat-room/ui/FriendListModal.tsx
import React, { useState, useEffect } from 'react';
import { getFriends } from '../../../features/social/api/friends';
import { useAuth } from '../../../shared/lib/context/AuthContext';
import { Friend, FriendResponse } from '../../../entities/friend';
import {
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalTitle,
    CloseButton,
    SearchContainer,
    SearchInput,
    SearchIcon,
    FriendListContainer,
    FriendItem,
    ProfileContainer,
    ProfileImage,
    ProfileInitial,
    StatusIndicator,
    FriendInfo,
    FriendName,
    FriendUsername,
    LoadingContainer,
    Spinner,
    EmptyState,
    EmptyTitle,
    EmptyMessage
} from '../styles/FriendListModal.styles';
import {
    BackArrowIcon,
    SearchIcon as SearchIconComponent,
    EmptyFriendsIcon,
    NoSearchResultsIcon
} from './icons/FriendListIcons';

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
                        <BackArrowIcon />
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
                        <SearchIconComponent />
                    </SearchIcon>
                </SearchContainer>

                {loading ? (
                    <LoadingContainer>
                        <Spinner />
                        <div>친구 목록을 불러오는 중...</div>
                    </LoadingContainer>
                ) : friends.length === 0 ? (
                    <EmptyState>
                        <EmptyFriendsIcon />
                        <EmptyTitle>친구가 없습니다</EmptyTitle>
                        <EmptyMessage>친구 추가 후 채팅을 시작해보세요</EmptyMessage>
                    </EmptyState>
                ) : filteredFriends.length === 0 ? (
                    <EmptyState>
                        <NoSearchResultsIcon />
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