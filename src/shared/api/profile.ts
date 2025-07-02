import api from "./api";
import { ApiResponse } from './api';
import { extractData } from '../lib/apiUtils';

// 사용자 상태 업데이트 (여러 features에서 공통 사용)
export const updateUserStatus = async (userId: number, status: string) => {
    const response = await api.patch<ApiResponse<any>>(`/users/${userId}/status`, { status });
    return extractData(response);
}; 