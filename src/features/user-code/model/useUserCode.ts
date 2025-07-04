import { useMutation } from '@tanstack/react-query';
import { createMyCode, getMyCode, findUserByCode, sendFriendRequestByCode } from '../api/userCodeApi';
import { UserCode } from '../types';
import { useUserDataQuery, useMutationWithSingleInvalidation, QUERY_KEYS } from '../../../shared';

export const useUserCode = (userId: number) => {
    // 내 유저 코드 조회
    const { data: myCode, isLoading: isLoadingMyCode } = useUserDataQuery<UserCode>(
        QUERY_KEYS.USER_CODE.my(userId),
        async () => {
            const result = await getMyCode(userId);
            // apiGet에서 이미 data가 추출된 상태이므로 { data: result } 형태로 래핑
            return { data: result };
        },
        userId
    );

    // 내 코드 생성/수정
    const createCode = useMutationWithSingleInvalidation({
        mutationFn: (code: string) => createMyCode(userId, code),
        invalidationTarget: QUERY_KEYS.USER_CODE.my(userId),
        successMessage: '코드가 생성되었습니다.',
    });

    // 유저 코드로 사용자 조회
    const findUser = useMutation({
        mutationFn: (code: string) => findUserByCode(code)
    });

    // 유저 코드로 친구 요청
    const sendFriendRequest = useMutation({
        mutationFn: (targetCode: string) => sendFriendRequestByCode(userId, targetCode)
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
        sendRequestError: sendFriendRequest.error
    };
}; 