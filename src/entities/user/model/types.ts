export interface User {
    id: number;
    username: string;
    nickname?: string;
    bio?: string;
    profileImageUrl?: string;
    status?: string;
    userCode?: string;
}

// API 응답용 타입 (백엔드에서 받는 형태)
export interface UserResponse {
    id: number; // 일관성을 위해 number로 통일
    username: string;
    nickname: string;
    status: string;
    profileImageUrl: string | null;
    backgroundImageUrl: string | null;
    bio: string | null;
    userCode: string;
    lastSeenAt: string | null;
}

// 레거시 DTO (필요시 제거 예정)
export interface UserDTO {
    id: string;
    username: string;
    nickname: string;
    status: string;
    profileImageUrl?: string | null;
    userCode?: string;
} 