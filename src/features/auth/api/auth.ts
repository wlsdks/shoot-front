import { apiGet, apiPost } from "../../../shared/lib/apiUtils";
import { API_ENDPOINTS } from "../../../shared/api/config";
import { User } from '../../../entities';
import api from "../../../shared/api/api";
import { ApiResponse } from "../../../shared/api/api";
import { extractData } from "../../../shared/lib/apiUtils";

// 타입 정의들
export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        id: number;
        username: string;
        nickname: string;
        profileImageUrl?: string;
    };
}

// 토큰 응답 인터페이스
export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
}

// 현재 사용자 정보 조회 API
export const fetchCurrentUser = async (): Promise<User> => {
    return apiGet<User>(API_ENDPOINTS.AUTH.ME);
};

// 레거시 호환성을 위한 함수 (기존 코드에서 사용)
export const loginCheckApi = async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>(API_ENDPOINTS.AUTH.ME);
    return extractData(response);
};

// 로그인 API 호출 (예: JWT 토큰 발급)
export const login = async (username: string, password: string): Promise<LoginResponse> => {
    return apiPost<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, { username, password });
};

// 회원가입 API 호출
export const signUp = async (userData: any) => {
    return apiPost('/auth/signup', userData);
};

// 레거시 호환성을 위한 함수 (기존 코드에서 사용)
export const signup = async (formData: FormData) => {
    const response = await api.post<ApiResponse<any>>('/users', formData);
    return extractData(response);
};

// 리프레시 토큰으로 액세스 토큰 갱신
export const refreshToken = async (refreshToken: string) => {
    return apiPost(API_ENDPOINTS.AUTH.REFRESH, { refreshToken });
};

// ID 찾기 API
export const findUserId = async (email: string) => {
    return apiPost('/auth/find-id', { email });
};

// 비밀번호 재설정 API
export const resetPassword = async (email: string) => {
    return apiPost('/auth/reset-password', { email });
};

// 사용자 정보 가져오기 (AuthContext에서 사용할 수 있는 함수)
export const fetchUserInfo = async (): Promise<User> => {
    return apiGet<User>(API_ENDPOINTS.AUTH.ME);
};