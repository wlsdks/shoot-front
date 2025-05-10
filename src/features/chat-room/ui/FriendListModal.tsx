import React, { useState, useEffect } from 'react';
import { getFriends } from '../../../features/social/api/friends';
import { useAuth } from '../../../shared/lib/context/AuthContext';
import { Friend, FriendResponse } from '../../../entities/friend';
import {
    ModalOverlay,
    ModalContent,
    Title,
    FriendList,
    FriendItem,
    ProfileImage,
    ProfileInitial,
    FriendInfo,
    Username,
    Nickname,
    CloseButton
} from '../styles/FriendListModal.styles';

interface FriendListModalProps {
  onClose: () => void;
  onSelectFriend: (roomId: number) => void;
}

export const FriendListModal: React.FC<FriendListModalProps> = ({
  onClose,
  onSelectFriend
}) => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

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
          isOutgoing: false
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

  const handleFriendClick = async (friendId: number) => {
    if (!user) return;
    try {
      onSelectFriend(friendId);
      onClose();
    } catch (error) {
      console.error('친구 선택에 실패했습니다:', error);
    }
  };

  const renderProfileImage = (friend: Friend) => {
    if (friend.profileImageUrl && friend.profileImageUrl !== 'null') {
      return <ProfileImage src={friend.profileImageUrl} alt={friend.username} />;
    }
    return <ProfileInitial>{friend.username.charAt(0).toUpperCase()}</ProfileInitial>;
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>&times;</CloseButton>
        <Title>친구 선택</Title>
        {loading ? (
          <div>로딩 중...</div>
        ) : friends.length === 0 ? (
          <div>친구가 없습니다.</div>
        ) : (
          <FriendList>
            {friends.map(friend => (
              <FriendItem
                key={friend.id}
                onClick={() => handleFriendClick(friend.id)}
              >
                {renderProfileImage(friend)}
                <FriendInfo>
                  <Username>{friend.username}</Username>
                  {friend.nickname && <Nickname>{friend.nickname}</Nickname>}
                </FriendInfo>
              </FriendItem>
            ))}
          </FriendList>
        )}
      </ModalContent>
    </ModalOverlay>
  );
}; 