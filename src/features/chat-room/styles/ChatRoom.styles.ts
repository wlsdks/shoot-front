import styled, { keyframes } from "styled-components";
import { fadeIn } from '../../../shared/ui/commonStyles';

export const bounce = keyframes`
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-3px); }
`;

// 채팅 컨테이너
export const ChatWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #ffffff;
    overflow: hidden;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
`;

export const ChatContainer = styled.div`
    width: 375px;
    height: 667px;
    background-color: #fff;
    border-radius: 30px;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 2px solid #ddd;
    position: relative;
`;

// 헤더 스타일
export const Header = styled.div`
    padding: 14px 16px;
    background: #fff;
    border-bottom: 1px solid #eee;
    display: flex;
    align-items: center;
    z-index: 10;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
`;

export const BackButton = styled.button`
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

export const HeaderTitle = styled.h2`
    font-size: 1.1rem;
    margin: 0;
    color: #333;
    font-weight: 600;
    flex: 1;
`;

// 채팅 영역 스타일
export const ChatArea = styled.div`
    flex: 1;
    padding: 10px;
    padding-bottom: 0px;
    background: #f8f9fa;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #ddd transparent;
    display: flex;
    flex-direction: column;
    position: relative;
    height: 100%;
    
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

export const MessagesContainer = styled.div`
    display: flex;
    flex-direction: column;
    min-height: min-content;
    width: 100%;
    padding-bottom: 2px;
    position: relative;
    transition: padding-bottom 0.3s ease-in-out;

    &.typing {
        padding-bottom: 5px;
    }
`;

export const MessageRow = styled.div<{ $isOwnMessage: boolean }>`
    display: flex;
    align-items: flex-end;
    justify-content: ${({ $isOwnMessage }) => ($isOwnMessage ? "flex-end" : "flex-start")};
    margin-bottom: 10px;
    animation: ${fadeIn} 0.3s ease-out;
`;

export const ChatBubble = styled.div<{ $isOwnMessage: boolean }>`
    max-width: 100%;
    padding: 10px 14px;
    border-radius: 18px;
    background: ${({ $isOwnMessage }) =>
        $isOwnMessage 
        ? "linear-gradient(135deg, #007bff, #0056b3)" 
        : "#ffffff"};
    color: ${({ $isOwnMessage }) => ($isOwnMessage ? "#fff" : "#333")};
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    font-size: 0.80rem;
    border: ${({ $isOwnMessage }) => $isOwnMessage ? "none" : "1px solid #eee"};
    cursor: pointer;
    transition: all 0.2s;
    word-break: break-word;
    position: relative;
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
    }
`;

export const TimeContainer = styled.div<{ $isOwnMessage: boolean }>`
    font-size: 0.7rem;
    color: #999;
    margin: 0 6px;
    display: flex;
    flex-direction: column;
    align-items: ${({ $isOwnMessage }) => ($isOwnMessage ? "flex-end" : "flex-start")};
`;

export const ReadIndicator = styled.div`
    font-size: 0.65rem;
    color: #333;
    margin-bottom: 1px;
`;

export const TypingIndicatorContainer = styled.div`
    padding: 8px 12px;
    font-size: 0.85rem;
    color: #666;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 18px;
    margin: 0;
    display: flex;
    align-items: center;
    max-width: 75%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    align-self: flex-start;
    position: absolute;
    bottom: 70px;
    left: 16px;
    z-index: 10;
    pointer-events: none;
    opacity: 0;
    visibility: hidden;
    transform: translateY(20px);
    will-change: transform, opacity, visibility;
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), 
                opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), 
                visibility 0.4s cubic-bezier(0.4, 0, 0.2, 1);

    &.visible {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
    }
`;

export const TypingDots = styled.div`
    display: flex;
    margin-left: 8px;
    
    span {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #999;
        margin: 0 1px;
        animation: ${bounce} 1.4s infinite ease-in-out both;
        
        &:nth-child(1) { animation-delay: -0.32s; }
        &:nth-child(2) { animation-delay: -0.16s; }
        &:nth-child(3) { animation-delay: 0s; }
    }
`;

// 입력 영역 스타일
export const ChatInputContainer = styled.div`
    padding: 12px 16px;
    background: #fff;
    border-top: 1px solid #eee;
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
`;

export const Input = styled.input`
    flex: 1;
    border: 1px solid #ddd;
    border-radius: 20px;
    padding: 10px 16px;
    font-size: 0.9rem;
    outline: none;
    transition: border-color 0.2s;
    
    &:focus {
        border-color: #007bff;
    }
    
    &::placeholder {
        color: #999;
    }
