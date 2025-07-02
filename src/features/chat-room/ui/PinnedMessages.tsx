import React from 'react';
import { ChatMessageItem } from '../../message/types/ChatRoom.types';
import {
    PinnedMessagesContainer,
    PinnedMessagesHeader,
    PinnedMessagesTitle,
    PinnedMessagesContent,
    PinnedMessageItem,
    PinnedMessageText,
    PinnedMessageDate
} from '../styles/ChatRoom.styles';
import { formatTime } from '../../message/lib/timeUtils';

interface PinnedMessagesProps {
    pinnedMessages: ChatMessageItem[];
    isExpanded: boolean;
    onToggleExpand: () => void;
    currentUserId?: number;
}

export const PinnedMessages: React.FC<PinnedMessagesProps> = ({
    pinnedMessages,
    isExpanded,
    onToggleExpand,
    currentUserId
}) => {
    if (pinnedMessages.length === 0) return null;

    return (
        <PinnedMessagesContainer $isExpanded={isExpanded}>
            <PinnedMessagesHeader
                onClick={onToggleExpand}
                role="button"
                tabIndex={0}
            >
                <PinnedMessagesTitle>
                    <span style={{ marginRight: '6px', fontSize: '14px' }}>📌</span>
                    <span style={{ flex: 1 }}>
                        {pinnedMessages[0].content?.text}
                    </span>
                </PinnedMessagesTitle>

                <span style={{ fontSize: '0.7rem', color: '#6c757d', marginLeft: '6px' }}>
                    {isExpanded ? '△' : '▽'}
                </span>
            </PinnedMessagesHeader>

            {isExpanded && (
                <PinnedMessagesContent>
                    {pinnedMessages.map((pinnedMsg) => (
                        <PinnedMessageItem key={pinnedMsg.id}>
                            <PinnedMessageText>
                                {pinnedMsg.content?.text}
                            </PinnedMessageText>
                            <PinnedMessageDate>
                                {formatTime(pinnedMsg.createdAt)}
                            </PinnedMessageDate>
                        </PinnedMessageItem>
                    ))}
                </PinnedMessagesContent>
            )}
        </PinnedMessagesContainer>
    );
}; 