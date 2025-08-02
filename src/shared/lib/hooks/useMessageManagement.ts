import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Message as ChatMessageItem, MessageStatus } from '../../../entities';
import { WebSocketService, TypingIndicatorMessage } from '../../index';
import { debounce } from 'lodash';

// 메시지 상태 관리 인터페이스
export interface MessageState {
  messages: ChatMessageItem[];
  messageStatuses: Record<string, any>;
  messageDirection: string;
  initialLoadComplete: boolean;
}

// 메시지 상태 관리 액션
export interface MessageActions {
  setMessageDirection: (direction: string) => void;
  setInitialLoadComplete: (complete: boolean) => void;
  updateMessages: (message: ChatMessageItem) => void;
  updateMessageStatus: (tempId: string, status: any) => void;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessageItem[]>>;
  setMessageStatuses: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}

// 메시지 핸들러 Props
interface UseMessageHandlersProps {
  webSocketService: React.MutableRefObject<WebSocketService>;
  roomId: string | undefined;
  userId: number | undefined;
  updateMessages: (message: ChatMessageItem) => void;
  updateMessageStatus: (tempId: string, status: { status: MessageStatus; persistedId: string | null; createdAt: string }) => void;
  setMessageStatuses: React.Dispatch<React.SetStateAction<Record<string, { status: MessageStatus; persistedId: string | null; createdAt: string }>>>;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessageItem[]>>;
  messagesRef: React.MutableRefObject<ChatMessageItem[]>;
  messageStatuses: Record<string, { status: MessageStatus; persistedId: string | null; createdAt: string }>;
}

// 타이핑 핸들러 Props
interface UseTypingHandlersProps {
  webSocketService: React.MutableRefObject<WebSocketService>;
  roomId: string | undefined;
  userId: number | undefined;
  updateTypingStatus: (typingMsg: TypingIndicatorMessage) => void;
}

// 메시지 상태 관리 훅
export const useMessageState = () => {
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [messageStatuses, setMessageStatuses] = useState<Record<string, any>>({});
  const [messageDirection, setMessageDirection] = useState<string>("INITIAL");
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  // 참조들
  const messagesRef = useRef<ChatMessageItem[]>([]);
  const chatAreaRef = useRef<HTMLDivElement>(null);

  // 메시지 업데이트 함수
  const updateMessages = useCallback((newMessage: ChatMessageItem) => {
    setMessages(prevMessages => {
      // 강화된 중복 방지 - ID, tempId, content+timestamp 체크
      const exists = prevMessages.some(msg => {
        // ID나 tempId가 동일한 경우
        if ((msg.id && newMessage.id && msg.id === newMessage.id) || 
            (msg.tempId && newMessage.tempId && msg.tempId === newMessage.tempId)) {
          return true;
        }
        
        // 같은 사용자가 같은 시간에 같은 내용의 메시지를 보낸 경우 (중복 방지)
        if (msg.senderId === newMessage.senderId && 
            msg.content === newMessage.content &&
            msg.createdAt === newMessage.createdAt) {
          return true;
        }
        
        return false;
      });
      
      if (exists) {
        return prevMessages.map(msg => {
          const shouldUpdate = (msg.id && newMessage.id && msg.id === newMessage.id) || 
                              (msg.tempId && newMessage.tempId && msg.tempId === newMessage.tempId) ||
                              (msg.senderId === newMessage.senderId && 
                               msg.content === newMessage.content &&
                               msg.createdAt === newMessage.createdAt);
          
          return shouldUpdate ? { ...msg, ...newMessage } : msg;
        });
      }
      
      return [...prevMessages, newMessage];
    });
  }, []);

  // 메시지 상태 업데이트 함수
  const updateMessageStatus = useCallback((tempId: string, status: any) => {
    setMessageStatuses(prev => ({
      ...prev,
      [tempId]: { ...prev[tempId], ...status }
    }));
  }, []);

  return {
    // State
    messages,
    messageStatuses,
    messageDirection,
    initialLoadComplete,
    
    // Actions  
    setMessageDirection,
    setInitialLoadComplete,
    updateMessages,
    updateMessageStatus,
    setMessages,
    setMessageStatuses,
    
    // Refs
    messagesRef,
    chatAreaRef
  };
};

