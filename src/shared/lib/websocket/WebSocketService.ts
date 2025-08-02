import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { WebSocketService, WebSocketMessage, TypingIndicatorMessage, MessageStatusUpdate, WebSocketConfig, ReactionUpdateMessage, ReactionResponse, ReactionRequest, PinUpdateMessage, PinMessageRequest } from "./types";
import { Message } from "../../../entities";

// 기본 설정
const DEFAULT_CONFIG: WebSocketConfig = {
    baseUrl: "http://localhost:8100/ws/chat",
    reconnectDelay: 5000,
    maxReconnectAttempts: 5,
    heartbeatInterval: 30000
};

export class WebSocketServiceImpl implements WebSocketService {
    private client: Client | null = null;
    private roomId: number | null = null;
    private userId: number | null = null;
    private isConnecting: boolean = false;
    private config: WebSocketConfig;
    
    // 콜백 배열들
    private messageCallbacks: ((message: Message) => void)[] = [];
    private typingIndicatorCallbacks: ((message: TypingIndicatorMessage) => void)[] = [];
    private messageStatusCallbacks: ((update: MessageStatusUpdate) => void)[] = [];
    private messageUpdateCallbacks: ((message: Message) => void)[] = [];
    private readBulkCallbacks: ((data: { messageIds: string[], userId: number }) => void)[] = [];
    private readCallbacks: ((data: { messageId: string, userId: number, readBy: Record<string, boolean> }) => void)[] = [];
    private pinUpdateCallbacks: ((update: PinUpdateMessage) => void)[] = [];
    private syncCallbacks: ((data: { roomId: number, direction?: string, messages: any[] }) => void)[] = [];
    // Reaction 관련 콜백들 추가
    private reactionUpdateCallbacks: ((update: ReactionUpdateMessage) => void)[] = [];
    private reactionResponseCallbacks: ((response: ReactionResponse) => void)[] = [];
    
    // 상태 관리
    private activeStatusDebounceTimeout: NodeJS.Timeout | null = null;
    private lastActiveStatus: boolean | null = null;

