// Message-reaction feature public API

// Note: 이 feature는 shared/lib/services/messageReactionService로 이전되었습니다.
// FSD 원칙에 따라 shared 레이어를 통해 접근해주세요.

// Deprecated - shared 레이어 사용 권장
export { messageReactionService } from './api/reactionApi';

// UI Components
export { MessageReaction } from './ui/MessageReaction';

// Model (Hooks)
export { useMessageReaction } from './model/useMessageReaction';

// Types (re-export from shared)
export type { MessageReactionProps, ReactionType } from '../../shared'; 