// 메시지 핸들러 훅
export const useMessageHandlers = ({
  webSocketService,
  roomId,
  userId,
  updateMessages,
  updateMessageStatus,
  setMessageStatuses,
  setMessages,
  messagesRef,
  messageStatuses
}: UseMessageHandlersProps) => {
  // 중복 상태 업데이트 방지를 위한 참조
  const lastStatusUpdateRef = useRef<Record<string, { status: string; timestamp: number }>>({});
  // 최근 전송된 메시지들의 tempId 추적
  const recentSentMessagesRef = useRef<string[]>([]);

  const handleMessage = useCallback((msg: ChatMessageItem) => {
    // 내가 보낸 메시지이고 tempId가 있으면 추적 목록에 추가
    if (msg.senderId === userId && msg.tempId) {
      recentSentMessagesRef.current.push(msg.tempId);
      // 최근 10개만 유지
      if (recentSentMessagesRef.current.length > 10) {
        recentSentMessagesRef.current = recentSentMessagesRef.current.slice(-10);
      }
    }
    
    updateMessages(msg);
    
    if (
      document.visibilityState === "visible" &&
      msg.readBy && !msg.readBy[userId!] &&
      msg.senderId !== userId &&
      msg.tempId && messageStatuses[msg.tempId]?.persistedId
    ) {
      webSocketService.current.sendMessage({
        ...msg,
        id: messageStatuses[msg.tempId].persistedId!
      });
    }
  }, [userId, updateMessages, messageStatuses, webSocketService]);

  const handleMessageStatus = useCallback((update: any) => {
    const statusUpdate = Array.isArray(update) 
      ? update[update.length - 1] 
      : update;
    
    if (!statusUpdate || !statusUpdate.tempId) {
      return;
    }

    // 중복 상태 업데이트 방지 (100ms 내 같은 상태는 무시)
    const now = Date.now();
    const lastUpdate = lastStatusUpdateRef.current[statusUpdate.tempId];
    if (lastUpdate && 
        lastUpdate.status === statusUpdate.status && 
        now - lastUpdate.timestamp < 100) {
      return;
    }

    lastStatusUpdateRef.current[statusUpdate.tempId] = {
      status: statusUpdate.status,
      timestamp: now
    };

    // 상태 업데이트 - 실제 변경이 있을 때만
    const existingStatus = messageStatuses[statusUpdate.tempId];
    
    const newStatus = {
      status: statusUpdate.status,
      persistedId: statusUpdate.persistedId || existingStatus?.persistedId,
      createdAt: statusUpdate.createdAt || existingStatus?.createdAt
    };
    
    // 상태가 실제로 변경된 경우에만 업데이트
    const hasStatusChanged = !existingStatus || 
      existingStatus.status !== newStatus.status || 
      existingStatus.persistedId !== newStatus.persistedId;
        
    if (!hasStatusChanged) {
      return;
    }
    
    setMessageStatuses((prev) => ({
      ...prev,
      [statusUpdate.tempId]: newStatus
    }));

    // 메시지 업데이트 - 메시지가 있는 경우 즉시 적용, 없으면 대안 매칭 시도
    let targetMessage = messagesRef.current.find(msg => msg.tempId === statusUpdate.tempId);
    
    if (!targetMessage) {
      // 최근 전송된 메시지 중에서 아직 상태가 SENDING인 메시지 찾기
      const pendingMessage = messagesRef.current
        .filter(msg => msg.senderId === userId && msg.status === "SENDING")
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
            
      if (pendingMessage) {
        targetMessage = pendingMessage;
        
        // 이 경우 실제 tempId를 업데이트하여 향후 매칭이 가능하도록 함
        setMessages((prev) => 
          prev.map(msg => 
            msg.tempId === pendingMessage.tempId 
              ? { 
                  ...msg, 
                  tempId: statusUpdate.tempId, // 서버 tempId로 업데이트
                  status: statusUpdate.status,
                  id: statusUpdate.persistedId || msg.id 
                }
              : msg
          )
        );
        return;
      }
      
      // 100ms 후에 다시 시도
      setTimeout(() => {
        const delayedTargetMessage = messagesRef.current.find(msg => msg.tempId === statusUpdate.tempId);
        if (delayedTargetMessage) {
          setMessages((prev) => 
            prev.map(msg => 
              msg.tempId === statusUpdate.tempId 
                ? { 
                    ...msg, 
                    status: statusUpdate.status,
                    id: statusUpdate.persistedId || msg.id 
                  }
                : msg
            )
          );
        }
      }, 100);
      return;
    }

    setMessages((prev) => {
      const updatedMessages = prev.map(msg => {
        if (msg.tempId === statusUpdate.tempId) {
          const updatedMsg = {
            ...msg,
            status: statusUpdate.status,
            id: statusUpdate.persistedId || msg.id
          };
          return updatedMsg;
        }
        return msg;
      });
      
      return updatedMessages;
    });

    // 실패 상태 처리
    if (statusUpdate.status === MessageStatus.FAILED) {
      console.error("메시지 전송 실패:", statusUpdate);
    }

    // 읽음 처리 로직
    if (statusUpdate.status === MessageStatus.SAVED && statusUpdate.persistedId) {
      const currentMsg = messagesRef.current.find(m => m.tempId === statusUpdate.tempId);
      if (currentMsg && !currentMsg.readBy[userId!] && currentMsg.senderId !== userId) {
        webSocketService.current.sendMessage({
          ...currentMsg,
          id: statusUpdate.persistedId
        });
      }
    }
  }, [userId, setMessageStatuses, setMessages, messagesRef, webSocketService, messageStatuses]);

  const handleMessageUpdate = useCallback((updatedMessage: ChatMessageItem) => {
    setMessages((prevMessages) => 
      prevMessages.map((msg) => 
        msg.id === updatedMessage.id ? updatedMessage : msg
      )
    );
  }, [setMessages]);

  const handleReadBulk = useCallback(({ messageIds, userId }: { messageIds: string[], userId: number }) => {
    setMessages((prev) =>
      prev.map((msg) =>
        messageIds.includes(msg.id)
          ? { ...msg, readBy: { ...msg.readBy, [userId]: true } }
          : msg
      )
    );
  }, [setMessages]);

  return {
    handleMessage,
    handleMessageStatus,
    handleMessageUpdate,
    handleReadBulk
  };
};

