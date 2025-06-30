import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../shared/lib/context/AuthContext";
import { pinMessage, unpinMessage, getPinnedMessages } from "../message/api/message";
import { markAllMessagesAsRead } from "./api/chatRoom";
import { createWebSocketService } from "./api/websocket/index";
import { MessageStatusUpdate } from "./api/websocket/types";
import { SmileOutlined } from '@ant-design/icons';
import { messageReactionService, ReactionType } from '../message-reaction/api/reactionApi';
import { Button } from 'antd';

// 스타일 임포트
import {
    ChatWrapper,
    ChatContainer,
    Header,
    BackButton,
    HeaderTitle,
    ChatArea,
    MessagesContainer,
    TypingIndicatorContainer,
    TypingDots,
    ChatInputContainer,
    Input,
    SendButton,
    ErrorMessage,
    ContextMenu,
    ContextMenuItem
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

// 컴포넌트 임포트
import { MessageRow } from '../message/ui/MessageRow';
import { UrlPreview } from '../message/ui/UrlPreview';
import { PinnedMessages } from '../message/ui/PinnedMessages';
import { ForwardMessageModal } from '../message/ui/ForwardMessageModal';

// 아이콘 컴포넌트 임포트
import {
    BackIcon,
    SendIcon,
    ForwardIcon,
    ErrorIcon,
    PinIcon
} from '../message/ui/icons';

// 유틸리티 임포트
import { formatTime } from '../message/lib/timeUtils';

const ChatRoom = ({ roomId }: { roomId: string }) => {
    const { user } = useAuth();
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
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

    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [showForwardModal, setShowForwardModal] = useState(false);
    const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(true);
    const navigate = useNavigate();
    const domReadyRef = useRef(false);
    const [pinnedMessages, setPinnedMessages] = useState<ChatMessageItem[]>([]);
    const [isPinnedMessagesExpanded, setIsPinnedMessagesExpanded] = useState(false);
    const lastItemRef = useRef<string | null>(null);
    const [showReactionPicker, setShowReactionPicker] = useState(false);
    const [reactionTypes] = useState<ReactionType[]>([
        { code: 'like', emoji: '👍', description: '좋아요' },
        { code: 'sad', emoji: '😢', description: '슬퍼요' },
        { code: 'dislike', emoji: '👎', description: '싫어요' },
        { code: 'angry', emoji: '😡', description: '화나요' },
        { code: 'curious', emoji: '🤔', description: '궁금해요' },
        { code: 'surprised', emoji: '😮', description: '놀라워요' }
    ]);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);

    // 고정된 메시지 가져오는 함수
    const fetchPinnedMessages = useCallback(async () => {
        if (!roomId) return;
        try {
            const response = await getPinnedMessages(Number(roomId));
            if (response && response.data && Array.isArray(response.data.pinnedMessages)) {
                const formattedPinnedMsgs = response.data.pinnedMessages.map((pinMsg: {
                    messageId: string;
                    content: string;
                    senderId: string;
                    pinnedBy: string;
                    pinnedAt: string;
                    createdAt: string;
                }) => ({
                    id: pinMsg.messageId,
                    roomId: response.data.roomId,
                    senderId: pinMsg.senderId,
                    content: {
                        text: pinMsg.content,
                        type: "TEXT",
                        attachments: [],
                        isEdited: false,
                        isDeleted: false
                    },
                    createdAt: pinMsg.createdAt,
                    status: "SAVED",
                    readBy: {}
                }));
                setPinnedMessages(formattedPinnedMsgs);
            } else if (response && Array.isArray(response.data)) {
                setPinnedMessages(response.data);
            } else {
                console.error("Unexpected pinned messages format:", response);
                setPinnedMessages([]);
            }
        } catch (error) {
            console.error("Failed to fetch pinned messages:", error);
            setPinnedMessages([]);
        }
    }, [roomId]);

    // 메시지 고정 함수
    const handlePinMessage = async () => {
        if (!contextMenu.message || !contextMenu.message.id) return;
        
        try {
            await pinMessage(contextMenu.message.id);
            // 성공 시 고정된 메시지 목록 다시 불러오기
            fetchPinnedMessages();
            // 컨텍스트 메뉴 닫기
            setContextMenu({ visible: false, x: 0, y: 0, message: null });
        } catch (error) {
            console.error("Failed to pin message:", error);
        }
    };
    
    // 메시지 고정 해제 함수
    const handleUnpinMessage = async (messageId: string) => {
        try {
            await unpinMessage(messageId);
            // 성공 시 고정된 메시지 목록에서 제거
            setPinnedMessages(prev => prev.filter(msg => msg.id !== messageId));
        } catch (error) {
            console.error("Failed to unpin message:", error);
        }
    };

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

    // 읽음 처리를 위한 세션 ID
    const [sessionId] = useState<string>(() => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);
    const lastReadTimeRef = useRef<number>(0);

    // 모든 메시지 읽음 처리 (웹소켓으로 통일)
    const markAllRead = useCallback(() => {
        if (!roomId || !user) return;
        const now = Date.now();
        if (now - lastReadTimeRef.current < 500) {
            console.log("읽음 처리 디바운스 중...");
            return;
        }
        lastReadTimeRef.current = now;

        // 웹소켓 연결 상태 확인
        if (!webSocketService.current?.isConnected()) {
            console.log("웹소켓 연결이 없어 HTTP API로 읽음 처리");
            markAllMessagesAsRead(Number(roomId), user.id, sessionId)
                .then(() => console.log("읽음 처리 성공"))
                .catch((err) => console.error("모든 메시지 읽음처리 실패", err));
            return;
        }

        // 웹소켓으로 읽음 처리
        console.log("웹소켓으로 읽음 처리:", { roomId, userId: user.id });
        webSocketService.current.markAllMessagesAsRead();
    }, [roomId, user, sessionId]);

    // 여러 메시지 읽음 업데이트 처리 함수
    const updateBulkMessageReadStatus = useCallback((messageIds: string[], userId: string) => {
        setMessages((prev) =>
            prev.map((msg) =>
                messageIds.includes(msg.id)
                    ? { ...msg, readBy: { ...msg.readBy, [userId]: true } }
                    : msg
            )
        );
    }, [setMessages]);

    // 뒤로가기 클릭시 동작
    const handleBack = () => {
        navigate("/", { state: { refresh: true } });
    };

    // 시간 문자열 가져오기 함수 추가 (renderTime 섹션 근처에 추가)
    const getMessageCreatedAt = (msg: ChatMessageItem): string => {
        // 1. 메시지 자체의 createdAt
        if (msg.createdAt) {
            return msg.createdAt;
        }
        
        // 2. messageStatuses에서 저장된 createdAt
        if (msg.tempId && messageStatuses[msg.tempId]?.createdAt) {
            return messageStatuses[msg.tempId].createdAt!;
        }
        
        // 3. 기본값 (현재 시간)
        return new Date().toISOString();
    };

    // 고정글
    useEffect(() => {
        if (roomId && isConnected) {
            fetchPinnedMessages();
        }
    }, [roomId, isConnected, fetchPinnedMessages]);

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

                // 핀 상태 변경 핸들러
                webSocketService.current.onPinUpdate(() => {
                    fetchPinnedMessages();
                });

                // 동기화 핸들러
                webSocketService.current.onSync((syncResponse: { roomId: number, direction?: string, messages: any[] }) => {
                    console.log("동기화 응답 수신:", {
                        direction: syncResponse.direction,
                        messageCount: syncResponse.messages.length,
                        source: "sync",
                        messages: syncResponse.messages.map(msg => ({
                            id: msg.id,
                            reactions: msg.reactions,
                            content: msg.content,
                            senderId: msg.senderId,
                            timestamp: msg.timestamp,
                            status: msg.status,
                            readBy: msg.readBy
                        }))
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
                    const lastMessageId = messages.length > 0 
                        ? messages[messages.length - 1].id 
                        : null;

                    webSocketService.current.requestSync(
                        lastMessageId || undefined,
                        lastMessageId ? "AFTER" : "INITIAL"
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
                    webSocketService.current.requestSync(firstMessage.id, "BEFORE");
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
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
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

        // 상태를 먼저 설정하고 메시지 추가
        updateMessageStatus(tempId, { 
            status: MessageStatus.SENDING, 
            persistedId: null,
            createdAt: new Date().toISOString()
        });

        // 상태 설정 후 약간의 지연을 두고 메시지 추가 (동기화 보장)
        setTimeout(() => {
            updateMessages(chatMessage);
        }, 0);
        
        webSocketService.current.sendMessage(chatMessage);
        setInput("");
        sendTypingIndicator(false);
    };

    // 입력값 변경 및 타이핑 디바운스 처리
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    };

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

    // 우클릭: 컨텍스트 메뉴 표시 (메시지 전달 옵션)
    const handleChatBubbleClick = (e: React.MouseEvent, message: ChatMessageItem) => {
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
    };

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

    // 메시지 상태 표시 로직
    const renderStatusIndicator = (currentStatus: MessageStatus, isOwn: boolean, isPersisted: boolean): JSX.Element | null => {
        if (!isOwn || !currentStatus) return null;
        
        // SAVED 상태이거나 persistedId가 있으면 상태 표시하지 않음
        if (currentStatus === MessageStatus.SAVED || isPersisted) return null;
        
        return (
            <div className="status-indicator">
                {currentStatus === MessageStatus.SENDING && "전송 중..."}
                {currentStatus === MessageStatus.SENT_TO_KAFKA && "서버로 전송됨"}
                {currentStatus === MessageStatus.PROCESSING && "처리 중..."}
                {currentStatus === MessageStatus.FAILED && "전송 실패"}
            </div>
        );
    };

    // 컨텍스트 메뉴에서 "메시지 전달" 선택
    const handleForwardClick = () => {
        if (contextMenu.message) {
            setSelectedMessageId(contextMenu.message.id);
            setShowForwardModal(true);
        }
        closeContextMenu();
    };

    // 읽음 상태 계산 로직 개선
    const calculateReadStatus = (
        isOwn: boolean,
        isPersisted: boolean,
        otherParticipants: string[],
        msg: ChatMessageItem
    ): boolean => {
        // 1. 내 메시지가 아니거나 저장되지 않은 경우
        const isNotOwnOrNotPersisted = Boolean((!isOwn) || (!isPersisted));
        if (isNotOwnOrNotPersisted) {
            return true;
        }

        // 2. 다른 참여자가 없는 경우
        const hasNoParticipants = Boolean(otherParticipants.length === 0);
        if (hasNoParticipants) {
            return false;
        }

        // 3. 모든 참여자가 읽었는지 확인
        const hasReadByAll = otherParticipants.every((id) => {
            const hasReadBy = Boolean(msg.readBy && msg.readBy[id]);
            return hasReadBy;
        });

        return hasReadByAll;
    };

    // 리액션 선택 핸들러
    const handleReactionSelect = async (reactionType: string) => {
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
    };

    // 반응 추가 버튼 클릭 핸들러
    const handleShowReactionPicker = (e: React.MouseEvent) => {
        e.stopPropagation(); // 이벤트 버블링 방지
        setShowReactionPicker(true);
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
                <Header>
                    <BackButton onClick={handleBack}>
                        <BackIcon />
                    </BackButton>
                    <HeaderTitle>채팅방</HeaderTitle>
                </Header>

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
                    <MessagesContainer className={input ? 'typing' : ''}>
                        {messages.map((msg, idx) => {
                            // 내 메시지인가?
                            const isOwn = String(msg.senderId) === String(user?.id);
                            
                            // 메시지 상태 결정 로직 개선
                            let currentStatus = msg.status;
                            let isPersisted = false;
                            
                            if (msg.tempId && messageStatuses[msg.tempId]) {
                                const statusInfo = messageStatuses[msg.tempId];
                                currentStatus = statusInfo.status;
                                // SAVED 상태이거나 persistedId가 있으면 저장된 것으로 간주
                                isPersisted = statusInfo.status === MessageStatus.SAVED || !!statusInfo.persistedId;
                            } else {
                                // tempId가 없거나 상태 정보가 없으면 이미 저장된 메시지로 간주
                                isPersisted = !!msg.id && msg.id !== msg.tempId;
                            }
                            
                            // 읽음 상태 확인 로직
                            const otherParticipants = msg.readBy 
                                ? Object.keys(msg.readBy).filter(id => id !== user?.id.toString()) 
                                : [];
                            
                            // 읽음 상태 계산 로직 개선
                            const otherHasRead = calculateReadStatus(
                                isOwn,
                                isPersisted,
                                otherParticipants,
                                msg
                            );
                            
                            // indicatorText: 메시지를 모든 상대방이 읽지 않았으면 "1" 표시
                            const indicatorText = isOwn && isPersisted && !otherHasRead ? "1" : "";
                            
                            // 상태표시 - persistedId가 있으면 표시하지 않음
                            const statusIndicator = renderStatusIndicator(currentStatus, isOwn, isPersisted);
                            
                            const nextMessage = messages[idx + 1];
                            const msgCreatedAt = getMessageCreatedAt(msg);
                            const currentTime = formatTime(msgCreatedAt);
                            const nextTime = nextMessage ? formatTime(getMessageCreatedAt(nextMessage)) : null;
                            const showTime = !nextMessage || currentTime !== nextTime;
                            
                            return (
                                <React.Fragment key={idx}>
                                    <MessageRow
                                        message={msg}
                                        isOwn={isOwn}
                                        showTime={showTime}
                                        currentTime={currentTime}
                                        statusIndicator={statusIndicator}
                                        indicatorText={indicatorText}
                                        onContextMenu={handleChatBubbleClick}
                                        onClick={handleChatBubbleClick}
                                        userId={user?.id || 0}
                                    />
                                    {msg.content?.urlPreview && (
                                        <div style={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start', width: '100%' }}>
                                            <UrlPreview message={msg} />
                                        </div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </MessagesContainer>
                    <div ref={bottomRef} />
                </ChatArea>

                <ChatInputContainer>
                    <Input
                        type="text"
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onCompositionStart={handleCompositionStart}
                        onCompositionEnd={handleCompositionEnd}
                        onBlur={() => {
                            sendTypingIndicator(false);
                            if (typingTimeoutRef.current) {
                                clearTimeout(typingTimeoutRef.current);
                                typingTimeoutRef.current = null;
                            }
                        }}
                        placeholder="메시지를 입력하세요"
                        disabled={!isConnected}
                    />
                    <SendButton onClick={sendMessage} disabled={!isConnected}>
                        <SendIcon />
                    </SendButton>
                    {(() => {
                        const otherTypingUsers = Object.values(typingUsers).filter(typingUser => 
                            String(typingUser.userId) !== String(user?.id)
                        );
                        if (otherTypingUsers.length === 0) return null;
                        return (
                            <TypingIndicatorContainer className="visible">
                                {otherTypingUsers.length > 1 
                                    ? `${otherTypingUsers.length}명이 타이핑 중입니다`
                                    : '상대방이 타이핑 중입니다'
                                }
                                <TypingDots>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </TypingDots>
                            </TypingIndicatorContainer>
                        );
                    })()}
                </ChatInputContainer>

                {contextMenu.visible && (
                    <ContextMenu id="context-menu" style={{ top: contextMenu.y, left: contextMenu.x }}>
                        {!showReactionPicker ? (
                            <>
                                <ContextMenuItem onClick={handleShowReactionPicker}>
                                    <SmileOutlined /> 반응 추가
                                </ContextMenuItem>
                                <ContextMenuItem onClick={handleForwardClick}>
                                    <ForwardIcon /> 메시지 전달
                                </ContextMenuItem>
                                {contextMenu.message && pinnedMessages.some(msg => msg.id === contextMenu.message?.id) ? (
                                    <ContextMenuItem onClick={() => {
                                        if (contextMenu.message) handleUnpinMessage(contextMenu.message.id);
                                        setContextMenu({ ...contextMenu, visible: false });
                                    }}>
                                        <PinIcon /> 공지사항 해제
                                    </ContextMenuItem>
                                ) : (
                                    <ContextMenuItem onClick={handlePinMessage}>
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
                                            onClick={() => handleReactionSelect(type.code)}
                                            style={{
                                                fontSize: '20px',
                                                padding: '4px',
                                                height: '32px',
                                                width: '32px',
                                                minWidth: '32px',
                                                backgroundColor: contextMenu.message?.reactions?.[type.code]?.includes(user?.id || 0) 
                                                    ? '#e6f7ff' 
                                                    : 'transparent',
                                            }}
                                        >
                                            {type.emoji}
                                        </Button>
                                    ))}
                                </div>
                                <ContextMenuItem onClick={() => setShowReactionPicker(false)}>
                                    <SmileOutlined /> 다른 반응
                                </ContextMenuItem>
                            </>
                        )}
                    </ContextMenu>
                )}

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