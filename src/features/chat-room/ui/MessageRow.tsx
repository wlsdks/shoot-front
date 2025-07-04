import React, { memo, useState, useEffect } from 'react';
import { Message as ChatMessageItem } from '../../../entities';
import { MessageRow as StyledMessageRow, ChatBubble, TimeContainer, ReadIndicator } from '../styles/ChatRoom.styles';
import { MessageReaction } from '../../../shared';
import { normalizeReactions } from '../../../shared/lib/reactionsUtils';
import styled from 'styled-components';

const MessageContainer = styled.div<{ $isOwnMessage: boolean }>`
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: ${({ $isOwnMessage }) => ($isOwnMessage ? 'flex-end' : 'flex-start')};
    width: 100%;
`;

const MessageContentRow = styled.div<{ $isOwnMessage: boolean }>`
    display: flex;
    align-items: flex-end;
    justify-content: ${({ $isOwnMessage }) => ($isOwnMessage ? "flex-end" : "flex-start")};
    width: 100%;
    gap: 1px;
`;

const ReactionArea = styled.div<{ $isOwnMessage: boolean }>`
    margin-top: 1px;
    align-self: ${({ $isOwnMessage }) => ($isOwnMessage ? 'flex-end' : 'flex-start')};
`;

// API 응답 구조에 맞는 타입 정의
interface ReactionItem {
    reactionType: string;
    emoji: string;
    description: string;
    userIds: number[];
    count: number;
}

interface MessageRowProps {
    message: ChatMessageItem;
    isOwn: boolean;
    showTime: boolean;
    currentTime: string;
    userId: number | undefined;
    statusIndicator: JSX.Element | null;
    indicatorText: string;
    onContextMenu: (e: React.MouseEvent, message: ChatMessageItem) => void;
    onClick: (e: React.MouseEvent, message: ChatMessageItem) => void;
    onReactionUpdate?: (messageId: string, updatedReactions: any) => void;
}

