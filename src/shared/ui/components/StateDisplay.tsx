import React from 'react';
import styled, { keyframes } from 'styled-components';
import { fadeIn } from '../commonStyles';

// Loading Components
const spinAnimation = keyframes`
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
`;

export const LoadingContainer = styled.div<{ $fullHeight?: boolean }>`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    ${props => props.$fullHeight && 'min-height: 200px;'}
    animation: ${fadeIn} 0.3s ease-out;
`;

export const Spinner = styled.div<{ $size?: 'small' | 'medium' | 'large' }>`
    border: 3px solid #f3f4f6;
    border-top: 3px solid #3b82f6;
    border-radius: 50%;
    animation: ${spinAnimation} 1s linear infinite;
    
    ${props => {
        switch (props.$size) {
            case 'small':
                return 'width: 20px; height: 20px; border-width: 2px;';
            case 'large':
                return 'width: 48px; height: 48px; border-width: 4px;';
            default:
                return 'width: 32px; height: 32px; border-width: 3px;';
        }
    }}
`;

const LoadingText = styled.p`
    margin-top: 1rem;
    color: #6b7280;
    font-size: 0.875rem;
    text-align: center;
`;

interface LoadingDisplayProps {
    message?: string;
    size?: 'small' | 'medium' | 'large';
    fullHeight?: boolean;
}

export const LoadingDisplay: React.FC<LoadingDisplayProps> = ({
    message = "로딩 중...",
    size = 'medium',
    fullHeight = false
}) => {
    return (
        <LoadingContainer $fullHeight={fullHeight}>
            <Spinner $size={size} />
            <LoadingText>{message}</LoadingText>
        </LoadingContainer>
    );
};

// Error Components
export const ErrorContainer = styled.div<{ $fullHeight?: boolean }>`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    text-align: center;
    ${props => props.$fullHeight && 'min-height: 200px;'}
    animation: ${fadeIn} 0.3s ease-out;
`;

const ErrorIcon = styled.div`
    width: 48px;
    height: 48px;
    background: #fef2f2;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
    
    svg {
        width: 24px;
        height: 24px;
        color: #dc2626;
    }
`;

const ErrorTitle = styled.h3`
    font-size: 1.125rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 0.5rem 0;
`;

const ErrorMessage = styled.p`
    color: #6b7280;
    font-size: 0.875rem;
    margin: 0 0 1.5rem 0;
    max-width: 400px;
    line-height: 1.5;
`;

const RetryButton = styled.button`
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
        background: #2563eb;
        transform: translateY(-1px);
    }
    
    &:active {
        transform: translateY(0);
    }
`;

interface ErrorDisplayProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
    retryLabel?: string;
    fullHeight?: boolean;
    icon?: React.ReactNode;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
    title = "오류가 발생했습니다",
    message = "문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
    onRetry,
    retryLabel = "다시 시도",
    fullHeight = false,
    icon
}) => {
    const defaultIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );

    return (
        <ErrorContainer $fullHeight={fullHeight}>
            <ErrorIcon>
                {icon || defaultIcon}
            </ErrorIcon>
            <ErrorTitle>{title}</ErrorTitle>
            <ErrorMessage>{message}</ErrorMessage>
            {onRetry && (
                <RetryButton onClick={onRetry}>
                    {retryLabel}
                </RetryButton>
            )}
        </ErrorContainer>
    );
};

// Empty State Component
export const EmptyContainer = styled.div<{ $fullHeight?: boolean }>`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 2rem;
    text-align: center;
    ${props => props.$fullHeight && 'min-height: 300px;'}
    animation: ${fadeIn} 0.3s ease-out;
`;

const EmptyIcon = styled.div`
    width: 64px;
    height: 64px;
    background: #f9fafb;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.5rem;
    
    svg {
        width: 32px;
        height: 32px;
        color: #9ca3af;
    }
`;

const EmptyTitle = styled.h3`
    font-size: 1.125rem;
    font-weight: 600;
    color: #374151;
    margin: 0 0 0.5rem 0;
`;

const EmptyDescription = styled.p`
    color: #6b7280;
    font-size: 0.875rem;
    margin: 0 0 2rem 0;
    max-width: 400px;
    line-height: 1.5;
`;

interface EmptyStateDisplayProps {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
    fullHeight?: boolean;
}

export const EmptyStateDisplay: React.FC<EmptyStateDisplayProps> = ({
    title,
    description,
    icon,
    action,
    fullHeight = false
}) => {
    const defaultIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
    );

    return (
        <EmptyContainer $fullHeight={fullHeight}>
            <EmptyIcon>
                {icon || defaultIcon}
            </EmptyIcon>
            <EmptyTitle>{title}</EmptyTitle>
            {description && <EmptyDescription>{description}</EmptyDescription>}
            {action && action}
        </EmptyContainer>
    );
}; 