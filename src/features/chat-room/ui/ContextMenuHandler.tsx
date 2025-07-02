import React, { memo } from 'react';
import { Button } from 'antd';
import { SmileOutlined } from '@ant-design/icons';
import { ContextMenu, ContextMenuItem } from '../styles/ChatRoom.styles';
import { ForwardIcon, PinIcon } from './icons';
import { ChatMessageItem } from '../../message/types/ChatRoom.types';
import { ReactionType } from '../../message-reaction/api/reactionApi';
import { hasReactionType } from '../../../shared/lib/reactionsUtils';

interface ContextMenuState {
    visible: boolean;
    x: number;
    y: number;
    message: ChatMessageItem | null;
}

interface ContextMenuHandlerProps {
    contextMenu: ContextMenuState;
    showReactionPicker: boolean;
    reactionTypes: ReactionType[];
    pinnedMessages: ChatMessageItem[];
    userId: number | undefined;
    onForwardClick: () => void;
    onPinMessage: () => Promise<void>;
    onUnpinMessage: (messageId: string) => Promise<void>;
    onShowReactionPicker: (e: React.MouseEvent) => void;
    onHideReactionPicker: () => void;
    onReactionSelect: (reactionType: string) => Promise<void>;
    onCloseContextMenu: () => void;
}

const ContextMenuHandlerComponent: React.FC<ContextMenuHandlerProps> = ({
    contextMenu,
    showReactionPicker,
    reactionTypes,
    pinnedMessages,
    userId,
    onForwardClick,
    onPinMessage,
    onUnpinMessage,
    onShowReactionPicker,
    onHideReactionPicker,
    onReactionSelect,
    onCloseContextMenu
}) => {
    if (!contextMenu.visible) return null;

    const isPinned = contextMenu.message && pinnedMessages.some(msg => msg.id === contextMenu.message?.id);

    return (
        <ContextMenu $x={contextMenu.x} $y={contextMenu.y}>
            {!showReactionPicker ? (
                <>
                    <ContextMenuItem onClick={onShowReactionPicker}>
                        <SmileOutlined /> 반응 추가
                    </ContextMenuItem>
                    <ContextMenuItem onClick={onForwardClick}>
                        <ForwardIcon /> 메시지 전달
                    </ContextMenuItem>
                    {isPinned ? (
                        <ContextMenuItem onClick={() => {
                            if (contextMenu.message) onUnpinMessage(contextMenu.message.id);
                            onCloseContextMenu();
                        }}>
                            <PinIcon /> 공지사항 해제
                        </ContextMenuItem>
                    ) : (
                        <ContextMenuItem onClick={onPinMessage}>
                            <PinIcon /> 공지사항 등록
                        </ContextMenuItem>
                    )}
                </>
            ) : (
                <>
                    <div style={{ 
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '4px',
                        padding: '8px',
                        borderBottom: '1px solid #f0f0f0',
                        marginBottom: '4px'
                    }}>
                        {reactionTypes.map((type) => (
                            <Button
                                key={type.code}
                                type="text"
                                onClick={() => onReactionSelect(type.code)}
                                style={{
                                    fontSize: '20px',
                                    padding: '4px',
                                    height: '32px',
                                    width: '32px',
                                    minWidth: '32px',
                                    backgroundColor: hasReactionType(contextMenu.message?.reactions, type.code, userId || 0)
                                        ? '#e6f7ff' 
                                        : 'transparent',
                                }}
                            >
                                {type.emoji}
                            </Button>
                        ))}
                    </div>
                    <ContextMenuItem onClick={onHideReactionPicker}>
                        <SmileOutlined /> 다른 반응
                    </ContextMenuItem>
                </>
            )}
        </ContextMenu>
    );
};

// React.memo로 렌더링 최적화
export const ContextMenuHandler = memo(ContextMenuHandlerComponent, (prevProps: ContextMenuHandlerProps, nextProps: ContextMenuHandlerProps) => {
    // 컨텍스트 메뉴나 리액션 피커 상태가 변경될 때만 리렌더링
    return (
        prevProps.contextMenu === nextProps.contextMenu &&
        prevProps.showReactionPicker === nextProps.showReactionPicker &&
        prevProps.reactionTypes === nextProps.reactionTypes &&
        prevProps.pinnedMessages === nextProps.pinnedMessages &&
        prevProps.userId === nextProps.userId &&
        prevProps.onForwardClick === nextProps.onForwardClick &&
        prevProps.onPinMessage === nextProps.onPinMessage &&
        prevProps.onUnpinMessage === nextProps.onUnpinMessage &&
        prevProps.onShowReactionPicker === nextProps.onShowReactionPicker &&
        prevProps.onHideReactionPicker === nextProps.onHideReactionPicker &&
        prevProps.onReactionSelect === nextProps.onReactionSelect &&
        prevProps.onCloseContextMenu === nextProps.onCloseContextMenu
    );
}); 