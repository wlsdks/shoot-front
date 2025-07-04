// 공통 타입 정의
export interface AuthContextType {
    user: any;
    isAuthenticated: boolean;
    loading: boolean;
    login: (username: string, password: string) => Promise<any>;
    logout: () => void;
}

// 리액션 관련 공통 타입
export interface ReactionType {
    code: string;
    emoji: string;
    description: string;
}

// 메시지 리액션 Props
export interface MessageReactionProps {
    messageId: string;
    userId?: number;
    reactions?: any[];
    onReactionUpdate?: (messageId: string, reactions: any[]) => void;
}

// 컨텍스트 메뉴 관련 타입
export interface ContextMenuState {
    visible: boolean;
    x: number;
    y: number;
    message: any | null;
}

// 웹소켓 관련 공통 타입
export interface WebSocketHandlers {
    onMessage?: (message: any) => void;
    onStatus?: (status: any) => void;
    onTyping?: (typing: any) => void;
}

// API 응답 표준 형식
export interface StandardResponse<T = any> {
    success: boolean;
    data: T;
    message?: string;
    code?: number;
} 