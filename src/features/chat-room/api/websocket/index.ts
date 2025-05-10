import { WebSocketService } from "./types";
import { WebSocketServiceImpl } from "./WebSocketServiceImpl";

let webSocketService: WebSocketService | null = null;

export const createWebSocketService = (): WebSocketService => {
    if (!webSocketService) {
        webSocketService = new WebSocketServiceImpl();
    }
    return webSocketService;
};

export const resetWebSocketService = () => {
    webSocketService = null;
};

export type { WebSocketService }; 