import React, { memo } from 'react';
import { Message as ChatMessageItem, MessageStatus } from '../../../entities';
import { MessagesContainer } from '../styles/ChatRoom.styles';
import { MessageRow } from './MessageRow';
import { UrlPreview } from './UrlPreview';
import { DateSeparator } from './DateSeparator';
import { formatTime } from '../../../shared';

interface MessagesListProps {
    messages: ChatMessageItem[];
    userId: number | undefined;
    input: string;
    onContextMenu: (e: React.MouseEvent, message: ChatMessageItem) => void;
    onClick: (e: React.MouseEvent, message: ChatMessageItem) => void;
    onReactionUpdate?: (messageId: string, updatedReactions: any) => void;
    onRetryMessage?: (message: ChatMessageItem) => void;
    onDeleteMessage?: (message: ChatMessageItem) => void;
}

const MessagesListComponent: React.FC<MessagesListProps> = ({
    messages,
    userId,
    input,
    onContextMenu,
    onClick,
    onReactionUpdate,
    onRetryMessage,
    onDeleteMessage
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

    const handleRetryMessage = (msg: ChatMessageItem) => {
        onRetryMessage?.(msg);
    };

    const handleDeleteMessage = (msg: ChatMessageItem) => {
        onDeleteMessage?.(msg);
    };

    const renderStatusIndicator = (msg: ChatMessageItem, isOwn: boolean, isPersisted: boolean, otherHasRead: boolean): JSX.Element | null => {
        if (!isOwn) return null;
        
        // 1. 전송 중: 회색 스피너
        if (msg.isSending) {
            return (
                <span style={{ 
                    fontSize: '0.8rem', 
                    color: '#999',
                    marginLeft: '4px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '2px'
                }}>
                    <span style={{ 
                        width: '8px', 
                        height: '8px', 
                        border: '1px solid #999', 
                        borderRadius: '50%',
                        borderTopColor: 'transparent',
                        animation: 'spin 1s linear infinite'
                    }} />
                </span>
            );
        }
        
        // 2. 전송 실패: 작은 삭제/재전송 버튼
        if (msg.status === MessageStatus.FAILED) {
            return (
                <span style={{ 
                    marginLeft: '4px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                }}>
                    {/* 삭제 버튼 */}
                    <button 
                        style={{ 
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.7rem',
                            color: '#999',
                            padding: '2px',
                            borderRadius: '2px',
                            width: '16px',
                            height: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease'
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMessage(msg);
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(244, 67, 54, 0.1)';
                            e.currentTarget.style.color = '#f44336';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#999';
                        }}
                        title="메시지 삭제"
                    >
                        ×
                    </button>
                    
                    {/* 재전송 버튼 */}
                    <button 
                        style={{ 
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.7rem',
                            color: '#999',
                            padding: '2px',
                            borderRadius: '2px',
                            width: '16px',
                            height: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease'
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleRetryMessage(msg);
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
                            e.currentTarget.style.color = '#4CAF50';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#999';
                        }}
                        title="재전송"
                    >
                        ↻
                    </button>
                </span>
            );
        }
        
        // 3. 전송 완료된 경우만 읽음 상태 표시 (카카오톡 스타일)
        if (isPersisted) {
            if (otherHasRead) {
                // 읽음: 아무것도 표시하지 않음 (카카오톡 스타일)
                return null;
            } else {
                // 전송됨 (읽지 않음): 검은색 "1" 표시
                return (
                    <span style={{ 
                        fontSize: '0.7rem', 
                        color: '#333',
                        marginLeft: '4px',
                        fontWeight: '500'
                    }}>
                        1
                    </span>
                );
            }
        }
        
        return null;
    };

    const isSameDate = (date1: string, date2: string) => {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        return d1.toDateString() === d2.toDateString();
    };

    return (
        <MessagesContainer className={input ? 'typing' : ''}>
            {messages.map((msg, idx) => {
                const isOwn = String(msg.senderId) === String(userId);
                const isPersisted = !!msg.id && msg.id !== msg.tempId && !msg.isSending;
                
                const otherParticipants = msg.readBy 
                    ? Object.keys(msg.readBy).filter(id => id !== userId?.toString()) 
                    : [];
                
                const otherHasRead = calculateReadStatus(isOwn, isPersisted, otherParticipants, msg);
                const statusIndicator = renderStatusIndicator(msg, isOwn, isPersisted, otherHasRead);
                
                const nextMessage = messages[idx + 1];
                const msgCreatedAt = getMessageCreatedAt(msg);
                const currentTime = formatTime(msgCreatedAt);
                const nextTime = nextMessage ? formatTime(getMessageCreatedAt(nextMessage)) : null;
                const showTime = !nextMessage || currentTime !== nextTime;
                
                // 날짜 구분선 표시 여부 확인
                const prevMessage = messages[idx - 1];
                const showDateSeparator = !prevMessage || !isSameDate(
                    getMessageCreatedAt(prevMessage), 
                    msgCreatedAt
                );
                
                return (
                    <React.Fragment key={idx}>
                        {showDateSeparator && (
                            <DateSeparator date={msgCreatedAt} />
                        )}
                        <MessageRow
                            message={msg}
                            isOwn={isOwn}
                            showTime={showTime}
                            currentTime={currentTime}
                            statusIndicator={statusIndicator}
                            onContextMenu={onContextMenu}
                            onClick={onClick}
                            userId={userId}
                            onReactionUpdate={onReactionUpdate}
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

// React.memo로 렌더링 최적화
export const MessagesList = memo(MessagesListComponent, (prevProps: MessagesListProps, nextProps: MessagesListProps) => {
    // 얕은 비교로 최적화
    return (
        prevProps.messages === nextProps.messages &&
        prevProps.userId === nextProps.userId &&
        prevProps.input === nextProps.input &&
        prevProps.onContextMenu === nextProps.onContextMenu &&
        prevProps.onClick === nextProps.onClick &&
        prevProps.onReactionUpdate === nextProps.onReactionUpdate &&
        prevProps.onRetryMessage === nextProps.onRetryMessage &&
        prevProps.onDeleteMessage === nextProps.onDeleteMessage
    );
}); 