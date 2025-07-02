import React from 'react';
import { ChatMessageItem } from '../../message/types/ChatRoom.types';
import {
    PinnedMessagesContainer,
    PinnedMessagesHeader,
    PinnedMessagesTitle,
    PinnedMessagesSummary,
    PinnedMessagesContent,
    PinnedMessageItem,
    PinnedMessageSender,
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
                    <span>📌</span>
                    <span>공지사항 ({pinnedMessages.length})</span>
                </PinnedMessagesTitle>

                {!isExpanded && pinnedMessages.length > 0 && (
                    <PinnedMessagesSummary>
                        <strong>
                            {pinnedMessages[0].senderId === currentUserId ? '나' : '상대방'}: {pinnedMessages[0].content?.text}
                        </strong>
                    </PinnedMessagesSummary>
                )}

                <span style={{ fontSize: '0.8rem', color: '#856404' }}>
                    {isExpanded ? '△' : '▽'}
                </span>
            </PinnedMessagesHeader>

            {isExpanded && (
                <PinnedMessagesContent>
                    {pinnedMessages.map((pinnedMsg) => (
                        <PinnedMessageItem key={pinnedMsg.id}>
                            <PinnedMessageSender>
                                {pinnedMsg.senderId === currentUserId ? '나' : '상대방'}
                            </PinnedMessageSender>
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