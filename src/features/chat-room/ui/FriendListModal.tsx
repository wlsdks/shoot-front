// src/features/chat-room/ui/FriendListModal.tsx
import React, { useState, useEffect } from 'react';
import { getFriends } from '../../../shared/api';
import { useAuthContext } from '../../auth';
import { Friend, FriendResponse } from '../../../entities';
import { 
    Modal, 
    ModalBody,
    SearchInput, 
    ProfileAvatar, 
    LoadingDisplay, 
    EmptyStateDisplay 
} from '../../../shared/ui';
import {
    FriendListContainer,
    FriendItem,
    FriendInfo,
    FriendName,
    FriendUsername
} from '../styles/FriendListModal.styles';
import {
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
    const { user } = useAuthContext();
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
        <Modal isOpen={true} onClose={onClose} title="친구 선택" maxWidth="500px">
            <ModalBody>
                <SearchInput
                    placeholder="친구 검색..."
                    value={searchTerm}
                    onChange={setSearchTerm}
                />

                {loading ? (
                    <LoadingDisplay message="친구 목록을 불러오는 중..." fullHeight />
                ) : friends.length === 0 ? (
                    <EmptyStateDisplay
                        icon={<EmptyFriendsIcon />}
                        title="친구가 없습니다"
                        description="친구 추가 후 채팅을 시작해보세요"
                    />
                ) : filteredFriends.length === 0 ? (
                    <EmptyStateDisplay
                        icon={<NoSearchResultsIcon />}
                        title="검색 결과가 없습니다"
                        description="다른 검색어로 다시 시도해보세요"
                    />
                ) : (
                    <FriendListContainer>
                        {filteredFriends.map((friend) => (
                            <FriendItem key={friend.id} onClick={() => handleFriendClick(friend.id)}>
                                <ProfileAvatar
                                    imageUrl={friend.profileImageUrl && friend.profileImageUrl !== 'null' ? friend.profileImageUrl : null}
                                    name={friend.nickname || friend.username}
                                    isOnline={friend.status === '온라인'}
                                    showStatus={true}
                                    size="medium"
                                />
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
            </ModalBody>
        </Modal>
    );
};