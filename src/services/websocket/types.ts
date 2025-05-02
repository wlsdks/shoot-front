import { ChatMessageItem } from "../../pages/chat/types/ChatRoom.types";

// types.ts 파일을 수정합니다
export interface WebSocketService {
    connect(roomId: number, userId: number): Promise<void>;
    disconnect(): void;
    sendMessage(message: ChatMessageItem): void;
    sendTypingIndicator(isTyping: boolean): void;
    sendActiveStatus(active: boolean): void;
    sendReadStatus(messageId: string): void; // 읽음 상태 전송 메서드 추가
    markAllMessagesAsRead(): void;
    requestSync(lastMessageId?: string, direction?: "INITIAL" | "BEFORE" | "AFTER"): void;
    onMessage(callback: (message: ChatMessageItem) => void): void;
    onTypingIndicator(callback: (message: TypingIndicatorMessage) => void): void;
    onMessageStatus(callback: (update: MessageStatusUpdate) => void): void;
    onMessageUpdate(callback: (message: ChatMessageItem) => void): void;
    onReadBulk(callback: (data: { messageIds: string[], userId: number }) => void): void;
    onRead(callback: (data: { messageId: string, userId: number, readBy: Record<string, boolean> }) => void): void; // 읽음 상태 콜백 추가
    onPinUpdate(callback: () => void): void;
    onSync(callback: (data: { roomId: number, direction?: string, messages: any[] }) => void): void;
    isConnected(): boolean;
}

export interface WebSocketMessage {
    roomId: number;
    userId: number;
    lastMessageId?: string;
    timestamp: string;
    direction?: string;
}

export interface TypingIndicatorMessage {
    roomId: number;
    userId: number;
    username: string;
    isTyping: boolean;
}

export interface MessageStatusUpdate {
    tempId: string;
    messageId?: string;
    persistedId?: string;
    status: string;
    timestamp?: string;
    errorMessage?: string;
}