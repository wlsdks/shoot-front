import api from "../../../shared/api/api";
import { ApiResponse } from '../../../shared/api/api';
import { extractData } from '../../../shared/lib/apiUtils';
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
    const response = await api.put<ApiResponse<ReactionResponse>>(`/messages/${messageId}/reactions`, {
      reactionType
    });
    return extractData(response);
  },

  removeReaction: async (messageId: string, reactionType: string): Promise<ReactionResponse> => {
    const response = await api.delete<ApiResponse<ReactionResponse>>(`/messages/${messageId}/reactions/${reactionType}`);
    return extractData(response);
  },

  getReactions: async (messageId: string): Promise<ReactionListResponse> => {
    const response = await api.get<ApiResponse<ReactionListResponse>>(`/messages/${messageId}/reactions`);
    return extractData(response);
  },

  getReactionTypes: async (): Promise<ReactionType[]> => {
    const response = await api.get<ApiResponse<ReactionType[]>>('/messages/reactions/types');
    return extractData(response);
  }
}; 