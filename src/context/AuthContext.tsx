import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import axios from "axios";
import { EventSourcePolyfill } from "event-source-polyfill";
import { loginCheckApi } from "../services/auth"; // => /api/v1/auth/me 호출

interface User {
    id: string;
    name: string;
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

    // 1) 초기 로드 시 localStorage 검사
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
    }, []);

    // 2) login
    const login = (u: User, token?: string) => {
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

        // SSE 연결 시작
        if (u.id) {
            console.log("AuthProvider: Starting SSE connection...");
            sseSource.current = new EventSourcePolyfill(`http://localhost:8100/api/v1/chatrooms/updates/${u.id}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

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

            // onerror: 오류 발생 시 로그 출력
            (sseSource.current as EventSource).onerror = function(this: EventSource, err: Event) {
                console.error("AuthProvider: SSE connection error:", err);
            };
        }
    };

    // 3) logout
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