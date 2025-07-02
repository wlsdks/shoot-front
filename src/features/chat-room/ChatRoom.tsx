import React, { useState, useRef, useEffect, useCallback, useLayoutEffect, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../auth";
import { usePinnedMessages } from "./model/hooks/usePinnedMessages";
import { markAllMessagesAsRead } from "./api/chatRoom";
import { createWebSocketService } from "./api/websocket/index";

import { messageReactionService, ReactionType } from '../message-reaction/api/reactionApi';

// 스타일 임포트
import {
    ChatWrapper,
    ChatContainer,
    ChatArea,
    ErrorMessage
} from '../message/ui/styles/ChatRoom.styles';

// 타입 임포트
import {
    MessageStatus,
    ChatMessageItem,
    TypingIndicatorMessage
} from '../message/types/ChatRoom.types';

// 커스텀 훅 임포트
import { useMessageState } from '../message/model/useMessageState';
import { useMessageHandlers } from '../message/model/useMessageHandlers';
import { useTypingState } from '../message/model/useTypingState';
import { useScrollManager } from '../message/model/useScrollManager';
import { useTypingHandlers } from '../message/model/useTypingHandlers';
import { useContextMenu } from '../message/model/useContextMenu';

// 새로 분리된 컴포넌트들 임포트
import { ChatHeader } from './ui/ChatHeader';
import { MessagesList } from './ui/MessagesList';
import { ChatInputArea } from './ui/ChatInputArea';
import { ContextMenuHandler } from './ui/ContextMenuHandler';

// 기존 컴포넌트 임포트
import { PinnedMessages } from '../message/ui/PinnedMessages';
import { ForwardMessageModal } from '../message/ui/ForwardMessageModal';
import { ErrorIcon } from '../message/ui/icons';

const ChatRoom = ({ roomId }: { roomId: string }) => {
    const { user } = useAuthContext();
    
    // 🚀 TODO: 새로운 통합 상태 관리 (단계적 적용 예정)
    // const { state: uiState, actions: uiActions } = useChatRoomState();
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(true);
    const [showForwardModal, setShowForwardModal] = useState(false);
    const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
    const [showReactionPicker, setShowReactionPicker] = useState(false);
    // React Query 기반 고정 메시지 관리
    const {
        pinnedMessages,
        pinMessage: optimizedPinMessage,
        unpinMessage: optimizedUnpinMessage,
        invalidatePinnedMessages
    } = usePinnedMessages(Number(roomId), isConnected);
    const [isPinnedMessagesExpanded, setIsPinnedMessagesExpanded] = useState(false);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    // 리액션 타입들을 메모이제이션 (불변 데이터)
    const reactionTypes = useMemo<ReactionType[]>(() => [
        { code: 'like', emoji: '👍', description: '좋아요' },
        { code: 'sad', emoji: '😢', description: '슬퍼요' },
        { code: 'dislike', emoji: '👎', description: '싫어요' },
        { code: 'angry', emoji: '😡', description: '화나요' },
        { code: 'curious', emoji: '🤔', description: '궁금해요' },
        { code: 'surprised', emoji: '😮', description: '놀라워요' }
    ], []);
    
    const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const webSocketService = useRef(createWebSocketService());
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const reconnectAttemptRef = useRef(0);
    const maxReconnectAttempts = 5;
    const reconnectDelay = 3000;

    const {
        messages,
        messageStatuses,
        messageDirection,
        initialLoadComplete,
        setMessageDirection,
        setInitialLoadComplete,
        updateMessages,
        updateMessageStatus,
        setMessages,
        setMessageStatuses,
        messagesRef,
        chatAreaRef
    } = useMessageState();

    const {
        handleMessage,
        handleMessageStatus,
        handleMessageUpdate,
        handleReadBulk
    } = useMessageHandlers({
        webSocketService,
        roomId,
        userId: user?.id,
        updateMessages,
        updateMessageStatus,
        setMessageStatuses,
        setMessages,
        messagesRef,
        messageStatuses
    });

    const {
        typingUsers,
        typingTimeoutRef,
        updateTypingStatus,
    } = useTypingState();

    const {
        lastScrollPosRef,
        scrollHeightBeforeUpdateRef,
        isPreviousMessagesLoadingRef,
        firstVisibleMessageRef,
        scrollToBottom,
    } = useScrollManager(chatAreaRef);

    const {
        sendTypingIndicator
    } = useTypingHandlers({
        webSocketService,
        roomId,
        userId: user?.id,
        updateTypingStatus
    });

    const {
        contextMenu,
        setContextMenu,
        closeContextMenu
    } = useContextMenu();

    const navigate = useNavigate();
    const domReadyRef = useRef(false);
    const lastItemRef = useRef<string | null>(null);

    // TODO: 메모이제이션된 값들 (향후 사용 예정)
    // const sessionId = useMemo(() => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, []);

    // TODO: 향후 사용 예정인 메모이제이션된 값들
    // const currentUserId = useMemo(() => user?.id, [user?.id]);
    // const reconnectConfig = useMemo(() => ({ maxAttempts: maxReconnectAttempts, delay: reconnectDelay }), []);



        // 메시지 고정 함수 (React Query Optimistic Update) - 메모이제이션
    const handlePinMessage = useCallback(async () => {
        if (!contextMenu.message || !contextMenu.message.id) return;
        
        const messageToPin = contextMenu.message;
        
        // 중복 체크 후 즉시 메뉴 닫기
        const isAlreadyPinned = pinnedMessages.some((msg: ChatMessageItem) => msg.id === messageToPin.id);
        if (isAlreadyPinned) {
            console.log("이미 고정된 메시지입니다:", messageToPin.id);
            setContextMenu({ ...contextMenu, visible: false });
            return;
        }
        
        console.log("🚀 최적화된 공지사항 등록:", messageToPin.id);
        
        // 메뉴 즉시 닫기
        setContextMenu({ ...contextMenu, visible: false });
        
        // React Query Optimistic Update 실행
        optimizedPinMessage(messageToPin);
    }, [contextMenu, setContextMenu, pinnedMessages, optimizedPinMessage]);
    
        // 메시지 고정 해제 함수 (React Query Optimistic Update) - 메모이제이션  
    const handleUnpinMessage = useCallback(async (messageId: string) => {
        console.log("🚀 최적화된 공지사항 해제:", messageId);
        
        // React Query Optimistic Update 실행
        optimizedUnpinMessage(messageId);
    }, [optimizedUnpinMessage]);

    // 4. 메시지가 처음 로드되었을 때만 강제 스크롤 실행 (필요한 경우)
    useEffect(() => {
        if (messages.length > 0 && !initialLoadComplete) {
            // 첫 메시지 로딩 후 한 번만 실행
            setTimeout(() => {
                if (chatAreaRef.current) {
                    chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
                }
                setInitialLoadComplete(true);
            }, 200); // 약간의 지연을 두고 스크롤
        }
    }, [chatAreaRef, setInitialLoadComplete, messages, initialLoadComplete]);

    // 메시지 참조 업데이트 (최신 메시지를 유지하기 위함)
    useEffect(() => {
        messagesRef.current = messages;
    }, [messagesRef, messages]);

    // onConnect 콜백에서 항상 최신의 DOM 준비 상태를 확인할 수 있습니다.
    useEffect(() => {
        domReadyRef.current = true;
    }, []);

    // messages 상태 업데이트 후 스크롤 보정을 위한 useEffect
    useEffect(() => {
        // 이전 메시지 로딩 플래그가 활성화된 경우에만 실행
        if (isPreviousMessagesLoadingRef.current && chatAreaRef.current && messageDirection === "BEFORE") {
            const chatArea = chatAreaRef.current;
            const newScrollHeight = chatArea.scrollHeight;
            
            // 스크롤 위치 보정 - 깜빡임 최소화를 위해 즉시 실행
            const heightDifference = newScrollHeight - scrollHeightBeforeUpdateRef.current;
            const newScrollPosition = lastScrollPosRef.current + heightDifference;
            
            // 스크롤 위치 설정을 requestAnimationFrame 안에서 수행
            requestAnimationFrame(() => {
                chatArea.scrollTop = newScrollPosition;
                console.log("스크롤 위치 설정:", chatArea.scrollTop);
            });
            
            // 플래그 해제는 스크롤 설정 후
            setTimeout(() => {
                isPreviousMessagesLoadingRef.current = false;
            }, 100);
        }
    }, [chatAreaRef, isPreviousMessagesLoadingRef, lastScrollPosRef, scrollHeightBeforeUpdateRef, messages, messageDirection]); // messageDirection 의존성 추가

    // 모든 useLayoutEffect 스크롤 위치 조정 코드를 하나로 통합
    useLayoutEffect(() => {
        if (!chatAreaRef.current || messages.length === 0) return;
        
        const chatArea = chatAreaRef.current;
        
        // 이전 메시지 로딩 시 (BEFORE)
        if (messageDirection === "BEFORE" && isPreviousMessagesLoadingRef.current) {
            const newScrollHeight = chatArea.scrollHeight;
            const heightDifference = newScrollHeight - scrollHeightBeforeUpdateRef.current;
            
            // 스크롤 위치 즉시 조정
            chatArea.scrollTop = lastScrollPosRef.current + heightDifference;
            
            // 마지막 로딩된 메시지 찾아서 화면에 표시되도록 조정 (옵션)
            if (lastItemRef.current) {
                const messageElement = document.getElementById(lastItemRef.current);
                if (messageElement) {
                    messageElement.scrollIntoView({ block: 'start' });
                }
            }
            
            // 로딩 완료 플래그 설정 (즉시 설정하여 더 이상의 스크롤 조정 방지)
            isPreviousMessagesLoadingRef.current = false;
        }
        // 초기 로드 시 (INITIAL)
        else if (messageDirection === "INITIAL" && !initialLoadComplete) {
            // 최하단으로 스크롤
            chatArea.scrollTop = chatArea.scrollHeight;
            setInitialLoadComplete(true);
        }
        // 새 메시지 추가 시 (new)
        else if (messageDirection === "new") {
            // 내가 보낸 메시지인 경우에만 스크롤 다운
            const isOwnMessage = messages[messages.length - 1]?.senderId === user?.id;
            if (isOwnMessage) {
                chatArea.scrollTop = chatArea.scrollHeight;
            }
        }
        // AFTER 방향인 경우 (주로 동기화 동작에서 처리했지만 백업)
        else if (messageDirection === "AFTER") {
            chatArea.scrollTop = chatArea.scrollHeight;
        }

        // 추가: 메시지가 변경될 때마다 DOM에 제대로 반영되는지 확인
        // console.log("메시지 상태 업데이트:", messages.length, "개 메시지");
        if (messages.length > 0) {
            // console.log("DOM 요소 개수:", chatAreaRef.current.querySelectorAll('[id^="msg-"]').length);
        }
    }, [chatAreaRef, isPreviousMessagesLoadingRef, lastScrollPosRef, scrollHeightBeforeUpdateRef, setInitialLoadComplete, user, messages, messageDirection, initialLoadComplete]);

    // 미리보기 로드 후 스크롤 처리를 위한 useEffect 추가
    useEffect(() => {
        // URL 미리보기가 포함된 메시지가 있는지 확인
        const hasUrlPreviews = messages.some(msg => msg.content?.urlPreview);
        
        if (hasUrlPreviews) {
            // 약간의 지연 후 스크롤 이동 (미리보기 렌더링 완료 대기)
            setTimeout(() => {
                scrollToBottom();
            }, 300);
        }
    }, [messages, scrollToBottom]);

    // 조합 시작 시
    const handleCompositionStart = () => {
        setIsTyping(true);
    };
    
    // 조합 종료 시
    const handleCompositionEnd = () => {
        setIsTyping(false);
    };

    // Enter 키 처리
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey && !isTyping) {
            e.preventDefault();
            sendMessage();
        }
    };

    // 읽음 처리를 위한 참조
    const lastReadTimeRef = useRef<number>(0);
    const readTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // 최적화된 모든 메시지 읽음 처리 (디바운싱 + 배치 처리)
    const markAllRead = useCallback(() => {
        if (!roomId || !user) return;
        
        const now = Date.now();
        
        // 기존 타이머가 있다면 취소하고 새로운 타이머 설정
        if (readTimeoutRef.current) {
            clearTimeout(readTimeoutRef.current);
        }
        
        // 200ms 디바운싱 (더 반응적으로 개선)
        readTimeoutRef.current = setTimeout(() => {
            // 중복 호출 방지 (500ms 최소 간격 유지)
            if (now - lastReadTimeRef.current < 300) {
                console.log("🎯 읽음 처리 스킵 (최근 처리됨)");
                return;
            }
            lastReadTimeRef.current = now;

            // 웹소켓 연결 상태 확인
            if (!webSocketService.current?.isConnected()) {
                console.log("📡 HTTP API로 읽음 처리 (웹소켓 미연결)");
                markAllMessagesAsRead(Number(roomId), user.id, 'temp-session')
                    .then(() => console.log("✅ HTTP 읽음 처리 성공"))
                    .catch((err) => console.error("❌ HTTP 읽음처리 실패", err));
                return;
            }

            // 웹소켓으로 읽음 처리 (최적화)
            console.log("⚡ 웹소켓 읽음 처리 (최적화):", { roomId, userId: user.id });
            webSocketService.current.markAllMessagesAsRead();
        }, 200);
    }, [roomId, user]);

    // 뒤로가기 클릭시 동작
    const handleBack = () => {
        navigate("/", { state: { refresh: true } });
    };

    // 시간 문자열 가져오기 함수는 MessagesList 컴포넌트로 이동됨

    // React Query가 자동으로 고정 메시지를 관리하므로 별도 useEffect 불필요

    /* eslint-disable react-hooks/exhaustive-deps */
    // WebSocket 연결 및 이벤트 핸들러 설정
    useEffect(() => {
        if (!roomId || !user) return;

        // roomId 유효성 검사
        const numericRoomId = Number(roomId);
        if (isNaN(numericRoomId)) {
            setConnectionError("유효하지 않은 채팅방 ID입니다.");
            return;
        }

        const connectWebSocket = async () => {
            try {
                // 이미 연결 중이거나 연결된 상태라면 중복 연결 방지
                if (webSocketService.current.isConnected() || 
                    (webSocketService.current as any).getIsConnecting?.()) {
                    console.log("웹소켓이 이미 연결되어 있거나 연결 중 - 중복 연결 방지");
                    return;
                }
                
                // 기존 핸들러들 모두 제거
                webSocketService.current.clearAllHandlers();
                
                await webSocketService.current.connect(numericRoomId, user.id);
                setConnectionError(null);
                setIsConnected(true);
                reconnectAttemptRef.current = 0;

                // 타이핑 인디케이터 핸들러를 먼저 설정
                webSocketService.current.onTypingIndicator((typingMsg: TypingIndicatorMessage) => {
                    if (typingMsg.userId === user.id) return;
                    updateTypingStatus(typingMsg);
                });

                // 메시지 수신 핸들러 (useMessageHandlers에서 처리)
                webSocketService.current.onMessage((msg: ChatMessageItem) => {
                    handleMessage(msg);
                    
                    // 상대방이 보낸 메시지이고, 현재 스크롤이 맨 하단에 있을 때만 자동 스크롤
                    if (msg.senderId !== user?.id) {
                        const chatArea = chatAreaRef.current;
                        if (chatArea) {
                            const { scrollTop, scrollHeight, clientHeight } = chatArea;
                            const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 20;
                            
                            if (isAtBottom) {
                                setTimeout(() => {
                                    scrollToBottom();
                                }, 100);
                            }
                        }
                    }
                    
                    if (
                        document.visibilityState === "visible" &&
                        msg.readBy && !msg.readBy[user?.id || ''] &&
                        msg.senderId !== user?.id &&
                        msg.tempId && messageStatuses[msg.tempId]?.persistedId
                    ) {
                        webSocketService.current.sendMessage({
                            ...msg,
                            id: messageStatuses[msg.tempId].persistedId!
                        });
                    }
                });

                // 메시지 상태 핸들러 (useMessageHandlers에서 처리)
                webSocketService.current.onMessageStatus(handleMessageStatus);

                // 메시지 업데이트 핸들러 (useMessageHandlers에서 처리)
                webSocketService.current.onMessageUpdate(handleMessageUpdate);

                // 읽음 처리 핸들러 (useMessageHandlers에서 처리)
                webSocketService.current.onReadBulk(handleReadBulk);

                // 개별 메시지 읽음 처리 핸들러 추가
                webSocketService.current.onRead((data: { messageId: string, userId: number, readBy: Record<string, boolean> }) => {
                    console.log("개별 메시지 읽음 처리:", data);
                    setMessages(prev => 
                        prev.map(msg => 
                            msg.id === data.messageId 
                                ? { ...msg, readBy: { ...msg.readBy, [data.userId]: true } }
                                : msg
                        )
                    );
                });

                // 핀 상태 변경 핸들러 - React Query 무효화
                webSocketService.current.onPinUpdate(() => {
                    invalidatePinnedMessages();
                });

                // 동기화 핸들러
                webSocketService.current.onSync((syncResponse: { roomId: number, direction?: string, messages: any[] }) => {
                    console.log("📥 [ChatRoom] 동기화 응답 처리 시작:", {
                        direction: syncResponse.direction,
                        messageCount: syncResponse.messages?.length || 0,
                        roomId: syncResponse.roomId,
                        rawResponse: syncResponse
                    });
                    
                    if (!syncResponse.messages || !Array.isArray(syncResponse.messages)) {
                        console.error("❌ [ChatRoom] 동기화 응답에 메시지 배열이 없음:", syncResponse);
                        return;
                    }
                    
                    console.log("📋 [ChatRoom] 동기화 메시지 상세:", 
                        syncResponse.messages.map((msg: any) => ({
                            id: msg.id,
                            content: msg.content?.text || 'No text',
                            senderId: msg.senderId,
                            timestamp: msg.timestamp,
                            status: msg.status,
                            readBy: msg.readBy
                        }))
                    );
                    
                    // 가장 최신 메시지의 timestamp 확인
                    const latestMessage = syncResponse.messages[syncResponse.messages.length - 1];
                    console.log("🕐 [ChatRoom] 동기화에서 받은 가장 최신 메시지:", {
                        id: latestMessage?.id,
                        content: latestMessage?.content?.text,
                        timestamp: latestMessage?.timestamp,
                        currentTime: new Date().toISOString()
                    });
                    
                    if (syncResponse.direction === "BEFORE") {
                        // 이전 메시지가 없으면 더 이상 요청하지 않음
                        if (syncResponse.messages.length === 0) {
                            console.log("더 이상 이전 메시지가 없습니다.");
                            isPreviousMessagesLoadingRef.current = false;
                            setHasMoreMessages(false);
                            return;
                        }

                        const targetMessageId = firstVisibleMessageRef.current;
                        const originalScrollTop = lastScrollPosRef.current;
                        const originalScrollHeight = scrollHeightBeforeUpdateRef.current;
                        
                        setMessages((prevMessages) => {
                            const syncMessages: ChatMessageItem[] = syncResponse.messages.map((msg: any) => ({
                                id: msg.id,
                                tempId: msg.tempId,
                                roomId: Number(syncResponse.roomId),
                                senderId: msg.senderId,
                                content: msg.content || { 
                                    text: '메시지를 불러올 수 없습니다', 
                                    type: 'TEXT', 
                                    attachments: [], 
                                    isEdited: false, 
                                    isDeleted: false 
                                },
                                createdAt: msg.timestamp,
                                status: msg.status || "SAVED",
                                readBy: msg.readBy || {},
                                reactions: msg.reactions || [],
                                metadata: {
                                    tempId: msg.tempId,
                                    needsUrlPreview: true,
                                    previewUrl: null
                                }
                            }));
                            
                            const messageMap = new Map<string, ChatMessageItem>();
                            prevMessages.forEach((msg) => messageMap.set(msg.id, msg));
                            syncMessages.forEach((msg) => messageMap.set(msg.id, msg));
                            
                            return Array.from(messageMap.values()).sort((a, b) => 
                                new Date(a.createdAt || "").getTime() - new Date(b.createdAt || "").getTime()
                            );
                        });
                        
                        requestAnimationFrame(() => {
                            requestAnimationFrame(() => {
                                const chatArea = chatAreaRef.current;
                                if (!chatArea) return;
                                
                                if (targetMessageId) {
                                    const targetElement = document.getElementById(`msg-${targetMessageId}`);
                                    if (targetElement) {
                                        targetElement.scrollIntoView({ block: 'start', behavior: 'auto' });
                                        console.log("타겟 메시지로 스크롤:", targetMessageId);
                                        isPreviousMessagesLoadingRef.current = false;
                                        return;
                                    }
                                }
                                
                                const newScrollHeight = chatArea.scrollHeight;
                                const heightDifference = newScrollHeight - originalScrollHeight;
                                const newScrollPosition = originalScrollTop + heightDifference;
                                
                                chatArea.scrollTop = newScrollPosition;
                                isPreviousMessagesLoadingRef.current = false;
                            });
                        });
                    } else {
                        console.log("✅ [ChatRoom] 일반 동기화 처리 (INITIAL/AFTER)");
                        setMessages((prevMessages) => {
                            console.log("📊 [ChatRoom] 메시지 상태 업데이트 전:", {
                                기존메시지수: prevMessages.length,
                                새로받은메시지수: syncResponse.messages.length,
                                동기화방향: syncResponse.direction
                            });
                            
                            const syncMessages: ChatMessageItem[] = syncResponse.messages.map((msg: any) => ({
                                id: msg.id,
                                tempId: msg.tempId,
                                roomId: Number(syncResponse.roomId),
                                senderId: msg.senderId,
                                content: msg.content || { 
                                    text: '메시지를 불러올 수 없습니다', 
                                    type: 'TEXT', 
                                    attachments: [], 
                                    isEdited: false, 
                                    isDeleted: false 
                                },
                                createdAt: msg.timestamp,
                                status: msg.status || "SAVED",
                                readBy: msg.readBy || {},
                                reactions: msg.reactions || [],
                                metadata: {
                                    tempId: msg.tempId,
                                    needsUrlPreview: true,
                                    previewUrl: null
                                }
                            }));
                            
                            const messageMap = new Map<string, ChatMessageItem>();
                            prevMessages.forEach((msg) => messageMap.set(msg.id, msg));
                            syncMessages.forEach((msg) => messageMap.set(msg.id, msg));
                            
                            return Array.from(messageMap.values()).sort((a, b) => 
                                new Date(a.createdAt || "").getTime() - new Date(b.createdAt || "").getTime()
                            );
                        });
                        
                        if (!syncResponse.direction || syncResponse.direction === "INITIAL") {
                            setMessageDirection("INITIAL");
                        }
                        else if (syncResponse.direction === "AFTER") {
                            setMessageDirection("AFTER");
                            setTimeout(() => {
                                if (chatAreaRef.current) {
                                    chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
                                }
                            }, 100);
                        }
                    }
                });

                // Heartbeat 설정
                heartbeatRef.current = setInterval(() => {
                    if (webSocketService.current.isConnected()) {
                        webSocketService.current.sendActiveStatus(true);
                    }
                }, 120000);

                // 초기 동기화 요청
                setTimeout(() => {
                    // 새로고침 직후나 첫 진입 시에는 최신 메시지부터 가져오기
                    console.log("초기 동기화 요청 시작 - 최신 메시지부터 가져오기");
                    
                    webSocketService.current.requestSync(
                        undefined,  // lastMessageId를 undefined로 설정하여 최신 메시지부터 가져오기
                        "INITIAL",  // 항상 INITIAL로 요청하여 최신 메시지들을 가져오기
                        100         // 초기 로드시 100개까지 가져오기 (충분한 양)
                    );

                    // 첫 진입 시 읽음 처리 추가
                    if (roomId && user) {
                        console.log("첫 진입 시 읽음 처리 시작");
                        markAllRead();
                    }
                }, 100);

            } catch (error) {
                console.error("WebSocket connection failed:", error);
                setConnectionError("연결 실패: 재연결을 시도합니다...");
                setIsConnected(false);

                // 재연결 시도
                if (reconnectAttemptRef.current < maxReconnectAttempts) {
                    reconnectAttemptRef.current++;
                    if (reconnectTimeoutRef.current) {
                        clearTimeout(reconnectTimeoutRef.current);
                    }
                    reconnectTimeoutRef.current = setTimeout(connectWebSocket, reconnectDelay);
                } else {
                    setConnectionError("연결 실패: 새로고침 후 다시 시도해주세요.");
                }
            }
        };

        connectWebSocket();

        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            webSocketService.current.disconnect();
        };
    }, [roomId, user?.id]);

    useEffect(() => {
        const handleOnline = () => {
            console.log("네트워크 연결됨, 재연결 시도...");
            if (!webSocketService.current.isConnected()) {
                setConnectionError("재연결 시도 중...");
                reconnectAttemptRef.current = 0;
                
                // roomId 유효성 검사
                const numericRoomId = Number(roomId);
                if (!isNaN(numericRoomId) && user) {
                    webSocketService.current.connect(numericRoomId, user.id)
                        .then(() => {
                            setConnectionError(null);
                            setIsConnected(true);
                        })
                        .catch((error) => {
                            console.error("Reconnection failed:", error);
                            setConnectionError("재연결 실패: 새로고침 후 다시 시도해주세요.");
                            setIsConnected(false);
                        });
                }
            }
        };
    
        const handleOffline = () => {
            console.log("네트워크 연결 끊김");
            setConnectionError("네트워크 연결이 끊어졌습니다. 자동 재연결 대기 중...");
            setIsConnected(false);
        };
    
        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);
    
        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, [roomId, user?.id]);

    // 스크롤 이벤트 핸들러 (페이징)
    useEffect(() => {
        const handleScroll = () => {
            if (!chatAreaRef.current) return;

            const { scrollTop } = chatAreaRef.current;
            
            // 스크롤이 맨 위에 가까워졌을 때만 이전 메시지 로드
            if (scrollTop < 50 && !isPreviousMessagesLoadingRef.current && messages.length > 0 && hasMoreMessages) {
                // 이미 첫 번째 메시지에 도달했는지 확인
                const firstMessage = messages[0];
                if (firstMessage) {
                    console.log("이전 메시지 로드 시작");
                    isPreviousMessagesLoadingRef.current = true;
                    firstVisibleMessageRef.current = firstMessage.id;
                    setMessageDirection("BEFORE");
                    webSocketService.current.requestSync(firstMessage.id, "BEFORE", 30); // 이전 메시지 30개씩 로드
                }
            }
        };

        const chatArea = chatAreaRef.current;
        if (chatArea) {
            chatArea.addEventListener("scroll", handleScroll);
            handleScroll();
        }
        return () => {
            if (chatArea) {
                chatArea.removeEventListener("scroll", handleScroll);
            }
        };
    }, [chatAreaRef, firstVisibleMessageRef, isPreviousMessagesLoadingRef, messages, setMessageDirection, hasMoreMessages]);

    // UUID 생성 함수
    const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : ((r & 0x3) | 0x8);
            return v.toString(16);
        });
    };

    // 메시지 전송
    const sendMessage = () => {
        if (!webSocketService.current.isConnected() || input.trim() === "" || !roomId || !user) {
            console.error("전송 불가: 연결 끊김 또는 유효하지 않은 입력");
            return;
        }

        setMessageDirection("new");

        const tempId = generateUUID();

        const chatMessage: ChatMessageItem = {
            id: tempId,
            tempId: tempId,
            roomId: Number(roomId),
            senderId: user.id,
            content: {
                text: input,
                type: "TEXT",
                attachments: [],
                isEdited: false,
                isDeleted: false,
            },
            createdAt: new Date().toISOString(),
            status: MessageStatus.SENDING,
            readBy: { [user.id.toString()]: true },
            metadata: {
                tempId: tempId,
                needsUrlPreview: true,
                previewUrl: null
            }
        };

        // 상태를 먼저 설정
        updateMessageStatus(tempId, { 
            status: MessageStatus.SENDING, 
            persistedId: null,
            createdAt: new Date().toISOString()
        });

        // 메시지 즉시 추가 (상태는 updateMessages 내에서 적용됨)
        updateMessages(chatMessage);
        
        // console.log("메시지 전송:", {
        //     tempId: chatMessage.tempId,
        //     content: chatMessage.content.text,
        //     timestamp: new Date().toISOString()
        // });
        
        webSocketService.current.sendMessage(chatMessage);
        setInput("");
        sendTypingIndicator(false);
    };

    // 입력값 변경 및 타이핑 디바운스 처리
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInput(value);

        // 웹소켓 연결 상태 확인
        if (!webSocketService.current?.isConnected() || !roomId || !user) {
            return;
        }

        // 타이핑 상태 전송
        sendTypingIndicator(true);

        // 활성 여부를 알림
        webSocketService.current.sendActiveStatus(true);

        // 기존 타이머 제거 후, 1초 후에 타이핑 인디케이터 끄기
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            sendTypingIndicator(false);
            typingTimeoutRef.current = null;
        }, 1000);
    }, [sendTypingIndicator, typingTimeoutRef]);

    // 웹소켓 연결 상태 모니터링
    useEffect(() => {
        const checkConnection = setInterval(() => {
            if (webSocketService.current?.isConnected()) {
                setIsConnected(true);
                clearInterval(checkConnection);
            }
        }, 100);

        return () => clearInterval(checkConnection);
    }, []);

    // 우클릭: 컨텍스트 메뉴 표시 (메시지 전달 옵션) - 메모이제이션
    const handleChatBubbleClick = useCallback((e: React.MouseEvent, message: ChatMessageItem) => {
        e.stopPropagation(); // 이벤트 전파 방지
        
        // 클릭한 위치에 메뉴 표시
        const x = e.clientX;
        const y = e.clientY;
        
        // 이미 메뉴가 표시되어 있으면 닫기
        if (contextMenu.visible && contextMenu.message?.id === message.id) {
            closeContextMenu();
        } else {
            // 메뉴 표시
            setContextMenu({ visible: true, x, y, message });
        }
    }, [contextMenu.visible, contextMenu.message, closeContextMenu, setContextMenu]);

    // 모달 제출: 대상 채팅방 ID 입력 후 메시지 전달 API 호출
    // const handleModalSubmit = () => {
    //     if (targetRoomId) {
    //         handleForwardMessage(targetRoomId);
    //         setShowForwardModal(false);
    //         setTargetRoomId('');
    //     }
    // };

    // 모달 취소
    // const handleModalCancel = () => {
    //     setShowForwardModal(false);
    //     setTargetRoomId('');
    // };

    // 메시지 상태 표시 로직은 MessagesList 컴포넌트로 이동됨

    // 컨텍스트 메뉴에서 "메시지 전달" 선택
    const handleForwardClick = () => {
        if (contextMenu.message) {
            setSelectedMessageId(contextMenu.message.id);
            setShowForwardModal(true);
        }
        closeContextMenu();
    };

    // 읽음 상태 계산 로직은 MessagesList 컴포넌트로 이동됨

    // 리액션 선택 핸들러 - 메모이제이션
    const handleReactionSelect = useCallback(async (reactionType: string) => {
        if (!contextMenu.message) return;
        
        try {
            const hasReacted = contextMenu.message.reactions?.[reactionType]?.includes(user?.id || 0);
            const response = hasReacted
                ? await messageReactionService.removeReaction(contextMenu.message.id, reactionType)
                : await messageReactionService.addReaction(contextMenu.message.id, reactionType);
            
            setMessages(prevMessages =>
                prevMessages.map(message =>
                    message.id === contextMenu.message?.id
                        ? { ...message, reactions: response.reactions }
                        : message
                )
            );
            setShowReactionPicker(false);
            closeContextMenu();
        } catch (error) {
            console.error('리액션 처리 중 오류 발생:', error);
        }
    }, [contextMenu.message, user?.id, setMessages, setShowReactionPicker, closeContextMenu]);

    // 반응 추가 버튼 클릭 핸들러
    const handleShowReactionPicker = (e: React.MouseEvent) => {
        e.stopPropagation(); // 이벤트 버블링 방지
        setShowReactionPicker(true);
    };

    // 입력창 포커스 해제 핸들러
    const handleBlur = () => {
        sendTypingIndicator(false);
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }
    };

    // 클릭 이벤트 핸들러 (리액션 피커 외부 클릭 시 닫기)
    useEffect(() => {
        const handleClickOutside = () => {
            setShowReactionPicker(false);
        };

        if (showReactionPicker) {
            document.addEventListener('click', handleClickOutside);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [showReactionPicker]);

    return (
        <ChatWrapper>
            <ChatContainer>
                <ChatHeader onBack={handleBack} />

                <PinnedMessages
                    pinnedMessages={pinnedMessages}
                    isExpanded={isPinnedMessagesExpanded}
                    onToggleExpand={() => setIsPinnedMessagesExpanded(!isPinnedMessagesExpanded)}
                    onUnpin={handleUnpinMessage}
                    currentUserId={user?.id}
                />

                {connectionError && 
                    <ErrorMessage>
                        <ErrorIcon />{connectionError}
                    </ErrorMessage>
                }

                <ChatArea ref={chatAreaRef}>
                    <MessagesList
                        messages={messages}
                        messageStatuses={messageStatuses}
                        userId={user?.id}
                        input={input}
                        onContextMenu={handleChatBubbleClick}
                        onClick={handleChatBubbleClick}
                    />
                    <div ref={bottomRef} />
                </ChatArea>

                <ChatInputArea
                    input={input}
                    isConnected={isConnected}
                    typingUsers={typingUsers}
                    userId={user?.id}
                    onInputChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onCompositionStart={handleCompositionStart}
                    onCompositionEnd={handleCompositionEnd}
                    onBlur={handleBlur}
                    onSendMessage={sendMessage}
                />

                <ContextMenuHandler
                    contextMenu={contextMenu}
                    showReactionPicker={showReactionPicker}
                    reactionTypes={reactionTypes}
                    pinnedMessages={pinnedMessages}
                    userId={user?.id}
                    onForwardClick={handleForwardClick}
                    onPinMessage={handlePinMessage}
                    onUnpinMessage={handleUnpinMessage}
                    onShowReactionPicker={handleShowReactionPicker}
                    onHideReactionPicker={() => setShowReactionPicker(false)}
                    onReactionSelect={handleReactionSelect}
                    onCloseContextMenu={() => setContextMenu({ ...contextMenu, visible: false })}
                />

                {showForwardModal && selectedMessageId && (
                    <ForwardMessageModal
                        messageId={selectedMessageId}
                        onClose={() => {
                            setShowForwardModal(false);
                            setSelectedMessageId(null);
                        }}
                    />
                )}
            </ChatContainer>
        </ChatWrapper>
    );
};

export default ChatRoom;