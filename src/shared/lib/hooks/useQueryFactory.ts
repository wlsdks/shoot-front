import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { QUERY_KEYS } from '../api/queryKeys';
import { handleApiError, ApiException, isRetryableError } from '../api/responseHandler';
import { getFriends, getIncomingRequests, sendFriendRequest, acceptFriendRequest } from '../../api/friends';
import { getPinnedMessages } from '../../api/messages';

// 기본 쿼리 옵션
export const DEFAULT_QUERY_OPTIONS = {
  staleTime: 5 * 60 * 1000, // 5분
  gcTime: 10 * 60 * 1000, // 10분
  retry: (failureCount: number, error: unknown) => {
    if (error instanceof ApiException && !isRetryableError(error)) {
      return false;
    }
    return failureCount < 3;
  },
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
} as const;

// 단일 무효화 mutation hook
export const useMutationWithSingleInvalidation = <TData, TVariables>(options: {
  mutationFn: (variables: TVariables) => Promise<TData>;
  invalidationTarget: readonly unknown[];
  successMessage?: string;
  onSuccess?: (data: TData, variables: TVariables) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: options.mutationFn,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: options.invalidationTarget });
      options.onSuccess?.(data, variables);
    },
    onError: (error) => {
      handleApiError(error);
    }
  });
};

// 여러 무효화 키를 지원하는 mutation hook
export const useMutationWithMultipleInvalidations = <TData, TVariables>(options: {
  mutationFn: (variables: TVariables) => Promise<TData>;
  invalidationTargets: readonly (readonly unknown[])[];
  successMessage?: string;
  onSuccess?: (data: TData, variables: TVariables) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: options.mutationFn,
    onSuccess: (data, variables, context) => {
      options.invalidationTargets.forEach(target => {
        queryClient.invalidateQueries({ queryKey: target });
      });
      options.onSuccess?.(data, variables);
    },
    onError: (error) => {
      handleApiError(error);
    }
  });
};

// 사용자별 데이터 쿼리 hook (하위 호환성을 위해 유지)
export const useUserDataQuery = <T>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<{ data: T }>,
  userId?: number,
  options?: Partial<UseQueryOptions<{ data: T }, ApiException, T>>
) => {
  return useQuery({
    queryKey,
    queryFn,
    enabled: !!userId,
    select: (response) => response.data,
    ...DEFAULT_QUERY_OPTIONS,
    ...options
  });
};

// ===== 개별 쿼리 Hook들 =====

// 친구 목록 조회
export const useFriendsList = (userId: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.FRIENDS.list(userId),
    queryFn: () => getFriends(userId),
    staleTime: 3 * 60 * 1000, // 3분
    enabled: !!userId,
  });
};

// 받은 친구 요청 조회
export const useIncomingRequests = (userId: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.FRIENDS.incoming(userId),
    queryFn: () => getIncomingRequests(userId),
    staleTime: 30 * 1000, // 30초
    refetchInterval: 60 * 1000, // 1분마다 자동 갱신
    enabled: !!userId,
  });
};

// 고정된 메시지 조회
export const usePinnedMessages = (chatRoomId: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.MESSAGES.pinned(chatRoomId),
    queryFn: () => getPinnedMessages(chatRoomId),
    staleTime: 5 * 60 * 1000, // 5분
    enabled: !!chatRoomId,
  });
};

// ===== Mutation Hook들 =====

// 친구 요청 보내기 (userId와 targetUserId 기반)
export const useSendFriendRequest = (userId: number) => {
  return useMutationWithMultipleInvalidations({
    mutationFn: (targetUserId: number) => 
      sendFriendRequest(userId, targetUserId),
    invalidationTargets: [
      QUERY_KEYS.FRIENDS.outgoing(userId),
      QUERY_KEYS.FRIENDS.list(userId),
    ],
    successMessage: '친구 요청을 보냈습니다.',
  });
};

// 친구 요청 수락
export const useAcceptFriendRequest = (userId: number) => {
  return useMutationWithMultipleInvalidations({
    mutationFn: (requesterId: number) => 
      acceptFriendRequest(userId, requesterId),
    invalidationTargets: [
      QUERY_KEYS.FRIENDS.incoming(userId),
      QUERY_KEYS.FRIENDS.list(userId),
    ],
    successMessage: '친구 요청을 수락했습니다.',
  });
};

// ===== 유틸리티 Hook들 =====

// 쿼리 무효화 헬퍼
export const useInvalidateQueries = () => {
  const queryClient = useQueryClient();
  
  return {
    // 사용자 관련 모든 쿼리 무효화
    invalidateUser: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER.all });
    },
    
    // 친구 관련 모든 쿼리 무효화
    invalidateFriends: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FRIENDS.all });
    },
    
    // 채팅방 관련 모든 쿼리 무효화
    invalidateChatRooms: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CHAT_ROOMS.all });
    },
    
    // 메시지 관련 쿼리 무효화
    invalidateMessages: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MESSAGES.all });
    },
    
    // 특정 쿼리 키 무효화
    invalidateQuery: (queryKey: readonly unknown[]) => {
      queryClient.invalidateQueries({ queryKey });
    }
  };
};

// API 상태 확인 헬퍼
export const useApiState = () => {
  const queryClient = useQueryClient();
  
  return {
    // 모든 쿼리 상태 확인
    isFetching: queryClient.isFetching() > 0,
    
    // 특정 타입의 쿼리 상태 확인
    isUserDataLoading: queryClient.isFetching({ queryKey: QUERY_KEYS.USER.all }) > 0,
    isFriendsDataLoading: queryClient.isFetching({ queryKey: QUERY_KEYS.FRIENDS.all }) > 0,
    isChatRoomsDataLoading: queryClient.isFetching({ queryKey: QUERY_KEYS.CHAT_ROOMS.all }) > 0,
    
    // 에러 상태 확인
    hasErrors: () => {
      const queries = queryClient.getQueryCache().getAll();
      return queries.some(query => query.state.error);
    },
    
    // 전체 캐시 클리어
    clearCache: () => {
      queryClient.clear();
    }
  };
}; 