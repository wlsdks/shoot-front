import React from 'react';
import styled from 'styled-components';

// 리액션 아이템 타입
interface ReactionItem {
    reactionType: string;
    emoji: string;
    description: string;
    userIds: number[];
    count: number;
}

// Props 타입
interface MessageReactionProps {
    messageId: string;
    userId?: number;
    reactions: ReactionItem[];
    onReactionUpdate?: (messageId: string, updatedReactions: Record<string, number[]>) => void;
}

// 스타일 컴포넌트들
const ReactionContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 2px;
    margin-top: 2px;
`;

const ReactionButton = styled.button<{ $isActive: boolean }>`
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 1px 4px;
    border: 1px solid ${({ $isActive, theme }) => $isActive ? theme?.colors?.primary || '#007bff' : '#dee2e6'};
    border-radius: 8px;
    background-color: ${({ $isActive, theme }) => $isActive ? theme?.colors?.primary + '10' || '#007bff10' : 'transparent'};
    color: ${({ $isActive, theme }) => $isActive ? theme?.colors?.primary || '#007bff' : '#6c757d'};
    font-size: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
    min-height: 18px;
    
    &:hover {
        background-color: ${({ theme }) => theme?.colors?.light || '#f8f9fa'};
        border-color: ${({ theme }) => theme?.colors?.primary || '#007bff'};
    }
    
    &:active {
        transform: scale(0.95);
    }
`;

const EmojiSpan = styled.span`
    font-size: 11px;
    line-height: 1;
`;

const CountSpan = styled.span`
    font-size: 9px;
    font-weight: 500;
    line-height: 1;
`;

export const MessageReaction: React.FC<MessageReactionProps> = ({
    messageId,
    userId,
    reactions,
    onReactionUpdate
}) => {
    const handleReactionClick = (reactionType: string) => {
        if (!userId || !onReactionUpdate) return;
        
        // 현재 사용자가 해당 리액션을 이미 눌렀는지 확인
        const reaction = reactions.find(r => r.reactionType === reactionType);
        const hasReacted = reaction?.userIds.includes(userId) || false;
        
        // 리액션 상태 토글
        const updatedReactions: Record<string, number[]> = {};
        reactions.forEach(r => {
            if (r.reactionType === reactionType) {
                if (hasReacted) {
                    // 리액션 제거
                    const newUserIds = r.userIds.filter(id => id !== userId);
                    if (newUserIds.length > 0) {
                        updatedReactions[reactionType] = newUserIds;
                    }
                } else {
                    // 리액션 추가
                    updatedReactions[reactionType] = [...r.userIds, userId];
                }
            } else {
                // 다른 리액션들은 그대로 유지
                updatedReactions[r.reactionType] = r.userIds;
            }
        });
        
        // 새로운 리액션인 경우 추가
        if (!reaction && !hasReacted) {
            updatedReactions[reactionType] = [userId];
        }
        
        onReactionUpdate(messageId, updatedReactions);
    };
    
    if (!reactions || reactions.length === 0) {
        return null;
    }
    
    return (
        <ReactionContainer>
            {reactions.map((reaction) => {
                const isActive = userId ? reaction.userIds.includes(userId) : false;
                
                return (
                    <ReactionButton
                        key={reaction.reactionType}
                        $isActive={isActive}
                        onClick={() => handleReactionClick(reaction.reactionType)}
                        title={`${reaction.description} ${reaction.count}명`}
                    >
                        <EmojiSpan>{reaction.emoji}</EmojiSpan>
                        <CountSpan>{reaction.count}</CountSpan>
                    </ReactionButton>
                );
            })}
        </ReactionContainer>
    );
}; 