import React, { useState } from 'react';
import { forwardMessageToUser } from '../../message/api/message';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '../styles/ChatRoom.styles';

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

    if (!isOpen) return null;

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
        <Modal onClick={handleCancel}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                    <h3>메시지 전달</h3>
                </ModalHeader>
                <ModalBody>
                    <input
                        type="text"
                        placeholder="전달할 사용자 ID를 입력하세요"
                        value={targetUserId}
                        onChange={(e) => setTargetUserId(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '0.9rem'
                        }}
                    />
                </ModalBody>
                <ModalFooter>
                    <button className="secondary" onClick={handleCancel}>
                        취소
                    </button>
                    <button className="primary" onClick={handleSubmit}>
                        전달
                    </button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}; 