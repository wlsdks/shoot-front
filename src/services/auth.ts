import api from "./api";  // 예: axios.create({ baseURL: 'http://localhost:8100/api/v1' }) 등
import { authApi } from './authApi';

// User 인터페이스 정의
export interface User {
    id: string;
    username: string;
    nickname?: string;
    bio?: string;
    profileImageUrl?: string;
    status?: string;
}

// 백엔드에서 실제로 반환하는 응답 형식에 맞춘 LoginResponse
export interface LoginResponse {
    userId: string;
    accessToken: string;
    refreshToken: string;
    // user?: User; // 백엔드가 user 객체를 포함하여 반환하는 경우 주석 해제
}

// 회원가입 API 호출
export const signup = async (formData: FormData) => {
    const response = await api.post('/users', formData); // Axios로 변경
    return response.data;
};

// 로그인 API 호출 (예: JWT 토큰 발급)
export const login = async (username: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', { username, password });
    return response.data;
};

// 현재 사용자 정보 조회 API
export const loginCheckApi = async (): Promise<User> => {
    const response = await api.get<User>("/auth/me");
    return response.data;
};

// refresh token API 호출 함수
export const refreshTokenApi = (refreshToken: string) => {
    return authApi.post<{accessToken: string, refreshToken: string}>('/auth/refresh-token', null, {
        headers: {
            Authorization: `Bearer ${refreshToken}`
        }
    });
};

// 사용자 정보 가져오기 (AuthContext에서 사용할 수 있는 함수)
export const fetchUserInfo = async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
};