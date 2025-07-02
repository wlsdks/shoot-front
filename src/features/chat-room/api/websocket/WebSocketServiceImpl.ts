import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { WebSocketService, WebSocketMessage, TypingIndicatorMessage, MessageStatusUpdate } from "./types";
import { Message as ChatMessageItem } from "../../../../entities";

export class WebSocketServiceImpl implements WebSocketService {
    private client: Client | null = null;
    private roomId: number | null = null;
    private userId: number | null = null;
    private isConnecting: boolean = false;
    // 메시지 수신 콜백 목록
    private messageCallbacks: ((message: ChatMessageItem) => void)[] = [];
    // 타이핑 상태 변경 콜백 목록
    private typingIndicatorCallbacks: ((message: TypingIndicatorMessage) => void)[] = [];
    // 메시지 상태 변경 콜백 목록 (전송 중, 전송 완료 등)
    private messageStatusCallbacks: ((update: MessageStatusUpdate) => void)[] = [];
    // 메시지 업데이트 콜백 목록 (수정, 삭제 등)
    private messageUpdateCallbacks: ((message: ChatMessageItem) => void)[] = [];
    // 여러 메시지 읽음 처리 콜백 목록
    private readBulkCallbacks: ((data: { messageIds: string[], userId: number }) => void)[] = [];
    // 개별 메시지 읽음 처리 콜백 목록
    private readCallbacks: ((data: { messageId: string, userId: number, readBy: Record<string, boolean> }) => void)[] = [];
    // 메시지 고정 상태 변경 콜백 목록
    private pinUpdateCallbacks: (() => void)[] = [];
    // 메시지 동기화 콜백 목록
    private syncCallbacks: ((data: { roomId: number, direction?: string, messages: any[] }) => void)[] = [];
    private activeStatusDebounceTimeout: NodeJS.Timeout | null = null;
    private lastActiveStatus: boolean | null = null;

    

    constructor() {
        // constructor에서는 client 생성하지 않음 (connect 시점에 생성)
        this.client = null;
    }

