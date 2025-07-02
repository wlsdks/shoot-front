import { apiGet, apiPut, apiDelete } from "../../../shared/lib/apiUtils";
import { ReactionItem } from '../../../entities';

export interface ReactionType {
  code: string;
  emoji: string;
  description: string;
}

export interface ReactionResponse {
  messageId: string;
  reactions: ReactionItem[];
  updatedAt: string;
}

export interface ReactionListResponse {
  messageId: string;
  reactions: ReactionItem[];
}

export const messageReactionService = {
  addReaction: async (messageId: string, reactionType: string): Promise<ReactionResponse> => {
    return apiPut<ReactionResponse>(`/messages/${messageId}/reactions`, { reactionType });
  },

  removeReaction: async (messageId: string, reactionType: string): Promise<ReactionResponse> => {
    return apiDelete<ReactionResponse>(`/messages/${messageId}/reactions/${reactionType}`);
  },

  getReactions: async (messageId: string): Promise<ReactionListResponse> => {
    return apiGet<ReactionListResponse>(`/messages/${messageId}/reactions`);
  },

  getReactionTypes: async (): Promise<ReactionType[]> => {
    return apiGet<ReactionType[]>('/messages/reactions/types');
  }
}; 