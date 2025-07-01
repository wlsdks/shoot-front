import { useReducer, useCallback } from 'react';
import { ChatMessageItem } from '../../../message/types/ChatRoom.types';

// 리액션 타입 정의
export interface ReactionType {
    code: string;
    emoji: string;
    description: string;
}

// ChatRoom UI 상태 타입 정의
export interface ChatRoomUIState {
    // 입력 관련
    input: string;
    isTyping: boolean;
    
    // 연결 관련
    connectionError: string | null;
    isConnected: boolean;
    
    // 모달 관련
    showForwardModal: boolean;
    selectedMessageId: string | null;
    showReactionPicker: boolean;
    
    // 고정 메시지 관련
    pinnedMessages: ChatMessageItem[];
    isPinnedMessagesExpanded: boolean;
    
    // 기타
    hasMoreMessages: boolean;
    reactionTypes: ReactionType[];
}

// 액션 타입 정의
export type ChatRoomUIAction =
    | { type: 'SET_INPUT'; payload: string }
    | { type: 'SET_IS_TYPING'; payload: boolean }
    | { type: 'SET_CONNECTION_ERROR'; payload: string | null }
    | { type: 'SET_IS_CONNECTED'; payload: boolean }
    | { type: 'SET_SHOW_FORWARD_MODAL'; payload: boolean }
    | { type: 'SET_SELECTED_MESSAGE_ID'; payload: string | null }
    | { type: 'SET_SHOW_REACTION_PICKER'; payload: boolean }
    | { type: 'SET_PINNED_MESSAGES'; payload: ChatMessageItem[] }
    | { type: 'ADD_PINNED_MESSAGE'; payload: ChatMessageItem }
    | { type: 'REMOVE_PINNED_MESSAGE'; payload: string }
    | { type: 'SET_PINNED_MESSAGES_EXPANDED'; payload: boolean }
    | { type: 'SET_HAS_MORE_MESSAGES'; payload: boolean }
    | { type: 'TOGGLE_PINNED_MESSAGES_EXPANDED' }
    | { type: 'CLOSE_ALL_MODALS' }
    | { type: 'RESET_INPUT' };

// 초기 상태
const initialState: ChatRoomUIState = {
    input: "",
    isTyping: false,
    connectionError: null,
    isConnected: true,
    showForwardModal: false,
    selectedMessageId: null,
    showReactionPicker: false,
    pinnedMessages: [],
    isPinnedMessagesExpanded: false,
    hasMoreMessages: true,
    reactionTypes: [
        { code: 'like', emoji: '👍', description: '좋아요' },
        { code: 'sad', emoji: '😢', description: '슬퍼요' },
        { code: 'dislike', emoji: '👎', description: '싫어요' },
        { code: 'angry', emoji: '😡', description: '화나요' },
        { code: 'curious', emoji: '🤔', description: '궁금해요' },
        { code: 'surprised', emoji: '😮', description: '놀라워요' }
    ]
};

