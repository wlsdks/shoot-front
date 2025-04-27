export interface Friend {
    id: number;
    username: string;
    profileImageUrl?: string;
    bio?: string;
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