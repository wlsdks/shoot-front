import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { fadeIn } from '../commonStyles';

export const ContextMenuOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 999;
`;

export const ContextMenuContainer = styled.div<{ $x: number; $y: number }>`
    position: fixed;
    top: ${props => props.$y}px;
    left: ${props => props.$x}px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    border: 1px solid #e0e0e0;
    z-index: 1000;
    min-width: 150px;
    animation: ${fadeIn} 0.15s ease-out;
    overflow: hidden;
`;

export const ContextMenuItem = styled.button<{ 
    $variant?: 'default' | 'danger'; 
    disabled?: boolean 
}>`
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border: none;
    background: none;
    text-align: left;
    cursor: pointer;
    font-size: 0.875rem;
    transition: all 0.15s ease;
    color: ${props => {
        if (props.disabled) return '#9ca3af';
        if (props.$variant === 'danger') return '#dc3545';
        return '#374151';
    }};
    
    &:hover {
        background: ${props => {
            if (props.disabled) return 'transparent';
            if (props.$variant === 'danger') return '#fef2f2';
            return '#f8f9fa';
        }};
        color: ${props => {
            if (props.disabled) return '#9ca3af';
            if (props.$variant === 'danger') return '#b91c1c';
            return '#111827';
        }};
    }
    
    &:disabled {
        cursor: not-allowed;
    }
    
    svg {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
    }
`;

export const ContextMenuDivider = styled.div`
    height: 1px;
    background: #e5e7eb;
    margin: 0.25rem 0;
`;

interface ContextMenuAction {
    id: string;
    label: string;
    icon?: React.ReactNode;
    variant?: 'default' | 'danger';
    disabled?: boolean;
    onClick: () => void;
}

interface ContextMenuProps {
    isVisible: boolean;
    x: number;
    y: number;
    actions: (ContextMenuAction | 'divider')[];
    onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
    isVisible,
    x,
    y,
    actions,
    onClose
}) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isVisible) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isVisible, onClose]);

    // Adjust position to keep menu within viewport
    useEffect(() => {
        if (!isVisible || !menuRef.current) return;

        const menu = menuRef.current;
        const rect = menu.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let adjustedX = x;
        let adjustedY = y;

        // Adjust horizontal position
        if (rect.right > viewportWidth) {
            adjustedX = viewportWidth - rect.width - 10;
        }

        // Adjust vertical position
        if (rect.bottom > viewportHeight) {
            adjustedY = viewportHeight - rect.height - 10;
        }

        if (adjustedX !== x || adjustedY !== y) {
            menu.style.left = `${adjustedX}px`;
            menu.style.top = `${adjustedY}px`;
        }
    }, [isVisible, x, y]);

    if (!isVisible) return null;

    return (
        <ContextMenuOverlay onClick={onClose}>
            <ContextMenuContainer ref={menuRef} $x={x} $y={y}>
                {actions.map((action, index) => {
                    if (action === 'divider') {
                        return <ContextMenuDivider key={`divider-${index}`} />;
                    }

                    return (
                        <ContextMenuItem
                            key={action.id}
                            $variant={action.variant}
                            disabled={action.disabled}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!action.disabled) {
                                    action.onClick();
                                    onClose();
                                }
                            }}
                        >
                            {action.icon && <span>{action.icon}</span>}
                            {action.label}
                        </ContextMenuItem>
                    );
                })}
            </ContextMenuContainer>
        </ContextMenuOverlay>
    );
}; 