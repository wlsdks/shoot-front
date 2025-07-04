import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import { usePinnedMessages } from "./model/hooks/usePinnedMessages";
// import { useChatRoomState } from "./model/hooks/useChatRoomState"; // TODO: 향후 점진적 적용 예정
import { markAllMessagesAsRead } from "./api/chatRoom";

// Shared 레이어에서 가져오기 (FSD 원칙 준수)
import { 
    createWebSocketService,
    messageReactionService,
    hasReactionType,
    type ReactionType,
    useContextMenu,
    // Message Management Hooks (FSD 원칙 준수)
    useMessageState,
    useMessageHandlers,
    useTypingState,
    useScrollManager,
    useTypingHandlers
} from "../../shared";

// Auth feature에서 가져오기 (상위 레이어에서 하위 레이어 접근)
import { useAuthContext } from "../auth";

// 스타일 임포트
import {
    ChatWrapper,
    ChatContainer,
    ChatArea,
    ErrorMessage
} from './styles/ChatRoom.styles';

// 타입 임포트
import {
    MessageStatus,
    Message as ChatMessageItem,
    TypingIndicatorMessage
} from '../../entities';

// 새로 분리된 컴포넌트들 임포트
import { ChatHeader } from './ui/ChatHeader';
import { MessagesList } from './ui/MessagesList';
import { ChatInputArea } from './ui/ChatInputArea';
import { ContextMenuHandler } from './ui/ContextMenuHandler';

// 기존 컴포넌트 임포트
import { PinnedMessages } from './ui/PinnedMessages';
import { ForwardMessageModal } from './ui/ForwardMessageModal';
import { ErrorIcon } from './ui/icons';

