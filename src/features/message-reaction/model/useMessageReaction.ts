import { useQuery } from '@tanstack/react-query';
import { messageReactionService } from '../api/reactionApi';
import { MessageReactionProps } from '../types';
import { useMutationWithSingleInvalidation, DEFAULT_QUERY_OPTIONS, QUERY_KEYS } from '../../../shared';
import { hasReactionType, normalizeReactions } from '../../../shared/lib/reactionsUtils';

export const useMessageReaction = (props: MessageReactionProps) => {
    // 리액션 목록 조회
    const { data: reactions, isLoading } = useQuery({
        queryKey: QUERY_KEYS.REACTIONS.byMessage(props.messageId),
        queryFn: () => messageReactionService.getReactions(props.messageId),
        ...DEFAULT_QUERY_OPTIONS,
    });

    // 리액션 타입 조회 (전역 캐시)
    const { data: reactionTypes } = useQuery({
        queryKey: QUERY_KEYS.REACTIONS.types(),
        queryFn: () => messageReactionService.getReactionTypes(),
        ...DEFAULT_QUERY_OPTIONS,
        staleTime: 30 * 60 * 1000, // 리액션 타입은 자주 바뀌지 않으므로 30분 캐시
    });

    // 리액션 추가/제거 mutation
    const reactionMutation = useMutationWithSingleInvalidation({
        mutationFn: async ({ reactionType, isAdding }: { reactionType: string; isAdding: boolean }) => {
            if (isAdding) {
                return messageReactionService.addReaction(props.messageId, reactionType);
            } else {
                return messageReactionService.removeReaction(props.messageId, reactionType);
            }
        },
        invalidationTarget: QUERY_KEYS.REACTIONS.byMessage(props.messageId),
        successMessage: '리액션이 업데이트되었습니다.',
    });

    const handleReaction = async (reactionType: string) => {
        // API 응답이 ReactionItem[] 배열 형태이므로 hasReactionType 유틸리티 사용
        const hasReacted = hasReactionType(reactions?.reactions, reactionType, props.userId || 0);
        await reactionMutation.mutateAsync({ reactionType, isAdding: !hasReacted });
    };

    return {
        // API 응답을 정규화하여 기존 Record 형태로 반환 (하위 호환성)
        reactions: reactions?.reactions ? 
            normalizeReactions(reactions.reactions).reduce((acc, reaction) => {
                acc[reaction.reactionType] = reaction.userIds;
                return acc;
            }, {} as Record<string, number[]>) : {},
        reactionTypes: reactionTypes || [],
        handleReaction,
        isLoading
    };
}; 