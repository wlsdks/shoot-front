import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import axios from "axios";
import api from "../services/api";
import { EventSourcePolyfill } from "event-source-polyfill";
import { refreshTokenApi, fetchUserInfo } from "../services/auth";
import { updateUserStatus } from '../services/profile';
import { extractData } from '../utils/apiUtils';

interface User {
    id: string;
    username: string;
    nickname?: string;
    bio?: string; // 한줄 소개
    profileImageUrl?: string;
    status?: string; // 내 상태
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    loading: boolean;
    login: (user: User, token: string, refreshToken?: string) => void;
    logout: () => void;
    deleteUser: () => Promise<void>; // 회원 탈퇴 함수
    updateStatus: (status: string) => Promise<void>; // 상태 변경 함수
    subscribeToSse: (eventName: string, callback: (event: MessageEvent) => void) => void;
    unsubscribeFromSse: (eventName: string, callback: (event: MessageEvent) => void) => void;
    reconnectSse: () => void;
    fetchCurrentUser: () => Promise<User | undefined>; // 현재 사용자 정보를 가져오는 함수 추가
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
    fetchCurrentUser: async () => undefined, // 기본값에도 추가
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const sseSource = useRef<EventSourcePolyfill | null>(null);
    const listeners = useRef<Map<string, Set<(event: MessageEvent) => void>>>(new Map());

    // 현재 사용자 정보를 가져오는 함수 - auth 서비스의 fetchUserInfo 활용
    const fetchCurrentUser = useCallback(async (): Promise<User | undefined> => {
        console.log("AuthProvider: Fetching current user data...");
        const token = localStorage.getItem("accessToken");
        if (!token) {
            console.log("AuthProvider: No token, skipping user fetch");
            return undefined;
        }
        
        try {
            // fetchUserInfo에서 이미 데이터 추출 처리
            const userData = await fetchUserInfo();
            console.log("AuthProvider: User data fetched successfully:", userData);
            
            // 가져온 사용자 정보로 상태 업데이트
            setUser(userData);
            
            // 인증 상태가 아직 설정되지 않은 경우에만 업데이트
            if (!isAuthenticated) {
                setIsAuthenticated(true);
            }
            
            return userData;
        } catch (error) {
            console.error('AuthProvider: Failed to fetch current user:', error);
            
            // 401 오류가 발생하면 자동으로 토큰 갱신 인터셉터가 처리
            if (axios.isAxiosError(error) && error.response?.status !== 401) {
                throw error;
            }
            return undefined;
        }
    }, [isAuthenticated]);

    // SSE 연결 재설정 함수
    const establishSseConnection = useCallback((u: User, token: string) => {
        console.log("AuthProvider: Establishing SSE connection...");
        try {
            // 새 연결 생성
            sseSource.current = new EventSourcePolyfill(
                `http://localhost:8100/api/v1/chatrooms/updates/${u.id}`,
                { 
                    headers: { "Authorization": `Bearer ${token}` },
                    heartbeatTimeout: 60000, // 60초 하트비트 타임아웃
                }
            );

            // 디버깅용 이벤트 핸들러
            sseSource.current.onopen = () => {
                console.log("AuthProvider: SSE connection opened");
            };

            // 기본 message 이벤트: 로그 추가
            (sseSource.current.onmessage as any) = function(this: EventSource, event: MessageEvent) {
                console.log("AuthProvider: SSE onmessage event received:", event.data);
                try {
                    const parsedData = JSON.parse(event.data);
                    console.log("AuthProvider: Parsed SSE data:", parsedData);
                    
                    // 메시지 이벤트 리스너 호출
                    const listenersForEvent = listeners.current.get("message") || new Set();
                    listenersForEvent.forEach(callback => callback(event));
                } catch (err) {
                    console.error("AuthProvider: Failed to parse SSE data:", err);
                }
            };

            // 커스텀 이벤트 friendAdded
            (sseSource.current as any).addEventListener("friendAdded", function(this: EventSource, event: Event) {
                console.log("AuthProvider: SSE friendAdded event received:", event);
                const msgEvent = event as MessageEvent;
                const listenersForEvent = listeners.current.get("friendAdded") || new Set();
                listenersForEvent.forEach(callback => callback(msgEvent));
            });

            // 커스텀 이벤트 chatRoomCreated
            (sseSource.current as any).addEventListener("chatRoomCreated", function(this: EventSource, event: Event) {
                console.log("AuthProvider: SSE chatRoomCreated event received:", event);
                const msgEvent = event as MessageEvent;
                const listenersForEvent = listeners.current.get("chatRoomCreated") || new Set();
                listenersForEvent.forEach(callback => callback(msgEvent));
            });

            // 커스텀 이벤트 heartbeat
            (sseSource.current as any).addEventListener("heartbeat", function(this: EventSource, event: Event) {
                console.log("AuthProvider: SSE heartbeat event received:", event);
                const msgEvent = event as MessageEvent;
                const listenersForEvent = listeners.current.get("heartbeat") || new Set();
                listenersForEvent.forEach(callback => callback(msgEvent));
            });

            // onerror: 연결 오류 발생 시 재연결 시도
            (sseSource.current as EventSource).onerror = function(this: EventSource, err: Event) {
                console.error("AuthProvider: SSE connection error:", err);
                if (sseSource.current) {
                    sseSource.current.close();
                    sseSource.current = null;
                }
                
                // 지수 백오프로 재연결 (5초 후)
                setTimeout(() => {
                    if (u.id && token) {
                        console.log("AuthProvider: Attempting to reconnect SSE...");
                        establishSseConnection(u, token);
                    }
                }, 5000);
            };
        } catch (error) {
            console.error("AuthProvider: Failed to establish SSE connection:", error);
        }
    }, []);

