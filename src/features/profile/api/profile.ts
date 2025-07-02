import api from "../../../shared/api/api";
import { ApiResponse } from '../../../shared/api/api';
import { extractData } from '../../../shared/lib/apiUtils';
import { UserResponse } from '../types/user';
import { Friend } from '../../../entities';

// 사용자 프로필 인터페이스
export interface ProfileUpdateRequest {
    nickname?: string;
    bio?: string;
    profileImageUrl?: string;
}

// 사용자 프로필 이미지 업로드 인터페이스
export interface SetProfileImageRequest {
    imageUrl: string;
}

// 사용자 프로필 배경 이미지 업로드 인터페이스
export interface SetBackgroundImageRequest {
    imageUrl: string;
}

/**
 * 현재 사용자 정보 조회 API
 * @returns 현재 사용자 정보
 */
export const getCurrentUser = async (): Promise<UserResponse> => {
    const response = await api.get<ApiResponse<UserResponse>>('/users/me');
    return extractData(response);
};

/**
 * 사용자 프로필 업데이트 API
 * @param userId 사용자 ID
 * @param profileData 업데이트할 프로필 데이터
 * @returns 업데이트된 사용자 정보
 */
export const updateProfile = async (
    userId: number,
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

// 사용자 프로필 이미지 업로드 API
export const setProfileImage = async (
    request: SetProfileImageRequest
): Promise<UserResponse> => {
    const response = await api.put<ApiResponse<UserResponse>>('/users/me/profile-image', request);
    return extractData(response);
};

// 사용자 프로필 배경 이미지 업로드 API
export const setBackgroundImage = async (request
    : SetBackgroundImageRequest
): Promise<UserResponse> => {
    const response = await api.put<ApiResponse<UserResponse>>('/users/me/background-image', request);
    return extractData(response);
};

// 친구 프로필 조회 API
export const getUserProfile = async (userId: number): Promise<Friend> => {
    const response = await api.get(`/users/${userId}`);
    return extractData(response);
};