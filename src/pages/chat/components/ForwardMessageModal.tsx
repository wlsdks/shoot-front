import React from 'react';
import { FriendListModal } from './FriendListModal';
import { forwardMessage } from '../../../services/message';
import { useAuth } from '../../../context/AuthContext';

interface ForwardMessageModalProps {
    messageId: string;
    onClose: () => void;
}

export const ForwardMessageModal: React.FC<ForwardMessageModalProps> = ({
    messageId,
    onClose
}) => {
    const { user } = useAuth();

    const handleFriendSelect = async (roomId: number) => {
        if (!user) return;
        try {
            await forwardMessage(messageId, roomId, user.id);
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