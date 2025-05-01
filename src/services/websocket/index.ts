import { WebSocketService } from "./types";
import { WebSocketServiceImpl } from "./WebSocketServiceImpl";

let instance: WebSocketService | null = null;

const createWebSocketService = (): WebSocketService => {
    if (!instance) {
        instance = new WebSocketServiceImpl();
    }
    return instance;
};

const getWebSocketService = (): WebSocketService | null => {
    return instance;
};

const resetWebSocketService = (): void => {
    if (instance) {
        instance.disconnect();
        instance = null;
    }
};

export { createWebSocketService, getWebSocketService, resetWebSocketService };
export type { WebSocketService }; 