    async connect(roomId: number, userId: number): Promise<void> {
        if (this.isConnecting) {
            return;
        }
        
        this.isConnecting = true;
        this.roomId = roomId;
        this.userId = userId;

        const token = localStorage.getItem("accessToken");
        if (!token) {
            this.isConnecting = false;
            throw new Error("No access token found");
        }

        const socket = new SockJS(`http://localhost:8100/ws/chat?token=${token}`);
        
        this.client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            debug: () => {},
            onConnect: () => {
                this.isConnecting = false;
                this.subscribeToMessages();
                // Send active status immediately on connect
                this.sendActiveStatus(true);
                // Mark all messages as read on initial connection
                setTimeout(() => {
                    this.markAllMessagesAsRead();
                }, 1000);
            },
            onStompError: (frame) => {
                console.error("❌ STOMP error:", frame);
                this.isConnecting = false;
            },
            onWebSocketError: (event) => {
                console.error("❌ WebSocket error:", event);
                this.isConnecting = false;
            }
        });

        try {
            await this.client.activate();
        } catch (error) {
            console.error("WebSocket connection failed:", error);
            this.isConnecting = false;
            throw error;
        }
    }

    private subscribeToMessages(): void {
        if (!this.client || !this.roomId) {
            console.error("WebSocket client not initialized or no roomId");
            return;
        }

        if (!this.client.connected) {
            console.error("WebSocket not connected");
            return;
        }

        // 일반 메시지 수신 구독 (새로운 메시지가 올 때마다 호출)
        this.client.subscribe(`/topic/messages/${this.roomId}`, (message) => {
            try {
                const msg: ChatMessageItem = JSON.parse(message.body);
                this.messageCallbacks.forEach(callback => callback(msg));
            } catch (error) {
                console.error("Error processing message:", error);
            }
        });

        // 타이핑 상태 변경 구독 (누군가 타이핑을 시작/종료할 때 호출)
        this.client.subscribe(`/topic/typing/${this.roomId}`, (message) => {
            const typingMsg: TypingIndicatorMessage = JSON.parse(message.body);
            this.typingIndicatorCallbacks.forEach(callback => callback(typingMsg));
        });

        // 메시지 상태 변경 구독 (전송 중, 전송 완료, 실패 등 상태 변경 시 호출)
        this.client.subscribe(`/topic/message/status/${this.roomId}`, (message) => {
            try {
                const statusUpdate = JSON.parse(message.body);
                this.messageStatusCallbacks.forEach(callback => callback(statusUpdate));
            } catch (error) {
                console.error("Error processing message status:", error);
            }
        });

        // 메시지 업데이트 구독 (메시지 수정, 삭제 등 변경 시 호출)
        this.client.subscribe(`/topic/message/update/${this.roomId}`, (message) => {
            const updatedMessage = JSON.parse(message.body);
            this.messageUpdateCallbacks.forEach(callback => callback(updatedMessage));
        });

        // 여러 메시지 읽음 처리 구독 (여러 메시지를 한 번에 읽음 처리할 때 호출)
        this.client.subscribe(`/topic/read-bulk/${this.roomId}`, (message) => {
            try {
                const data = JSON.parse(message.body);
                this.readBulkCallbacks.forEach(callback => callback(data));
            } catch (error) {
                console.error("Error processing bulk read status:", error);
            }
        });

        // 개별 메시지 읽음 처리 구독 (한 메시지를 읽음 처리할 때 호출)
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

        // 메시지 고정 상태 변경 구독 (메시지를 고정하거나 해제할 때 호출)
        this.client.subscribe(`/topic/pin/${this.roomId}`, () => {
            this.pinUpdateCallbacks.forEach(callback => callback());
        });

        // 메시지 동기화 구독 (초기 로드, 이전 메시지 로드, 새 메시지 동기화 시 호출) -> 이걸로 모든 메시지를 받아옴 (api 호출 없이)
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

    isConnected(): boolean {
        return this.client?.connected || false;
    }
    
    getIsConnecting(): boolean {
        return this.isConnecting;
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

    // 콜백 등록 메서드들
    onMessage(callback: (message: ChatMessageItem) => void): void {
        this.messageCallbacks.push(callback);
    }

    onMessageStatus(callback: (update: MessageStatusUpdate) => void): void {
        this.messageStatusCallbacks.push(callback);
    }

    onTypingIndicator(callback: (message: TypingIndicatorMessage) => void): void {
        this.typingIndicatorCallbacks.push(callback);
    }

    onMessageUpdate(callback: (message: ChatMessageItem) => void): void {
        this.messageUpdateCallbacks.push(callback);
    }

    onRead(callback: (data: { messageId: string, userId: number, readBy: Record<string, boolean> }) => void): void {
        this.readCallbacks.push(callback);
    }

    onReadBulk(callback: (data: { messageIds: string[], userId: number }) => void): void {
        this.readBulkCallbacks.push(callback);
    }

    onPinUpdate(callback: () => void): void {
        this.pinUpdateCallbacks.push(callback);
    }

    onSync(callback: (data: { roomId: number, direction?: string, messages: any[] }) => void): void {
        this.syncCallbacks.push(callback);
    }

    clearAllHandlers(): void {
        this.messageCallbacks = [];
        this.typingIndicatorCallbacks = [];
        this.messageStatusCallbacks = [];
        this.messageUpdateCallbacks = [];
        this.readBulkCallbacks = [];
        this.readCallbacks = [];
        this.pinUpdateCallbacks = [];
        this.syncCallbacks = [];
    }

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

    // 메시지를 받아오기 위해 호출 (초기 로드, 이전 메시지 로드, 새 메시지 동기화 시 호출)
    requestSync(lastMessageId?: string, direction: "INITIAL" | "BEFORE" | "AFTER" = "INITIAL", limit?: number): void {
        if (!this.client?.connected || !this.roomId || !this.userId) {
            return;
        }

        const syncMessage: WebSocketMessage = {
            roomId: this.roomId,
            userId: this.userId,
            lastMessageId,
            timestamp: new Date().toISOString(),
            direction,
            limit: limit || (direction === "INITIAL" ? 50 : 20) // 초기 로드시 50개, 페이징시 20개
        };

        this.client.publish({
            destination: "/app/sync",
            body: JSON.stringify(syncMessage)
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
        
        try {
            this.client.publish({
                destination: "/app/read",
                body: JSON.stringify(payload),
                headers: { 
                    'content-type': 'application/json'
                }
            });
        } catch (error) {
            console.error("Error sending read status:", error);
        }
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
        if (this.lastActiveStatus === active) {
            return;
        }

        if (this.activeStatusDebounceTimeout) {
            clearTimeout(this.activeStatusDebounceTimeout);
        }

        this.activeStatusDebounceTimeout = setTimeout(() => {
            if (!this.client?.connected || !this.roomId || !this.userId) {
                console.warn("Cannot send active status: WebSocket not connected or missing roomId/userId");
                return;
            }
            
            const payload = JSON.stringify({ 
                userId: this.userId, 
                roomId: this.roomId, 
                active 
            });
            
            this.client.publish({
                destination: "/app/active",
                body: payload
            });

            this.lastActiveStatus = active;
        }, 500);
    }
}