import { useMutation } from '@tanstack/react-query';
import { login, signup, loginCheckApi } from '../services/auth';
import { User } from '../services/auth';
import { useAuth as useAuthContext } from '../context/AuthContext';

export const useAuth = () => {
    const { login: contextLogin } = useAuthContext();

    // 로그인
    const loginMutation = useMutation({
        mutationFn: ({ username, password }: { username: string; password: string }) => 
            login(username, password),
        onSuccess: async (data) => {
            try {
                // 토큰 저장
                localStorage.setItem("accessToken", data.accessToken);
                if (data.refreshToken) {
                    localStorage.setItem("refreshToken", data.refreshToken);
                }
                
                // 사용자 정보를 가져와서 context에 저장
                const user = await loginCheckApi();
                if (user) {
                    // 상태 업데이트를 동기적으로 처리
                    await new Promise<void>((resolve) => {
                        contextLogin(user, data.accessToken, data.refreshToken);
                        resolve();
                    });
                } else {
                    throw new Error("사용자 정보를 가져오는데 실패했습니다.");
                }
            } catch (error) {
                console.error("Failed to fetch user data:", error);
                // 에러 발생 시 토큰 제거
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
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
    };
}; 