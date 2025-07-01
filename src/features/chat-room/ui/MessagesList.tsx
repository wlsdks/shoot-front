import React from 'react';
import { ChatMessageItem, MessageStatus, MessageStatusInfo } from '../../message/types/ChatRoom.types';
import { MessagesContainer } from '../../message/ui/styles/ChatRoom.styles';
import { MessageRow } from '../../message/ui/MessageRow';
import { UrlPreview } from '../../message/ui/UrlPreview';
import { formatTime } from '../../message/lib/timeUtils';

interface MessagesListProps {
    messages: ChatMessageItem[];
    messageStatuses: { [key: string]: MessageStatusInfo };
    userId: number | undefined;
    input: string;
    onContextMenu: (e: React.MouseEvent, message: ChatMessageItem) => void;
    onClick: (e: React.MouseEvent, message: ChatMessageItem) => void;
}

export const MessagesList: React.FC<MessagesListProps> = ({
    messages,
    messageStatuses,
    userId,
    input,
    onContextMenu,
    onClick
}) => {
    const getMessageCreatedAt = (msg: ChatMessageItem): string => {
        if (msg.createdAt && typeof msg.createdAt === 'object' && 'toISOString' in msg.createdAt) {
            return (msg.createdAt as Date).toISOString();
        }
        if (typeof msg.createdAt === 'string') {
            return msg.createdAt;
        }
        return new Date().toISOString();
    };

    const calculateReadStatus = (
        isOwn: boolean,
        isPersisted: boolean,
        otherParticipants: string[],
        msg: ChatMessageItem
    ): boolean => {
        if (!isOwn || !isPersisted) return false;
        
        if (!msg.readBy || Object.keys(msg.readBy).length === 0) return false;
        
        if (otherParticipants.length === 0) return true;
        
        return otherParticipants.some(participantId => {
            const readInfo = msg.readBy?.[participantId];
            // 기존 로직을 그대로 유지 (타입 체크 우회)
            return readInfo && typeof readInfo === 'object' && (readInfo as any).readAt && 
                   new Date((readInfo as any).readAt) > new Date(msg.createdAt);
        });
    };

    const renderStatusIndicator = (currentStatus: MessageStatus, isOwn: boolean, isPersisted: boolean): JSX.Element | null => {
        if (!isOwn || isPersisted) return null;
        
        switch (currentStatus) {
            case MessageStatus.SENDING:
                return <span style={{ fontSize: '0.7rem', color: '#999' }}>전송 중...</span>;
            case MessageStatus.FAILED:
                return <span style={{ fontSize: '0.7rem', color: '#f44336' }}>전송 실패</span>;
            default:
                return null;
        }
    };

    return (
        <MessagesContainer className={input ? 'typing' : ''}>
            {messages.map((msg, idx) => {
                const isOwn = String(msg.senderId) === String(userId);
                
                let currentStatus = msg.status;
                let isPersisted = false;
                
                if (msg.tempId && messageStatuses[msg.tempId]) {
                    const statusInfo = messageStatuses[msg.tempId];
                    currentStatus = statusInfo.status;
                    isPersisted = statusInfo.status === MessageStatus.SAVED || !!statusInfo.persistedId;
                } else {
                    isPersisted = !!msg.id && msg.id !== msg.tempId;
                }
                
                const otherParticipants = msg.readBy 
                    ? Object.keys(msg.readBy).filter(id => id !== userId?.toString()) 
                    : [];
                
                const otherHasRead = calculateReadStatus(isOwn, isPersisted, otherParticipants, msg);
                const indicatorText = isOwn && isPersisted && !otherHasRead ? "1" : "";
                const statusIndicator = renderStatusIndicator(currentStatus, isOwn, isPersisted);
                
                const nextMessage = messages[idx + 1];
                const msgCreatedAt = getMessageCreatedAt(msg);
                const currentTime = formatTime(msgCreatedAt);
                const nextTime = nextMessage ? formatTime(getMessageCreatedAt(nextMessage)) : null;
                const showTime = !nextMessage || currentTime !== nextTime;
                
                return (
                    <React.Fragment key={idx}>
                        <MessageRow
                            message={msg}
                            isOwn={isOwn}
                            showTime={showTime}
                            currentTime={currentTime}
                            statusIndicator={statusIndicator}
                            indicatorText={indicatorText}
                            onContextMenu={onContextMenu}
                            onClick={onClick}
                            userId={userId || 0}
                        />
                        {msg.content?.urlPreview && (
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: isOwn ? 'flex-end' : 'flex-start', 
                                width: '100%' 
                            }}>
                                <UrlPreview message={msg} />
                            </div>
                        )}
                    </React.Fragment>
                );
            })}
        </MessagesContainer>
    );
}; 