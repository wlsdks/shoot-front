import styled from 'styled-components';

export const ActionButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
    background-color: #f2f8ff;
    border: none;
    border-radius: 10px;
    color: #007bff;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    gap: 6px;
    height: 38px;
    
    &:hover {
        background-color: #e1eeff;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 123, 255, 0.15);
    }
`;

export const ContextMenu = styled.div`
    position: fixed;
    background: white;
    border-radius: 14px;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    min-width: 150px;
    overflow: hidden;
`;

export const ContextMenuItem = styled.div`
    padding: 0.8rem 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    color: #333;
    font-size: 0.9rem;
    transition: background-color 0.2s;

    &:hover {
        background-color: #f5f9ff;
        color: #007bff;
    }

    svg {
        width: 1rem;
        height: 1rem;
        color: #666;
    }

    &:hover svg {
        color: #007bff;
    }
`;

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

export const SearchContainer = styled.div`
    padding: 0 0 1rem 0;
    position: relative;
`;

export const SearchInput = styled.input`
    width: 100%;
    padding: 0.8rem 1rem 0.8rem 3.0rem;
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
    left: 1rem;
    top: calc(50% - 0.5rem);
    transform: translateY(-50%);
    color: #a0aec0;
    pointer-events: none;
    display: flex;
    align-items: center;
`; 