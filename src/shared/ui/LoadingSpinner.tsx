import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
`;

const SpinnerContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    color: #6c757d;
`;

const Spinner = styled.div`
    border: 3px solid #f3f3f3;
    border-top: 3px solid #007bff;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    animation: ${spin} 1s linear infinite;
    margin-bottom: 1rem;
`;

const LoadingText = styled.p`
    margin: 0;
    font-size: 0.9rem;
`;

interface LoadingSpinnerProps {
    text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text = '로딩 중...' }) => {
    return (
        <SpinnerContainer>
            <Spinner />
            <LoadingText>{text}</LoadingText>
        </SpinnerContainer>
    );
};

export default LoadingSpinner; 