`;

export const SendButton = styled.button`
    background: linear-gradient(135deg, #007bff, #0056b3);
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    
    &:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
    }
    
    &:active {
        transform: scale(0.95);
    }
    
    &:disabled {
        background: #ccc;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }
`;

// 컨텍스트 메뉴 스타일
export const ContextMenu = styled.div<{ $x: number; $y: number }>`
    position: fixed;
    left: ${({ $x }) => $x}px;
    top: ${({ $y }) => $y}px;
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    min-width: 160px;
    animation: ${fadeIn} 0.2s ease-out;
`;

export const ContextMenuItem = styled.button<{ $isDangerous?: boolean }>`
    width: 100%;
    padding: 12px 16px;
    background: none;
    border: none;
    text-align: left;
    cursor: pointer;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 10px;
    color: ${({ $isDangerous }) => $isDangerous ? '#dc3545' : '#333'};
    transition: background-color 0.2s;
    
    &:first-child {
        border-radius: 8px 8px 0 0;
    }
    
    &:last-child {
        border-radius: 0 0 8px 8px;
    }
    
    &:only-child {
        border-radius: 8px;
    }
    
    &:hover {
        background: ${({ $isDangerous }) => $isDangerous ? '#f8d7da' : '#f8f9fa'};
    }
`;

// 고정 메시지 스타일
export const PinnedMessagesContainer = styled.div<{ $isExpanded: boolean }>`
    background: linear-gradient(135deg, #fff3cd, #ffeaa7);
    border: 1px solid #ffeaa7;
    border-radius: 12px;
    margin: 10px;
    margin-bottom: 0;
    overflow: hidden;
    max-height: ${({ $isExpanded }) => $isExpanded ? '300px' : '60px'};
    transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 8px rgba(255, 193, 7, 0.2);
`;

export const PinnedMessagesHeader = styled.div`
    padding: 12px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    user-select: none;
    transition: background-color 0.2s;
    
    &:hover {
        background: rgba(255, 255, 255, 0.5);
    }
`;

export const PinnedMessagesTitle = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    font-size: 0.9rem;
    color: #856404;
    
    svg {
        width: 16px;
        height: 16px;
        fill: #856404;
    }
`;

export const PinnedMessagesSummary = styled.div`
    font-size: 0.8rem;
    color: #856404;
    opacity: 0.8;
    margin-top: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 200px;
`;

export const PinnedMessagesContent = styled.div`
    max-height: 240px;
    overflow-y: auto;
    border-top: 1px solid rgba(255, 255, 255, 0.3);
    
    &::-webkit-scrollbar {
        width: 4px;
    }
    
    &::-webkit-scrollbar-thumb {
        background: rgba(133, 100, 4, 0.3);
        border-radius: 2px;
    }
`;

export const PinnedMessageItem = styled.div`
    padding: 12px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.2);
    
    &:last-child {
        border-bottom: none;
    }
    
    &:hover {
        background: rgba(255, 255, 255, 0.4);
    }
`;

export const PinnedMessageSender = styled.div`
    font-size: 0.75rem;
    color: #856404;
    font-weight: 600;
    margin-bottom: 4px;
`;

export const PinnedMessageText = styled.div`
    font-size: 0.85rem;
    color: #333;
    line-height: 1.4;
    word-break: break-word;
`;

export const PinnedMessageDate = styled.div`
    font-size: 0.7rem;
    color: #856404;
    opacity: 0.7;
    margin-top: 4px;
`;

// URL 미리보기 스타일
export const UrlPreviewContainer = styled.div`
    margin-top: 8px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
    background: #f9f9f9;
    cursor: pointer;
    transition: all 0.2s;
    max-width: 280px;
    
    &:hover {
        border-color: #007bff;
        box-shadow: 0 2px 8px rgba(0, 123, 255, 0.15);
        transform: translateY(-1px);
    }
`;

export const UrlPreviewImage = styled.img`
    width: 100%;
    height: 120px;
    object-fit: cover;
    background: #f0f0f0;
`;

export const UrlPreviewContent = styled.div`
    padding: 12px;
`;

export const UrlPreviewTitle = styled.div`
    font-size: 0.85rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 4px;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
`;

export const UrlPreviewDescription = styled.div`
    font-size: 0.75rem;
    color: #666;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
`;

export const UrlPreviewUrl = styled.div`
    font-size: 0.7rem;
    color: #007bff;
    margin-top: 6px;
    font-weight: 500;
`;

// 에러 메시지 스타일
export const ErrorMessage = styled.div`
    padding: 12px 16px;
    background: #fff2f0;
    border: 1px solid #ffccc7;
    border-radius: 8px;
    margin: 10px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #cf1322;
    font-size: 0.9rem;
    animation: ${fadeIn} 0.3s ease-out;
`;

// 모달 스타일
export const Modal = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: ${fadeIn} 0.3s ease-out;
`;

export const ModalContent = styled.div`
    background: white;
    border-radius: 12px;
    padding: 24px;
    max-width: 400px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
`;

export const ModalHeader = styled.div`
    margin-bottom: 20px;
    
    h3 {
        margin: 0;
        font-size: 1.2rem;
        color: #333;
    }
`;

export const ModalBody = styled.div`
    margin-bottom: 20px;
`;

export const ModalFooter = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    
    button {
        padding: 8px 16px;
        border: 1px solid #ddd;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.2s;
        
        &.primary {
            background: #007bff;
            color: white;
            border-color: #007bff;
            
            &:hover {
                background: #0056b3;
                border-color: #0056b3;
            }
        }
        
        &.secondary {
            background: white;
            color: #666;
            
            &:hover {
                background: #f8f9fa;
            }
        }
    }
`; 