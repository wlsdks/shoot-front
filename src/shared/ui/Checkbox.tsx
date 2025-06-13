import styled from 'styled-components';
import React from 'react';

const CheckboxContainer = styled.div`
    position: relative;
    width: 18px;
    height: 18px;
    flex-shrink: 0;
`;

const StyledCheckbox = styled.input.attrs({ type: 'checkbox' })`
    position: absolute;
    opacity: 0;
    width: 18px;
    height: 18px;
    cursor: pointer;
    
    &:checked + span {
        background-color: #4a6cf7;
        border-color: #4a6cf7;
    }
    
    &:checked + span::after {
        opacity: 1;
    }
`;

const CheckboxControl = styled.span`
    position: absolute;
    top: 0;
    left: 0;
    width: 18px;
    height: 18px;
    border-radius: 4px;
    border: 2px solid #cbd5e1;
    background: white;
    transition: all 0.2s;
    pointer-events: none;
    
    &::after {
        content: '';
        position: absolute;
        left: 5px;
        top: 2px;
        width: 5px;
        height: 9px;
        border: solid white;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
        opacity: 0;
        transition: opacity 0.2s;
    }
`;

export const Checkbox: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => {
    return (
        <CheckboxContainer>
            <StyledCheckbox {...props} />
            <CheckboxControl />
        </CheckboxContainer>
    );
}

export default Checkbox; 