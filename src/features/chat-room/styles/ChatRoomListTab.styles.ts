import styled from 'styled-components';

// ActionButton은 shared/ui로 이동됨

// ContextMenu는 shared/ui로 이동됨

// ErrorContainer는 shared/ui로 이동됨

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