// 타이핑 사용자 타입 정의
export interface TypingUser {
  userId: number;
  username: string;
  isTyping: boolean;
}

// 타이핑 상태 관리 훅
export const useTypingState = () => {
  const [typingUsers, setTypingUsers] = useState<Record<string, TypingUser>>({});
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updateTypingStatus = useCallback((typingMsg: any) => {
    const { userId, username, isTyping } = typingMsg;
    
    setTypingUsers(prev => {
      const updated = { ...prev };
      if (isTyping) {
        updated[userId] = {
          userId,
          username: username || 'Unknown User',
          isTyping: true
        };
        
        // 3초 후 자동으로 타이핑 상태 해제
        setTimeout(() => {
          setTypingUsers(current => {
            const next = { ...current };
            delete next[userId];
            return next;
          });
        }, 3000);
      } else {
        delete updated[userId];
      }
      return updated;
    });
  }, []);

  return {
    typingUsers,
    typingTimeoutRef,
    updateTypingStatus
  };
};

// 타이핑 핸들러 훅
export const useTypingHandlers = ({
  webSocketService,
  roomId,
  userId,
  updateTypingStatus
}: UseTypingHandlersProps) => {
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingTimeRef = useRef<number>(0);
  
  // 디바운싱된 타이핑 인디케이터 전송 (300ms → 200ms로 최적화)
  const debouncedSendTyping = useMemo(() => 
    debounce((isTyping: boolean) => {
      if (!webSocketService.current?.isConnected() || !roomId || !userId) return;

      const now = Date.now();
      
      // 너무 자주 호출되는 것을 방지 (100ms 최소 간격)
      if (now - lastTypingTimeRef.current < 100) {
        return;
      }
      
      lastTypingTimeRef.current = now;
      
      webSocketService.current.sendTypingIndicator(isTyping);
    }, 200), // 300ms → 200ms로 개선
    [webSocketService, roomId, userId]
  );

  // 타이핑 시작 감지
  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    // 즉시 UI 업데이트
    if (isTyping && userId) {
      updateTypingStatus({
        roomId: Number(roomId),
        userId,
        username: 'me',
        isTyping: true
      });
    }
    
    // 디바운싱된 API 호출
    debouncedSendTyping(isTyping);
    
    // 타이핑 종료 타이머 설정
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        debouncedSendTyping(false);
        if (userId) {
          updateTypingStatus({
            roomId: Number(roomId),
            userId,
            username: 'me',
            isTyping: false
          });
        }
      }, 3000); // 3초 후 자동 타이핑 종료
    }
  }, [debouncedSendTyping, updateTypingStatus, userId, roomId]);

  return {
    sendTypingIndicator
  };
};

