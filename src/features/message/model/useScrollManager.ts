import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { throttle } from 'lodash';

export const useScrollManager = (chatAreaRef: React.RefObject<HTMLDivElement>) => {
    const lastScrollPosRef = useRef(0);
    const scrollHeightBeforeUpdateRef = useRef(0);
    const isPreviousMessagesLoadingRef = useRef(false);
    const firstVisibleMessageRef = useRef<string | null>(null);
    const isNearBottom = useRef(true);
    const lastScrollHeight = useRef(0);
    
    // 스크롤 복원을 위한 상태
    const [scrollRestoreInfo, setScrollRestoreInfo] = useState<{
        shouldRestore: boolean;
        targetMessageId?: string;
        heightDifference?: number;
        originalScrollTop?: number;
    }>({ shouldRestore: false });

    const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
        if (chatAreaRef.current) {
            chatAreaRef.current.scrollTo({
                top: chatAreaRef.current.scrollHeight,
                behavior
            });
        }
    }, [chatAreaRef]);

    // 부드러운 스크롤 복원 함수
    const restoreScrollPosition = useCallback(() => {
        if (!chatAreaRef.current || !scrollRestoreInfo.shouldRestore) return;

        const chatArea = chatAreaRef.current;
        
        // 타겟 메시지가 있으면 해당 메시지로 스크롤
        if (scrollRestoreInfo.targetMessageId) {
            const targetElement = document.getElementById(`msg-${scrollRestoreInfo.targetMessageId}`);
            if (targetElement) {
                // 부드러운 스크롤로 해당 메시지를 화면 상단에 위치
                targetElement.scrollIntoView({ 
                    block: 'start', 
                    behavior: 'auto' // 즉시 이동 (깜빡임 방지)
                });
                console.log("타겟 메시지로 부드럽게 스크롤:", scrollRestoreInfo.targetMessageId);
                setScrollRestoreInfo({ shouldRestore: false });
                isPreviousMessagesLoadingRef.current = false;
                return;
            }
        }

        // 높이 차이로 계산된 위치로 복원
        if (scrollRestoreInfo.heightDifference !== undefined && scrollRestoreInfo.originalScrollTop !== undefined) {
            const newScrollPosition = scrollRestoreInfo.originalScrollTop + scrollRestoreInfo.heightDifference;
            
            // 부드러운 전환을 위해 CSS transition 활용
            chatArea.style.scrollBehavior = 'auto';
            chatArea.scrollTop = newScrollPosition;
            
            console.log("스크롤 위치 복원:", {
                original: scrollRestoreInfo.originalScrollTop,
                heightDiff: scrollRestoreInfo.heightDifference,
                new: newScrollPosition
            });
        }

        setScrollRestoreInfo({ shouldRestore: false });
        isPreviousMessagesLoadingRef.current = false;
    }, [chatAreaRef, scrollRestoreInfo, isPreviousMessagesLoadingRef]);

    // 스크롤 핸들러 함수 (throttle 적용 전)
    const scrollHandler = useCallback(() => {
        if (!chatAreaRef.current || isPreviousMessagesLoadingRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = chatAreaRef.current;
        
        if (lastScrollPosRef.current === scrollTop) return;
        
        const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 20;
        isNearBottom.current = isAtBottom;
        lastScrollHeight.current = scrollHeight;
        lastScrollPosRef.current = scrollTop;
    }, [chatAreaRef]);

    // throttle이 적용된 스크롤 핸들러 (useMemo 사용)
    const handleScroll = useMemo(() => {
        return throttle(scrollHandler, 100);
    }, [scrollHandler]);

    // 이전 메시지 로딩 준비
    const prepareForPreviousMessages = useCallback((targetMessageId: string) => {
        if (!chatAreaRef.current) return;
        
        isPreviousMessagesLoadingRef.current = true;
        firstVisibleMessageRef.current = targetMessageId;
        
        if (chatAreaRef.current) {
            scrollHeightBeforeUpdateRef.current = chatAreaRef.current.scrollHeight;
            lastScrollPosRef.current = chatAreaRef.current.scrollTop;
            
            console.log("스크롤 위치 저장:", {
                scrollHeight: scrollHeightBeforeUpdateRef.current,
                scrollTop: lastScrollPosRef.current
            });
        }
        
        console.log("이전 메시지 로딩 준비:", { targetMessageId });
    }, [chatAreaRef]);

    // 이전 메시지 로딩 완료 후 스크롤 복원 설정
    const finalizePreviousMessagesLoad = useCallback((targetMessageId: string) => {
        if (!chatAreaRef.current) return;

        const chatArea = chatAreaRef.current;
        const newScrollHeight = chatArea.scrollHeight;
        const heightDifference = newScrollHeight - scrollHeightBeforeUpdateRef.current;

        setScrollRestoreInfo({
            shouldRestore: true,
            targetMessageId,
            heightDifference,
            originalScrollTop: lastScrollPosRef.current
        });

        console.log("스크롤 복원 정보 설정:", {
            targetMessageId,
            heightDifference,
            originalScrollTop: lastScrollPosRef.current,
            newScrollHeight
        });
    }, [chatAreaRef]);

    // 스크롤 복원 실행 (useEffect로 DOM 업데이트 후 실행)
    useEffect(() => {
        if (scrollRestoreInfo.shouldRestore) {
            // 다음 프레임에서 실행하여 DOM 업데이트가 완료된 후 복원
            const timeoutId = setTimeout(restoreScrollPosition, 0);
            return () => clearTimeout(timeoutId);
        }
    }, [scrollRestoreInfo, restoreScrollPosition]);

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
        prepareForPreviousMessages,
        finalizePreviousMessagesLoad,
        restoreScrollPosition
    };
}; 