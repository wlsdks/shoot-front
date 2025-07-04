// Chat room feature API re-exports from shared
export { 
    createWebSocketService, 
    getWebSocketService, 
    resetWebSocketService 
} from '../../../shared/api/websocket';

export type {
    WebSocketService,
    WebSocketConfig,
    WebSocketMessage,
    Message,
    TypingIndicatorMessage,
    MessageStatusUpdate
} from '../../../shared/api/websocket';

// Chat room specific API
export * from './chatRoom'; 