import styled from 'styled-components';

// 필요한 스타일만 유지

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

// ProfileContainer, ProfileImage, ProfileInitial, StatusIndicator는 shared ProfileAvatar로 대체됨

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

// LoadingContainer, Spinner, EmptyState, EmptyTitle, EmptyMessage는 shared LoadingDisplay, EmptyStateDisplay로 대체됨 