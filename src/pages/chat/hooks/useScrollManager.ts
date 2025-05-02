import { useCallback, useEffect, useRef } from 'react';
import { throttle } from 'lodash';

export const useScrollManager = (chatAreaRef: React.RefObject<HTMLDivElement>) => {
    const lastScrollPosRef = useRef(0);
    const scrollHeightBeforeUpdateRef = useRef(0);
    const isPreviousMessagesLoadingRef = useRef(false);
    const firstVisibleMessageRef = useRef<string | null>(null);
    const isNearBottom = useRef(true);
    const lastScrollHeight = useRef(0);

    const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
        if (chatAreaRef.current) {
            chatAreaRef.current.scrollTo({
                top: chatAreaRef.current.scrollHeight,
                behavior
            });
        }
    }, [chatAreaRef]);

    const handleScroll = useCallback(
        throttle(() => {
            if (!chatAreaRef.current) return;

            const { scrollTop, scrollHeight, clientHeight } = chatAreaRef.current;
            const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 20;
            isNearBottom.current = isAtBottom;
            lastScrollHeight.current = scrollHeight;
        }, 50),
        [chatAreaRef]
    );

    const saveScrollPosition = useCallback(() => {
        if (chatAreaRef.current) {
            scrollHeightBeforeUpdateRef.current = chatAreaRef.current.scrollHeight;
            lastScrollPosRef.current = chatAreaRef.current.scrollTop;
        }
    }, [chatAreaRef]);

    useEffect(() => {
        const chatArea = chatAreaRef.current;
        if (chatArea) {
            chatArea.addEventListener('scroll', handleScroll);
            handleScroll();
            return () => chatArea.removeEventListener('scroll', handleScroll);
        }
    }, [chatAreaRef, handleScroll]);

    return {
        lastScrollPosRef,
        scrollHeightBeforeUpdateRef,
        isPreviousMessagesLoadingRef,
        firstVisibleMessageRef,
        isNearBottom,
        lastScrollHeight: lastScrollHeight.current,
        scrollToBottom,
        handleScroll,
        saveScrollPosition
    };
}; 