import { useMutation } from '@tanstack/react-query';
import { login, signup, loginCheckApi } from '../api';
import { useAuth as useAuthContext } from './AuthContext';
import { API_CONFIG } from '../../../shared/api/config';

export const useAuth = () => {
    const { login: contextLogin, isAuthenticated } = useAuthContext();

    // 로그인
    const loginMutation = useMutation({
        mutationFn: ({ username, password }: { username: string; password: string }) => 
            login(username, password),
        onSuccess: async (data) => {
            try {
                // 토큰 저장
                localStorage.setItem(API_CONFIG.TOKEN_STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
                if (data.refreshToken) {
                    localStorage.setItem(API_CONFIG.TOKEN_STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
                }
                
                // 사용자 정보를 가져와서 context에 저장
                const user = await loginCheckApi();
                if (user) {
                    // 상태 업데이트를 동기적으로 처리
                    contextLogin(user, data.accessToken, data.refreshToken);
                } else {
                    throw new Error("사용자 정보를 가져오는데 실패했습니다.");
                }
            } catch (error) {
                console.error("Failed to fetch user data:", error);
                // 에러 발생 시 토큰 제거
                localStorage.removeItem(API_CONFIG.TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
                localStorage.removeItem(API_CONFIG.TOKEN_STORAGE_KEYS.REFRESH_TOKEN);
                throw error;
            }
        }
    });

    // 회원가입
    const signupMutation = useMutation({
        mutationFn: (formData: FormData) => signup(formData),
    });

    return {
        login: loginMutation.mutate,
        signup: signupMutation.mutate,
        isPending: loginMutation.isPending,
        error: loginMutation.error,
        isSignupLoading: signupMutation.isPending,
        signupError: signupMutation.error,
        isAuthenticated,
    };
}; 