export interface UserCode {
    id: number;
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