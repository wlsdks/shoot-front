import { apiGet, apiPost, apiDelete } from "../../../shared/lib/apiUtils";

// 내 코드 생성 및 수정
export const createMyCode = async (userId: number, code: string) => {
    return apiPost<any>('/users/code', { userId, code });
};

// 내 유저 코드 삭제
export const deleteMyCode = async (userId: number) => {
    return apiDelete<any>('/users/code', { userId });
};

// 내 유저 코드 조회
export const getMyCode = async (userId: number) => {
    return apiGet<any>(`/users/${userId}/code`);
};

// 유저 코드로 사용자 조회
export const findUserByCode = async (code: string) => {
    try {
        return await apiGet<any>('/users/find-by-code', { code });
    } catch (error: any) {
        // 에러 응답의 데이터를 그대로 반환하여 message를 포함시킴
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 유저 코드로 친구 요청 보내기
export const sendFriendRequestByCode = async (userId: number, targetCode: string) => {
    try {
        const data = await apiPost<any>('/users/request/by-code', { userId, targetCode });
        return { data };
    } catch (error: any) {
        // 에러 응답의 데이터를 그대로 반환하여 message를 포함시킴
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
}; 