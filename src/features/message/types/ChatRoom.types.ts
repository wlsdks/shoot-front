import { ChatRoom } from '../../../entities';
import {
    Message,
    MessageStatus,
    MessageStatusInfo,
    MessageStatusUpdate,
    MessageStatusData,
    TypingIndicatorMessage
} from '../../../entities';

export type { ChatRoom };

// 호환성을 위해 기존 이름 유지
export type ChatMessageItem = Message;

// entities에서 가져온 타입들 re-export
export {
    MessageStatus,
    type MessageStatusInfo,
    type MessageStatusUpdate,
    type MessageStatusData,
    type TypingIndicatorMessage
};

// features 레벨의 타입들
export interface ChatRoomProps {
    roomId: string;
} 