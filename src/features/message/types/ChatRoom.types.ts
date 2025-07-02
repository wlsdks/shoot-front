import { ChatRoom } from '../../../entities';

export type { ChatRoom };

export enum MessageStatus {
    SENDING = 'SENDING',
    PROCESSING = 'PROCESSING',
    SENT_TO_KAFKA = 'SENT_TO_KAFKA',
    SAVED = 'SAVED',
    FAILED = 'FAILED'
}

// 채팅 메시지 인터페이스
export interface ChatMessageItem {
    id: string;
    tempId?: string;
    roomId: number;
    senderId: number;
    content: {
        text: string;
        type: string;
        attachments: any[];
        isEdited: boolean;
        isDeleted: boolean;
        urlPreview?: any;
    };
    createdAt: string;
    status: MessageStatus;
    readBy: Record<string, boolean>;
    reactions?: Record<string, number[]>;
    metadata?: {
        tempId?: string;
        needsUrlPreview?: boolean;
        previewUrl?: string | null;
    };
}

// 타이핑 인디케이터 메시지 인터페이스
export interface TypingIndicatorMessage {
    roomId: number;
    userId: number;
    username: string;
    isTyping: boolean;
}

export interface MessageStatusData {
    status: MessageStatus;
    messageId?: string;
    persistedId: string | null;
    createdAt: string;
}

export interface MessageStatusUpdate {
    tempId: string;
    messageId: string;
    status: MessageStatus;
    timestamp?: number;
}

export interface ChatRoomProps {
    roomId: string;
}

export interface MessageStatusInfo {
    status: MessageStatus;
    persistedId: string | null;
    createdAt: string;
} 