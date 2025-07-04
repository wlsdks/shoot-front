export interface UserCode {
    id: string | number;  // API에서 문자열로 올 수 있음
    username: string;
    nickname?: string;
    userCode?: string;
}

export interface UserCodeResponse {
    userCode: string;
}

export interface UserCodeManagerProps {
    userId: number;
    onCodeUpdate?: () => void;
}

export interface UserCodeSettingsProps {
    userId: number;
    onClose?: () => void;
} 