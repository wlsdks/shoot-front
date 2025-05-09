export interface Friend {
    id: number;
    name: string;
    username: string;
    nickname: string;
    bio?: string;
    profileImageUrl: string;
    status: string;
}

export interface FriendResponse {
    id: number;
    username: string;
    nickname: string;
    bio?: string;
    profileImageUrl: string;
    status?: string;
    isFriend: boolean;
    isPending: boolean;
    isIncoming: boolean;
    isOutgoing: boolean;
} 