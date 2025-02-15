// axios 인스턴스 및 REST API 함수들
import axios from 'axios';

// 백엔드의 기본 URL (포트 등은 백엔드 설정에 맞춤)
const api = axios.create({
    baseURL: 'http://localhost:8100/api/v1',
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

export default api;