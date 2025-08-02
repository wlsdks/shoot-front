import React, { useState } from 'react';
import { forwardMessageToUser } from '../../../shared/api/messages';
import { Modal, ModalBody, ModalFooter, Input, ActionButton } from '../../../shared/ui';

interface ForwardMessageModalProps {
    isOpen: boolean;
    onClose: () => void;
    messageId: string;
    currentUserId: number;
}

export const ForwardMessageModal: React.FC<ForwardMessageModalProps> = ({
    isOpen,
    onClose,
    messageId,
    currentUserId
}) => {
    const [targetUserId, setTargetUserId] = useState('');

    const handleSubmit = async () => {
        if (targetUserId) {
            try {
                await forwardMessageToUser(messageId, parseInt(targetUserId), currentUserId);
                onClose();
                setTargetUserId('');
            } catch (error) {
                console.error('메시지 전달 실패:', error);
            }
        }
    };

    const handleCancel = () => {
        onClose();
        setTargetUserId('');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="메시지 전달" maxWidth="400px">
            <ModalBody>
                <Input
                    type="text"
                    placeholder="전달할 사용자 ID를 입력하세요"
                    value={targetUserId}
                    onChange={(e) => setTargetUserId(e.target.value)}
                />
            </ModalBody>
            <ModalFooter>
                <ActionButton variant="secondary" onClick={handleCancel}>
                    취소
                </ActionButton>
                <ActionButton variant="primary" onClick={handleSubmit}>
                    전달
                </ActionButton>
            </ModalFooter>
        </Modal>
    );
}; 