import { Friend } from '../../../../entities';
import { FriendResponse } from '../../../../entities';

export const convertToFriend = (response: FriendResponse): Friend => ({
    id: response.id,
    username: response.username,
    nickname: response.nickname,
    status: response.status || "온라인",
    profileImageUrl: response.profileImageUrl || undefined,
    backgroundImageUrl: null,
    bio: response.bio || undefined,
    userCode: "",
    lastSeenAt: null,
    isFriend: response.isFriend,
    isPending: response.isPending,
    isIncoming: response.isIncoming,
    isOutgoing: response.isOutgoing
}); 