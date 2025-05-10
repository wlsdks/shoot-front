export interface Friend {
    id: number;
    username: string;
    nickname: string;
    status: string;
    profileImageUrl: string | null;
    backgroundImageUrl: string | null;
    bio: string | null;
    userCode: string;
    lastSeenAt: string | null;
} 