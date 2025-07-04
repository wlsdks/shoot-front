import { apiGet, apiPut, apiDelete } from '../apiUtils';
import { ReactionType } from '../types/common';

// 기존 API 응답 타입들
export interface ReactionResponse {
    messageId: string;
    reactions: any[];
    updatedAt: string;
}

export interface ReactionListResponse {
    messageId: string;
    reactions: any[];
}

// 메시지 리액션 API 서비스
export class MessageReactionService {
    // 리액션 추가 (기존 경로 및 메서드 사용)
    async addReaction(messageId: string, reactionType: string): Promise<ReactionResponse> {
        return apiPut<ReactionResponse>(`/messages/${messageId}/reactions`, { reactionType });
    }

    // 리액션 제거 (기존 경로 사용)
    async removeReaction(messageId: string, reactionType: string): Promise<ReactionResponse> {
        return apiDelete<ReactionResponse>(`/messages/${messageId}/reactions/${reactionType}`);
    }

    // 메시지의 리액션 목록 조회 (기존 경로 사용)
    async getReactions(messageId: string): Promise<ReactionListResponse> {
        return apiGet<ReactionListResponse>(`/messages/${messageId}/reactions`);
    }

    // 사용 가능한 리액션 타입 조회
    async getReactionTypes(): Promise<ReactionType[]> {
        return [
            { code: 'like', emoji: '👍', description: '좋아요' },
            { code: 'sad', emoji: '😢', description: '슬퍼요' },
            { code: 'dislike', emoji: '👎', description: '싫어요' },
            { code: 'angry', emoji: '😡', description: '화나요' },
            { code: 'curious', emoji: '🤔', description: '궁금해요' },
            { code: 'surprised', emoji: '😮', description: '놀라워요' }
        ];
    }
}

// 싱글톤 인스턴스 생성
export const messageReactionService = new MessageReactionService(); 