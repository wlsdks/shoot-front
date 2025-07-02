import { ChatRoom } from '../../../entities';
import { Message } from '../../../entities';

export type { ChatRoom };

// 호환성을 위해 기존 이름 유지
export type ChatMessageItem = Message;

// features 레벨의 타입들
export interface ChatRoomProps {
    roomId: string;
} 