const MessageRowComponent: React.FC<MessageRowProps> = ({
    message,
    isOwn,
    showTime,
    currentTime,
    userId,
    statusIndicator,
    indicatorText,
    onContextMenu,
    onClick,
    onReactionUpdate
}) => {
    // 로컬 상태로 반응 관리
    const [localReactions, setLocalReactions] = useState<ReactionItem[]>(
        normalizeReactions(message.reactions)
    );

    // 메시지 reactions가 변경될 때 로컬 상태 업데이트 (실시간 반영)
    useEffect(() => {
        setLocalReactions(normalizeReactions(message.reactions));
    }, [message.reactions]);

    const hasReactions = localReactions && localReactions.length > 0;

    // 테스트용 반응 추가 (메시지 더블클릭시) - 스크롤 조정 포함
    const handleDoubleClick = (e: React.MouseEvent, msg: ChatMessageItem) => {
        e.preventDefault();
        
        // 테스트용 좋아요 반응 추가
        setLocalReactions(prev => {
            const existingLike = prev.find(r => r.reactionType === 'like');
            const hasLiked = existingLike?.userIds.includes(userId || 0) || false;
            
            let newReactions;
            if (hasLiked) {
                // 좋아요 제거
                newReactions = prev.map(reaction => {
                    if (reaction.reactionType === 'like') {
                        const newUserIds = reaction.userIds.filter(id => id !== (userId || 0));
                        return {
                            ...reaction,
                            userIds: newUserIds,
                            count: newUserIds.length
                        };
                    }
                    return reaction;
                }).filter(reaction => reaction.count > 0);
            } else {
                // 좋아요 추가
                if (existingLike) {
                    newReactions = prev.map(reaction => {
                        if (reaction.reactionType === 'like') {
                            const newUserIds = [...reaction.userIds, userId || 0];
                            return {
                                ...reaction,
                                userIds: newUserIds,
                                count: newUserIds.length
                            };
                        }
                        return reaction;
                    });
                } else {
                    newReactions = [...prev, {
                        reactionType: 'like',
                        emoji: '👍',
                        description: '좋아요',
                        userIds: [userId || 0],
                        count: 1
                    }];
                }
            }
            
            // 상위 컴포넌트에 리액션 업데이트 알림 (스크롤 조정용)
            if (onReactionUpdate) {
                const reactionsAsRecord: Record<string, number[]> = {};
                newReactions.forEach(reaction => {
                    reactionsAsRecord[reaction.reactionType] = reaction.userIds;
                });
                onReactionUpdate(message.id, reactionsAsRecord);
            }
            
            return newReactions;
        });
    };

    const handleReactionUpdate = (messageId: string, updatedReactions: Record<string, number[]>) => {
        // Record를 ReactionItem[] 배열로 변환하고 즉시 화면에 반영
        const reactionItems = normalizeReactions(updatedReactions);
        setLocalReactions(reactionItems);
        
        // 상위 컴포넌트에 리액션 업데이트 알림 (스크롤 조정용)
        if (onReactionUpdate) {
            onReactionUpdate(messageId, updatedReactions);
        }
    };

    return (
        <StyledMessageRow id={`msg-${message.id}`} $isOwnMessage={isOwn}>
            <MessageContainer $isOwnMessage={isOwn}>
                {/* 내 메시지가 아닌 경우 (상대방): 말풍선 + 시간/상태가 가로로 배치 */}
                {!isOwn && (
                    <MessageContentRow $isOwnMessage={isOwn}>
                        <ChatBubble 
                            $isOwnMessage={isOwn}
                            onContextMenu={(e) => onContextMenu(e, message)}
                            onClick={(e) => onClick(e, message)}
                            onDoubleClick={(e) => handleDoubleClick(e, message)}
                            title="더블클릭하여 좋아요 반응 추가/제거"
                        >
                            <div>
                                {message.content?.text}
                            </div>
                        </ChatBubble>
                        
                        {/* 시간/상태 표시 - 말풍선 오른쪽에 */}
                        {(showTime || statusIndicator || indicatorText) && (
                            <TimeContainer $isOwnMessage={isOwn}>
                                {indicatorText && (
                                    <ReadIndicator>{indicatorText}</ReadIndicator>
                                )}
                                {showTime && (
                                    <div>{currentTime}</div>
                                )}
                                {statusIndicator}
                            </TimeContainer>
                        )}
                    </MessageContentRow>
                )}

                {/* 내 메시지인 경우: 시간/상태 + 말풍선이 가로로 배치 */}
                {isOwn && (
                    <MessageContentRow $isOwnMessage={isOwn}>
                        {/* 시간/상태 표시 - 말풍선 왼쪽에 */}
                        {(showTime || statusIndicator || indicatorText) && (
                            <TimeContainer $isOwnMessage={isOwn}>
                                {indicatorText && (
                                    <ReadIndicator>{indicatorText}</ReadIndicator>
                                )}
                                {showTime && (
                                    <div>{currentTime}</div>
                                )}
                                {statusIndicator}
                            </TimeContainer>
                        )}
                        
                        <ChatBubble 
                            $isOwnMessage={isOwn}
                            onContextMenu={(e) => onContextMenu(e, message)}
                            onClick={(e) => onClick(e, message)}
                            onDoubleClick={(e) => handleDoubleClick(e, message)}
                            title="더블클릭하여 좋아요 반응 추가/제거"
                        >
                            <div>
                                {message.content?.text}
                            </div>
                        </ChatBubble>
                    </MessageContentRow>
                )}
                
                {/* 메시지 리액션은 말풍선 아래에 별도 영역으로 표시 */}
                {hasReactions && (
                    <ReactionArea $isOwnMessage={isOwn}>
                        <MessageReaction
                            messageId={message.id}
                            userId={userId}
                            reactions={localReactions}
                            onReactionUpdate={handleReactionUpdate}
                        />
                    </ReactionArea>
                )}
            </MessageContainer>
        </StyledMessageRow>
    );
};

// React.memo로 렌더링 최적화 - 메시지별 개별 메모이제이션
export const MessageRow = memo(MessageRowComponent, (prevProps, nextProps) => {
    // 메시지 내용, 상태, 시간 표시 여부 등이 동일하면 리렌더링 하지 않음
    return (
        prevProps.message === nextProps.message &&
        prevProps.isOwn === nextProps.isOwn &&
        prevProps.showTime === nextProps.showTime &&
        prevProps.currentTime === nextProps.currentTime &&
        prevProps.userId === nextProps.userId &&
        prevProps.statusIndicator === nextProps.statusIndicator &&
        prevProps.indicatorText === nextProps.indicatorText &&
        prevProps.onContextMenu === nextProps.onContextMenu &&
        prevProps.onClick === nextProps.onClick &&
        prevProps.onReactionUpdate === nextProps.onReactionUpdate
    );
}); 