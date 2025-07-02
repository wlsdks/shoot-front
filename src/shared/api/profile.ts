import { apiPatch } from '../lib/apiUtils';

// 사용자 상태 업데이트 (여러 features에서 공통 사용)
export const updateUserStatus = async (userId: number, status: string) => {
    return apiPatch<any>(`/users/${userId}/status`, { status });
}; 