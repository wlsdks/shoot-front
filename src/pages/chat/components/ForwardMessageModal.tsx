import React from 'react';
import {
    ModalOverlay,
    ModalContent,
    ModalButtons
} from '../styles/ChatRoom.styles';

interface ForwardMessageModalProps {
    targetRoomId: string;
    onTargetRoomIdChange: (value: string) => void;
    onSubmit: () => void;
    onCancel: () => void;
}

export const ForwardMessageModal: React.FC<ForwardMessageModalProps> = ({
    targetRoomId,
    onTargetRoomIdChange,
    onSubmit,
    onCancel
}) => {
    return (
        <ModalOverlay>
            <ModalContent>
                <h3>메시지 전달</h3>
                <p>전달할 대상 채팅방 ID를 입력하세요:</p>
                <input 
                    value={targetRoomId} 
                    onChange={(e) => onTargetRoomIdChange(e.target.value)} 
                    placeholder="대상 채팅방 ID" 
                />
                <ModalButtons>
                    <button onClick={onSubmit}>전달</button>
                    <button onClick={onCancel}>취소</button>
                </ModalButtons>
            </ModalContent>
        </ModalOverlay>
    );
}; 