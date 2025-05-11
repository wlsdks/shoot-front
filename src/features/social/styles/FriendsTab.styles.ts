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

export const ProfileSection = styled.div`
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #eef2f7;
`;

export const HeaderButtons = styled.div`
    display: flex;
    gap: 8px;
`; 