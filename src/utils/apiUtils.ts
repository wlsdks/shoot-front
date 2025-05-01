// src/utils/apiUtils.ts
import { ApiResponse } from '../services/api';
import { AxiosResponse, AxiosError } from 'axios';

/**
 * API 응답에서 데이터 부분만 추출
 */
export function extractData<T>(response: AxiosResponse<ApiResponse<T>>): T {
    if (!response.data.success) {
        throw createApiError(response.data);
    }
    
    return response.data.data ?? ([] as unknown as T);
}

/**
 * API 응답에서 메시지 추출
 */
export function extractMessage(response: AxiosResponse<ApiResponse<any>>): string {
    return response.data.message || '알 수 없는 오류가 발생했습니다.';
}

/**
 * API 에러 생성
 */
export function createApiError(error: ApiResponse<any> | AxiosError): Error {
    if ('response' in error && error.response?.data) {
        const apiError = error.response.data as ApiResponse<any>;
        const customError = new Error(apiError.message || '요청 처리 중 오류가 발생했습니다.');
        (customError as any).errorCode = apiError.errorCode;
        (customError as any).statusCode = apiError.code;
        return customError;
    }
    
    if ('success' in error && !error.success) {
        const customError = new Error(error.message || '요청 처리 중 오류가 발생했습니다.');
        (customError as any).errorCode = error.errorCode;
        (customError as any).statusCode = error.code;
        return customError;
    }
    
    return new Error('알 수 없는 오류가 발생했습니다.');
}

/**
 * API 에러 처리
 */
export function handleApiError(error: unknown): Error {
    if (error instanceof Error) {
        return error;
    }
    
    if (error && typeof error === 'object' && 'response' in error) {
        return createApiError(error as AxiosError);
    }
    
    return new Error('알 수 없는 오류가 발생했습니다.');
}