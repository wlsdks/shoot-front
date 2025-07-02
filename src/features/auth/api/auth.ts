import api from "../../../shared/api/api";
import { ApiResponse } from "../../../shared/api/api";
import { extractData } from '../../../shared/lib/apiUtils';
import { User } from '../../../entities';
import { API_ENDPOINTS } from '../../../shared/api/config';

// 백엔드에서 실제로 반환하는 응답 형식에 맞춘 LoginResponse
export interface LoginResponse {
    userId: number;
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
    const response = await api.post<ApiResponse<LoginResponse>>(API_ENDPOINTS.AUTH.LOGIN, { username, password });
    return extractData(response);
};

// 현재 사용자 정보 조회 API
export const loginCheckApi = async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>(API_ENDPOINTS.AUTH.ME);
    return extractData(response);
};

// refresh token API 호출 함수
export const refreshTokenApi = async (refreshToken: string) => {
    const response = await api.post<ApiResponse<TokenResponse>>(API_ENDPOINTS.AUTH.REFRESH, null, {
        headers: {
            Authorization: `Bearer ${refreshToken}`
        }
    });
    return response; // 전체 응답 반환
};

// 사용자 정보 가져오기 (AuthContext에서 사용할 수 있는 함수)
export const fetchUserInfo = async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>(API_ENDPOINTS.AUTH.ME);
    return extractData(response);
};