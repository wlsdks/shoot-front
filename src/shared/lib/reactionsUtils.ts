import { ReactionItem } from '../../entities';

// reactions 데이터가 특정 반응 타입을 포함하는지 확인
export const hasReactionType = (
    reactions: ReactionItem[] | Record<string, number[]> | undefined, 
    reactionType: string, 
    userId: number
): boolean => {
    if (!reactions) return false;
    
    if (Array.isArray(reactions)) {
        // 새로운 API 구조 (배열)
        const reaction = reactions.find(r => r.reactionType === reactionType);
        return reaction?.userIds.includes(userId) || false;
    } else {
        // 기존 구조 (Record)
        return reactions[reactionType]?.includes(userId) || false;
    }
};

// reactions 데이터를 ReactionItem[] 배열로 정규화
export const normalizeReactions = (reactions: ReactionItem[] | Record<string, number[]> | undefined): ReactionItem[] => {
    if (!reactions) return [];
    
    if (Array.isArray(reactions)) {
        return reactions;
    }
    
    // Record를 ReactionItem[]로 변환
    const DEFAULT_REACTION_TYPES = [
        { code: 'like', emoji: '👍', description: '좋아요' },
        { code: 'love', emoji: '❤️', description: '사랑해요' },
        { code: 'haha', emoji: '😂', description: '웃음' },
        { code: 'wow', emoji: '😮', description: '놀람' },
        { code: 'sad', emoji: '😢', description: '슬픔' },
        { code: 'angry', emoji: '😡', description: '화남' },
        { code: 'dislike', emoji: '👎', description: '싫어요' },
    ];

    return Object.entries(reactions)
        .filter(([_, userIds]) => Array.isArray(userIds) && userIds.length > 0)
        .map(([reactionType, userIds]) => {
            const typeInfo = DEFAULT_REACTION_TYPES.find(t => t.code === reactionType);
            return {
                reactionType,
                emoji: typeInfo?.emoji || '❓',
                description: typeInfo?.description || reactionType,
                userIds: userIds as number[],
                count: (userIds as number[]).length
            };
        });
}; 