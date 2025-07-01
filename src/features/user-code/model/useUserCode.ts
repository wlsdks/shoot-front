import { useMutation } from '@tanstack/react-query';
import { createMyCode, getMyCode, findUserByCode, sendFriendRequestByCode } from '../api/userCodeApi';
import { UserCode } from '../types';
import { useUserDataQuery, useMutationWithSingleInvalidation } from '../../../shared/lib/hooks/useQueryFactory';

export const useUserCode = (userId: number) => {
    // 내 유저 코드 조회
    const { data: myCode, isLoading: isLoadingMyCode } = useUserDataQuery<UserCode>(
        ['userCode'],
        () => getMyCode(userId),
        userId
    );

    // 내 코드 생성/수정
    const createCode = useMutationWithSingleInvalidation(
        (code: string) => createMyCode(userId, code),
        ['userCode', userId]
    );

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