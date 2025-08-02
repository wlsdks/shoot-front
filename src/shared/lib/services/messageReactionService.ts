import { WebSocketService, ReactionResponse as WSReactionResponse } from '../websocket/types';
import { ReactionType } from '../types/common';

// WebSocket 기반 메시지 리액션 서비스
export class MessageReactionService {
    private webSocketService: WebSocketService | null = null;
    private responseCallbacks: Map<string, (response: WSReactionResponse) => void> = new Map();

    // WebSocket 서비스 설정
    setWebSocketService(webSocketService: WebSocketService): void {
        this.webSocketService = webSocketService;
        
        // 반응 응답 콜백 등록
        this.webSocketService.onReactionResponse((response) => {
            // 임시로 모든 대기 중인 콜백 호출 (실제로는 요청 ID 기반으로 매칭해야 함)
            this.responseCallbacks.forEach((callback, messageId) => {
                callback(response);
            });
            this.responseCallbacks.clear();
        });
    }

    // 리액션 토글 (WebSocket 기반)
    async toggleReaction(messageId: string, reactionType: string): Promise<WSReactionResponse> {
        if (!this.webSocketService) {
            throw new Error('WebSocket service not initialized');
        }

        return new Promise((resolve, reject) => {
            // 응답 콜백 등록 (간단한 구현 - 실제로는 요청 ID로 매칭)
            const timeoutId = setTimeout(() => {
                this.responseCallbacks.delete(messageId);
                reject(new Error('Reaction request timeout'));
            }, 5000);

            this.responseCallbacks.set(messageId, (response) => {
                clearTimeout(timeoutId);
                if (response.success) {
                    resolve(response);
                } else {
                    reject(new Error(response.message));
                }
            });

            // WebSocket으로 반응 전송
            this.webSocketService!.sendReaction(messageId, reactionType);
        });
    }

    // 기존 메서드들을 새로운 방식으로 래핑
    async addReaction(messageId: string, reactionType: string): Promise<{ reactions: any[] }> {
        const response = await this.toggleReaction(messageId, reactionType);
        return { reactions: response.data?.reactions || [] };
    }

    async removeReaction(messageId: string, reactionType: string): Promise<{ reactions: any[] }> {
        const response = await this.toggleReaction(messageId, reactionType);
        return { reactions: response.data?.reactions || [] };
    }

    // 사용 가능한 리액션 타입 조회 (변경 없음)
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