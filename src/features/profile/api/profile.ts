import api from "../../../shared/api/api";
import { ApiResponse } from '../../../shared/api/api';
import { extractData } from '../../../shared/lib/apiUtils';

// 사용자 프로필 인터페이스
export interface ProfileUpdateRequest {
    nickname?: string;
    bio?: string;
    profileImageUrl?: string;
}

/**
 * 사용자 프로필 업데이트 API
 * @param userId 사용자 ID
 * @param profileData 업데이트할 프로필 데이터
 * @returns 업데이트된 사용자 정보
 */
export const updateProfile = async (
    userId: number, // userId 타입 변경
    profileData: ProfileUpdateRequest
) => {
    const response = await api.put<ApiResponse<any>>(`/users/me`, profileData);
    return extractData(response);
};

/**
 * 사용자 프로필 이미지 업로드 API
 * @param formData 이미지 파일이 포함된 FormData 객체
 * @returns 업로드된 이미지 URL을 포함한 응답
 */
export const uploadProfileImage = async (
    formData: FormData
) => {
    const response = await api.post<ApiResponse<{ imageUrl: string }>>('/users/me/upload-image', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response;
};

/**
 * 사용자 상태 업데이트 API
 * @param userId 유저의 ID
 * @param status 변경할 상태 (ONLINE, BUSY, AWAY 등)
 * @returns 업데이트된 사용자 정보
 */
export const updateUserStatus = async (
    userId: number, // userId 타입 변경
    status: string
) => {
    const response = await api.put<ApiResponse<any>>(`/users/me/status`, { userId, status });
    return response;
};

/**
 * 사용자 비밀번호 변경 API
 * @param currentPassword 현재 비밀번호
 * @param newPassword 새 비밀번호
 * @returns 성공 여부
 */
export const changePassword = async (
    currentPassword: string,
    newPassword: string
) => {
    const response = await api.put<ApiResponse<any>>(`/users/me/password`, {
        currentPassword,
        newPassword
    });
    return extractData(response);
};