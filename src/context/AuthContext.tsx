// 전역 상태 관리 (예: 인증 상태)
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from "axios";
import { loginCheckApi } from "../services/api"; // => /api/v1/auth/me 호출

interface User {
    id: string;
    name: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    loading: boolean;              // ← 추가: 인증 확인중인지를 표시
    login: (user: User, token?: string) => void;
    logout: () => void;
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
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // 로딩 상태: 아직 토큰 검사중이면 true
    const [loading, setLoading] = useState(true);

    // 1) 초기 로드 시 localStorage 검사
    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            // 토큰이 없다면 인증 안된 상태로 로딩끝
            setLoading(false);
            return;
        }

        // 토큰이 있으면 /me API 호출로 검증
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        loginCheckApi()
        .then((res) => {
            // 성공 => user 저장
            const data = res.data; // e.g. { id, username, nickname }
            setUser(data);
            setIsAuthenticated(true);
        })
        .catch((err) => {
            console.error("토큰검증 실패:", err);
            // 혹은 localStorage.removeItem("accessToken");
        })
        .finally(() => {
            // 로딩 끝
            setLoading(false);
        });
    }, []);

    // 2) login
    const login = (u: User, token?: string) => {
        setUser(u);
        setIsAuthenticated(true);
        if (token) {
            localStorage.setItem("accessToken", token);
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }
    };

    // 3) logout
    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem("accessToken");
        delete axios.defaults.headers.common["Authorization"];
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};