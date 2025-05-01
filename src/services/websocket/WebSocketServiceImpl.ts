import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { WebSocketService, WebSocketMessage, TypingIndicatorMessage, MessageStatusUpdate } from "./types";
import { ChatMessageItem } from "../../pages/chat/types/ChatRoom.types";

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
                this.setupSubscriptions();
            },
            onStompError: (frame) => {
                console.error("STOMP 에러:", frame);
            },
            onWebSocketError: (event) => {
                console.error("WebSocket 에러:", event);
            }
        });

        try {
            await this.client.activate();
        } catch (error) {
            console.error("WebSocket 연결 실패:", error);
            throw error;
        }
    }

    private setupSubscriptions() {
        if (!this.client || !this.roomId) {
            console.error("WebSocket 클라이언트가 초기화되지 않았거나 roomId가 없습니다.");
            return;
        }

        if (!this.client.connected) {
            console.error("WebSocket이 연결되지 않은 상태입니다.");
            return;
        }

        // 메시지 수신 구독
        this.client.subscribe(`/topic/messages/${this.roomId}`, (message) => {
            const msg: ChatMessageItem = JSON.parse(message.body);
            
            // 여기에 자동 읽음 처리 로직 추가
            if (
                document.visibilityState === "visible" && 
                msg.senderId !== this.userId && 
                msg.id // tempId가 아닌 실제 id가 있을 때만
            ) {
                console.log(`자동 읽음 처리 전송: 메시지 ${msg.id}`);
                this.sendReadStatus(msg.id);
            }
            
            // 기존 콜백 호출 유지
            this.messageCallbacks.forEach(callback => callback(msg));
        });

        // 타이핑 인디케이터 구독
        this.client.subscribe(`/topic/typing/${this.roomId}`, (message) => {
            const typingMsg: TypingIndicatorMessage = JSON.parse(message.body);
            this.typingIndicatorCallbacks.forEach(callback => callback(typingMsg));
        });

        // 메시지 상태 구독
        this.client.subscribe(`/topic/message/status/${this.roomId}`, (message) => {
            const statusUpdate = JSON.parse(message.body);
            this.messageStatusCallbacks.forEach(callback => callback(statusUpdate));
        });

        // 메시지 업데이트 구독
        this.client.subscribe(`/topic/message/update/${this.roomId}`, (message) => {
            const updatedMessage = JSON.parse(message.body);
            this.messageUpdateCallbacks.forEach(callback => callback(updatedMessage));
        });

        // 읽음 처리 상태 구독
        this.client.subscribe(`/topic/read-bulk/${this.roomId}`, (message) => {
            const data = JSON.parse(message.body);
            this.readBulkCallbacks.forEach(callback => callback(data));
        });

        // 개별 읽음 처리 상태 구독
        this.client.subscribe(`/topic/read/${this.roomId}`, (message) => {
            try {
                const data = JSON.parse(message.body);
                console.log("읽음 처리 메시지 수신:", data);
                
                // 읽음 처리 특화 콜백을 별도로 호출
                if (data.messageId && data.userId) {
                    this.readCallbacks.forEach(callback => callback(data));
                    console.log(`메시지 ${data.messageId} 읽음 처리 완료:`, data);
                } else {
                    console.warn("읽음 처리 데이터 형식 오류:", data);
                }
            } catch (error) {
                console.error("읽음 처리 이벤트 처리 오류:", error);
            }
        });
        

        // 핀 상태 변경 구독
        this.client.subscribe(`/topic/pin/${this.roomId}`, () => {
            this.pinUpdateCallbacks.forEach(callback => callback());
        });

        // 동기화 구독
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
        if (!this.client?.connected) return;
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
        if (!this.client?.connected || !this.roomId || !this.userId) return;
        
        this.client.publish({
            destination: "/app/active",
            body: JSON.stringify({ userId: this.userId, roomId: this.roomId, active })
        });
    }

    sendReadStatus(messageId: string): void {
        if (!this.client?.connected || !this.userId) {
            console.warn("읽음 상태 전송 불가: 연결 끊김", { messageId, connected: this.client?.connected });
            return;
        }
        
        const payload = { messageId: messageId, userId: this.userId };
        console.log("읽음 상태 전송 시작:", payload);
        
        this.client.publish({
            destination: "/app/read",
            body: JSON.stringify(payload)
        });
        console.log("읽음 상태 전송 완료:", payload);
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