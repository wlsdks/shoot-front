import React from 'react';
import { ChatRoomListTab } from '../../features/chat-room';

interface ChatWidgetProps {
  // Tab component props에서 필요한 것들을 받아올 수 있도록 확장 가능
  [key: string]: any;
}

/**
 * ChatWidget - 채팅 관련 기능들을 조합하는 위젯
 * FSD 원칙에 따라 ChatRoomListTab feature를 래핑하여 app 레이어에서 사용
 */
export const ChatWidget: React.FC<ChatWidgetProps> = (props) => {
  return <ChatRoomListTab {...props} />;
};