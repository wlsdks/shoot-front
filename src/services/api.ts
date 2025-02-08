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

// 회원가입 API 호출
export const signup = (username: string, nickname: string) => {
    return api.post('/users', { username, nickname });
};

// 로그인 API 호출 (예: JWT 토큰 발급)
export const login = (username: string, password: string) => {
    return api.post('/auth/login', { username, password });
};

// 채팅방 목록 API 호출
export const getChatRooms = (userId: string) => {
    return api.get(`/chatrooms?userId=${userId}`);
};

// 채팅 메시지 조회 API 호출
export const getChatMessages = (roomId: string, before?: string, limit: number = 20) => {
    return api.get(`/messages/get`, { params: { roomId, before, limit } });
};

// 토큰 유효성 검사 (GET /auth/me) 같은 형식
export const loginCheckApi = () => {
    // 별도의 token 매개변수 없이, axios가 common header로 토큰을 포함
    return api.get("/auth/me");
};