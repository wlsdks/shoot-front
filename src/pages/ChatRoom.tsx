import React, { useEffect, useLayoutEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { forwardMessage, pinMessage, unpinMessage, getPinnedMessages } from "../services/message";
import { markAllMessagesAsRead } from "../services/chatRoom";
import SockJS from "sockjs-client";
import { Client, IMessage } from "@stomp/stompjs";
import styled, { keyframes } from "styled-components";
import { throttle } from "lodash";

// 채팅 메시지 인터페이스
export interface ChatMessageItem {
    id: string;
    tempId?: string;
    roomId: number; // string -> number로 변경
    senderId: number; // string -> number로 변경
    content: {
        text: string;
        type: string;
        attachments: any[];
        isEdited: boolean;
        isDeleted: boolean;
        urlPreview?: {  // 백엔드 구조와 일치시킴
            url: string;
            title?: string;
            description?: string;
            imageUrl?: string;
            siteName?: string;
        }
    };
    createdAt?: string;
    status: string;
    readBy: { [userId: string]: boolean };
}

// 타이핑 인디케이터 메시지 인터페이스
interface TypingIndicatorMessage {
    roomId: number; // string -> number로 변경
    userId: number; // string -> number로 변경
    username: string;
    isTyping: boolean;
}

// 애니메이션 정의
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
`;

const bounce = keyframes`
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-3px); }
`;

// ============= 스타일 컴포넌트 정의 =============

// 채팅 컨테이너
const ChatWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 60px);
    padding-top: 60px;
    background-color: #f5f7fa;
    overflow: hidden;
`;

const ChatContainer = styled.div`
    width: 375px;
    height: 667px;
    background-color: #fff;
    border-radius: 20px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    border: 1px solid rgba(0, 0, 0, 0.05);
`;

// 헤더 스타일
const Header = styled.div`
    padding: 14px 16px;
    background: #fff;
    border-bottom: 1px solid #eee;
    display: flex;
    align-items: center;
    z-index: 10;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
`;

const BackButton = styled.button`
    background: #f0f7ff;
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    cursor: pointer;
    color: #007bff;
    margin-right: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    
    &:hover {
        background: #e1ecff;
        transform: translateX(-2px);
    }
`;

const HeaderTitle = styled.h2`
    font-size: 1.1rem;
    margin: 0;
    color: #333;
    font-weight: 600;
    flex: 1;
`;

// 채팅 영역 스타일
const ChatArea = styled.div`
    flex: 1;
    padding: 16px;
    background: #f8f9fa;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #ddd transparent;
    
    &::-webkit-scrollbar {
        width: 5px;
    }
    
    &::-webkit-scrollbar-thumb {
        background: #ddd;
        border-radius: 3px;
    }
    
    &::-webkit-scrollbar-track {
        background: transparent;
    }
`;

// 메시지 행: 채팅 말풍선과 시간/Indicator를 수평 배치
const MessageRow = styled.div<{ $isOwnMessage: boolean }>`
    display: flex;
    align-items: flex-end;
    justify-content: ${({ $isOwnMessage }) => ($isOwnMessage ? "flex-end" : "flex-start")};
    margin-bottom: 10px;
    animation: ${fadeIn} 0.3s ease-out;
`;

// 채팅 말풍선
const ChatBubble = styled.div<{ $isOwnMessage: boolean }>`
    max-width: 100%;
    padding: 10px 14px;
    border-radius: 18px;
    background: ${({ $isOwnMessage }) =>
        $isOwnMessage 
        ? "linear-gradient(135deg, #007bff, #0056b3)" 
        : "#ffffff"};
    color: ${({ $isOwnMessage }) => ($isOwnMessage ? "#fff" : "#333")};
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    font-size: 0.95rem;
    border: ${({ $isOwnMessage }) => $isOwnMessage ? "none" : "1px solid #eee"};
    cursor: pointer;
    transition: all 0.2s;
    word-break: break-word;
    position: relative;
    className: "chat-bubble"; /* 클래스명 추가 - 선택자로 사용하기 위함 */
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
    }
`;

// 시간 및 상태 컨테이너
const TimeContainer = styled.div<{ $isOwnMessage: boolean }>`
    font-size: 0.7rem;
    color: #999;
    margin: 0 6px;
    display: flex;
    flex-direction: column;
    align-items: ${({ $isOwnMessage }) => ($isOwnMessage ? "flex-end" : "flex-start")};
`;

// 타이핑 인디케이터
const TypingIndicatorContainer = styled.div`
    padding: 8px 12px;
    font-size: 0.85rem;
    color: #666;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 18px;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    max-width: 75%;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const TypingDots = styled.div`
    display: flex;
    margin-left: 8px;
    
    span {
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background-color: #aaa;
        margin: 0 2px;
        animation: ${bounce} 1s infinite;
        
        &:nth-child(2) {
            animation-delay: 0.2s;
        }
        
        &:nth-child(3) {
            animation-delay: 0.4s;
        }
    }
`;

// 입력 영역
const ChatInputContainer = styled.div`
    display: flex;
    padding: 12px 16px;
    background: #fff;
    border-top: 1px solid #eee;
    z-index: 10;
`;

const Input = styled.input`
    flex: 1;
    padding: 12px 16px;
    font-size: 0.95rem;
    border: none;
    border-radius: 20px;
    background: #f0f2f5;
    
    &:focus {
        outline: none;
        background: #e8eaed;
        box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.2);
    }
    
    &::placeholder {
        color: #aaa;
    }
`;

const SendButton = styled.button`
    padding: 0;
    width: 40px;
    height: 40px;
    margin-left: 8px;
    background: linear-gradient(135deg, #007bff, #0056b3);
    color: #fff;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
        transform: scale(1.05);
        box-shadow: 0 2px 5px rgba(0, 123, 255, 0.4);
    }
    
    &:disabled {
        background: #ccc;
        cursor: not-allowed;
    }
`;

const ErrorMessage = styled.div`
    padding: 10px;
    background: #ffebee;
    color: #c62828;
    text-align: center;
    font-size: 0.9rem;
    border-radius: 10px;
    margin: 8px 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    
    svg {
        margin-right: 6px;
    }
`;

const ContextMenu = styled.div`
    position: fixed; /* absolute 대신 fixed 사용 */
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
    z-index: 1000; /* 충분히 높은 z-index */
    overflow: hidden;
    border: 1px solid #eee;
    min-width: 150px; /* 최소 너비 지정 */
