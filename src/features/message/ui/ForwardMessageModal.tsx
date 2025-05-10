import React from 'react';
import { FriendListModal } from '../../chat-room/ui/FriendListModal';
import { forwardMessageToUser } from '../api/message';
import { useAuth } from '../../../shared/lib/context/AuthContext';

interface ForwardMessageModalProps {
    messageId: string;
    onClose: () => void;
}

export const ForwardMessageModal: React.FC<ForwardMessageModalProps> = ({
    messageId,
    onClose
}) => {
    const { user } = useAuth();

    const handleFriendSelect = async (friendId: number) => {
        if (!user) return;
        try {
            await forwardMessageToUser(messageId, friendId, user.id);
            onClose();
        } catch (error) {
            console.error("Forward error", error);
            alert("메시지 전달 실패");
        }
    };

    return (
        <FriendListModal
            onClose={onClose}
            onSelectFriend={handleFriendSelect}
        />
    );
}; 