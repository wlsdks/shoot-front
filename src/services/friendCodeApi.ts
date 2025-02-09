import axios from 'axios';

// 내 코드 조회
export const getMyCode = async (userId: string) => {
    return await axios.get(`/api/v1/users/${userId}/code`);
};

// 코드로 친구 찾기
export const findUserByCode = async (code: string) => {
    return await axios.get(`/api/v1/users/find-by-code?code=${code}`);
};

// 내 코드 등록
export const createMyCode = async (userId: string, code: string) => {
    return await axios.post(`/api/v1/users/${userId}/code?code=${code}`);
};

// 내 코드 수정
export const updateMyCode = async (userId: string, code: string) => {
    return await axios.post(`/api/v1/users/${userId}/code?code=${code}`);
};

// 내 코드 삭제
export const deleteMyCode = async (userId: string) => {
    return await axios.delete(`/api/v1/users/${userId}/code`);
};

// 코드로 친구 찾기 및 요청 보내기
export const sendFriendRequestByCode = async (userId: string, targetCode: string) => {
    return await axios.post(`/api/v1/friends/request/by-code?userId=${userId}&targetCode=${targetCode}`);
};