`;

const ContextMenuItem = styled.div`
    padding: 10px 14px;
    cursor: pointer;
    transition: background 0.2s;
    display: flex;
    align-items: center;
    
    svg {
        margin-right: 8px;
        color: #666;
    }
    
    &:hover {
        background: #f5f9ff;
    }
`;

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1001;
`;

const ModalContent = styled.div`
    background: white;
    padding: 20px;
    border-radius: 10px;
    min-width: 300px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    
    h3 {
        margin-top: 0;
        color: #333;
    }
    
    input {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 6px;
        margin: 10px 0;
        font-size: 0.95rem;
        
        &:focus {
            outline: none;
            border-color: #007bff;
        }
    }
`;

const ModalButtons = styled.div`
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    
    button {
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 0.95rem;
        cursor: pointer;
        transition: all 0.2s;
        
        &:first-child {
            background: #f0f0f0;
            border: none;
            color: #333;
            
            &:hover {
                background: #e0e0e0;
            }
        }
        
        &:last-child {
            background: #007bff;
            border: none;
            color: white;
            
            &:hover {
                background: #0056b3;
            }
        }
    }
`;

// URL 미리보기 스타일
const UrlPreviewContainer = styled.div`
    margin-top: 15px;
    margin-bottom: 5px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 12px;
    overflow: hidden;
    background: white;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    transition: all 0.2s;
    max-width: 300px;
    width: 100%;
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }
`;

const PreviewImage = styled.div<{ $hasImage: boolean }>`
    width: 100%;
    height: ${({ $hasImage }) => ($hasImage ? '140px' : '0')};
    background-color: #f1f3f5;
    display: ${({ $hasImage }) => ($hasImage ? 'block' : 'none')};
    
    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
`;

const PreviewContent = styled.div`
    padding: 10px 12px;
`;

const PreviewSite = styled.div`
    font-size: 0.7rem;
    color: #777;
    margin-bottom: 4px;
`;

const PreviewTitle = styled.div`
    font-size: 0.9rem;
    font-weight: 600;
    color: #007bff;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-decoration: underline;
`;

const PreviewDescription = styled.div`
    font-size: 0.8rem;
    color: #666;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
`;

// 고정된 메시지 섹션 스타일 (다른 스타일 컴포넌트 근처에 추가)
const PinnedMessagesContainer = styled.div<{ $isExpanded: boolean }>`
    background-color: #f8f9fa;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    padding: 0;
    max-height: ${props => props.$isExpanded ? '200px' : '56px'};
    overflow: ${props => props.$isExpanded ? 'auto' : 'hidden'};
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const PinnedMessagesHeader = styled.div<{ $isExpanded: boolean }>`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    background-color: #f0f5ff;
    border-bottom: ${props => props.$isExpanded ? '1px solid rgba(0, 123, 255, 0.1)' : 'none'};
    cursor: pointer;
`;

const ExpandButton = styled.button<{ $isExpanded: boolean }>`
    background: none;
    border: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #007bff;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
        background-color: rgba(0, 123, 255, 0.1);
    }
    
    svg {
        transition: transform 0.3s ease;
        transform: ${props => props.$isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'};
    }
`;

// 공지사항 요약 컨테이너 추가
const PinnedMessagesSummary = styled.div`
    display: flex;
    align-items: center;
    overflow: hidden;
    flex: 1;
    margin-left: 10px;
    
    span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 0.85rem;
        color: #666;
    }
`;

const PinnedMessagesTitle = styled.div`
    font-size: 0.85rem;
    font-weight: 600;
    color: #007bff;
    display: flex;
    align-items: center;
    gap: 6px;
`;

const PinnedMessagesContent = styled.div`
    padding: 8px 0;
    max-height: 200px;
    overflow-y: auto;
`;

const PinnedMessageItem = styled.div`
    display: flex;
    align-items: center;
    padding: 8px 16px;
    background-color: #fff;
    margin: 4px 8px;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    position: relative;
    transition: all 0.2s;
    border-left: 3px solid #007bff;
    
    &:hover {
        background-color: #f9f9f9;
        transform: translateY(-1px);
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }
`;

const PinnedMessageContent = styled.div`
    flex: 1;
    font-size: 0.9rem;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const PinnedMessageSender = styled.span`
    font-weight: 600;
    margin-right: 6px;
    color: #007bff;
`;

const UnpinButton = styled.button`
    background: none;
    border: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #aaa;
    cursor: pointer;
    margin-left: 8px;
    transition: all 0.2s;
    
    &:hover {
        color: #dc3545;
        background-color: rgba(220, 53, 69, 0.1);
    }
`;

// ============= 아이콘 컴포넌트 =============
const BackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
);

const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
);

const ForwardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="17 8 22 12 17 16"></polyline>
        <line x1="4" y1="12" x2="22" y2="12"></line>
    </svg>
);

const ErrorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
);

// 핀 아이콘 컴포넌트
const PinIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L12 6"></path>
        <path d="M12 12L12 19"></path>
        <line x1="4.5" y1="12" x2="19.5" y2="12"></line>
        <path d="M8 12c-1.1 0-2-.9-2-2V7c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v3c0 1.1-.9 2-2 2H8z"></path>
    </svg>
);

// 화살표 아이콘 컴포넌트
const ChevronDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
);

