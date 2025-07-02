// src/utils/apiUtils.ts
import { ApiResponse } from '../api/api';
import { AxiosResponse, AxiosError } from 'axios';
import api from '../api/api';

/**
 * API 응답에서 데이터 부분만 추출
 */
export function extractData<T>(response: AxiosResponse<ApiResponse<T>>): T {
    if (!response.data.success) {
        throw createApiError(response.data);
    }
    
    if (response.data.data === null || response.data.data === undefined) {
        throw new Error('응답 데이터가 없습니다.');
    }
    
    return response.data.data;
}

/**
 * API 응답에서 메시지 부분만 추출
 */
export function extractMessage<T>(response: AxiosResponse<ApiResponse<T>>): string {
    return response.data.message ?? '성공';
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

// === 공통 API 헬퍼 함수들 ===

/**
 * GET 요청 헬퍼
 */
export async function apiGet<T>(url: string, params?: Record<string, any>): Promise<T> {
    const response = await api.get<ApiResponse<T>>(url, { params });
    return extractData(response);
}

/**
 * POST 요청 헬퍼
 */
export async function apiPost<T>(url: string, data?: any, params?: Record<string, any>): Promise<T> {
    const response = await api.post<ApiResponse<T>>(url, data, { params });
    return extractData(response);
}

/**
 * PUT 요청 헬퍼
 */
export async function apiPut<T>(url: string, data?: any, params?: Record<string, any>): Promise<T> {
    const response = await api.put<ApiResponse<T>>(url, data, { params });
    return extractData(response);
}

/**
 * DELETE 요청 헬퍼
 */
export async function apiDelete<T>(url: string, params?: Record<string, any>): Promise<T> {
    const response = await api.delete<ApiResponse<T>>(url, { params });
    return extractData(response);
}

/**
 * PATCH 요청 헬퍼
 */
export async function apiPatch<T>(url: string, data?: any, params?: Record<string, any>): Promise<T> {
    const response = await api.patch<ApiResponse<T>>(url, data, { params });
    return extractData(response);
}