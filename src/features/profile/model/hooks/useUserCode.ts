import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createMyCode, getMyCode, findUserByCode, sendFriendRequestByCode } from '../../../user-code/api/userCodeApi';

export const useUserCode = (userId: number) => {
    const queryClient = useQueryClient();

    // 내 유저 코드 조회
    const { data: myCode, isLoading: isLoadingMyCode } = useQuery({
        queryKey: ['userCode', userId],
        queryFn: () => getMyCode(userId),
    });

    // 내 코드 생성/수정
    const createCode = useMutation({
        mutationFn: (code: string) => createMyCode(userId, code),
        onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['userCode', userId] });
        },
    });

    // 유저 코드로 사용자 조회
    const findUser = useMutation({
        mutationFn: (code: string) => findUserByCode(code),
    });

    // 유저 코드로 친구 요청
    const sendFriendRequest = useMutation({
        mutationFn: (targetCode: string) => sendFriendRequestByCode(userId, targetCode),
    });

    return {
        myCode,
        isLoadingMyCode,
        createCode: createCode.mutate,
        findUser: findUser.mutate,
        sendFriendRequest: sendFriendRequest.mutate,
        isCreatingCode: createCode.isPending,
        isFindingUser: findUser.isPending,
        isSendingRequest: sendFriendRequest.isPending,
        createCodeError: createCode.error,
        findUserError: findUser.error,
        sendRequestError: sendFriendRequest.error,
    };
}; 