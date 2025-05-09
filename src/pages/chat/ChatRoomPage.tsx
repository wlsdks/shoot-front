import React from 'react';
import { useParams } from 'react-router-dom';
import ChatRoom from '../../features/chat-room/ChatRoom';

const ChatRoomPage: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    if (!roomId) return null;
    return <ChatRoom roomId={roomId} />;
};

export default ChatRoomPage; 