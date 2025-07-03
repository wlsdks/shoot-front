import React from 'react';
import styled from 'styled-components';
import { fadeIn } from '../commonStyles';

export const StyledActionButton = styled.button<{
    $variant?: 'primary' | 'secondary' | 'danger' | 'outline';
    $size?: 'small' | 'medium' | 'large';
    $fullWidth?: boolean;
    disabled?: boolean;
}>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    animation: ${fadeIn} 0.3s ease-out;
    text-decoration: none;
    white-space: nowrap;
    
    /* Size variants */
    ${props => {
        switch (props.$size) {
            case 'small':
                return `
                    padding: 0.375rem 0.75rem;
                    font-size: 0.875rem;
                    min-height: 32px;
                `;
            case 'large':
                return `
                    padding: 0.75rem 1.5rem;
                    font-size: 1rem;
                    min-height: 48px;
                `;
            default:
                return `
                    padding: 0.5rem 1rem;
                    font-size: 0.875rem;
                    min-height: 38px;
                `;
        }
    }}
    
    /* Width */
    width: ${props => props.$fullWidth ? '100%' : 'auto'};
    
    /* Color variants */
    ${props => {
        if (props.disabled) {
            return `
                background: #e9ecef;
                color: #6c757d;
                cursor: not-allowed;
                &:hover {
                    background: #e9ecef;
                    transform: none;
                }
            `;
        }
        
        switch (props.$variant) {
            case 'primary':
                return `
                    background: #007bff;
                    color: white;
                    &:hover {
                        background: #0056b3;
                        transform: translateY(-2px);
                        box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
                    }
                `;
            case 'danger':
                return `
                    background: #dc3545;
                    color: white;
                    &:hover {
                        background: #c82333;
                        transform: translateY(-2px);
                        box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
                    }
                `;
            case 'outline':
                return `
                    background: transparent;
                    color: #007bff;
                    border: 1px solid #007bff;
                    &:hover {
                        background: #007bff;
                        color: white;
                        transform: translateY(-2px);
                        box-shadow: 0 4px 12px rgba(0, 123, 255, 0.2);
                    }
                `;
            default: // secondary
                return `
                    background: #6c757d;
                    color: white;
                    &:hover {
                        background: #545b62;
                        transform: translateY(-2px);
                        box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
                    }
                `;
        }
    }}
    
    &:active {
        transform: translateY(0);
    }
    
    &:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
    }
`;

interface ActionButtonProps {
    children: React.ReactNode;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'outline';
    size?: 'small' | 'medium' | 'large';
    fullWidth?: boolean;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    className?: string;
    icon?: React.ReactNode;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
    children,
    onClick,
    variant = 'primary',
    size = 'medium',
    fullWidth = false,
    disabled = false,
    type = 'button',
    className,
    icon,
    ...props
}) => {
    return (
        <StyledActionButton
            $variant={variant}
            $size={size}
            $fullWidth={fullWidth}
            disabled={disabled}
            type={type}
            onClick={onClick}
            className={className}
            {...props}
        >
            {icon && <span>{icon}</span>}
            {children}
        </StyledActionButton>
    );
}; 