import api from "../../../shared/api/api";
import { ApiResponse } from '../../../shared/api/api';
import { extractData } from '../../../shared/lib/apiUtils';

// 내 코드 생성 및 수정
export const createMyCode = async (userId: number, code: string) => {
    const response = await api.post<ApiResponse<any>>('/users/code', null, {
        params: { userId, code }
    });
    return extractData(response);
};

// 내 유저 코드 삭제
export const deleteMyCode = async (userId: number) => {
    const response = await api.delete<ApiResponse<any>>('/users/code', {
        params: { userId }
    });
    return extractData(response);
};

// 내 유저 코드 조회
export const getMyCode = async (userId: number) => {
    const response = await api.get<ApiResponse<any>>(`/users/${userId}/code`);
    return extractData(response);
};

// 유저 코드로 사용자 조회
export const findUserByCode = async (code: string) => {
    const response = await api.get<ApiResponse<any>>('/users/find-by-code', {
        params: { code }
    });
    return response.data;
};

// 유저 코드로 친구 요청 보내기
export const sendFriendRequestByCode = async (userId: number, targetCode: string) => {
    const response = await api.post<ApiResponse<any>>('/users/request/by-code', null, {
        params: { userId, targetCode }
    });
    return {
        data: extractData(response)
    };
}; 