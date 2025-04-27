export interface Friend {
    id: number;
    name: string;
    username: string;
    nickname?: string;
    status: string;
    profileImage?: string;
    profileImageUrl?: string;
    bio?: string;
    mutualFriends?: number;
    commonInterests?: string[];
}

export interface FriendRequest {
    id: number;
    senderId: number;
    receiverId: number;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: string;
}

export interface FriendRecommendation extends Friend {
    mutualFriends?: number;
    commonInterests?: string[];
}

export interface FriendResponse {
    id: number;
    username: string;
    nickname?: string;
    profileImageUrl?: string;
} 