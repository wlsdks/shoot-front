import { useState, useEffect } from 'react';
import { ChatMessageItem } from '../types/ChatRoom.types';

interface ContextMenuState {
    visible: boolean;
    x: number;
    y: number;
    message: ChatMessageItem | null;
}

export const useContextMenu = () => {
    const [contextMenu, setContextMenu] = useState<ContextMenuState>({
        visible: false,
        x: 0,
        y: 0,
        message: null
    });

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (contextMenu.visible) {
                const menuElement = document.getElementById('context-menu');
                if (menuElement && !menuElement.contains(e.target as Node)) {
                    setContextMenu({ ...contextMenu, visible: false, message: null });
                }
            }
        };
        
        setTimeout(() => {
            window.addEventListener("click", handleClick);
        }, 0);
        
        return () => window.removeEventListener("click", handleClick);
    }, [contextMenu]);

    const handleContextMenu = (e: React.MouseEvent, message: ChatMessageItem) => {
        e.preventDefault();
        setContextMenu({ visible: true, x: e.clientX, y: e.clientY, message });
    };

    const closeContextMenu = () => {
        setContextMenu({ ...contextMenu, visible: false, message: null });
    };

    return {
        contextMenu,
        setContextMenu,
        handleContextMenu,
        closeContextMenu
    };
}; 