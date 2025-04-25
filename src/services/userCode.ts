import api from "./api";
import { ApiResponse } from '../services/api';
import { extractData } from '../utils/apiUtils';

// 내 코드 생성 및 수정: userCode를 쿼리 파라미터로 전달합니다.
export const createMyCode = async (userId: number, code: string) => { // userId 타입 변경
    const response = await api.post<ApiResponse<any>>(`/users/${userId}/code`, null, { params: { code } });
    return extractData(response);
};

// 내 유저 코드 삭제
export const deleteMyCode = async (userId: number) => { // userId 타입 변경
    const response = await api.delete<ApiResponse<any>>(`/users/${userId}/code`);
    return extractData(response);
};

// 내 유저 코드 조회
export const getMyCode = async (userId: number) => { // userId 타입 변경
    const response = await api.get<ApiResponse<any>>(`/users/${userId}/code`);
    return extractData(response);
};

// 유저 코드로 사용자 조회
export const findUserByCode = async (code: string) => {
    const response = await api.get<ApiResponse<any>>(`/users/find-by-code`, { params: { code } });
    return {
        data: extractData(response)
    };
};

// 유저 코드로 친구 요청 보내기
export const sendFriendRequestByCode = async (userId: number, targetCode: string) => { // userId 타입 변경
    const response = await api.post<ApiResponse<any>>(`/users/request/by-code`, null, { params: { userId, targetCode } });
    return {
        data: extractData(response)
    };
};