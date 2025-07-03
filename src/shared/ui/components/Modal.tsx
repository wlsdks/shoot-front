import React from 'react';
import styled, { keyframes } from 'styled-components';
import { fadeIn } from '../commonStyles';

const scaleIn = keyframes`
    from {
        transform: scale(0.95);
        opacity: 0;
    }
    to {
        transform: scale(1);
        opacity: 1;
    }
`;

export const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: ${fadeIn} 0.25s ease-out;
    backdrop-filter: blur(3px);
`;

export const ModalContent = styled.div<{ $maxWidth?: string }>`
    background: white;
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
    max-width: ${props => props.$maxWidth || '90vw'};
    max-height: 90vh;
    overflow-y: auto;
    animation: ${scaleIn} 0.25s ease-out;
    position: relative;
`;

export const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #e9ecef;
`;

export const ModalTitle = styled.h2`
    font-size: 1.25rem;
    font-weight: 600;
    color: #333;
    margin: 0;
`;

export const ModalCloseButton = styled.button`
    background: none;
    border: none;
    color: #6c757d;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    
    &:hover {
        background: #f8f9fa;
        color: #495057;
    }
`;

export const ModalBody = styled.div`
    padding: 1.5rem;
`;

export const ModalFooter = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding: 1.5rem;
    border-top: 1px solid #e9ecef;
`;

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    maxWidth?: string;
    children: React.ReactNode;
    hideCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    maxWidth,
    children,
    hideCloseButton = false
}) => {
    if (!isOpen) return null;

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <ModalOverlay onClick={handleOverlayClick}>
            <ModalContent $maxWidth={maxWidth}>
                {title && (
                    <ModalHeader>
                        <ModalTitle>{title}</ModalTitle>
                        {!hideCloseButton && (
                            <ModalCloseButton onClick={onClose}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </ModalCloseButton>
                        )}
                    </ModalHeader>
                )}
                {children}
            </ModalContent>
        </ModalOverlay>
    );
}; 