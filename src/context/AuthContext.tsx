import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import axios from "axios";
import { EventSourcePolyfill } from "event-source-polyfill";
import { loginCheckApi } from "../services/auth";

interface User {
    id: string;
    username: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    loading: boolean;
    login: (user: User, token?: string) => void;
    logout: () => void;
    subscribeToSse: (eventName: string, callback: (event: MessageEvent) => void) => void;
    unsubscribeFromSse: (eventName: string, callback: (event: MessageEvent) => void) => void;
}

// AuthContext 기본값은 children이 없는 빈 객체로 타입 추론되기 때문에,
// 별도의 props 타입을 만들어 children을 명시해 줍니다.
interface AuthProviderProps {
    children: ReactNode;
}  

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    user: null,
    loading: false,
    login: () => {},
    logout: () => {},
    subscribeToSse: () => {},
    unsubscribeFromSse: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const sseSource = useRef<EventSourcePolyfill | null>(null);
    const listeners = useRef<Map<string, Set<(event: MessageEvent) => void>>>(new Map());

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


            // 기본 message 이벤트: 로그 추가
            (sseSource.current.onmessage as any) = function(this: EventSource, event: MessageEvent) {
                console.log("AuthProvider: SSE onmessage event received:", event);
                const listenersForEvent = listeners.current.get("message") || new Set();
                listenersForEvent.forEach(callback => callback(event));
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

    // login
    const login = useCallback((u: User, token?: string) => {
        console.log("AuthProvider: Logging in, user:", u, "token:", token);
        if (!token) {
            console.error("AuthProvider: No token provided during login");
            return;
        }

        // 기존 SSE 연결이 있다면 먼저 종료
        if (sseSource.current) {
            console.log("AuthProvider: Existing SSE connection found. Closing it.");
            sseSource.current.close();
            sseSource.current = null;
            listeners.current.clear();
        }
        
        setUser(u);
        setIsAuthenticated(true);
        
        localStorage.setItem("accessToken", token);

        // 이 코드는 axios로 HTTP 요청을 보낼 때마다 기본적으로 "Authorization" 헤더에 해당 토큰을 포함시킵니다.
        // 이를 통해 매번 개별 요청에 토큰을 수동으로 추가할 필요 없이, 인증이 필요한 API 호출 시 자동으로 토큰이 전달되어 인증이 이루어집니다.
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // SSE 연결 시작 (자동 재연결 로직 포함)
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
        delete axios.defaults.headers.common["Authorization"];
        
        if (sseSource.current) {
            console.log("AuthProvider: Closing SSE connection");
            sseSource.current.close();
            sseSource.current = null;
            listeners.current.clear(); // 모든 리스너 초기화
        }
    };

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

    // 초기 로드 시 localStorage 검사
    useEffect(() => {
        console.log("AuthProvider: Checking token...");
        const token = localStorage.getItem("accessToken");
        if (!token) {
            console.log("AuthProvider: No token, skipping...");
            setLoading(false);
            return;
        }

        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        loginCheckApi()
            .then((res) => {
                console.log("AuthProvider: Token valid, user:", res.data);
                const data = res.data;
                // 자동 로그인 시 login 함수를 호출하여 SSE 연결도 생성
                login(data, token);
            })
            .catch((err) => {
                console.error("토큰검증 실패:", err);
            })
            .finally(() => {
                console.log("AuthProvider: Loading complete");
                setLoading(false);
            });
    }, [login]);

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

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout, subscribeToSse, unsubscribeFromSse }}>
            {children}
        </AuthContext.Provider>
    );
};