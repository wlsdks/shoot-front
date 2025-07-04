import { apiGet, apiPut, apiDelete } from "../../../shared/lib/apiUtils";
import { ReactionItem } from '../../../entities';

export interface ReactionType {
  code: string;
  emoji: string;
  description: string;
}

// 기존 호환성을 위해 shared 레이어의 서비스를 re-export
export { 
  messageReactionService,
  type ReactionResponse,
  type ReactionListResponse 
} from '../../../shared/lib/services/messageReactionService'; 