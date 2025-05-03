import styled, { keyframes } from "styled-components";

// 애니메이션 정의
export const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
`;

export const bounce = keyframes`
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-3px); }
`;

// 채팅 컨테이너
export const ChatWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 60px);
    padding-top: 60px;
    background-color: #f5f7fa;
    overflow: hidden;
`;

export const ChatContainer = styled.div`
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
    overflow-y: scroll;
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
    className: "chat-bubble";
    
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

// URL 미리보기 스타일
export const UrlPreviewContainer = styled.div`
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

export const PreviewImage = styled.div<{ $hasImage: boolean }>`
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

export const PreviewContent = styled.div`
    padding: 10px 12px;
`;

export const PreviewSite = styled.div`
    font-size: 0.7rem;
    color: #777;
    margin-bottom: 4px;
`;

export const PreviewTitle = styled.div`
    font-size: 0.9rem;
    font-weight: 600;
    color: #007bff;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-decoration: underline;
`;

export const PreviewDescription = styled.div`
    font-size: 0.8rem;
    color: #666;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
`;

// 입력 영역
export const ChatInputContainer = styled.div`
    display: flex;
    padding: 12px 16px;
    background: #fff;
    border-top: 1px solid #eee;
    z-index: 10;
    position: relative;
`;

export const Input = styled.input`
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

export const SendButton = styled.button`
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

export const ErrorMessage = styled.div`
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

export const ContextMenu = styled.div`
    position: fixed;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    overflow: hidden;
    border: 1px solid #eee;
    min-width: 150px;
`;

export const ContextMenuItem = styled.div`
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

export const ModalOverlay = styled.div`
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

export const ModalContent = styled.div`
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

export const ModalButtons = styled.div`
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

// 고정된 메시지 섹션 스타일
export const PinnedMessagesContainer = styled.div<{ $isExpanded: boolean }>`
    background-color: #f8f9fa;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    padding: 0;
    max-height: ${props => props.$isExpanded ? '200px' : '56px'};
    overflow: ${props => props.$isExpanded ? 'auto' : 'hidden'};
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

export const PinnedMessagesHeader = styled.div<{ $isExpanded: boolean }>`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    background-color: #f0f5ff;
    border-bottom: ${props => props.$isExpanded ? '1px solid rgba(0, 123, 255, 0.1)' : 'none'};
    cursor: pointer;
`;

export const ExpandButton = styled.button<{ $isExpanded: boolean }>`
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

export const PinnedMessagesSummary = styled.div`
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

export const PinnedMessagesTitle = styled.div`
    font-size: 0.85rem;
    font-weight: 600;
    color: #007bff;
    display: flex;
    align-items: center;
    gap: 6px;
`;

export const PinnedMessagesContent = styled.div`
    padding: 8px 0;
    max-height: 200px;
    overflow-y: auto;
`;

export const PinnedMessageItem = styled.div`
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

export const PinnedMessageContent = styled.div`
    flex: 1;
    font-size: 0.9rem;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

export const PinnedMessageSender = styled.span`
    font-weight: 600;
    margin-right: 6px;
    color: #007bff;
`;

export const UnpinButton = styled.button`
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