    // reconnectSse 함수
    const reconnectSse = useCallback(() => {
        if (user) {
            const token = localStorage.getItem("accessToken");
            if (token) {
                console.log("AuthProvider: Forcing SSE reconnection...");
                if (sseSource.current) {
                    sseSource.current.close();
                    sseSource.current = null;
                }
                establishSseConnection(user, token);
            }
        }
    }, [user, establishSseConnection]);

    // login 함수 (token과 refreshToken과 함께 로그인)
    const login = useCallback((u: User, token: string, refreshToken?: string) => {
        console.log("AuthProvider: Logging in, user:", u, "token:", token, "refreshToken:", refreshToken);
        if (!token) {
            console.error("AuthProvider: No token provided during login");
            return;
        }

        // 기존 SSE 연결이 있다면 종료
        if (sseSource.current) {
            console.log("AuthProvider: Existing SSE connection found. Closing it.");
            sseSource.current.close();
            sseSource.current = null;
            listeners.current.clear();
        }
        
        setUser(u);
        setIsAuthenticated(true);
        
        // accessToken과 refreshToken을 localStorage에 저장
        localStorage.setItem("accessToken", token);
        if (refreshToken) {
            localStorage.setItem("refreshToken", refreshToken);
        }

        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // SSE 연결 시작
        if (u.id) {
            establishSseConnection(u, token);
        }
    }, [establishSseConnection]);

    // logout
    const logout = () => {
        console.log("AuthProvider: Logging out...");
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken"); // refreshToken도 삭제
        delete axios.defaults.headers.common["Authorization"];
        
        if (sseSource.current) {
            console.log("AuthProvider: Closing SSE connection");
            sseSource.current.close();
            sseSource.current = null;
            listeners.current.clear(); // 모든 리스너 초기화
        }
    };

    // 회원탈퇴
    const deleteUser = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token || !user) throw new Error('User not authenticated');

        try {
            await api.delete('/users/me', {
                headers: { Authorization: `Bearer ${token}` },
            });
            logout(); // 탈퇴 후 로그아웃
        } catch (error) {
            console.error('AuthProvider: Failed to delete user', error);
            throw error;
        }
    };

    // 회원상태 업데이트
    const updateStatus = async (status: string) => {
        const token = localStorage.getItem('accessToken');
        if (!token || !user?.id) throw new Error('User not authenticated');
    
        try {
            const response = await updateUserStatus(user.id, status);
            const data = extractData(response);
            
            // 사용자 정보 업데이트
            setUser((prev) => (prev ? { ...prev, status } : null));
            
            return data;
        } catch (error) {
            console.error('AuthProvider: Failed to update status', error);
            throw error;
        }
    };

    // 초기 로드 시 localStorage의 token 검사 및 자동 로그인 처리
    useEffect(() => {
        console.log("AuthProvider: Checking token...");
        const token = localStorage.getItem("accessToken");
        if (!token) {
            console.log("AuthProvider: No token, skipping...");
            setLoading(false);
            return;
        }

        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        
        // loginCheckApi 대신 fetchCurrentUser 사용
        fetchCurrentUser()
            .then((userData) => {
                if (userData) {
                    console.log("AuthProvider: Token valid, user:", userData);
                    // 여기서 refresh token도 localStorage에서 가져와서 함께 전달합니다.
                    const storedRefreshToken = localStorage.getItem("refreshToken") || undefined;
                    login(userData, token, storedRefreshToken);
                }
            })
            .catch((err) => {
                console.error("토큰검증 실패:", err);
                logout();
            })
            .finally(() => {
                console.log("AuthProvider: Loading complete");
                setLoading(false);
            });
    }, [fetchCurrentUser, login]);

    // SSE 연결이 끊어진 경우, user가 있는 상태라면 재연결 시도
    useEffect(() => {
        if (user && !sseSource.current) {
            const token = localStorage.getItem("accessToken");
            if (token) {
                console.log("AuthProvider: SSE connection missing, re-establishing...");
                establishSseConnection(user, token);
            }
        }
    }, [user, establishSseConnection]);

    // SSE 구독 관리
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

    // ── refresh token을 통한 accessToken 재발급 로직 ──
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
                            console.log("AuthProvider: Attempting to refresh token...");
                            const response = await refreshTokenApi(storedRefreshToken);
                            
                            // TokenResponse 형식 체크
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
                                throw new Error("토큰 갱신 실패");
                            }
                        } catch (refreshError) {
                            console.error("AuthProvider: Token refresh failed", refreshError);
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
    }, [user, establishSseConnection]);

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
            fetchCurrentUser  // 새로 추가한 함수
        }}>
            {children}
        </AuthContext.Provider>
    );
};