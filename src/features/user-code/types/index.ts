// UserCode는 entities/user/User와 중복이므로 User 타입을 직접 사용
export type { User as UserCode } from '../../../entities/user';

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