// ============= ChatRoom 컴포넌트 =============
const ChatRoom: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const { user } = useAuth();
    const [messages, setMessages] = useState<ChatMessageItem[]>([]);
    const [input, setInput] = useState("");
    const [typingUsers, setTypingUsers] = useState<string[]>([]);
    const [stompClient, setStompClient] = useState<Client | null>(null);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [showForwardModal, setShowForwardModal] = useState(false);
    const [targetRoomId, setTargetRoomId] = useState("");
    const [isConnected, setIsConnected] = useState(true);
    const [isComposing, setIsComposing] = useState(false);
    const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; message: ChatMessageItem | null }>({ visible: false, x: 0, y: 0, message: null });
    const navigate = useNavigate();
    const chatAreaRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const messagesRef = useRef<ChatMessageItem[]>([]);
    const domReadyRef = useRef(false);
    const [isDomReady, setIsDomReady] = useState(false);
    const [pinnedMessages, setPinnedMessages] = useState<ChatMessageItem[]>([]);
    const [isPinnedMessagesExpanded, setIsPinnedMessagesExpanded] = useState(false);

    // 1. 더 단순하게 이전 위치 유지를 위한 참조 추가
    const lastScrollPosRef = useRef(0);
    const scrollHeightBeforeUpdateRef = useRef(0);
    const isPreviousMessagesLoadingRef = useRef(false);
    const lastItemRef = useRef<string | null>(null); // 마지막으로 로드된 메시지 추적 (추가)
    const firstVisibleMessageRef = useRef<string | null>(null); // 현재 화면에 보이는 첫 번째 메시지 ID

    // 1. 메시지 방향을 추적하는 상태 추가 (스크롤 방향 제어용)
    const [messageDirection, setMessageDirection] = useState<"INITIAL" | "BEFORE" | "AFTER" | "new">("INITIAL");

    // 메시지 상태를 저장하기 위한 타입 정의
    type MessageStatus = {
        status: string;
        persistedId: string | null;
        createdAt?: string | null; // createdAt 속성 추가
    };

    // 메시지 상태 추적
    const [messageStatuses, setMessageStatuses] = useState<{
        [tempId: string]: MessageStatus
    }>({});
    
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);

    // 스크롤 하단 이동
    const scrollToBottom = useCallback(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    // 고정된 메시지 가져오는 함수
    const fetchPinnedMessages = useCallback(async () => {
        if (!roomId) return;
        try {
            const response = await getPinnedMessages(Number(roomId)); // string -> number 변환
            // 응답 구조 확인 및 변환
            console.log("핀 메시지 응답:", response); // 디버깅용 로그 추가
            
            if (response && response.data && Array.isArray(response.data.pinnedMessages)) {
                // 백엔드 응답 구조에 맞게 변환
                const formattedPinnedMsgs = response.data.pinnedMessages.map((pinMsg: {
                    messageId: string;
                    content: string;
                    senderId: number; // string -> number 변경
                    pinnedBy: number; // string -> number 변경
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
                // 기존 예상 구조도 지원
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
    }, [messages, initialLoadComplete]);

    // 메시지 참조 업데이트 (최신 메시지를 유지하기 위함)
    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    // onConnect 콜백에서 항상 최신의 DOM 준비 상태를 확인할 수 있습니다.
    useEffect(() => {
        domReadyRef.current = true;
        setIsDomReady(true); // 컴포넌트가 마운트되면 DOM이 준비되었다고 가정
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
    }, [messages, messageDirection]); // messageDirection 의존성 추가

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
            // 현재 스크롤이 거의 하단에 있는 경우만 스크롤 다운
            const isNearBottom = chatArea.scrollHeight - chatArea.scrollTop - chatArea.clientHeight < 150;
            if (isNearBottom) {
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
    }, [messages, messageDirection, initialLoadComplete]);

    // 메시지 업데이트 최적화
    const updateMessages = useCallback((newMsg: ChatMessageItem) => {
        setMessages(prev => {
            // 불변성을 유지하면서 명확한 업데이트 로직 구현
            const msgExists = prev.some(m => m.id === newMsg.id);
            if (msgExists) {
                return prev.map(m => m.id === newMsg.id ? {...newMsg, readBy: newMsg.readBy || {}} : m);
            } else {
                const updatedMessages = [...prev, {...newMsg, readBy: newMsg.readBy || {}}];
                // 상태 업데이트 후 DOM 업데이트 시점에 스크롤 조정
                setTimeout(() => {
                    if (chatAreaRef.current) {
                        const isNearBottom = chatAreaRef.current.scrollHeight - chatAreaRef.current.scrollTop - chatAreaRef.current.clientHeight < 150;
                        if (isNearBottom) {
                            chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
                        }
                    }
                }, 100); // URL 미리보기가 로드될 시간을 고려하여 약간의 지연 추가
                return updatedMessages;
            }
        });
    }, []);

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
        setIsComposing(true);
    };
    
    // 조합 종료 시
    const handleCompositionEnd = () => {
        setIsComposing(false);
    };

    // Enter 키 처리
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey && !isComposing) {
            e.preventDefault();
            sendMessage();
        }
    };

    // 읽음 처리를 위한 세션 ID
    const [sessionId] = useState<string>(() => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);
    const lastReadTimeRef = useRef<number>(0);

    // 모든 메시지 읽음 처리 (API refresh 호출 제거)
    const markAllRead = useCallback(() => {
        if (!roomId || !user) return;
        const now = Date.now();
        if (now - lastReadTimeRef.current < 2000) {
            return;
        }
        lastReadTimeRef.current = now;
        markAllMessagesAsRead(Number(roomId), user.id, sessionId) // roomId를 number로 변환
            .catch((err) => console.error("모든 메시지 읽음처리 실패", err));
        // 이제 백엔드의 동기화(sync) 응답을 통해 누락 메시지가 자동 반영됨
    }, [roomId, user, sessionId]);

    // 여러 메시지 읽음 업데이트 처리 함수
    const updateBulkMessageReadStatus = (messageIds: string[], userId: string) => {
        setMessages((prev) =>
            prev.map((msg) =>
                messageIds.includes(msg.id)
                    ? { ...msg, readBy: { ...msg.readBy, [userId]: true } }
                    : msg
            )
        );
    };

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

    // 초기 메시지 로드 및 STOMP 연결
    useEffect(() => {
        // DOM이 준비되었는지 확인
        if (!chatAreaRef.current) return;

        // DOM이 준비된 후 웹소켓 연결 로직 시작
        const connectWebSocket = () => {
            if (!roomId || !user) return;

            // 이미 연결이 있으면 먼저 정리
            if (stompClient && stompClient.connected) {
                stompClient.deactivate();
            }

            // STOMP 연결
            const token = localStorage.getItem("accessToken");
            const socket = new SockJS(`http://localhost:8100/ws/chat?token=${token}`);
            const client = new Client({
                webSocketFactory: () => socket,
                reconnectDelay: 5000,
                debug: function(message) {
                    // console.log("STOMP 디버그:", message);
                },
                onConnect: () => {
                    console.log("WebSocket 연결됨");
                    setConnectionError(null);
                    setIsConnected(true);

                    // 최신 DOM 준비 상태(ref)를 확인합니다.
                    if (domReadyRef.current) {
                        // DOM이 준비되었으면 약간의 딜레이 후 동기화 요청을 보냅니다.
                        setTimeout(() => {
                            // 동기화 요청 (마지막 메시지 ID가 있으면 해당 ID 이후의 메시지만 받아옴) 
                            const lastMessageId = messages.length > 0 
                                ? messages[messages.length - 1].id 
                                : null;

                            console.log("동기화 요청 보내기:", roomId, lastMessageId);

                            // 동기화 요청: 마지막 메시지가 있으면 "AFTER", 없으면 "INITIAL"
                            client.publish({
                                destination: "/app/sync",
                                body: JSON.stringify({
                                    roomId: Number(roomId), // string -> number로 변환
                                    userId: user.id,
                                    lastMessageId,
                                    timestamp: new Date().toISOString(),
                                    direction: lastMessageId ? "AFTER" : "INITIAL"
                                })
                            });
                        }, 100); // 100ms 정도의 딜레이 (상황에 따라 조정)
                    } else {
                        console.log("DOM이 아직 준비되지 않음. 동기화 요청 대기");
                        // 필요하다면 DOM 준비 상태를 주기적으로 확인해 동기화 요청을 재시도할 수 있습니다.
                        // 예를 들어, 아래와 같이 재시도할 수 있습니다.
                        const retryInterval = setInterval(() => {
                            if (domReadyRef.current) {
                                clearInterval(retryInterval);

                                setTimeout(() => {
                                    // 마지막 메시지 id 추출
                                    const lastMessageId = messages.length > 0 
                                        ? messages[messages.length - 1].id 
                                        : null;

                                    console.log("동기화 요청 보내기 (재시도):", roomId, lastMessageId);

                                    // 요청 보내기
                                    client.publish({
                                        destination: "/app/sync",
                                        body: JSON.stringify({
                                            roomId: Number(roomId), // string -> number로 변환
                                            userId: user.id,
                                            lastMessageId,
                                            timestamp: new Date().toISOString(),
                                            direction: lastMessageId ? "AFTER" : "INITIAL"
                                        })
                                    });
                                }, 100);
                            }
                        }, 200);
                    }

                    // 활성 상태 전송
                    if (stompClient && stompClient.connected) {
                        stompClient.publish({
                            destination: "/app/active",
                            body: JSON.stringify({ 
                                userId: user.id.toString(), 
                                roomId: Number(roomId), // string -> number로 변환
                                active: true 
                            })
                        });
                    } else {
                        console.warn("연결이 되지 않았으므로 publish 호출을 스킵합니다.");
                        // 필요 시 재연결 로직 추가
                    }

                    // Heartbeat 설정
                    heartbeatRef.current = setInterval(() => {
                        if (client.connected) {
                            client.publish({
                                destination: "/app/active",
                                body: JSON.stringify({ 
                                    userId: user.id.toString(), 
                                    roomId: Number(roomId), // string -> number로 변환
                                    active: true 
                                })
                            });
                        }
                    }, 120000); // 2분

                    // 메시지 수신 구독 (실시간 신규 메시지 처리)
                    client.subscribe(`/topic/messages/${roomId}`, (message: IMessage) => {
                        // console.log("수신된 웹소켓 메시지:", message.body);
                        const msg: ChatMessageItem = JSON.parse(message.body);
                        // console.log("파싱된 메시지:", msg);
                        
                        // 새로 만든 updateMessages 함수 사용
                        updateMessages(msg);

                        // 새 메시지 도착 시 내가 읽으면 실시간 처리
                        const persistedId = msg.tempId ? messageStatuses[msg.tempId]?.persistedId : null;
                        if (
                            document.visibilityState === "visible" &&
                            msg.readBy && !msg.readBy[user.id.toString()] &&
                            msg.senderId !== user.id &&
                            persistedId 
                        ) {
                            client.publish({
                                destination: "/app/read",
                                body: JSON.stringify({ messageId: persistedId, userId: user.id }),
                            });
                        }
                    });

                    // 타이핑 인디케이터 구독
                    client.subscribe(`/topic/typing/${roomId}`, (message: IMessage) => {
                        const typingMsg: TypingIndicatorMessage = JSON.parse(message.body);
                        if (typingMsg.userId === user.id) return;
                        setTypingUsers((prev) => {
                            const newUsers = typingMsg.isTyping
                                ? prev.includes(typingMsg.username || typingMsg.userId.toString())
                                    ? prev 
                                    : [...prev, typingMsg.username || typingMsg.userId.toString()]
                                : prev.filter(u => u !== (typingMsg.username || typingMsg.userId.toString()));
                            if (newUsers.length > 0) scrollToBottom();
                            return newUsers;
                        });
                    });

                    // 메시지 상태 채널 구독
                    client.subscribe(`/topic/message/status/${roomId}`, (message: IMessage) => {
                        // console.log("상태 업데이트 수신:", JSON.parse(message.body));
                        const statusUpdate = JSON.parse(message.body);

                        // 1. messageStatuses 업데이트
                        setMessageStatuses((prev) => {
                            // 기존에 저장된 메시지 상태 찾기
                            const existingStatus = prev[statusUpdate.tempId] || {};
                            
                            return {
                                ...prev,
                                [statusUpdate.tempId]: {
                                    status: statusUpdate.status,
                                    persistedId: statusUpdate.persistedId,
                                    // 기존 createdAt를 우선 사용, 없으면 상태 업데이트의 createdAt 사용
                                    createdAt: existingStatus.createdAt || statusUpdate.createdAt
                                }
                            };
                        });
                        // 2. 메시지 목록 업데이트
                        setMessages((prev) =>
                            prev.map((msg) => {
                                if (msg.tempId === statusUpdate.tempId) {
                                    return {
                                        ...msg,
                                        status: statusUpdate.status,
                                        id: statusUpdate.persistedId || msg.id,
                                        // createdAt 변경하지 않음
                                    };
                                }
                                return msg;
                            })
                        );
                        if (statusUpdate.status === "SAVED" && statusUpdate.persistedId) {
                            const currentMsg = messagesRef.current.find(m => m.tempId === statusUpdate.tempId);
                            if (currentMsg && !currentMsg.readBy[user.id.toString()] && currentMsg.senderId !== user.id) {
                                client.publish({
                                    destination: "/app/read",
                                    body: JSON.stringify({ messageId: statusUpdate.persistedId, userId: user.id }),
                                });
                            }
                        }
                        if (statusUpdate.status === 'failed') {
                            setConnectionError(`메시지 저장 실패: ${statusUpdate.errorMessage || '알 수 없는 오류'}`);
                            setTimeout(() => setConnectionError(null), 3000);
                        }
                    });

                    // 메시지 업데이트 구독 (URL 미리보기 등)
                    client.subscribe(`/topic/message/update/${roomId}`, (message: IMessage) => {
                        const updatedMessage = JSON.parse(message.body);
                        // console.log("메시지 업데이트 수신:", updatedMessage);
                        
                        // 기존 메시지 목록에서 업데이트된 메시지 찾아 교체
                        setMessages((prevMessages) => 
                            prevMessages.map((msg) => 
                                msg.id === updatedMessage.id ? updatedMessage : msg
                            )
                        );
                    });

                    // 읽음 처리 상태 구독
                    client.subscribe(`/topic/read-bulk/${roomId}`, (message: IMessage) => {
                        const { messageIds, userId } = JSON.parse(message.body);
                        updateBulkMessageReadStatus(messageIds, userId);
                    });
                    
                    // 웹소켓 구독 추가 (onConnect 함수 내 다른 구독 부분에 추가)
                    // 메시지 핀 상태 변경 구독
                    client.subscribe(`/topic/pin/${roomId}`, (message: IMessage) => {
                        console.log("메시지 핀 상태 변경:", message.body);
                        try {
                            const pinUpdate = JSON.parse(message.body);
                            // 고정된 메시지 목록 새로고침
                            fetchPinnedMessages();
                        } catch (error) {
                            console.error("핀 메시지 업데이트 처리 실패:", error);
                        }
                    });

                    // 동기화 구독
                    client.subscribe(`/user/queue/sync`, (message: IMessage) => {
                        const syncResponse = JSON.parse(message.body) as {
                            roomId: number; // string -> number로 변경
                            direction?: string;
                            messages: Array<any>;
                        };
                        
                        // console.log("동기화 응답 수신:", syncResponse.direction, syncResponse.messages.length);
                        
                        if (syncResponse.direction === "BEFORE" && syncResponse.messages.length > 0) {
                            // 처리 전 중요한 정보 저장
                            const targetMessageId = firstVisibleMessageRef.current;
                            const originalScrollTop = lastScrollPosRef.current;
                            const originalScrollHeight = scrollHeightBeforeUpdateRef.current;
                            
                            // 메시지 업데이트
                            setMessages((prevMessages) => {
                                // 메시지 변환 및 중복 제거
                                const syncMessages: ChatMessageItem[] = syncResponse.messages.map((msg) => ({
                                    id: msg.id,
                                    tempId: msg.tempId,
                                    roomId: syncResponse.roomId,
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
                                    readBy: msg.readBy || {}
                                }));
                                
                                // 중복 제거를 위한 Map 사용
                                const messageMap = new Map<string, ChatMessageItem>();
                                prevMessages.forEach((msg) => messageMap.set(msg.id, msg));
                                syncMessages.forEach((msg) => messageMap.set(msg.id, msg));
                                
                                const mergedMessages = Array.from(messageMap.values());
                                mergedMessages.sort((a, b) =>
                                    new Date(a.createdAt || "").getTime() - new Date(b.createdAt || "").getTime()
                                );
                                
                                return mergedMessages;
                            });
                            
                            // 메시지 업데이트 후 DOM 업데이트 타이밍에 맞춰 스크롤 위치 조정
                            // requestAnimationFrame은 DOM 업데이트 후 실행됨
                            requestAnimationFrame(() => {
                                // 두 번째 requestAnimationFrame으로 이중 보호하여 더 안정적으로 만듦
                                requestAnimationFrame(() => {
                                    const chatArea = chatAreaRef.current;
                                    if (!chatArea) return;
                                    
                                    // 첫 번째 접근 방식: 이전에 보이던 메시지로 스크롤
                                    if (targetMessageId) {
                                        const targetElement = document.getElementById(`msg-${targetMessageId}`);
                                        if (targetElement) {
                                            // 'smooth' 대신 'auto'를 사용하여 즉시 이동
                                            targetElement.scrollIntoView({ block: 'start', behavior: 'auto' });
                                            console.log("타겟 메시지로 스크롤:", targetMessageId);
                                            isPreviousMessagesLoadingRef.current = false;
                                        return;
                                        }
                                    }
                                    
                                    // 두 번째 접근 방식: 높이 차이를 계산하여 스크롤 위치 보정
                                    const newScrollHeight = chatArea.scrollHeight;
                                    const heightDifference = newScrollHeight - originalScrollHeight;
                                    const newScrollPosition = originalScrollTop + heightDifference;
                                    
                                    // 스크롤 위치 즉시 설정 (부드러운 전환 없이)
                                    chatArea.scrollTop = newScrollPosition;
                                    
                                    // 플래그 해제
                                    isPreviousMessagesLoadingRef.current = false;
                                });
                            });
                            } else {
                            // 다른 방향의 메시지 처리 (초기 로드 또는 새 메시지)
                            // 이 부분은 기존 코드와 동일하게 유지...
                            setMessages((prevMessages) => {
                                // 메시지 변환 코드...
                                const syncMessages: ChatMessageItem[] = syncResponse.messages.map((msg) => ({
                                    id: msg.id,
                                    tempId: msg.tempId,
                                    roomId: syncResponse.roomId,
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
                                    readBy: msg.readBy || {}
                                }));
                                
                                const messageMap = new Map<string, ChatMessageItem>();
                                prevMessages.forEach((msg) => messageMap.set(msg.id, msg));
                                syncMessages.forEach((msg) => messageMap.set(msg.id, msg));
                                
                                const mergedMessages = Array.from(messageMap.values());
                                mergedMessages.sort((a, b) =>
                                    new Date(a.createdAt || "").getTime() - new Date(b.createdAt || "").getTime()
                                );
                                
                                return mergedMessages;
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
                },
                onDisconnect: () => {
                    setConnectionError("연결 끊김, 재접속 시도 중...");
                    setIsConnected(false);
                },
                onStompError: () => {
                    setConnectionError("연결 오류, 재접속 시도 중...");
                    setIsConnected(false);
                }
            });

            client.activate();
            setStompClient(client);

            // 창 종료 이벤트
            const handleBeforeUnload = () => {
                if (client && client.connected) {
                    client.publish({
                        destination: "/app/active",
                        body: JSON.stringify({ 
                            userId: user.id.toString(), 
                            roomId: Number(roomId), // string -> number로 변환
                            active: false 
                        })
                    });
                    client.deactivate();
                }
            };
            window.addEventListener("beforeunload", handleBeforeUnload);

            return () => {
                if (client && client.connected) {
                    client.publish({
                        destination: "/app/active",
                        body: JSON.stringify({ 
                            userId: user.id.toString(), 
                            roomId: Number(roomId), // string -> number로 변환
                            active: false 
                        })
                    });
                    client.deactivate();
                }
                if (heartbeatRef.current) clearInterval(heartbeatRef.current);
                window.removeEventListener("beforeunload", handleBeforeUnload);
            };
        }
        // 약간의 지연을 주어 DOM이 완전히 렌더링된 후 연결
        const timer = setTimeout(connectWebSocket, 300);
        return () => clearTimeout(timer);
        // eslint-disable-next-line
    }, [roomId, user]);

    // 이전 메시지를 로드할 때 사용자 화면에 보이는 첫 번째 메시지를 찾는 함수
    const findFirstVisibleMessage = () => {
    if (!chatAreaRef.current) return null;
    
    const chatArea = chatAreaRef.current;
    const scrollTop = chatArea.scrollTop;
    const messageElements = chatArea.querySelectorAll('[id^="msg-"]'); // 메시지에 id 속성이 있어야 함
    
    for (let i = 0; i < messageElements.length; i++) {
        const element = messageElements[i] as HTMLElement;
        const position = element.offsetTop;
        
        // 스크롤 위치에 가장 가까운 메시지를 찾음
        if (position >= scrollTop) {
        return element.id.replace('msg-', '');
        }
    }
    
     
    return messageElements.length > 0 
        ? (messageElements[0] as HTMLElement).id.replace('msg-', '')
        : null;
    };

    // 이전 메시지 조회 (웹소켓 사용)
    const fetchPreviousMessages = useCallback((oldestMessageId: string) => {
        if (!stompClient || !stompClient.connected || !roomId || !user) {
            console.error("이전 메시지 조회 불가: 연결 끊김 또는 유효하지 않은 상태");
            return;
        }
        
        const chatArea = chatAreaRef.current;
        if (!chatArea || isPreviousMessagesLoadingRef.current) return; // 중복 요청 방지
        
        // 플래그 설정
        isPreviousMessagesLoadingRef.current = true;
        
        // 현재 스크롤 위치를 정확히 저장
        requestAnimationFrame(() => {
            if (!chatArea) return;
            
            // 현재 스크롤 위치와 높이를 정확히 저장
            scrollHeightBeforeUpdateRef.current = chatArea.scrollHeight;
            lastScrollPosRef.current = chatArea.scrollTop;
            
            // 중요: 현재 화면에 보이는 첫 번째 메시지를 저장
            firstVisibleMessageRef.current = findFirstVisibleMessage();
            
            // 방향 설정 후 메시지 요청
            setMessageDirection("BEFORE");
            
            // 이전 메시지 요청
            stompClient.publish({
                destination: "/app/sync",
                body: JSON.stringify({
                    roomId: roomId,
                    userId: user.id,
                    lastMessageId: oldestMessageId,
                    timestamp: new Date().toISOString(),
                    direction: "BEFORE"
                })
            });
        });
    }, [roomId, user, stompClient]);

    // 스크롤 이벤트 핸들러 (페이징)
    useEffect(() => {
        const chatArea = chatAreaRef.current;
        if (!chatArea) return;
        
        const throttledHandleScroll = throttle(() => {
            // 이미 로딩 중이면 추가 요청 방지
            if (isPreviousMessagesLoadingRef.current) return;
            
            // 상단 근처에 도달했을 때 이전 메시지 요청
            if (chatArea.scrollTop < 50 && messages.length > 0) {
                const oldestMessage = messages[0];
                fetchPreviousMessages(oldestMessage.id);
            }
        }, 500);
        
        chatArea.addEventListener("scroll", throttledHandleScroll);
        return () => chatArea.removeEventListener("scroll", throttledHandleScroll);
    }, [messages, fetchPreviousMessages]);

    // Window focus 이벤트: 창이 포커스 될 때 읽음 처리 (이전 API 새로고침 호출 제거됨)
    useEffect(() => {
        const handleFocus = () => {
            if (user && roomId) {
                // 연결 상태 확인
                if (!isConnected || !stompClient?.connected) {
                    console.log("ChatRoom: Connection lost, attempting to reconnect...");
                    setConnectionError("연결이 끊어졌습니다. 재연결 시도 중...");
                    
                    // 기존 연결 종료
                    if (stompClient) {
                        stompClient.deactivate();
                    }
                    
                    // 페이지 재로드
                    setTimeout(() => {
                        if (window.location.pathname.includes(`/chatroom/${roomId}`)) {
                            window.location.reload();
                        }
                    }, 1000);
                } else {
                    // 정상 연결 상태에서는 읽음 처리
                    markAllRead();
                }
            }
        };
        window.addEventListener("focus", handleFocus);
        return () => window.removeEventListener("focus", handleFocus);
    }, [roomId, user, isConnected, stompClient, markAllRead]);

    // 타이핑 인디케이터 전송
    const sendTypingIndicator = (isTyping: boolean) => {
        if (!stompClient || !roomId || !user || !stompClient.connected) return;
        const typingPayload: TypingIndicatorMessage = { 
            roomId: Number(roomId),
            userId: user.id,
            username: user.username || "Unknown",
            isTyping 
        };
        stompClient.publish({
            destination: "/app/typing",
            body: JSON.stringify(typingPayload),
        });
    };

    // 입력값 변경 및 타이핑 디바운스 처리
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInput(value);

        if (!stompClient || !roomId || !user || !stompClient.connected) return;

        // 입력값이 비어있으면 즉시 타이핑 인디케이터 끄기
        if (value.trim() === "") {
            sendTypingIndicator(false);
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = null;
            }
            return;
        }
    
        // 입력 중일 때는 타이핑 인디케이터 켜기
        sendTypingIndicator(true);

        // 활성 여부를 알림 (타이핑 아님)
        stompClient.publish({
            destination: "/app/active",
            body: JSON.stringify({ userId: user.id, roomId, active: true }),
        });

        // 기존 타이머 제거 후, 1초 후에 타이핑 인디케이터 끄기
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            sendTypingIndicator(false);
            typingTimeoutRef.current = null;
        }, 1000);
    };

    // 메시지 전송
    const sendMessage = () => {
        if (!stompClient || !stompClient.connected || input.trim() === "" || !roomId || !user) {
            console.error("전송 불가: 연결 끊김 또는 유효하지 않은 입력");
            return;
        }

        // 방향을 '새 메시지'로 설정
        setMessageDirection("new");

        // tempId 생성      
        const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

        // 메시지 세팅
        const chatMessage: ChatMessageItem = {
            id: tempId, // 임시 ID 사용
            tempId: tempId, // tempId 속성 추가
            roomId: Number(roomId), // Convert string to number
            senderId: user.id,
            content: {
                text: input,
                type: "TEXT",
                attachments: [],
                isEdited: false,
                isDeleted: false,
            },
            createdAt: new Date().toISOString(),
            status: "sending", // 초기 상태는 sending
            readBy: { [user.id.toString()]: true } // Ensure user.id is converted to string as a key
        };

        // 상태 추적을 위해 messageStatuses에 추가
        setMessageStatuses((prev) => ({
            ...prev,
            [tempId]: { status: "sending", persistedId: null, createdAt: chatMessage.createdAt }
        }));

        // 메시지를 로컬 상태에 먼저 추가 (UI에 즉시 반영)
        setMessages((prev) => {
            const updatedMessages = [...prev, chatMessage];
            setTimeout(() => scrollToBottom(), 0);
            return updatedMessages;
        });

        // 실제 전송
        stompClient.publish({
            destination: "/app/chat",
            body: JSON.stringify(chatMessage),
        });

        setInput("");
        sendTypingIndicator(false);
    };

    // URL 미리보기 렌더링 함수
    const renderUrlPreview = (message: ChatMessageItem) => {
        // content.urlPreview가 있는지 확인
        const preview = message.content?.urlPreview;
        
        // URL 미리보기가 없으면 렌더링하지 않음
        if (!preview) {
            return null;
        }
        
        // 미리보기 정보가 충분하지 않으면 렌더링하지 않음
        if (!preview.title && !preview.description) {
            return null;
        }
        
        return (
            <UrlPreviewContainer onClick={() => preview.url && window.open(preview.url, '_blank')}>
                <PreviewImage $hasImage={!!preview.imageUrl}>
                    {preview.imageUrl && <img src={preview.imageUrl} alt={preview.title || "Preview"} />}
                </PreviewImage>
                <PreviewContent>
                    {preview.siteName && <PreviewSite>{preview.siteName}</PreviewSite>}
                    {preview.title && <PreviewTitle>{preview.title}</PreviewTitle>}
                    {preview.description && <PreviewDescription>{preview.description}</PreviewDescription>}
                </PreviewContent>
            </UrlPreviewContainer>
        );
    };

    // 우클릭: 컨텍스트 메뉴 표시 (메시지 전달 옵션)
    const handleContextMenu = (e: React.MouseEvent, message: ChatMessageItem) => {
        e.preventDefault();
        setContextMenu({ visible: true, x: e.clientX, y: e.clientY, message });
    };

    // 외부 클릭 시 컨텍스트 메뉴 닫기
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            // contextMenu가 열려있고, 메뉴 외부를 클릭한 경우에만 닫기
            if (contextMenu.visible) {
                const menuElement = document.getElementById('context-menu');
                if (menuElement && !menuElement.contains(e.target as Node)) {
                    setContextMenu({ ...contextMenu, visible: false, message: null });
                }
            }
        };
        
        // 다음 tick에서 이벤트 리스너 등록 (즉시 실행 방지)
        setTimeout(() => {
            window.addEventListener("click", handleClick);
        }, 0);
        
        return () => window.removeEventListener("click", handleClick);
    }, [contextMenu]);

    // 컨텍스트 메뉴에서 "메시지 전달" 선택
    const handleForwardClick = () => {
        setContextMenu({ ...contextMenu, visible: false });
        setShowForwardModal(true);
    };

    // 말풍선 클릭 핸들러 함수 추가
    const handleChatBubbleClick = (e: React.MouseEvent, message: ChatMessageItem) => {
        e.stopPropagation(); // 이벤트 전파 방지
        
        // 클릭한 위치에 메뉴 표시
        const x = e.clientX;
        const y = e.clientY;
        
        // 이미 메뉴가 표시되어 있으면 닫기
        if (contextMenu.visible && contextMenu.message?.id === message.id) {
            setContextMenu({ visible: false, x: 0, y: 0, message: null });
        } else {
            // 메뉴 표시
            setContextMenu({ visible: true, x, y, message });
        }
    };

    useEffect(() => {
        const handleOnline = () => {
            console.log("네트워크 연결됨, 재연결 시도...");
            if (!stompClient?.connected) {
                setConnectionError("재연결 시도 중...");
                
                // 페이지 새로고침으로 완전 재연결
                window.location.reload();
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
    }, [stompClient]);

    // 모달 제출: 대상 채팅방 ID 입력 후 메시지 전달 API 호출
    const handleModalSubmit = async () => {
        if (contextMenu.message) {
            try {
                // Convert targetRoomId to number if the API expects a number
                await forwardMessage(
                    contextMenu.message.id, 
                    Number(targetRoomId), // Convert string to number
                    user!.id
                );
                alert("메시지가 전달되었습니다.");
            } catch (error) {
                console.error("Forward error", error);
                alert("메시지 전달 실패");
            }
        }
        setShowForwardModal(false);
        setTargetRoomId("");
    };

    // 모달 취소
    const handleModalCancel = () => {
        setShowForwardModal(false);
        setTargetRoomId("");
    };

    // 오전/오후 및 12시간제 시:분 포맷팅 함수
    const formatTime = (dateString: string): string => {
        if (!dateString) return "";
        try {
            const date = new Date(dateString);
            const hours = date.getHours();
            const minutes = date.getMinutes();
            const period = hours < 12 ? "오전" : "오후";
            const hour12 = hours % 12 === 0 ? 12 : hours % 12;
            const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
            return `${period} ${hour12}:${formattedMinutes}`;
        } catch (e) {
            console.error("시간 형식 변환 오류:", e);
            return "";
        }
    };

    return (
        <ChatWrapper>
            <ChatContainer>
                <Header>
                    <BackButton onClick={handleBack}>
                        <BackIcon />
                    </BackButton>
                    <HeaderTitle>채팅방</HeaderTitle>
                </Header>
                {pinnedMessages.length > 0 && (
                    <PinnedMessagesContainer $isExpanded={isPinnedMessagesExpanded}>
                        <PinnedMessagesHeader 
                        $isExpanded={isPinnedMessagesExpanded} 
                        onClick={() => setIsPinnedMessagesExpanded(!isPinnedMessagesExpanded)}
                        >
                            <PinnedMessagesTitle>
                                <PinIcon /> 
                                <span>공지사항 ({pinnedMessages.length})</span>
                            </PinnedMessagesTitle>
                            
                            {!isPinnedMessagesExpanded && pinnedMessages.length > 0 && (
                                <PinnedMessagesSummary>
                                    <span>
                                        {pinnedMessages[0].senderId === user?.id ? '나' : '상대방'}: {pinnedMessages[0].content?.text}
                                    </span>
                                </PinnedMessagesSummary>
                            )}
                            
                            <ExpandButton $isExpanded={isPinnedMessagesExpanded}>
                                <ChevronDownIcon />
                            </ExpandButton>
                        </PinnedMessagesHeader>
                        
                        {isPinnedMessagesExpanded && (
                            <PinnedMessagesContent>
                                {pinnedMessages.map((pinnedMsg) => (
                                    <PinnedMessageItem key={`pinned-${pinnedMsg.id}`}>
                                        <PinnedMessageContent>
                                            <PinnedMessageSender>
                                                {pinnedMsg.senderId === user?.id ? '나' : '상대방'}:
                                            </PinnedMessageSender>
                                            {pinnedMsg.content?.text}
                                        </PinnedMessageContent>
                                        <UnpinButton onClick={(e) => {
                                            e.stopPropagation(); // 이벤트 버블링 방지
                                            handleUnpinMessage(pinnedMsg.id);
                                        }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                                <line x1="6" y1="6" x2="18" y2="18"></line>
                                            </svg>
                                        </UnpinButton>
                                    </PinnedMessageItem>
                                ))}
                            </PinnedMessagesContent>
                        )}
                    </PinnedMessagesContainer>
                )}
                {connectionError && 
                    <ErrorMessage>
                        <ErrorIcon />{connectionError}
                    </ErrorMessage>
                }
                <ChatArea ref={chatAreaRef}>
                    {messages.map((msg, idx) => {
                        // 내 메시지인가?
                        const isOwn = msg.senderId === user?.id;

                        // 우선, 웹소켓 업데이트 상태가 있다면 사용, 없으면 API의 상태 사용
                        const currentStatus = msg.tempId
                            ? messageStatuses[msg.tempId]?.status || msg.status
                            : msg.status;

                        // 저장된 상태로 간주
                        const isPersisted = currentStatus && currentStatus.toUpperCase() === "SAVED";

                        // 내 메시지의 경우, 참여자가 읽은 항목이 있는지 확인
                        const otherHasRead = msg.readBy 
                            ? Object.entries(msg.readBy as Record<string, boolean>)
                                .filter(([id]) => id !== user?.id.toString()) // Ensure user.id is a string
                                .some(([, read]) => read === true)
                            : false;

                        // indicatorText: 읽지 않았으면 "1" 
                        const indicatorText = isOwn && isPersisted && !otherHasRead ? "1" : "";

                        // 상태표시
                        const statusIndicator = isOwn && currentStatus && !isPersisted ? (
                            <div className="status-indicator">
                                {currentStatus === "sending" && "전송 중..."}
                                {currentStatus === "SENT_TO_KAFKA" && "서버로 전송됨"}
                                {currentStatus === "FAILED" && "전송 실패"}
                            </div>
                        ) : null;
                        
                        // 시간 표시 여부 로직 수정
                        const nextMessage = messages[idx + 1];
                        const msgCreatedAt = getMessageCreatedAt(msg);

                        // 현재 메시지 시간 포맷팅
                        const currentTime = formatTime(msgCreatedAt);

                        // 다음 메시지 시간 포맷팅 (있는 경우만)
                        const nextTime = nextMessage ? formatTime(getMessageCreatedAt(nextMessage)) : null;

                        // 현재 메시지와 다음 메시지의 시간을 비교
                        const showTime = !nextMessage || currentTime !== nextTime;
                        
                        return (
                            <React.Fragment key={idx}>
                                <MessageRow id={`msg-${msg.id}`} $isOwnMessage={isOwn}>
                                    {isOwn ? (
                                        <>
                                            <TimeContainer $isOwnMessage={true}>
                                                {statusIndicator}
                                                {indicatorText && <div>{indicatorText}</div>}
                                                {showTime && <div>{currentTime}</div>}
                                            </TimeContainer>
                                            <ChatBubble 
                                                $isOwnMessage={isOwn} 
                                                onContextMenu={(e) => handleContextMenu(e, msg)}
                                                onClick={(e) => handleChatBubbleClick(e, msg)}
                                            >
                                                <div>{msg.content?.text || '메시지를 불러올 수 없습니다'}</div>
                                            </ChatBubble>
                                        </>
                                    ) : (
                                        <>
                                            <ChatBubble 
                                                $isOwnMessage={isOwn} 
                                                onContextMenu={(e) => handleContextMenu(e, msg)}
                                                onClick={(e) => handleChatBubbleClick(e, msg)}
                                            >
                                                <div>{msg.content?.text || '메시지를 불러올 수 없습니다'}</div>
                                            </ChatBubble>
                                            <TimeContainer $isOwnMessage={false}>
                                                {showTime && <div>{currentTime}</div>}
                                            </TimeContainer>
                                        </>
                                    )}
                                </MessageRow>
                                {msg.content?.urlPreview && (
                                    <div style={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start', width: '100%' }}>
                                        {renderUrlPreview(msg)}
                                    </div>
                                )}
                            </React.Fragment>
                        );
                    })}
                    {typingUsers.length > 0 && (
                        <TypingIndicatorContainer>
                            {typingUsers.join(", ")}님이 타이핑 중...
                            <TypingDots>
                                <span></span>
                                <span></span>
                                <span></span>
                            </TypingDots>
                        </TypingIndicatorContainer>
                    )}
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
                </ChatInputContainer>
                {contextMenu.visible && (
                    <ContextMenu id="context-menu" style={{ top: contextMenu.y, left: contextMenu.x }}>
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
                    </ContextMenu>
                )}
                {showForwardModal && (
                    <ModalOverlay>
                        <ModalContent>
                            <h3>메시지 전달</h3>
                            <p>전달할 대상 채팅방 ID를 입력하세요:</p>
                            <input value={targetRoomId} onChange={(e) => setTargetRoomId(e.target.value)} placeholder="대상 채팅방 ID" />
                            <ModalButtons>
                                <button onClick={handleModalSubmit}>전달</button>
                                <button onClick={handleModalCancel}>취소</button>
                            </ModalButtons>
                        </ModalContent>
                    </ModalOverlay>
                )}
            </ChatContainer>
        </ChatWrapper>
    );
};

export default ChatRoom;