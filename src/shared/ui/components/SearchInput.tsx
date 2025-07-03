import React from 'react';
import styled from 'styled-components';
import { fadeIn } from '../commonStyles';

export const SearchContainer = styled.div`
    position: relative;
    margin-bottom: 1rem;
    animation: ${fadeIn} 0.3s ease-out;
`;

export const SearchInputField = styled.input`
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.5rem;
    border: 1px solid #e0e0e0;
    border-radius: 20px;
    background-color: #f8f9fa;
    font-size: 0.9rem;
    transition: all 0.3s ease;
    outline: none;

    &:focus {
        border-color: #007bff;
        background-color: #fff;
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
    }

    &::placeholder {
        color: #9ca3af;
    }
`;

export const SearchIcon = styled.div`
    position: absolute;
    left: 0.875rem;
    top: 50%;
    transform: translateY(-50%);
    color: #9ca3af;
    pointer-events: none;
    z-index: 1;
    
    svg {
        width: 16px;
        height: 16px;
    }
`;

export const ClearButton = styled.button<{ $visible: boolean }>`
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #9ca3af;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 50%;
    opacity: ${props => props.$visible ? 1 : 0};
    visibility: ${props => props.$visible ? 'visible' : 'hidden'};
    transition: all 0.2s ease;
    
    &:hover {
        background-color: #f1f3f4;
        color: #495057;
    }
    
    svg {
        width: 14px;
        height: 14px;
    }
`;

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    onFocus?: () => void;
    onBlur?: () => void;
    disabled?: boolean;
    autoFocus?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({
    value,
    onChange,
    placeholder = "검색...",
    onFocus,
    onBlur,
    disabled = false,
    autoFocus = false
}) => {
    const handleClear = () => {
        onChange('');
    };

    return (
        <SearchContainer>
            <SearchIcon>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </SearchIcon>
            <SearchInputField
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                onFocus={onFocus}
                onBlur={onBlur}
                disabled={disabled}
                autoFocus={autoFocus}
            />
            <ClearButton 
                $visible={value.length > 0}
                onClick={handleClear}
                type="button"
                tabIndex={-1}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </ClearButton>
        </SearchContainer>
    );
}; 