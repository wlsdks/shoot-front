import styled from 'styled-components';

export const ErrorContainer = styled.div`
    background-color: #fff5f5;
    color: #e53e3e;
    padding: 1rem;
    border-radius: 10px;
    margin: 0 0 1rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    box-shadow: 0 2px 5px rgba(229, 62, 62, 0.1);
    
    svg {
        flex-shrink: 0;
    }
`;

export const LoadMoreButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 0.75rem;
    background-color: #f2f8ff;
    border: none;
    border-radius: 10px;
    color: #007bff;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    margin-top: 1rem;
    
    &:hover {
        background-color: #e1eeff;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 123, 255, 0.15);
    }
    
    &:disabled {
        background-color: #f2f2f2;
        color: #aaa;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }
`; 