// authApi.ts
import axios from 'axios';

export const authApi = axios.create({
    baseURL: 'http://localhost:8100/api/v1',
    // 여기서는 기본 Authorization 헤더를 설정하지 않습니다.
});
