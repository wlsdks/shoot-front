import React from 'react';
import styled from 'styled-components';
import { ReactionItem } from '../../../entities';
import { normalizeReactions } from '../../../shared/lib/reactionsUtils';

const ReactionContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 3px;
    margin-top: 2px;
    margin-bottom: 0;
    position: relative;
    padding: 0;
`;

const ReactionButton = styled.button<{ $isActive: boolean }>`
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 2px 6px;
    border: 1px solid ${({ $isActive }) => $isActive ? '#007bff' : '#e0e0e0'};
    border-radius: 10px;
    background: ${({ $isActive }) => $isActive ? '#e3f2fd' : '#fff'};
    color: ${({ $isActive }) => $isActive ? '#007bff' : '#666'};
    font-size: 0.65rem;
    cursor: pointer;
    transition: all 0.2s ease;
    min-height: 20px;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
    
    &:hover {
        border-color: #007bff;
        background: ${({ $isActive }) => $isActive ? '#d1ecf1' : '#f8f9ff'};
        transform: translateY(-1px);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    &:active {
        transform: translateY(0);
        box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
    }
`;

const EmojiSpan = styled.span`
    font-size: 11px;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 12px;
`;

const CountSpan = styled.span`
    font-size: 0.6rem;
    font-weight: 600;
    min-width: 8px;
    text-align: center;
    line-height: 1;
`;

interface MessageReactionPropsUpdated {
    messageId: string;
    userId?: number;
    reactions: ReactionItem[] | Record<string, number[]>; // 두 구조 모두 지원
    onReactionUpdate: (reactions: Record<string, number[]>) => void;
}

export const MessageReaction: React.FC<MessageReactionPropsUpdated> = ({ 
    messageId, 
    userId, 
    reactions, 
    onReactionUpdate 
}) => {
    const normalizedReactions = normalizeReactions(reactions);
    
    if (!normalizedReactions || normalizedReactions.length === 0) {
        return null;
    }

    const handleReaction = async (reactionType: string) => {
        const currentReaction = normalizedReactions.find(r => r.reactionType === reactionType);
        const currentUserIds = currentReaction?.userIds || [];
        const hasReacted = currentUserIds.includes(userId || 0);
        
        let updatedUserIds: number[];
        
        if (hasReacted) {
            // 반응 제거
            updatedUserIds = currentUserIds.filter(id => id !== (userId || 0));
        } else {
            // 반응 추가
            updatedUserIds = [...currentUserIds, userId || 0];
        }
        
        // Record 형태로 변환하여 상위 컴포넌트에 전달
        const updatedReactions: Record<string, number[]> = {};
        normalizedReactions.forEach(reaction => {
            if (reaction.reactionType === reactionType) {
                updatedReactions[reactionType] = updatedUserIds;
            } else {
                updatedReactions[reaction.reactionType] = reaction.userIds;
            }
        });
        
        onReactionUpdate(updatedReactions);
    };

    return (
        <ReactionContainer>
            {normalizedReactions.map((reaction) => {
                const isActive = reaction.userIds.includes(userId || 0);
                
                return (
                    <ReactionButton
                        key={reaction.reactionType}
                        $isActive={isActive}
                        onClick={() => handleReaction(reaction.reactionType)}
                    >
                        <EmojiSpan>{reaction.emoji}</EmojiSpan>
                        <CountSpan>{reaction.count}</CountSpan>
                    </ReactionButton>
                );
            })}
        </ReactionContainer>
    );
}; 