// 스크롤 관리 훅  
export const useScrollManager = (chatAreaRef: React.RefObject<HTMLDivElement>) => {
  const lastScrollPosRef = useRef<number>(0);
  const scrollHeightBeforeUpdateRef = useRef<number>(0);
  const isPreviousMessagesLoadingRef = useRef<boolean>(false);
  const firstVisibleMessageRef = useRef<string | null>(null);
  const isNearBottom = useRef<boolean>(true);
  const lastScrollHeight = useRef<number>(0);
  
  const [scrollRestoreInfo, setScrollRestoreInfo] = useState<{
    shouldRestore: boolean;
    targetMessageId: string | null;
    offsetFromTop: number;
  }>({
    shouldRestore: false,
    targetMessageId: null,
    offsetFromTop: 0
  });

  const scrollToBottom = useCallback((behavior: 'auto' | 'smooth' = 'auto') => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTo({
        top: chatAreaRef.current.scrollHeight,
        behavior
      });
    }
  }, [chatAreaRef]);

  const handleScroll = useCallback(() => {
    if (!chatAreaRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = chatAreaRef.current;
    const bottomThreshold = 50;
    
    isNearBottom.current = scrollTop + clientHeight >= scrollHeight - bottomThreshold;
    lastScrollPosRef.current = scrollTop;
    lastScrollHeight.current = scrollHeight;
  }, [chatAreaRef]);

  const prepareForPreviousMessages = useCallback((firstMessageId: string) => {
    if (!chatAreaRef.current) return;
    
    isPreviousMessagesLoadingRef.current = true;
    firstVisibleMessageRef.current = firstMessageId;
    scrollHeightBeforeUpdateRef.current = chatAreaRef.current.scrollHeight;
  }, [chatAreaRef]);

  const finalizePreviousMessagesLoad = useCallback((targetMessageId: string) => {
    setScrollRestoreInfo({
      shouldRestore: true,
      targetMessageId,
      offsetFromTop: 100
    });
  }, []);

  const restoreScrollPosition = useCallback(() => {
    if (!chatAreaRef.current || !scrollRestoreInfo.shouldRestore) return;
    
    const heightDifference = chatAreaRef.current.scrollHeight - scrollHeightBeforeUpdateRef.current;
    if (heightDifference > 0) {
      chatAreaRef.current.scrollTop = lastScrollPosRef.current + heightDifference;
    }
    
    isPreviousMessagesLoadingRef.current = false;
    setScrollRestoreInfo({
      shouldRestore: false,
      targetMessageId: null,
      offsetFromTop: 0
    });
  }, [scrollRestoreInfo, chatAreaRef]);

  // 스크롤 복원 실행
  useEffect(() => {
    if (scrollRestoreInfo.shouldRestore) {
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