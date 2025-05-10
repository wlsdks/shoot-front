import axios from 'axios';
import { createApiError, handleApiError } from '../lib/apiUtils';

// 백엔드의 ResponseDto와 일치하는 인터페이스 정의
export interface ApiResponse<T> {
    success: boolean;
    data: T | null;
    message: string | null;
    errorCode: string | null;
    timestamp: string;  // 백엔드에서는 Instant 타입이지만 JSON으로 전송될 때 문자열로 변환됩니다
    code: number;
}

// 백엔드의 기본 URL (포트 등은 백엔드 설정에 맞춤)
const api = axios.create({
    baseURL: 'http://localhost:8100/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

// 요청 인터셉터를 통해 JWT 토큰을 헤더에 추가합니다.
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

// 응답 인터셉터를 통해 백엔드의 새로운 응답 형식을 처리합니다.
api.interceptors.response.use(
    (response) => {
        // API 응답이 ResponseDto 형식인 경우 (success 필드가 있는 경우)
        if (response.data && 'success' in response.data) {
            const apiResponse = response.data as ApiResponse<any>;
            
            // 성공 응답이 아닌 경우 에러 처리
            if (!apiResponse.success) {
                return Promise.reject(createApiError(apiResponse));
            }
        }
        
        return response;
    },
    (error) => {
        return Promise.reject(handleApiError(error));
    }
);

export const fetchData = async () => {
    const response = await api.get('/api/data');
    return response.data;
};

export default api;