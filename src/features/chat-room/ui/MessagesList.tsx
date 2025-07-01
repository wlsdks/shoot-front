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
        // 내 메시지가 아니거나 저장되지 않은 경우 - 읽음 표시 안함
        if (!isOwn || !isPersisted) return true;

        // 다른 참여자가 없는 경우 - 읽지 않음 표시
        if (otherParticipants.length === 0) return false;

        // 모든 참여자가 읽었는지 확인
        const hasReadByAll = otherParticipants.every((id) => {
            const hasReadBy = Boolean(msg.readBy && msg.readBy[id]);
            return hasReadBy;
        });

        return hasReadByAll;
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