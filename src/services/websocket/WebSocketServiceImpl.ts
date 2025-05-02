import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { WebSocketService, WebSocketMessage, TypingIndicatorMessage, MessageStatusUpdate } from "./types";
import { ChatMessageItem, MessageStatus } from "../../pages/chat/types/ChatRoom.types";

export class WebSocketServiceImpl implements WebSocketService {
    private client: Client | null = null;
    private roomId: number | null = null;
    private userId: number | null = null;
    private messageCallbacks: ((message: ChatMessageItem) => void)[] = [];
    private typingIndicatorCallbacks: ((message: TypingIndicatorMessage) => void)[] = [];
    private messageStatusCallbacks: ((update: MessageStatusUpdate) => void)[] = [];
    private messageUpdateCallbacks: ((message: ChatMessageItem) => void)[] = [];
    private readBulkCallbacks: ((data: { messageIds: string[], userId: number }) => void)[] = [];
    private readCallbacks: ((data: { messageId: string, userId: number, readBy: Record<string, boolean> }) => void)[] = [];
    private pinUpdateCallbacks: (() => void)[] = [];
    private syncCallbacks: ((data: { roomId: number, direction?: string, messages: any[] }) => void)[] = [];

    async connect(roomId: number, userId: number): Promise<void> {
        this.roomId = roomId;
        this.userId = userId;

        const token = localStorage.getItem("accessToken");
        if (!token) {
            throw new Error("No access token found");
        }

        const socket = new SockJS(`http://localhost:8100/ws/chat?token=${token}`);
        
        this.client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            debug: () => {},
            onConnect: () => {
                console.log("WebSocket connected successfully");
                this.setupSubscriptions();
                // Send active status immediately on connect
                this.sendActiveStatus(true);
                // Mark all messages as read on initial connection
                setTimeout(() => {
                    this.markAllMessagesAsRead();
                }, 1000);
            },
            onStompError: (frame) => {
                console.error("STOMP error:", frame);
            },
            onWebSocketError: (event) => {
                console.error("WebSocket error:", event);
            }
        });

        try {
            await this.client.activate();
        } catch (error) {
            console.error("WebSocket connection failed:", error);
            throw error;
        }
    }

    private setupSubscriptions() {
        if (!this.client || !this.roomId) {
            console.error("WebSocket client not initialized or no roomId");
            return;
        }

        if (!this.client.connected) {
            console.error("WebSocket not connected");
            return;
        }

        // Message subscription
        this.client.subscribe(`/topic/messages/${this.roomId}`, (message) => {
            try {
                const msg: ChatMessageItem = JSON.parse(message.body);
                this.messageCallbacks.forEach(callback => callback(msg));
            } catch (error) {
                console.error("Error processing message:", error);
            }
        });

        // Typing indicator subscription
        this.client.subscribe(`/topic/typing/${this.roomId}`, (message) => {
            const typingMsg: TypingIndicatorMessage = JSON.parse(message.body);
            this.typingIndicatorCallbacks.forEach(callback => callback(typingMsg));
        });

        // Message status subscription
        this.client.subscribe(`/topic/message/status/${this.roomId}`, (message) => {
            try {
                const statusUpdate = JSON.parse(message.body);
                this.messageStatusCallbacks.forEach(callback => callback(statusUpdate));
            } catch (error) {
                console.error("Error processing message status:", error);
            }
        });

        // Message update subscription
        this.client.subscribe(`/topic/message/update/${this.roomId}`, (message) => {
            const updatedMessage = JSON.parse(message.body);
            this.messageUpdateCallbacks.forEach(callback => callback(updatedMessage));
        });

        // Bulk read status subscription
        this.client.subscribe(`/topic/read-bulk/${this.roomId}`, (message) => {
            try {
                const data = JSON.parse(message.body);
                this.readBulkCallbacks.forEach(callback => callback(data));
            } catch (error) {
                console.error("Error processing bulk read status:", error);
            }
        });

        // Read status update subscription
        this.client.subscribe(`/topic/read-status/${this.roomId}`, (message) => {
            try {
                const data = JSON.parse(message.body);
                if (data.messageId && data.readBy) {
                    this.messageUpdateCallbacks.forEach(callback => callback({
                        id: data.messageId,
                        readBy: data.readBy
                    } as ChatMessageItem));
                }
            } catch (error) {
                console.error("Error processing read status update:", error);
            }
        });

        // Pin status subscription
        this.client.subscribe(`/topic/pin/${this.roomId}`, () => {
            this.pinUpdateCallbacks.forEach(callback => callback());
        });

        // Sync subscription
        this.client.subscribe(`/user/queue/sync`, (message) => {
            const syncData = JSON.parse(message.body);
            this.syncCallbacks.forEach(callback => callback(syncData));
        });
    }

    disconnect(): void {
        if (this.client && this.client.connected) {
            this.sendActiveStatus(false);
            this.client.deactivate();
        }
    }

    sendMessage(message: ChatMessageItem): void {
        if (!this.client?.connected) {
            console.warn("Cannot send message: WebSocket not connected");
            return;
        }
        this.client.publish({
            destination: "/app/chat",
            body: JSON.stringify(message)
        });
    }

    sendTypingIndicator(isTyping: boolean): void {
        if (!this.client?.connected || !this.roomId || !this.userId) return;
        
        const typingPayload: TypingIndicatorMessage = {
            roomId: this.roomId,
            userId: this.userId,
            username: localStorage.getItem("username") || "Unknown",
            isTyping
        };

        this.client.publish({
            destination: "/app/typing",
            body: JSON.stringify(typingPayload)
        });
    }

    sendActiveStatus(active: boolean): void {
        if (!this.client?.connected || !this.roomId || !this.userId) {
            console.warn("Cannot send active status: WebSocket not connected or missing roomId/userId");
            return;
        }
        
        const payload = JSON.stringify({ 
            userId: this.userId, 
            roomId: this.roomId, 
            active 
        });
        
        console.log("Sending active status:", payload);
        
        this.client.publish({
            destination: "/app/active",
            body: payload
        });
    }

    // Improved read status method
    sendReadStatus(messageId: string): void {
        if (!this.client?.connected || !this.userId || !this.roomId) {
            console.warn("Cannot send read status: WebSocket not connected or missing data", { 
                messageId, 
                connected: this.client?.connected, 
                userId: this.userId,
                roomId: this.roomId
            });
            return;
        }
        
        const payload = { 
            messageId, 
            userId: this.userId,
            roomId: this.roomId
        };
        
        console.log("Sending read status via WebSocket:", payload);
        
        try {
            this.client.publish({
                destination: "/app/read",
                body: JSON.stringify(payload),
                headers: { 
                    'content-type': 'application/json'
                }
            });
            console.log("Read status sent successfully");
        } catch (error) {
            console.error("Error sending read status:", error);
        }
    }

    // New method to mark all messages as read on chat room entry
    markAllMessagesAsRead(): void {
        if (!this.client?.connected || !this.roomId || !this.userId) {
            console.warn("Cannot mark all as read: WebSocket not connected or missing data", {
                connected: this.client?.connected,
                roomId: this.roomId,
                userId: this.userId
            });
            return;
        }

        const payload = {
            roomId: this.roomId,
            userId: this.userId,
            requestId: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
        };
        
        try {
            this.client.publish({
                destination: "/app/read-all",
                body: JSON.stringify(payload),
                headers: { 
                    'content-type': 'application/json'
                }
            });
        } catch (error) {
            console.error("Error marking all messages as read:", error);
        }
    }

    requestSync(lastMessageId?: string, direction: "INITIAL" | "BEFORE" | "AFTER" = "INITIAL"): void {
        if (!this.client?.connected || !this.roomId || !this.userId) return;

        const syncMessage: WebSocketMessage = {
            roomId: this.roomId,
            userId: this.userId,
            lastMessageId,
            timestamp: new Date().toISOString(),
            direction
        };

        this.client.publish({
            destination: "/app/sync",
            body: JSON.stringify(syncMessage)
        });
    }

    onMessage(callback: (message: ChatMessageItem) => void): void {
        this.messageCallbacks.push(callback);
    }

    onTypingIndicator(callback: (message: TypingIndicatorMessage) => void): void {
        this.typingIndicatorCallbacks.push(callback);
    }

    onMessageStatus(callback: (update: MessageStatusUpdate) => void): void {
        this.messageStatusCallbacks.push(callback);
    }

    onMessageUpdate(callback: (message: ChatMessageItem) => void): void {
        this.messageUpdateCallbacks.push(callback);
    }

    onReadBulk(callback: (data: { messageIds: string[], userId: number }) => void): void {
        this.readBulkCallbacks.push(callback);
    }

    onRead(callback: (data: { messageId: string, userId: number, readBy: Record<string, boolean> }) => void): void {
        this.readCallbacks.push(callback);
    }

    onPinUpdate(callback: () => void): void {
        this.pinUpdateCallbacks.push(callback);
    }

    onSync(callback: (data: { roomId: number, direction?: string, messages: any[] }) => void): void {
        this.syncCallbacks.push(callback);
    }

    isConnected(): boolean {
        return this.client?.connected || false;
    }
}