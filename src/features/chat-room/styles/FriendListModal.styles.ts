import styled from 'styled-components';
import { fadeIn, slideUp } from '../../../shared/ui/commonStyles';

export const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    animation: ${fadeIn} 0.3s ease;
    backdrop-filter: blur(4px);
`;

export const ModalContent = styled.div`
    background: white;
    width: 90%;
    max-width: 340px;
    max-height: 70vh;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    animation: ${slideUp} 0.3s ease-out;
`;

export const ModalHeader = styled.div`
    padding: 1.2rem 1.5rem;
    background: linear-gradient(to right, #f2f8ff, #f8fafc);
    border-bottom: 1px solid #eaeaea;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
`;

export const ModalTitle = styled.h3`
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
    text-align: center;
`;

export const CloseButton = styled.button`
    position: absolute;
    left: 1.2rem;
    background: none;
    border: none;
    width: 30px;
    height: 30px;
    border-radius: 8px;
    color: #64748b;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    
    &:hover {
        background: rgba(255, 255, 255, 0.8);
        color: #4a6cf7;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }
    
    svg {
        width: 18px;
        height: 18px;
    }
`;

export const SearchContainer = styled.div`
    padding: 1rem 1.5rem;
    position: relative;
    border-bottom: 1px solid #eaeaea;
`;

export const SearchInput = styled.input`
    width: 100%;
    padding: 0.75rem 2.7rem 0.75rem 1rem;
    border: 1px solid #e1e8ed;
    border-radius: 12px;
    font-size: 0.9rem;
    background-color: #f8fafc;
    transition: all 0.3s;
    
    &:focus {
        outline: none;
        border-color: #4a6cf7;
        background-color: #fff;
        box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.1);
    }

    &::placeholder {
        color: #a0aec0;
    }
`;

export const SearchIcon = styled.div`
    position: absolute;
    right: 2.3rem;
    top: 50%;
    transform: translateY(-50%);
    color: #a0aec0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
`;

export const FriendListContainer = styled.div`
    max-height: 50vh;
    overflow-y: auto;
    padding: 0.8rem 0;
    
    &::-webkit-scrollbar {
        width: 5px;
    }
    
    &::-webkit-scrollbar-track {
        background: #f1f1f1;
    }
    
    &::-webkit-scrollbar-thumb {
        background: #ddd;
        border-radius: 5px;
    }
    
    &::-webkit-scrollbar-thumb:hover {
        background: #ccc;
    }
`;

export const FriendItem = styled.div`
    display: flex;
    align-items: center;
    padding: 0.85rem 1.5rem;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
        background-color: #f0f7ff;
    }
    
    &:active {
        background-color: #e1eeff;
    }
`;

export const ProfileContainer = styled.div`
    position: relative;
    margin-right: 1rem;
`;

export const ProfileImage = styled.img`
    width: 45px;
    height: 45px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #e1ecff;
    background-color: #f0f5ff;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
    transition: all 0.2s;
    
    ${FriendItem}:hover & {
        border-color: #4a6cf7;
        transform: scale(1.05);
    }
`;

export const ProfileInitial = styled.div`
    width: 45px;
    height: 45px;
    border-radius: 50%;
    background: linear-gradient(135deg, #4a6cf7, #2a4cdf);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 1.2rem;
    border: 2px solid #e1ecff;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
    transition: all 0.2s;
    
    ${FriendItem}:hover & {
        border-color: #4a6cf7;
        transform: scale(1.05);
    }
`;

export const StatusIndicator = styled.div<{ isOnline: boolean }>`
    position: absolute;
    bottom: 0;
    right: 0;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: ${props => props.isOnline ? '#10b981' : '#94a3b8'};
    border: 2px solid white;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

export const FriendInfo = styled.div`
    flex: 1;
    min-width: 0;
`;

export const FriendName = styled.div`
    font-size: 0.95rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 0.3rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

export const FriendUsername = styled.div`
    font-size: 0.8rem;
    color: #64748b;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

export const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    color: #64748b;
    gap: 1rem;
`;

export const Spinner = styled.div`
    width: 30px;
    height: 30px;
    border: 3px solid #e2e8f0;
    border-radius: 50%;
    border-top-color: #4a6cf7;
    animation: spin 0.8s linear infinite;
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;

export const EmptyState = styled.div`
    padding: 2.5rem 1rem;
    text-align: center;
    color: #64748b;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    
    svg {
        color: #cbd5e1;
        width: 48px;
        height: 48px;
        margin-bottom: 1rem;
    }
`;

export const EmptyTitle = styled.h4`
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
    font-weight: 600;
    color: #475569;
`;

export const EmptyMessage = styled.p`
    margin: 0;
    font-size: 0.85rem;
    color: #64748b;
    line-height: 1.5;
`; 