// Reducer 함수
function chatRoomUIReducer(state: ChatRoomUIState, action: ChatRoomUIAction): ChatRoomUIState {
    switch (action.type) {
        case 'SET_INPUT':
            return { ...state, input: action.payload };
            
        case 'SET_IS_TYPING':
            return { ...state, isTyping: action.payload };
            
        case 'SET_CONNECTION_ERROR':
            return { ...state, connectionError: action.payload };
            
        case 'SET_IS_CONNECTED':
            return { ...state, isConnected: action.payload };
            
        case 'SET_SHOW_FORWARD_MODAL':
            return { ...state, showForwardModal: action.payload };
            
        case 'SET_SELECTED_MESSAGE_ID':
            return { ...state, selectedMessageId: action.payload };
            
        case 'SET_SHOW_REACTION_PICKER':
            return { ...state, showReactionPicker: action.payload };
            
        case 'SET_PINNED_MESSAGES':
            return { ...state, pinnedMessages: action.payload };
            
        case 'ADD_PINNED_MESSAGE':
            // 중복 방지
            if (state.pinnedMessages.some(msg => msg.id === action.payload.id)) {
                return state;
            }
            return { 
                ...state, 
                pinnedMessages: [...state.pinnedMessages, action.payload] 
            };
            
        case 'REMOVE_PINNED_MESSAGE':
            return {
                ...state,
                pinnedMessages: state.pinnedMessages.filter(msg => msg.id !== action.payload)
            };
            
        case 'SET_PINNED_MESSAGES_EXPANDED':
            return { ...state, isPinnedMessagesExpanded: action.payload };
            
        case 'TOGGLE_PINNED_MESSAGES_EXPANDED':
            return { ...state, isPinnedMessagesExpanded: !state.isPinnedMessagesExpanded };
            
        case 'SET_HAS_MORE_MESSAGES':
            return { ...state, hasMoreMessages: action.payload };
            
        case 'CLOSE_ALL_MODALS':
            return {
                ...state,
                showForwardModal: false,
                selectedMessageId: null,
                showReactionPicker: false
            };
            
        case 'RESET_INPUT':
            return {
                ...state,
                input: "",
                isTyping: false
            };
            
        default:
            return state;
    }
}

// Custom Hook
export const useChatRoomState = () => {
    const [state, dispatch] = useReducer(chatRoomUIReducer, initialState);
    
    // 액션 생성자들 (메모이제이션)
    const actions = {
        setInput: useCallback((input: string) => {
            dispatch({ type: 'SET_INPUT', payload: input });
        }, []),
        
        setIsTyping: useCallback((isTyping: boolean) => {
            dispatch({ type: 'SET_IS_TYPING', payload: isTyping });
        }, []),
        
        setConnectionError: useCallback((error: string | null) => {
            dispatch({ type: 'SET_CONNECTION_ERROR', payload: error });
        }, []),
        
        setIsConnected: useCallback((connected: boolean) => {
            dispatch({ type: 'SET_IS_CONNECTED', payload: connected });
        }, []),
        
        setShowForwardModal: useCallback((show: boolean) => {
            dispatch({ type: 'SET_SHOW_FORWARD_MODAL', payload: show });
        }, []),
        
        setSelectedMessageId: useCallback((id: string | null) => {
            dispatch({ type: 'SET_SELECTED_MESSAGE_ID', payload: id });
        }, []),
        
        setShowReactionPicker: useCallback((show: boolean) => {
            dispatch({ type: 'SET_SHOW_REACTION_PICKER', payload: show });
        }, []),
        
        setPinnedMessages: useCallback((messages: ChatMessageItem[]) => {
            dispatch({ type: 'SET_PINNED_MESSAGES', payload: messages });
        }, []),
        
        addPinnedMessage: useCallback((message: ChatMessageItem) => {
            dispatch({ type: 'ADD_PINNED_MESSAGE', payload: message });
        }, []),
        
        removePinnedMessage: useCallback((messageId: string) => {
            dispatch({ type: 'REMOVE_PINNED_MESSAGE', payload: messageId });
        }, []),
        
        setPinnedMessagesExpanded: useCallback((expanded: boolean) => {
            dispatch({ type: 'SET_PINNED_MESSAGES_EXPANDED', payload: expanded });
        }, []),
        
        togglePinnedMessagesExpanded: useCallback(() => {
            dispatch({ type: 'TOGGLE_PINNED_MESSAGES_EXPANDED' });
        }, []),
        
        setHasMoreMessages: useCallback((hasMore: boolean) => {
            dispatch({ type: 'SET_HAS_MORE_MESSAGES', payload: hasMore });
        }, []),
        
        closeAllModals: useCallback(() => {
            dispatch({ type: 'CLOSE_ALL_MODALS' });
        }, []),
        
        resetInput: useCallback(() => {
            dispatch({ type: 'RESET_INPUT' });
        }, [])
    };
    
    return {
        state,
        actions
    };
}; 