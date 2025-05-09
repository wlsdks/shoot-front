import React from 'react';
import { ChatMessageItem } from '../model/types/ChatRoom.types';
import {
    PinnedMessagesContainer,
    PinnedMessagesHeader,
    ExpandButton,
    PinnedMessagesSummary,
    PinnedMessagesTitle,
    PinnedMessagesContent,
    PinnedMessageItem,
    PinnedMessageContent,
    PinnedMessageSender,
    UnpinButton
} from '../ui/styles/ChatRoom.styles';
import { PinIcon, ChevronDownIcon } from './icons';

interface PinnedMessagesProps {
    pinnedMessages: ChatMessageItem[];
    isExpanded: boolean;
    onToggleExpand: () => void;
    onUnpin: (messageId: string) => void;
    currentUserId?: number;
}

export const PinnedMessages: React.FC<PinnedMessagesProps> = ({
    pinnedMessages,
    isExpanded,
    onToggleExpand,
    onUnpin,
    currentUserId
}) => {
    if (pinnedMessages.length === 0) return null;

    return (
        <PinnedMessagesContainer $isExpanded={isExpanded}>
            <PinnedMessagesHeader 
                $isExpanded={isExpanded} 
                onClick={onToggleExpand}
            >
                <PinnedMessagesTitle>
                    <PinIcon /> 
                    <span>공지사항 ({pinnedMessages.length})</span>
                </PinnedMessagesTitle>
                
                {!isExpanded && pinnedMessages.length > 0 && (
                    <PinnedMessagesSummary>
                        <span>
                            {pinnedMessages[0].senderId === currentUserId ? '나' : '상대방'}: {pinnedMessages[0].content?.text}
                        </span>
                    </PinnedMessagesSummary>
                )}
                
                <ExpandButton $isExpanded={isExpanded}>
                    <ChevronDownIcon />
                </ExpandButton>
            </PinnedMessagesHeader>
            
            {isExpanded && (
                <PinnedMessagesContent>
                    {pinnedMessages.map((pinnedMsg) => (
                        <PinnedMessageItem key={`pinned-${pinnedMsg.id}`}>
                            <PinnedMessageContent>
                                <PinnedMessageSender>
                                    {pinnedMsg.senderId === currentUserId ? '나' : '상대방'}:
                                </PinnedMessageSender>
                                {pinnedMsg.content?.text}
                            </PinnedMessageContent>
                            <UnpinButton onClick={(e) => {
                                e.stopPropagation();
                                onUnpin(pinnedMsg.id);
                            }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </UnpinButton>
                        </PinnedMessageItem>
                    ))}
                </PinnedMessagesContent>
            )}
        </PinnedMessagesContainer>
    );
}; 