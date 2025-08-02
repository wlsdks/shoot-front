import { ReactionItem } from '../../entities';
import { Reaction } from './websocket/types';
import { ReactionType } from './types/common';

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

// 기본 반응 타입 정의
const DEFAULT_REACTION_TYPES: ReactionType[] = [
    { code: 'like', emoji: '👍', description: '좋아요' },
    { code: 'sad', emoji: '😢', description: '슬퍼요' },
    { code: 'dislike', emoji: '👎', description: '싫어요' },
    { code: 'angry', emoji: '😡', description: '화나요' },
    { code: 'curious', emoji: '🤔', description: '궁금해요' },
    { code: 'surprised', emoji: '😮', description: '놀라워요' },
    { code: 'love', emoji: '❤️', description: '사랑해요' },
    { code: 'haha', emoji: '😂', description: '웃음' },
    { code: 'wow', emoji: '😮', description: '놀람' },
];

// 백엔드 Reaction[] 배열을 프론트엔드 ReactionItem[] 배열로 변환
export const convertReactionsToReactionItems = (reactions: Reaction[]): ReactionItem[] => {
    if (!reactions || !Array.isArray(reactions)) return [];
    
    // reactionType별로 그룹화
    const groupedReactions = reactions.reduce((acc, reaction) => {
        const { reactionType, userId } = reaction;
        if (!acc[reactionType]) {
            acc[reactionType] = [];
        }
        acc[reactionType].push(userId);
        return acc;
    }, {} as Record<string, number[]>);
    
    // ReactionItem[] 형태로 변환
    return Object.entries(groupedReactions)
        .filter(([_, userIds]) => userIds.length > 0)
        .map(([reactionType, userIds]) => {
            const typeInfo = DEFAULT_REACTION_TYPES.find(t => t.code === reactionType);
            return {
                reactionType,
                emoji: typeInfo?.emoji || '❓',
                description: typeInfo?.description || reactionType,
                userIds: Array.from(new Set(userIds)), // 중복 제거
                count: new Set(userIds).size
            };
        });
};

// reactions 데이터를 ReactionItem[] 배열로 정규화
export const normalizeReactions = (reactions: ReactionItem[] | Record<string, number[]> | undefined): ReactionItem[] => {
    if (!reactions) return [];
    
    if (Array.isArray(reactions)) {
        return reactions;
    }
    
    // Record를 ReactionItem[]로 변환
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