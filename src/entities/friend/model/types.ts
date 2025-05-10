import { User } from '../../user';

export interface Friend extends User {
    isFriend: boolean;
    isPending: boolean;
    isIncoming: boolean;
    isOutgoing: boolean;
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