import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import axios from "axios";
import api from "../../api/api";
import { EventSourcePolyfill } from "event-source-polyfill";
import { refreshTokenApi, loginCheckApi } from "../../../features/auth/api";
import { updateUserStatus } from '../../../features/profile/api/profile';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User } from '../../../entities/user';
import { API_CONFIG, API_ENDPOINTS } from '../../api/config';

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
        
        setUser(u);
        setIsAuthenticated(true);
        
        localStorage.setItem(API_CONFIG.TOKEN_STORAGE_KEYS.ACCESS_TOKEN, token);
        if (refreshToken) {
            localStorage.setItem(API_CONFIG.TOKEN_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        }

        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        if (u.id) {
            establishSseConnection(u, token);
        }
    }, [establishSseConnection, closeSSEConnection]);

    const logout = useCallback(() => {
        closeSSEConnection();
        
        setUser(null);
        setIsAuthenticated(false);
        
        // 토큰 및 저장된 데이터 정리
        Object.values(API_CONFIG.TOKEN_STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        
        delete axios.defaults.headers.common["Authorization"];
        listeners.current.clear();
    }, [closeSSEConnection]);

    const subscribeToSse = useCallback((eventName: SseEventType, callback: SseListener) => {
        const eventListeners = listeners.current.get(eventName) || new Set();
        eventListeners.add(callback);
        listeners.current.set(eventName, eventListeners);
    }, []);

    const unsubscribeFromSse = useCallback((eventName: SseEventType, callback: SseListener) => {
        const eventListeners = listeners.current.get(eventName);
        if (eventListeners) {
            eventListeners.delete(callback);
            if (eventListeners.size === 0) {
                listeners.current.delete(eventName);
            }
        }
    }, []);

    useEffect(() => {
        if (!isLoadingUser) {
            setLoading(false);
        }
    }, [isLoadingUser]);

    useEffect(() => {
        const interceptor = api.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    const storedRefreshToken = localStorage.getItem(API_CONFIG.TOKEN_STORAGE_KEYS.REFRESH_TOKEN);

                    if (storedRefreshToken) {
                        try {
                            const response = await refreshTokenApi(storedRefreshToken);
                            
                            if (response.data.success && response.data.data) {
                                const { accessToken, refreshToken: newRefreshToken } = response.data.data;
                        
                                localStorage.setItem(API_CONFIG.TOKEN_STORAGE_KEYS.ACCESS_TOKEN, accessToken);
                                localStorage.setItem(API_CONFIG.TOKEN_STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
                        
                                api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
                                originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
                        
                                if (user) {
                                    establishSseConnection(user, accessToken);
                                }
                        
                                return api(originalRequest);
                            } else {
                                throw new Error("Token refresh failed");
                            }
                        } catch (refreshError) {
                            console.error("Token refresh failed:", refreshError);
                            logout();
                        }
                    } else {
                        logout();
                    }
                }
                return Promise.reject(error);
            }
        );
        return () => api.interceptors.response.eject(interceptor);
    }, [user, establishSseConnection, logout]);

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            user,
            loading,
            isPending: false,
            error: null,
            login,
            logout,
            deleteUser: () => deleteUserMutation.mutate(),
            updateStatus: (status: string) => updateStatusMutation.mutate(status),
            subscribeToSse,
            unsubscribeFromSse,
            reconnectSse,
            fetchCurrentUser: () => queryClient.invalidateQueries({ queryKey: ['currentUser'] }),
        }}>
            {children}
        </AuthContext.Provider>
    );
};