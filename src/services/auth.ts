import api from "./api";  // 예: axios.create({ baseURL: 'http://localhost:8100/api/v1' }) 등
// import { AxiosResponse } from "axios";

// 회원가입 API 호출
export const signup = (username: string, nickname: string) => {
    return api.post('/users', { username, nickname });
};

// 로그인 API 호출 (예: JWT 토큰 발급)
export const login = (username: string, password: string) => {
    return api.post('/auth/login', { username, password });
};

// 토큰 유효성 검사 (GET /auth/me) 같은 형식
export const loginCheckApi = () => {
    // 별도의 token 매개변수 없이, axios가 common header로 토큰을 포함
    return api.get("/auth/me");
};

// refresh token API 호출 함수
export const refreshTokenApi = (refreshToken: string) => {
    return api.post('/auth/refresh-token', null, {
        headers: {
        Authorization: `Bearer ${refreshToken}`
        }
    });
};