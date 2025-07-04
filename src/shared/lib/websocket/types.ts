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
    onPinUpdate(callback: () => void): void;
    onSync(callback: (syncResponse: { roomId: number, direction?: string, messages: any[] }) => void): void;
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