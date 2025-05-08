import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import axios from "axios";
import api from "../services/api";
import { EventSourcePolyfill } from "event-source-polyfill";
import { refreshTokenApi, loginCheckApi } from "../services/auth";
import { updateUserStatus } from '../services/profile';

interface User {
    id: number;
    username: string;
    nickname?: string;
    bio?: string;
    profileImageUrl?: string;
    status?: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    loading: boolean;
    login: (user: User, token: string, refreshToken?: string) => void;
    logout: () => void;
    deleteUser: () => Promise<void>;
    updateStatus: (status: string) => Promise<void>;
    subscribeToSse: (eventName: string, callback: (event: MessageEvent) => void) => void;
    unsubscribeFromSse: (eventName: string, callback: (event: MessageEvent) => void) => void;
    reconnectSse: () => void;
    fetchCurrentUser: () => Promise<User | undefined>;
}

interface AuthProviderProps {
    children: ReactNode;
}

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    user: null,
    loading: false,
    login: () => {},
    logout: () => {},
    deleteUser: async () => {},
    updateStatus: async () => {},
    subscribeToSse: () => {},
    unsubscribeFromSse: () => {},
    reconnectSse: () => {},
    fetchCurrentUser: async () => undefined,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const sseSource = useRef<EventSourcePolyfill | null>(null);
    const listeners = useRef<Map<string, Set<(event: MessageEvent) => void>>>(new Map());
    const connectionAttemptCount = useRef<number>(0);
    const reconnectTimeout = useRef<NodeJS.Timeout>();

    const fetchCurrentUser = useCallback(async (): Promise<User | undefined> => {
        const token = localStorage.getItem("accessToken");
        if (!token) return undefined;
        
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
    }, [isAuthenticated]);

    const establishSseConnection = useCallback((u: User, token: string) => {
        if (sseSource.current) {
            sseSource.current.close();
            sseSource.current = null;
        }

        connectionAttemptCount.current += 1;
        const currentAttempt = connectionAttemptCount.current;

        try {
            sseSource.current = new EventSourcePolyfill(
                `http://localhost:8100/api/v1/chatrooms/updates/${u.id}`,
                { 
                    headers: { "Authorization": `Bearer ${token}` },
                    heartbeatTimeout: 60000,
                }
            );

            sseSource.current.onopen = () => {
                connectionAttemptCount.current = 0;
            };

            (sseSource.current as any).onmessage = function(this: EventSource, ev: MessageEvent) {
                try {
                    const parsedData = JSON.parse(ev.data);
                    const listenersForEvent = listeners.current.get("message") || new Set();
                    listenersForEvent.forEach(callback => callback(ev));
                } catch (err) {
                    console.error("Failed to parse SSE data:", err);
                }
            };

            const eventTypes = ["friendAdded", "chatRoomCreated", "heartbeat"];
            eventTypes.forEach(eventType => {
                (sseSource.current as any).addEventListener(eventType, function(this: EventSource, ev: Event) {
                    const msgEvent = ev as MessageEvent;
                    const listenersForEvent = listeners.current.get(eventType) || new Set();
                    listenersForEvent.forEach(callback => callback(msgEvent));
                });
            });

            (sseSource.current as any).onerror = function(this: EventSource, ev: Event) {
                if (currentAttempt === connectionAttemptCount.current && sseSource.current) {
                    sseSource.current.close();
                    sseSource.current = null;
                    
                    if (reconnectTimeout.current) {
                        clearTimeout(reconnectTimeout.current);
                    }

                    reconnectTimeout.current = setTimeout(() => {
                        if (u.id && token && currentAttempt === connectionAttemptCount.current) {
                            establishSseConnection(u, token);
                        }
                    }, 5000);
                }
            };
        } catch (error) {
            console.error("Failed to establish SSE connection:", error);
        }
    }, []);

    const reconnectSse = useCallback(() => {
        if (user) {
            const token = localStorage.getItem("accessToken");
            if (token) {
                connectionAttemptCount.current = 0;
                
                if (sseSource.current) {
                    sseSource.current.close();
                    sseSource.current = null;
                }
                establishSseConnection(user, token);
            }
        }
    }, [user, establishSseConnection]);

    useEffect(() => {
        return () => {
            if (sseSource.current) {
                sseSource.current.close();
                sseSource.current = null;
            }
            if (reconnectTimeout.current) {
                clearTimeout(reconnectTimeout.current);
            }
            listeners.current.clear();
        };
    }, []);

    const login = useCallback((u: User, token: string, refreshToken?: string) => {
        if (!token) return;

        if (sseSource.current) {
            sseSource.current.close();
            sseSource.current = null;
            listeners.current.clear();
        }
        
        setUser(u);
        setIsAuthenticated(true);
        
        localStorage.setItem("accessToken", token);
        if (refreshToken) {
            localStorage.setItem("refreshToken", refreshToken);
        }

        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        if (u.id) {
            establishSseConnection(u, token);
        }
    }, [establishSseConnection]);

    const logout = useCallback(() => {
        if (sseSource.current) {
            sseSource.current.close();
            sseSource.current = null;
        }
        if (reconnectTimeout.current) {
            clearTimeout(reconnectTimeout.current);
        }
        
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        delete axios.defaults.headers.common["Authorization"];
        listeners.current.clear();
    }, []);

    const deleteUser = async () => {
        try {
            await api.delete("/api/v1/users/me");
            logout();
        } catch (error) {
            console.error("Failed to delete user:", error);
            throw error;
        }
    };

    const updateStatus = async (status: string) => {
        if (!user) return;
        
        try {
            await updateUserStatus(user.id, status);
            setUser(prev => prev ? { ...prev, status } : null);
        } catch (error) {
            console.error("Failed to update status:", error);
            throw error;
        }
    };

    const subscribeToSse = (eventName: string, callback: (event: MessageEvent) => void) => {
        const eventListeners = listeners.current.get(eventName) || new Set();
        eventListeners.add(callback);
        listeners.current.set(eventName, eventListeners);
    };

    const unsubscribeFromSse = (eventName: string, callback: (event: MessageEvent) => void) => {
        const eventListeners = listeners.current.get(eventName);
        if (eventListeners) {
            eventListeners.delete(callback);
            if (eventListeners.size === 0) {
                listeners.current.delete(eventName);
            }
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            fetchCurrentUser().finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const interceptor = api.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    const storedRefreshToken = localStorage.getItem("refreshToken");

                    if (storedRefreshToken) {
                        try {
                            const response = await refreshTokenApi(storedRefreshToken);
                            
                            if (response.data.success && response.data.data) {
                                const { accessToken, refreshToken: newRefreshToken } = response.data.data;
                        
                                localStorage.setItem("accessToken", accessToken);
                                localStorage.setItem("refreshToken", newRefreshToken);
                        
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
            login,
            logout,
            deleteUser,
            updateStatus,
            subscribeToSse,
            unsubscribeFromSse,
            reconnectSse,
            fetchCurrentUser,
        }}>
            {children}
        </AuthContext.Provider>
    );
};