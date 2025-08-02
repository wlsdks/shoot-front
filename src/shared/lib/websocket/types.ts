// WebSocket 서비스 관련 타입 정의
import { Message, TypingIndicatorMessage, MessageStatusUpdate } from '../../../entities';

// Re-export entities types for consistency
export type { Message, TypingIndicatorMessage, MessageStatusUpdate };

export interface WebSocketMessage {
    roomId: number;
    userId: number;
    lastMessageId?: string;
    timestamp: string;
    direction?: "INITIAL" | "BEFORE" | "AFTER";
    limit?: number;
}

export interface Reaction {
    userId: number;
    reactionType: string;
    createdAt?: string;
}

export interface ReactionRequest {
    messageId: string;
    reactionType: string;
    userId: number;
}

export interface ReactionUpdateMessage {
    messageId: string;
    reactions: Record<string, number[]>; // 백엔드에서 집계된 형태로 전송
    userId: number;
    reactionType: string;
    action: 'ADDED' | 'REMOVED';
}

export interface ReactionResponse {
    success: boolean;
    message: string;
    data: {
        messageId: string;
        reactions: Reaction[];
        updatedAt: string;
    } | null;
}

// 메시지 고정 관련 타입
export interface PinMessageRequest {
    messageId: string;
    userId: number;
}

export interface PinUpdateMessage {
    messageId: string;
    roomId: number;
    userId: number;
    isPinned: boolean;
    timestamp: string;
}

export interface WebSocketService {
    connect(roomId: number, userId: number): Promise<void>;
    disconnect(): void;
    isConnected(): boolean;
    sendMessage(message: any): void;
    onMessage(callback: (message: Message) => void): void;
    onMessageStatus(callback: (update: MessageStatusUpdate) => void): void;
    onTypingIndicator(callback: (typingMsg: TypingIndicatorMessage) => void): void;
    onMessageUpdate(callback: (updatedMessage: Message) => void): void;
    onRead(callback: (data: { messageId: string, userId: number, readBy: Record<string, boolean> }) => void): void;
    onReadBulk(callback: (data: { messageIds: string[], userId: number }) => void): void;
    onPinUpdate(callback: (update: PinUpdateMessage) => void): void;
    onSync(callback: (syncResponse: { roomId: number, direction?: string, messages: any[] }) => void): void;
    // Reaction 관련 메서드
    sendReaction(messageId: string, reactionType: string): void;
    onReactionUpdate(callback: (update: ReactionUpdateMessage) => void): void;
    onReactionResponse(callback: (response: ReactionResponse) => void): void;
    // Pin 관련 메서드 추가
    sendPinToggle(messageId: string): void;
    clearAllHandlers(): void;
    markAllMessagesAsRead(): void;
    sendTypingIndicator(isTyping: boolean): void;
    sendActiveStatus(isActive: boolean): void;
    requestSync(lastMessageId?: string, direction?: string, limit?: number): void;
}

export interface WebSocketConfig {
    baseUrl: string;
    reconnectDelay: number;
    maxReconnectAttempts: number;
    heartbeatInterval: number;
} 