const ChatRoom = ({ roomId }: { roomId: string }) => {
    const { user } = useAuthContext();
    
    // 🚀 TODO: 향후 통합 상태 관리 적용 예정 (단계적 적용)
    // const { state: uiState, actions: uiActions } = useChatRoomState();
    
    // 임시로 기존 방식 유지
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
        isPreviousMessagesLoadingRef,
        firstVisibleMessageRef,
        isNearBottom,
        scrollToBottom,
        prepareForPreviousMessages,
        finalizePreviousMessagesLoad
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
            setContextMenu({ ...contextMenu, visible: false });
            return;
        }
        
        setContextMenu({ ...contextMenu, visible: false });
        optimizedPinMessage(messageToPin);
    }, [contextMenu, setContextMenu, pinnedMessages, optimizedPinMessage]);
    
        // 메시지 고정 해제 함수 (React Query Optimistic Update) - 메모이제이션  
    const handleUnpinMessage = useCallback(async (messageId: string) => {
        optimizedUnpinMessage(messageId);
    }, [optimizedUnpinMessage]);

    // 초기 로드 완료 시 스크롤 최하단으로 - 단순화
    useEffect(() => {
        if (messages.length > 0 && !initialLoadComplete && messageDirection === "INITIAL") {
            // 초기 로드 시에는 반드시 맨 하단으로 이동
            const scrollToBottomImmediate = () => {
                if (chatAreaRef.current) {
                    chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
                }
            };
            
            // DOM 업데이트 완료 후 즉시 스크롤
            setTimeout(scrollToBottomImmediate, 50);
            setTimeout(() => {
                scrollToBottomImmediate();
                setInitialLoadComplete(true);
            }, 150);
        }
    }, [messages.length, initialLoadComplete, messageDirection, setInitialLoadComplete, chatAreaRef]);

    // 새 메시지 도착 시 스크롤 처리 - 단순화 및 AFTER 방향 포함
    useEffect(() => {
        if ((messageDirection === "new" || messageDirection === "AFTER") && messages.length > 0 && initialLoadComplete) {
            const lastMessage = messages[messages.length - 1];
            const isOwnMessage = lastMessage?.senderId === user?.id;
            
            // 내가 보낸 메시지이거나 현재 화면이 하단에 있을 때만 자동 스크롤
            if (isOwnMessage || isNearBottom.current) {
                setTimeout(() => scrollToBottom('smooth'), 50);
            }
        }
    }, [messageDirection, messages, user?.id, scrollToBottom, isNearBottom, initialLoadComplete]);

    // 메시지 참조 업데이트
    useEffect(() => {
        messagesRef.current = messages;
    }, [messagesRef, messages]);

    // DOM 준비 상태 설정
    useEffect(() => {
        domReadyRef.current = true;
    }, []);

    // URL 미리보기 로드 후 스크롤 처리 제거 - 불필요한 스크롤 조작 방지

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
                return;
            }
            lastReadTimeRef.current = now;

            // 웹소켓 연결 상태 확인
            if (!webSocketService.current?.isConnected()) {
                markAllMessagesAsRead(Number(roomId), user.id, 'temp-session')
                    .catch((err) => console.error("HTTP 읽음처리 실패", err));
                return;
            }

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

                // 메시지 수신 핸들러 (useMessageHandlers에서 처리) - 스크롤 로직 제거
                webSocketService.current.onMessage((msg: ChatMessageItem) => {
                    handleMessage(msg);
                    
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
                    if (!syncResponse.messages || !Array.isArray(syncResponse.messages)) {
                        console.error("동기화 응답에 메시지 배열이 없음:", syncResponse);
                        return;
                    }
                    
                    if (syncResponse.direction === "BEFORE") {
                        // 이전 메시지가 없으면 더 이상 요청하지 않음
                        if (syncResponse.messages.length === 0) {
                            isPreviousMessagesLoadingRef.current = false;
                            setHasMoreMessages(false);
                            return;
                        }

                        const targetMessageId = firstVisibleMessageRef.current;
                        
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
                        
                        // 새로운 스크롤 관리자 사용 - 부드러운 스크롤 복원
                        if (targetMessageId) {
                            setTimeout(() => {
                                finalizePreviousMessagesLoad(targetMessageId);
                            }, 50);
                        }
                    } else {
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
                        
                        if (!syncResponse.direction || syncResponse.direction === "INITIAL") {
                            setMessageDirection("INITIAL");
                        }
                        else if (syncResponse.direction === "AFTER") {
                            setMessageDirection("AFTER");
                            // 스크롤 로직 제거 - messageDirection 변경으로 기존 useEffect에서 처리
                        }
                    }
                });

                // Heartbeat 설정
                heartbeatRef.current = setInterval(() => {
                    if (webSocketService.current.isConnected()) {
                        webSocketService.current.sendActiveStatus(true);
                    }
                }, 120000);

                // 초기 동기화 요청 - 중복 방지
                if (messages.length === 0) {  // 메시지가 없을 때만 초기 동기화 실행
                    setTimeout(() => {
                        webSocketService.current.requestSync(
                            undefined,  // lastMessageId를 undefined로 설정하여 최신 메시지부터 가져오기
                            "INITIAL",  // 항상 INITIAL로 요청하여 최신 메시지들을 가져오기
                            50          // 초기 로드시 50개로 줄여서 빠른 로딩
                        );

                        if (roomId && user) {
                            markAllRead();
                        }
                    }, 100);
                }

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

    // 스크롤 이벤트 핸들러 (페이징) - 개선된 버전
    useEffect(() => {
        const handleScroll = () => {
            if (!chatAreaRef.current || isPreviousMessagesLoadingRef.current) return;

            const { scrollTop } = chatAreaRef.current;
            
            // 스크롤이 맨 위에 가까워졌을 때만 이전 메시지 로드
            if (scrollTop < 50 && messages.length > 0 && hasMoreMessages) {
                const firstMessage = messages[0];
                if (firstMessage) {
                    // 새로운 스크롤 관리자 사용 - 스크롤 위치 저장 및 로딩 준비
                    prepareForPreviousMessages(firstMessage.id);
                    setMessageDirection("BEFORE");
                    webSocketService.current.requestSync(firstMessage.id, "BEFORE", 30); // 이전 메시지 30개씩 로드
                }
            }
        };

        const chatArea = chatAreaRef.current;
        if (chatArea) {
            chatArea.addEventListener("scroll", handleScroll, { passive: true }); // passive 옵션으로 성능 개선
            handleScroll();
        }
        return () => {
            if (chatArea) {
                chatArea.removeEventListener("scroll", handleScroll);
            }
        };
    }, [chatAreaRef, isPreviousMessagesLoadingRef, messages, setMessageDirection, hasMoreMessages, prepareForPreviousMessages]);

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

    // 리액션 선택 핸들러 - 메모이제이션 및 스크롤 자동 조정
    const handleReactionSelect = useCallback(async (reactionType: string) => {
        if (!contextMenu.message) return;
        
        try {
            const hasReacted = hasReactionType(contextMenu.message.reactions, reactionType, user?.id || 0);
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
            
            // 리액션 업데이트 후 스크롤 자동 조정 (화면 하단 근처에 있을 때만)
            if (isNearBottom.current) {
                setTimeout(() => {
                    scrollToBottom('smooth');
                }, 100); // DOM 업데이트 완료 후 스크롤
            }
            
            setShowReactionPicker(false);
            closeContextMenu();
        } catch (error) {
            console.error('리액션 처리 중 오류 발생:', error);
        }
    }, [contextMenu.message, user?.id, setMessages, setShowReactionPicker, closeContextMenu, isNearBottom, scrollToBottom]);

    // 반응 추가 버튼 클릭 핸들러
    const handleShowReactionPicker = (e: React.MouseEvent) => {
        e.stopPropagation(); // 이벤트 버블링 방지
        setShowReactionPicker(true);
    };

    // 리액션 업데이트 콜백 (MessageRow에서 호출)
    const handleReactionUpdate = useCallback((messageId: string, updatedReactions: any) => {
        setMessages(prevMessages =>
            prevMessages.map(message =>
                message.id === messageId
                    ? { ...message, reactions: updatedReactions }
                    : message
            )
        );
        
        // 리액션 업데이트 후 스크롤 자동 조정 (화면 하단 근처에 있을 때만)
        if (isNearBottom.current) {
            setTimeout(() => {
                scrollToBottom('smooth');
            }, 100);
        }
    }, [setMessages, isNearBottom, scrollToBottom]);

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
                        onReactionUpdate={handleReactionUpdate}
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

                {showForwardModal && selectedMessageId && user && (
                    <ForwardMessageModal
                        isOpen={showForwardModal}
                        messageId={selectedMessageId}
                        currentUserId={user.id}
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