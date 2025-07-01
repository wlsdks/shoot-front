import React from 'react';
import { Header, BackButton, HeaderTitle } from '../../message/ui/styles/ChatRoom.styles';
import { BackIcon } from '../../message/ui/icons';

interface ChatHeaderProps {
    onBack: () => void;
    title?: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ onBack, title = "채팅방" }) => {
    return (
        <Header>
            <BackButton onClick={onBack}>
                <BackIcon />
            </BackButton>
            <HeaderTitle>{title}</HeaderTitle>
        </Header>
    );
}; 