import api from "./api";  // baseURL이 "http://localhost:8100/api/v1"로 설정된 axios 인스턴스 사용
import { AxiosResponse } from 'axios';

// 내 코드 생성 및 수정: userCode를 쿼리 파라미터로 전달합니다.
export const createMyCode = (userId: string, code: string): Promise<AxiosResponse<any>> => {
    return api.post(`/users/${userId}/code`, null, { params: { code } });
};

// 내 유저 코드 삭제
export const deleteMyCode = (userId: string): Promise<AxiosResponse<any>> => {
    return api.delete(`/users/${userId}/code`);
};

// 내 유저 코드 조회
export const getMyCode = (userId: string): Promise<AxiosResponse<any>> => {
    return api.get(`/users/${userId}/code`);
};

// 유저 코드로 사용자 조회
export const findUserByCode = (code: string): Promise<AxiosResponse<any>> => {
    return api.get(`/users/find-by-code`, { params: { code } });
};

// 유저 코드로 친구 요청 보내기
export const sendFriendRequestByCode = (userId: string, targetCode: string): Promise<AxiosResponse<any>> => {
    return api.post(`/users/request/by-code`, null, { params: { userId, targetCode } });
};