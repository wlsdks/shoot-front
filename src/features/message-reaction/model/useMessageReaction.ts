import { useQuery } from '@tanstack/react-query';
import { messageReactionService } from '../api/reactionApi';
import { MessageReactionProps } from '../types';
import { useMutationWithSingleInvalidation, DEFAULT_QUERY_OPTIONS } from '../../../shared/lib/hooks/useQueryFactory';

export const useMessageReaction = (props: MessageReactionProps) => {
    // 리액션 목록 조회
    const { data: reactions, isLoading } = useQuery({
        queryKey: ['reactions', props.messageId],
        queryFn: () => messageReactionService.getReactions(props.messageId),
        ...DEFAULT_QUERY_OPTIONS,
    });

    // 리액션 타입 조회
    const { data: reactionTypes } = useQuery({
        queryKey: ['reactionTypes'],
        queryFn: () => messageReactionService.getReactionTypes(),
        ...DEFAULT_QUERY_OPTIONS,
        staleTime: 30 * 60 * 1000, // 리액션 타입은 자주 바뀌지 않으므로 30분 캐시
    });

    // 리액션 추가/제거 mutation
    const reactionMutation = useMutationWithSingleInvalidation(
        async ({ reactionType, isAdding }: { reactionType: string; isAdding: boolean }) => {
            if (isAdding) {
                return messageReactionService.addReaction(props.messageId, reactionType);
            } else {
                return messageReactionService.removeReaction(props.messageId, reactionType);
            }
        },
        ['reactions', props.messageId]
    );

    const handleReaction = async (reactionType: string) => {
        const hasReacted = reactions?.reactions[reactionType]?.includes(props.userId || 0);
        await reactionMutation.mutateAsync({ reactionType, isAdding: !hasReacted });
    };

    return {
        reactions: reactions?.reactions || {},
        reactionTypes: reactionTypes || [],
        handleReaction,
        isLoading
    };
}; 