export interface User {
    id: number;
    username: string;
    nickname?: string;
    bio?: string;
    profileImageUrl?: string;
    status?: string;
    userCode?: string;
}

export interface UserDTO {
    id: string;
    username: string;
    nickname: string;
    status: string;
    profileImageUrl?: string | null;
    userCode?: string;
} 