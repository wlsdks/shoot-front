import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import axios from "axios";
import api from "../../../shared/api/api";
import { EventSourcePolyfill } from "event-source-polyfill";
import { loginCheckApi } from "../api";
import { updateUserStatus } from '../../../shared/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User } from '../../../entities';
import { API_CONFIG, API_ENDPOINTS } from '../../../shared/api/config';

// SSE 이벤트 타입 정의
type SseEventType = 'message' | 'friendAdded' | 'chatRoomCreated' | 'heartbeat';
type SseListener = (event: MessageEvent) => void;

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    loading: boolean;
    isPending: boolean;
    error: Error | null;
    login: (user: User, token: string, refreshToken?: string) => void;
    logout: () => void;
    deleteUser: () => void;
    updateStatus: (status: string) => void;
    subscribeToSse: (eventName: SseEventType, callback: SseListener) => void;
    unsubscribeFromSse: (eventName: SseEventType, callback: SseListener) => void;
    reconnectSse: () => void;
    fetchCurrentUser: () => void;
}

interface AuthProviderProps {
    children: ReactNode;
}

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    user: null,
    loading: false,
    isPending: false,
    error: null,
    login: () => {},
    logout: () => {},
    deleteUser: () => {},
    updateStatus: () => {},
    subscribeToSse: () => {},
    unsubscribeFromSse: () => {},
    reconnectSse: () => {},
    fetchCurrentUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const sseSource = useRef<EventSourcePolyfill | null>(null);
    const listeners = useRef<Map<SseEventType, Set<SseListener>>>(new Map());
    const connectionAttemptCount = useRef<number>(0);
    const reconnectTimeout = useRef<NodeJS.Timeout>();
    const queryClient = useQueryClient();

    // 현재 사용자 정보 조회 쿼리
    const { isLoading: isLoadingUser } = useQuery({
        queryKey: ['currentUser'],
        queryFn: async () => {
            const token = localStorage.getItem(API_CONFIG.TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
            if (!token) return undefined;
            
            // 로그인 페이지에서는 API 호출을 하지 않음
            if (window.location.pathname === '/login') {
                return undefined;
            }
            
            try {
                const userData = await loginCheckApi();
                setUser(userData);
                if (!isAuthenticated) {
                    setIsAuthenticated(true);
                }
                return userData;
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.status !== 401) {
                    throw error;
                }
                return undefined;
            }
        },
        enabled: !!localStorage.getItem(API_CONFIG.TOKEN_STORAGE_KEYS.ACCESS_TOKEN),
        staleTime: API_CONFIG.QUERY_STALE_TIME.MEDIUM,
    });

    // 사용자 삭제 mutation
    const deleteUserMutation = useMutation({
        mutationFn: async () => {
            await api.delete(API_ENDPOINTS.USERS.DELETE_ME);
        },
        onSuccess: () => {
            logout();
        },
    });

    // 사용자 상태 업데이트 mutation
    const updateStatusMutation = useMutation({
        mutationFn: async (status: string) => {
            if (!user) throw new Error("사용자 정보가 없습니다.");
            return updateUserStatus(user.id, status);
        },
        onSuccess: (_, status) => {
            setUser(prev => prev ? { ...prev, status } : null);
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });
        },
    });

    const closeSSEConnection = useCallback(() => {
        if (sseSource.current) {
            sseSource.current.close();
            sseSource.current = null;
        }
        if (reconnectTimeout.current) {
            clearTimeout(reconnectTimeout.current);
        }
    }, []);

    const establishSseConnection = useCallback((u: User, token: string) => {
        closeSSEConnection();

        connectionAttemptCount.current += 1;
        const currentAttempt = connectionAttemptCount.current;

        try {
            const sseUrl = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.CHAT_ROOMS.SSE_UPDATES(u.id)}`;
            sseSource.current = new EventSourcePolyfill(sseUrl, { 
                headers: { "Authorization": `Bearer ${token}` },
                heartbeatTimeout: API_CONFIG.SSE_HEARTBEAT_TIMEOUT,
            });

            sseSource.current.onopen = () => {
                connectionAttemptCount.current = 0;
            };

            (sseSource.current as any).onmessage = function(ev: MessageEvent) {
                try {
                    JSON.parse(ev.data); // 데이터 유효성 검사
                    const listenersForEvent = listeners.current.get("message") || new Set();
                    listenersForEvent.forEach(callback => callback(ev));
                } catch (err) {
                    console.error("Failed to parse SSE data:", err);
                }
            };

            const eventTypes: SseEventType[] = ["friendAdded", "chatRoomCreated", "heartbeat"];
            eventTypes.forEach(eventType => {
                (sseSource.current as any).addEventListener(eventType, function(ev: Event) {
                    const msgEvent = ev as MessageEvent;
                    const listenersForEvent = listeners.current.get(eventType) || new Set();
                    listenersForEvent.forEach(callback => callback(msgEvent));
                });
            });

            (sseSource.current as any).onerror = function(ev: Event) {
                if (currentAttempt === connectionAttemptCount.current && sseSource.current) {
                    closeSSEConnection();
                    
                    reconnectTimeout.current = setTimeout(() => {
                        if (u.id && token && currentAttempt === connectionAttemptCount.current) {
                            establishSseConnection(u, token);
                        }
                    }, API_CONFIG.SSE_RECONNECT_DELAY);
                }
            };
        } catch (error) {
            console.error("Failed to establish SSE connection:", error);
        }
    }, [closeSSEConnection]);

    const reconnectSse = useCallback(() => {
        if (user) {
            const token = localStorage.getItem(API_CONFIG.TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
            if (token) {
                connectionAttemptCount.current = 0;
                establishSseConnection(user, token);
            }
        }
    }, [user, establishSseConnection]);

    useEffect(() => {
        const currentListeners = listeners.current;
        return () => {
            closeSSEConnection();
            currentListeners.clear();
        };
    }, [closeSSEConnection]);

    const login = useCallback((u: User, token: string, refreshToken?: string) => {
        if (!token) return;

        closeSSEConnection();
        listeners.current.clear();
        
        localStorage.setItem(API_CONFIG.TOKEN_STORAGE_KEYS.ACCESS_TOKEN, token);
        if (refreshToken) {
            localStorage.setItem(API_CONFIG.TOKEN_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        }

        setUser(u);
        setIsAuthenticated(true);
        setLoading(false);
        
        establishSseConnection(u, token);
    }, [establishSseConnection, closeSSEConnection]);

    const logout = useCallback(() => {
        closeSSEConnection();
        listeners.current.clear();
        
        localStorage.removeItem(API_CONFIG.TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(API_CONFIG.TOKEN_STORAGE_KEYS.REFRESH_TOKEN);
        
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
        
        queryClient.clear();
    }, [closeSSEConnection, queryClient]);

    const deleteUser = useCallback(async () => {
        deleteUserMutation.mutate();
    }, [deleteUserMutation]);

    const updateStatus = useCallback((status: string) => {
        updateStatusMutation.mutate(status);
    }, [updateStatusMutation]);

    const subscribeToSse = useCallback((eventName: SseEventType, callback: SseListener) => {
        if (!listeners.current.has(eventName)) {
            listeners.current.set(eventName, new Set());
        }
        listeners.current.get(eventName)?.add(callback);
    }, []);

    const unsubscribeFromSse = useCallback((eventName: SseEventType, callback: SseListener) => {
        listeners.current.get(eventName)?.delete(callback);
    }, []);

    const fetchCurrentUser = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    }, [queryClient]);

    useEffect(() => {
        if (!isLoadingUser) {
            setLoading(false);
        }
    }, [isLoadingUser]);

    const contextValue: AuthContextType = {
        isAuthenticated,
        user,
        loading: loading || isLoadingUser,
        isPending: deleteUserMutation.isPending || updateStatusMutation.isPending,
        error: deleteUserMutation.error || updateStatusMutation.error,
        login,
        logout,
        deleteUser,
        updateStatus,
        subscribeToSse,
        unsubscribeFromSse,
        reconnectSse,
        fetchCurrentUser,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}; 