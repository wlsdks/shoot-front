import { useState, useCallback, useRef, useEffect } from 'react';

export interface ConnectionState {
    isConnected: boolean;
    isConnecting: boolean;
    error: string | null;
    reconnectAttempts: number;
}

export interface ConnectionConfig {
    maxReconnectAttempts?: number;
    reconnectDelay?: number;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onError?: (error: string) => void;
    onReconnectAttempt?: (attempt: number) => void;
}

export interface UseConnectionReturn {
    state: ConnectionState;
    connect: () => Promise<void>;
    disconnect: () => void;
    reconnect: () => void;
    resetConnection: () => void;
}

/**
 * 연결 상태 관리를 위한 공통 Hook
 * WebSocket, SSE 등 다양한 연결 타입에 사용 가능
 */
export function useConnection(
    connectFn: () => Promise<void>,
    disconnectFn: () => void,
    config: ConnectionConfig = {}
): UseConnectionReturn {
    const {
        maxReconnectAttempts = 5,
        reconnectDelay = 3000,
        onConnect,
        onDisconnect,
        onError,
        onReconnectAttempt
    } = config;

    const [state, setState] = useState<ConnectionState>({
        isConnected: false,
        isConnecting: false,
        error: null,
        reconnectAttempts: 0,
    });

    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const connectionAttemptCountRef = useRef(0);

    const updateState = useCallback((updates: Partial<ConnectionState>) => {
        setState(prev => ({ ...prev, ...updates }));
    }, []);

    const clearReconnectTimeout = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
    }, []);

    const connect = useCallback(async () => {
        if (state.isConnecting || state.isConnected) {
            return;
        }

        updateState({ 
            isConnecting: true, 
            error: null 
        });

        try {
            await connectFn();
            updateState({
                isConnected: true,
                isConnecting: false,
                error: null,
                reconnectAttempts: 0,
            });
            connectionAttemptCountRef.current = 0;
            onConnect?.();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            updateState({
                isConnected: false,
                isConnecting: false,
                error: errorMessage,
            });
            onError?.(errorMessage);
            throw error;
        }
    }, [state.isConnecting, state.isConnected, connectFn, updateState, onConnect, onError]);

    const disconnect = useCallback(() => {
        clearReconnectTimeout();
        
        if (state.isConnected) {
            try {
                disconnectFn();
                onDisconnect?.();
            } catch (error) {
                console.error('Disconnect error:', error);
            }
        }

        updateState({
            isConnected: false,
            isConnecting: false,
            error: null,
            reconnectAttempts: 0,
        });
        connectionAttemptCountRef.current = 0;
    }, [state.isConnected, disconnectFn, onDisconnect, updateState, clearReconnectTimeout]);

    const reconnect = useCallback(() => {
        if (state.reconnectAttempts >= maxReconnectAttempts) {
            updateState({
                error: `최대 재연결 시도 횟수(${maxReconnectAttempts})를 초과했습니다.`
            });
            return;
        }

        const attemptNumber = state.reconnectAttempts + 1;
        updateState({ 
            reconnectAttempts: attemptNumber,
            error: null 
        });
        
        onReconnectAttempt?.(attemptNumber);

        reconnectTimeoutRef.current = setTimeout(() => {
            connect().catch((error) => {
                console.error(`재연결 시도 ${attemptNumber} 실패:`, error);
                
                if (attemptNumber < maxReconnectAttempts) {
                    reconnect();
                } else {
                    updateState({
                        error: `재연결에 실패했습니다. (시도 횟수: ${maxReconnectAttempts})`
                    });
                }
            });
        }, reconnectDelay);
    }, [
        state.reconnectAttempts, 
        maxReconnectAttempts, 
        reconnectDelay, 
        connect, 
        updateState, 
        onReconnectAttempt
    ]);

    const resetConnection = useCallback(() => {
        clearReconnectTimeout();
        updateState({
            isConnected: false,
            isConnecting: false,
            error: null,
            reconnectAttempts: 0,
        });
        connectionAttemptCountRef.current = 0;
    }, [updateState, clearReconnectTimeout]);

    // 컴포넌트 언마운트 시 정리
    useEffect(() => {
        return () => {
            clearReconnectTimeout();
            disconnect();
        };
    }, [clearReconnectTimeout, disconnect]);

    return {
        state,
        connect,
        disconnect,
        reconnect,
        resetConnection,
    };
}

/**
 * 자동 재연결이 포함된 연결 관리 Hook
 */
export function useAutoReconnectConnection(
    connectFn: () => Promise<void>,
    disconnectFn: () => void,
    isConnectionHealthy: () => boolean,
    config: ConnectionConfig & { 
        healthCheckInterval?: number;
        autoReconnect?: boolean;
    } = {}
): UseConnectionReturn {
    const {
        healthCheckInterval = 30000,
        autoReconnect = true,
        ...connectionConfig
    } = config;

    const connection = useConnection(connectFn, disconnectFn, connectionConfig);
    const healthCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // 연결 상태 모니터링
    useEffect(() => {
        if (!connection.state.isConnected || !autoReconnect) {
            return;
        }

        healthCheckIntervalRef.current = setInterval(() => {
            if (!isConnectionHealthy() && connection.state.isConnected) {
                console.warn('연결 상태가 불안정합니다. 재연결을 시도합니다.');
                connection.reconnect();
            }
        }, healthCheckInterval);

        return () => {
            if (healthCheckIntervalRef.current) {
                clearInterval(healthCheckIntervalRef.current);
                healthCheckIntervalRef.current = null;
            }
        };
    }, [
        connection.state.isConnected, 
        autoReconnect, 
        healthCheckInterval, 
        isConnectionHealthy, 
        connection.reconnect
    ]);

    return connection;
} 