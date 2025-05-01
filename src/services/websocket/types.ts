import { Client } from "@stomp/stompjs";
import { ChatMessageItem, MessageStatus } from "../../pages/chat/types/ChatRoom.types";

export interface WebSocketMessage {
    roomId: number;
    userId: number;
    lastMessageId?: string;
    timestamp: string;
    direction?: "INITIAL" | "BEFORE" | "AFTER";
}

export interface TypingIndicatorMessage {
    roomId: number;
    userId: number;
    username: string;
    isTyping: boolean;
}

export interface MessageStatusUpdate {
    tempId: string;
    status: MessageStatus;
    persistedId?: string;
    createdAt?: string;
    errorMessage?: string;
}

export interface WebSocketService {
    connect: (roomId: number, userId: number) => Promise<void>;
    disconnect: () => void;
    sendMessage: (message: ChatMessageItem) => void;
    sendTypingIndicator: (isTyping: boolean) => void;
    sendActiveStatus: (active: boolean) => void;
    requestSync: (lastMessageId?: string, direction?: "INITIAL" | "BEFORE" | "AFTER") => void;
    onMessage: (callback: (message: ChatMessageItem) => void) => void;
    onTypingIndicator: (callback: (message: TypingIndicatorMessage) => void) => void;
    onMessageStatus: (callback: (update: MessageStatusUpdate) => void) => void;
    onMessageUpdate: (callback: (message: ChatMessageItem) => void) => void;
    onReadBulk: (callback: (data: { messageIds: string[], userId: number }) => void) => void;
    onPinUpdate: (callback: () => void) => void;
    onSync: (callback: (data: { roomId: number, direction?: string, messages: any[] }) => void) => void;
    isConnected: () => boolean;
} 