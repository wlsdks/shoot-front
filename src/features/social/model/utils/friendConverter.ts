import { Friend } from '../../types/friend';
import { FriendResponse } from '../../../../entities/friend';

export const convertToFriend = (response: FriendResponse): Friend => ({
    id: response.id,
    username: response.username,
    nickname: response.nickname,
    status: response.status || "온라인",
    profileImageUrl: response.profileImageUrl || null,
    backgroundImageUrl: null,
    bio: response.bio || null,
    userCode: "",
    lastSeenAt: null
}); 