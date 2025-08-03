import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Message as ChatMessageItem, MessageStatus } from '../../../entities';
import { WebSocketService, TypingIndicatorMessage } from '../../index';
import { debounce } from 'lodash';

// 메시지 상태 관리 인터페이스
export interface MessageState {
  messages: ChatMessageItem[];
  messageDirection: string;
  initialLoadComplete: boolean;
}

// 메시지 상태 관리 액션
export interface MessageActions {
  setMessageDirection: (direction: string) => void;
  setInitialLoadComplete: (complete: boolean) => void;
  updateMessages: (message: ChatMessageItem) => void;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessageItem[]>>;
}

// 메시지 핸들러 Props
interface UseMessageHandlersProps {
  webSocketService: React.MutableRefObject<WebSocketService>;
  roomId: string | undefined;
  userId: number | undefined;
  updateMessages: (message: ChatMessageItem) => void;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessageItem[]>>;
  messagesRef: React.MutableRefObject<ChatMessageItem[]>;
  messageTimeoutsRef: React.MutableRefObject<Map<string, NodeJS.Timeout>>;
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

  return {
    // State
    messages,
    messageDirection,
    initialLoadComplete,
    
    // Actions  
    setMessageDirection,
    setInitialLoadComplete,
    updateMessages,
    setMessages,
    
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
  setMessages,
  messagesRef,
  messageTimeoutsRef
}: UseMessageHandlersProps) => {
  const handleMessage = useCallback((msg: ChatMessageItem) => {
    // 내가 보낸 메시지인지 확인
    if (msg.senderId === userId || String(msg.senderId) === String(userId)) {
      // tempId 매칭으로 전송 중인 메시지 찾기
      setMessages(prev => {
        const updatedMessages = prev.map(existingMsg => {
          // 정확한 tempId 매칭
          if (existingMsg.tempId === msg.tempId && existingMsg.isSending) {
            return {
              ...existingMsg,
              ...msg,
              isSending: false // 전송 완료!
            };
          }
          
          // tempId가 다르지만 내용과 시간이 유사한 최근 메시지 찾기 (fallback)
          if (existingMsg.isSending && 
              String(existingMsg.senderId) === String(msg.senderId) &&
              existingMsg.content.text === msg.content.text) {
            
            const existingTime = new Date(existingMsg.createdAt).getTime();
            const newTime = new Date(msg.createdAt).getTime();
            
            // 시간 파싱이 실패한 경우 (NaN) 시간 검사 스킵
            if (isNaN(existingTime) || isNaN(newTime)) {
              return {
                ...existingMsg,
                ...msg,
                isSending: false // 전송 완료!
              };
            }
            
            const timeDiff = Math.abs(newTime - existingTime);
            if (timeDiff < 10000) { // 10초 이내
              return {
                ...existingMsg,
                ...msg,
                isSending: false // 전송 완료!
              };
            }
          }
          
          return existingMsg;
        });
        
        // 새로운 메시지라면 추가
        const exists = updatedMessages.some(existing => existing.tempId === msg.tempId || existing.id === msg.id);
        if (!exists) {
          return [...updatedMessages, msg];
        }
        
        return updatedMessages;
      });
      
      return; // 중복 처리 방지
    }
    
    // 다른 사용자 메시지는 기존 로직 사용
    updateMessages(msg);
    
    if (
      document.visibilityState === "visible" &&
      msg.readBy && !msg.readBy[userId!] &&
      msg.senderId !== userId &&
      msg.id
    ) {
      webSocketService.current.sendMessage({
        ...msg,
        id: msg.id
      });
    }
  }, [userId, updateMessages, webSocketService, setMessages]);

  const handleMessageStatus = useCallback((update: any) => {
    const statusUpdate = Array.isArray(update) 
      ? update[update.length - 1] 
      : update;
    
    if (!statusUpdate || !statusUpdate.tempId) {
      return;
    }

    // 메시지 상태 업데이트 처리 (PENDING, SENT, FAILED)
    setMessages((prev) => {
      return prev.map(msg => {
        if (msg.tempId === statusUpdate.tempId) {
          // timeout 클리어 (SENT 또는 FAILED 시)
          if (statusUpdate.status === MessageStatus.SENT || statusUpdate.status === 'SENT' ||
              statusUpdate.status === MessageStatus.FAILED || statusUpdate.status === 'FAILED') {
            const timeoutId = messageTimeoutsRef.current.get(statusUpdate.tempId);
            if (timeoutId) {
              clearTimeout(timeoutId);
              messageTimeoutsRef.current.delete(statusUpdate.tempId);
            }
          }

          if (statusUpdate.status === MessageStatus.SENT || statusUpdate.status === 'SENT') {
            // SENT: 전송 성공 → 체크 표시
            return {
              ...msg,
              status: MessageStatus.SENT,
              id: statusUpdate.persistedId || msg.id,
              isSending: false // 전송 완료 (성공)
            };
          } else if (statusUpdate.status === MessageStatus.FAILED || statusUpdate.status === 'FAILED') {
            // FAILED: 전송 실패 → 삭제/재전송 버튼
            return {
              ...msg,
              status: MessageStatus.FAILED,
              isSending: false, // 전송 완료 (실패)
              metadata: {
                ...msg.metadata,
                canRetry: true
              }
            };
          } else if (statusUpdate.status === MessageStatus.PENDING || statusUpdate.status === 'PENDING') {
            // PENDING: 전송 중 → 스피너 표시
            return {
              ...msg,
              status: MessageStatus.PENDING,
              isSending: true
            };
          }
        }
        return msg;
      });
    });
  }, [setMessages, messageTimeoutsRef]);

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