import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { API_CONFIG } from '../../../shared/api/config';

// 기본 쿼리 옵션
export const DEFAULT_QUERY_OPTIONS = {
  staleTime: API_CONFIG.QUERY_STALE_TIME.MEDIUM,
  refetchOnWindowFocus: false,
  retry: 1,
} as const;

// 사용자별 데이터 쿼리 팩토리
export function useUserDataQuery<T>(
  queryKey: (string | number)[],
  queryFn: () => Promise<T>,
  userId?: number,
  options?: Partial<UseQueryOptions<T>>
) {
  return useQuery({
    queryKey: [...queryKey, userId],
    queryFn,
    enabled: !!userId,
    ...DEFAULT_QUERY_OPTIONS,
    ...options,
  });
}

// 뮤테이션 후 쿼리 무효화 팩토리
export function useMutationWithInvalidation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  invalidateKeys: (string | number)[][],
  options?: Partial<UseMutationOptions<TData, Error, TVariables>>
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn,
    onSuccess: (data, variables, context) => {
      invalidateKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key });
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}

// 단일 뮤테이션 팩토리 (하나의 쿼리만 무효화)
export function useMutationWithSingleInvalidation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  invalidateKey: (string | number)[],
  options?: Partial<UseMutationOptions<TData, Error, TVariables>>
) {
  return useMutationWithInvalidation(mutationFn, [invalidateKey], options);
} 