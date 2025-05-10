export interface UserResponse {
    id: string;
    username: string;
    nickname: string;
    status: string;
    profileImageUrl: string | null;
    backgroundImageUrl: string | null;
    bio: string | null;
    userCode: string;
    lastSeenAt: string | null;
} 