import React, { memo } from 'react';
import { Header, BackButton, HeaderTitle } from '../styles/ChatRoom.styles';
import { BackIcon } from './icons';

interface ChatHeaderProps {
    onBack: () => void;
    title?: string;
}

const ChatHeaderComponent: React.FC<ChatHeaderProps> = ({ onBack, title = "채팅방" }) => {
    return (
        <Header>
            <BackButton onClick={onBack}>
                <BackIcon />
            </BackButton>
            <HeaderTitle>{title}</HeaderTitle>
        </Header>
    );
};

// React.memo로 렌더링 최적화 (onBack 함수 참조가 변경될 때만 리렌더링)
export const ChatHeader = memo(ChatHeaderComponent); 