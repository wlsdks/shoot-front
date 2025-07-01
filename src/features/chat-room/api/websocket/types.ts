// types.ts 파일을 수정합니다
export interface WebSocketService {
    connect(roomId: number, userId: number): Promise<void>;
    disconnect(): void;
    isConnected(): boolean;
    sendMessage(message: any): void;
    onMessage(callback: (message: any) => void): void;
    onMessageStatus(callback: (update: MessageStatusUpdate) => void): void;
    onTypingIndicator(callback: (typingMsg: any) => void): void;
    onMessageUpdate(callback: (updatedMessage: any) => void): void;
    onRead(callback: (data: any) => void): void;
    onReadBulk(callback: (data: any) => void): void;
    onPinUpdate(callback: () => void): void;
    onSync(callback: (syncResponse: any) => void): void;
    clearAllHandlers(): void;
    markAllMessagesAsRead(): void;
    sendTypingIndicator(isTyping: boolean): void;
    sendActiveStatus(isActive: boolean): void;
    requestSync(lastMessageId?: string, direction?: string, limit?: number): void;
}

export interface WebSocketMessage {
    roomId: number;
    userId: number;
    lastMessageId?: string;
    timestamp: string;
    direction?: string;
    limit?: number;
}

export interface TypingIndicatorMessage {
    roomId: number;
    userId: number;
    username: string;
    isTyping: boolean;
}

export interface MessageStatusUpdate {
    tempId: string;
    status: string;
    persistedId?: string;
    createdAt?: string;
    errorMessage?: string;
}