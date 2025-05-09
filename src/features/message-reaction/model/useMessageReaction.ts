import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { messageReactionService } from '../api/reactionApi';
import { MessageReactionProps } from '../types';

export const useMessageReaction = (props: MessageReactionProps) => {
    const queryClient = useQueryClient();

    // 리액션 목록 조회
    const { data: reactions, isLoading } = useQuery({
        queryKey: ['reactions', props.messageId],
        queryFn: () => messageReactionService.getReactions(props.messageId)
    });

    // 리액션 타입 조회
    const { data: reactionTypes } = useQuery({
        queryKey: ['reactionTypes'],
        queryFn: () => messageReactionService.getReactionTypes()
    });

    // 리액션 추가/제거 mutation
    const reactionMutation = useMutation({
        mutationFn: async ({ reactionType, isAdding }: { reactionType: string; isAdding: boolean }) => {
        if (isAdding) {
            return messageReactionService.addReaction(props.messageId, reactionType);
        } else {
            return messageReactionService.removeReaction(props.messageId, reactionType);
        }
        },
        onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['reactions', props.messageId] });
        }
    });

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