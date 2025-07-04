// WebSocket 관련 API 통합
export { 
    createWebSocketService, 
    getWebSocketService, 
    resetWebSocketService 
} from '../lib/websocket';

export type {
    WebSocketService,
    WebSocketConfig,
    WebSocketMessage,
    Message,
    TypingIndicatorMessage,
    MessageStatusUpdate
} from '../lib/websocket'; 