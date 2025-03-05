// src/utils/apiUtils.ts
import { ApiResponse } from '../services/api';
import { AxiosResponse } from 'axios';

/**
 * API 응답에서 데이터 부분만 추출
 */
export function extractData<T>(response: AxiosResponse<ApiResponse<T>>): T {
    // 응답이 성공이고 데이터가 있는 경우에만 데이터 반환
    if (response.data.success && response.data.data !== null) {
        return response.data.data;
    }
    
    // 데이터가 없는 경우 빈 배열 또는 적절한 기본값 반환
    if (Array.isArray(response.data.data)) {
        return [] as unknown as T;
    }
    
    // 실패한 경우 에러 던지기
    throw new Error(response.data.message || '알 수 없는 오류가 발생했습니다.');
}

/**
 * API 응답에서 메시지 추출
 */
export function extractMessage(response: AxiosResponse<ApiResponse<any>>): string {
    return response.data.message || '';
}

/**
 * API 응답이 성공인지 확인
 */
export function isSuccess(response: AxiosResponse<ApiResponse<any>>): boolean {
    return response.data.success;
}