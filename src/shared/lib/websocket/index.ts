import { WebSocketService, WebSocketConfig } from "./types";
import { WebSocketServiceImpl } from "./WebSocketService";

// 싱글톤 인스턴스 관리
let webSocketInstance: WebSocketService | null = null;

/**
 * WebSocket 서비스 팩토리 함수
 * 싱글톤 패턴으로 관리되어 앱 전체에서 하나의 연결만 유지
 */
export const createWebSocketService = (config?: Partial<WebSocketConfig>): WebSocketService => {
    if (!webSocketInstance) {
        webSocketInstance = new WebSocketServiceImpl(config);
    }
    return webSocketInstance;
};

/**
 * 기존 WebSocket 서비스 인스턴스 가져오기
 */
export const getWebSocketService = (): WebSocketService | null => {
    return webSocketInstance;
};

/**
 * WebSocket 서비스 인스턴스 재설정 (테스트용)
 */
export const resetWebSocketService = (): void => {
    if (webSocketInstance) {
        webSocketInstance.disconnect();
        webSocketInstance = null;
    }
};

// 타입들 re-export
export type {
    WebSocketService,
    WebSocketConfig,
    WebSocketMessage,
    Message,
    TypingIndicatorMessage,
    MessageStatusUpdate
} from "./types"; 