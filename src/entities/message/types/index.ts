export enum MessageStatus {
    SENDING = 'SENDING',
    PROCESSING = 'PROCESSING',
    SENT_TO_KAFKA = 'SENT_TO_KAFKA',
    SAVED = 'SAVED',
    FAILED = 'FAILED'
}

// 메시지 컨텐츠 인터페이스
export interface MessageContent {
    text: string;
    type: string;
    attachments: any[];
    isEdited: boolean;
    isDeleted: boolean;
    urlPreview?: any;
}

// 메시지 메타데이터 인터페이스
export interface MessageMetadata {
    tempId?: string;
    needsUrlPreview?: boolean;
    previewUrl?: string | null;
}

// API에서 받는 반응 아이템 구조
export interface ReactionItem {
    reactionType: string;
    emoji: string;
    description: string;
    userIds: number[];
    count: number;
}

// 채팅 메시지 엔티티 인터페이스
export interface Message {
    id: string;
    tempId?: string;
    roomId: number;
    senderId: number;
    content: MessageContent;
    createdAt: string;
    status: MessageStatus;
    readBy: Record<string, boolean>;
    reactions?: ReactionItem[] | Record<string, number[]>; // 두 구조 모두 지원
    metadata?: MessageMetadata;
}

// 메시지 상태 정보
export interface MessageStatusInfo {
    status: MessageStatus;
    persistedId: string | null;
    createdAt: string;
}

// 메시지 상태 업데이트
export interface MessageStatusUpdate {
    tempId: string;
    messageId: string;
    status: MessageStatus;
    timestamp?: number;
}

// 메시지 상태 데이터
export interface MessageStatusData {
    status: MessageStatus;
    messageId?: string;
    persistedId: string | null;
    createdAt: string;
}

// 타이핑 인디케이터 메시지 인터페이스
export interface TypingIndicatorMessage {
    roomId: number;
    userId: number;
    username: string;
    isTyping: boolean;
} 