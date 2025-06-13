import styled from 'styled-components';
import React from 'react';

export const InputWrapper = styled.div`
    position: relative;
`;

export const StyledInputIcon = styled.div`
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    display: flex;
    align-items: center;
    justify-content: center;
`;

export const StyledInput = styled.input<{hasIcon: boolean}>`
    width: 100%;
    padding: 0.9rem 1rem;
    padding-left: ${({ hasIcon }) => (hasIcon ? '2.8rem' : '1rem')};
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    font-size: 0.95rem;
    background-color: #f8fafc;
    transition: all 0.3s;
    
    &:focus {
        outline: none;
        border-color: #4a6cf7;
        background-color: #fff;
        box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.1);
    }
    
    &::placeholder {
        color: #cbd5e1;
    }
`;

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ icon, ...props }) => {
    return (
        <InputWrapper>
            {icon && <StyledInputIcon>{icon}</StyledInputIcon>}
            <StyledInput hasIcon={!!icon} {...props} />
        </InputWrapper>
    );
};

export default Input; 