    constructor(config: Partial<WebSocketConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
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

        const socket = new SockJS(`${this.config.baseUrl}?token=${token}`);
        
        this.client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: this.config.reconnectDelay,
            debug: () => {}, // 프로덕션에서는 비활성화
            onConnect: () => {
                this.isConnecting = false;
                this.subscribeToMessages();
                this.sendActiveStatus(true);
                // 초기 연결 시 모든 메시지 읽음 처리
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
        // 클라이언트 또는 방 아이디가 없으면 종료
        if (!this.client || !this.roomId) {
            console.error("WebSocket client not initialized or no roomId");
            return;
        }

        // 연결 상태 확인
        if (!this.client.connected) {
            console.error("WebSocket not connected");
            return;
        }

        // 메시지 수신 구독
        this.client.subscribe(`/topic/messages/${this.roomId}`, (message) => {
            try {
                const msg: Message = JSON.parse(message.body);
                this.messageCallbacks.forEach(callback => callback(msg));
            } catch (error) {
                console.error("Error processing message:", error);
            }
        });

        // 타이핑 상태 구독
        this.client.subscribe(`/topic/typing/${this.roomId}`, (message) => {
            const typingMsg: TypingIndicatorMessage = JSON.parse(message.body);
            this.typingIndicatorCallbacks.forEach(callback => callback(typingMsg));
        });

        // 메시지 상태 구독
        this.client.subscribe(`/topic/message/status/${this.roomId}`, (message) => {
            try {
                const statusUpdate = JSON.parse(message.body);
                this.messageStatusCallbacks.forEach(callback => callback(statusUpdate));
            } catch (error) {
                console.error("Error processing message status:", error);
            }
        });

        // 메시지 업데이트 구독
        this.client.subscribe(`/topic/message/update/${this.roomId}`, (message) => {
            const updatedMessage = JSON.parse(message.body);
            this.messageUpdateCallbacks.forEach(callback => callback(updatedMessage));
        });

        // 읽음 처리 구독들
        this.client.subscribe(`/topic/read-bulk/${this.roomId}`, (message) => {
            try {
                const data = JSON.parse(message.body);
                this.readBulkCallbacks.forEach(callback => callback(data));
            } catch (error) {
                console.error("Error processing bulk read status:", error);
            }
        });

        // 읽음 처리 구독
        this.client.subscribe(`/topic/read-status/${this.roomId}`, (message) => {
            try {
                const data = JSON.parse(message.body);
                if (data.messageId && data.readBy) {
                    this.messageUpdateCallbacks.forEach(callback => callback({
                        id: data.messageId,
                        readBy: data.readBy
                    } as Message));
                }
            } catch (error) {
                console.error("Error processing read status update:", error);
            }
        });

        // 동기화 구독
        this.client.subscribe(`/user/queue/sync`, (message) => {
            const syncData = JSON.parse(message.body);
            this.syncCallbacks.forEach(callback => callback(syncData));
        });

        // Reaction 관련 구독들 추가
        
        // 채팅방 전체 반응 업데이트 구독 (완전한 reactions 데이터가 포함된 토픽만 사용)
        this.client.subscribe(`/topic/message/reaction/${this.roomId}`, (message) => {
            try {
                const reactionUpdate = JSON.parse(message.body);
                
                // reactions 필드가 있는 경우만 처리 (완전한 업데이트)
                if (reactionUpdate.reactions) {
                    this.reactionUpdateCallbacks.forEach(callback => callback(reactionUpdate as ReactionUpdateMessage));
                }
            } catch (error) {
                console.error("❌ Error processing reaction update:", error);
            }
        });

        // Pin 관련 구독 추가
        this.client.subscribe(`/topic/pins/${this.roomId}`, (message) => {
            try {
                const pinUpdate = JSON.parse(message.body);
                this.pinUpdateCallbacks.forEach(callback => callback(pinUpdate as PinUpdateMessage));
            } catch (error) {
                console.error("❌ Error processing pin update:", error);
            }
        });

        // 개별 사용자 반응 응답 구독
        if (this.userId) {
            this.client.subscribe(`/queue/message/reaction/response/${this.userId}`, (message) => {
                try {
                    const reactionResponse: ReactionResponse = JSON.parse(message.body);
                    this.reactionResponseCallbacks.forEach(callback => callback(reactionResponse));
                } catch (error) {
                    console.error("❌ Error processing reaction response:", error);
                }
            });
        }
    }

    disconnect(): void {
        if (this.client && this.client.connected) {
            this.sendActiveStatus(false);
            this.client.deactivate();
        }
        this.clearAllHandlers();
    }

    isConnected(): boolean {
        return this.client?.connected || false;
    }
    
    getIsConnecting(): boolean {
        return this.isConnecting;
    }

    sendMessage(message: Message): void {
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
    onMessage(callback: (message: Message) => void): void {
        this.messageCallbacks.push(callback);
    }

    onMessageStatus(callback: (update: MessageStatusUpdate) => void): void {
        this.messageStatusCallbacks.push(callback);
    }

    onTypingIndicator(callback: (message: TypingIndicatorMessage) => void): void {
        this.typingIndicatorCallbacks.push(callback);
    }

    onMessageUpdate(callback: (message: Message) => void): void {
        this.messageUpdateCallbacks.push(callback);
    }

    onRead(callback: (data: { messageId: string, userId: number, readBy: Record<string, boolean> }) => void): void {
        this.readCallbacks.push(callback);
    }

    onReadBulk(callback: (data: { messageIds: string[], userId: number }) => void): void {
        this.readBulkCallbacks.push(callback);
    }

    onSync(callback: (data: { roomId: number, direction?: string, messages: any[] }) => void): void {
        this.syncCallbacks.push(callback);
    }

    // Reaction 관련 메서드들
    sendReaction(messageId: string, reactionType: string): void {
        if (!this.client?.connected || !this.userId) {
            console.warn("⚠️ Cannot send reaction: WebSocket not connected or missing userId");
            return;
        }

        const reactionRequest: ReactionRequest = {
            messageId,
            reactionType,
            userId: this.userId
        };

        this.client.publish({
            destination: "/app/reaction",
            body: JSON.stringify(reactionRequest)
        });
    }

    onReactionUpdate(callback: (update: ReactionUpdateMessage) => void): void {
        this.reactionUpdateCallbacks.push(callback);
    }

    onReactionResponse(callback: (response: ReactionResponse) => void): void {
        this.reactionResponseCallbacks.push(callback);
    }

    // Pin 관련 메서드들
    sendPinToggle(messageId: string): void {
        if (!this.client?.connected || !this.userId) {
            console.warn("⚠️ Cannot send pin toggle: WebSocket not connected or missing userId");
            return;
        }

        const pinRequest: PinMessageRequest = {
            messageId,
            userId: this.userId
        };

        this.client.publish({
            destination: "/app/pin/toggle",
            body: JSON.stringify(pinRequest)
        });
    }

    onPinUpdate(callback: (update: PinUpdateMessage) => void): void {
        this.pinUpdateCallbacks.push(callback);
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
        // Reaction 콜백들도 정리
        this.reactionUpdateCallbacks = [];
        this.reactionResponseCallbacks = [];
    }

    markAllMessagesAsRead(): void {
        if (!this.client?.connected || !this.roomId || !this.userId) {
            console.warn("Cannot mark messages as read: WebSocket not connected or missing roomId/userId");
            return;
        }

        this.client.publish({
            destination: "/app/read-all",
            body: JSON.stringify({
                roomId: this.roomId,
                userId: this.userId
            })
        });
    }

    sendTypingIndicator(isTyping: boolean): void {
        if (!this.client?.connected || !this.roomId || !this.userId) {
            console.warn("Cannot send typing indicator: WebSocket not connected or missing roomId/userId");
            return;
        }

        this.client.publish({
            destination: "/app/typing",
            body: JSON.stringify({
                roomId: this.roomId,
                userId: this.userId,
                isTyping
            })
        });
    }

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
            limit: limit || (direction === "INITIAL" ? 50 : 20)
        };

        this.client.publish({
            destination: "/app/sync",
            body: JSON.stringify(syncMessage)
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