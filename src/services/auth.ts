import api from "./api";  // 예: axios.create({ baseURL: 'http://localhost:8100/api/v1' }) 등
import { authApi } from './authApi';
import { ApiResponse } from '../services/api';
import { extractData } from '../utils/apiUtils';

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
}

// 토큰 응답 인터페이스
export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
}

// 회원가입 API 호출
export const signup = async (formData: FormData) => {
    const response = await api.post<ApiResponse<any>>('/users', formData);
    return extractData(response);
};

// 로그인 API 호출 (예: JWT 토큰 발급)
export const login = async (username: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', { username, password });
    return extractData(response);
};

// 현재 사용자 정보 조회 API
export const loginCheckApi = async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>("/auth/me");
    return extractData(response);
};

// refresh token API 호출 함수
export const refreshTokenApi = async (refreshToken: string) => {
    const response = await authApi.post<ApiResponse<TokenResponse>>('/auth/refresh-token', null, {
        headers: {
            Authorization: `Bearer ${refreshToken}`
        }
    });
    return response; // 전체 응답 반환
};

// 사용자 정보 가져오기 (AuthContext에서 사용할 수 있는 함수)
export const fetchUserInfo = async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return extractData(response);
};