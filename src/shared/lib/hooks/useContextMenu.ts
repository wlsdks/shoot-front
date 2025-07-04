import { useState, useCallback } from 'react';
import { ContextMenuState } from '../types/common';

export const useContextMenu = () => {
    const [contextMenu, setContextMenu] = useState<ContextMenuState>({
        visible: false,
        x: 0,
        y: 0,
        message: null
    });

    const closeContextMenu = useCallback(() => {
        setContextMenu(prev => ({ ...prev, visible: false, message: null }));
    }, []);

    const openContextMenu = useCallback((x: number, y: number, message: any = null) => {
        setContextMenu({ visible: true, x, y, message });
    }, []);

    return {
        contextMenu,
        setContextMenu,
        closeContextMenu,
        openContextMenu
    };
}; 