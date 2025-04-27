import styled from 'styled-components';
import { fadeIn, commonColors, commonShadows, commonBorderRadius } from './commonStyles';

export const TabContainer = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: ${commonColors.light};
`;

export const TabHeader = styled.div`
    padding: 1rem;
    background-color: ${commonColors.white};
    border-bottom: 1px solid #e9ecef;
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: ${commonShadows.small};
`;

export const TabTitle = styled.h2`
    font-size: 1.25rem;
    font-weight: 700;
    color: ${commonColors.dark};
    margin: 0;
`;

export const TabActions = styled.div`
    display: flex;
    gap: 0.5rem;
`;

export const TabButton = styled.button`
    background: ${commonColors.primary};
    color: ${commonColors.white};
    border: none;
    border-radius: ${commonBorderRadius.medium};
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: ${commonShadows.small};
    
    &:hover {
        background: #0056b3;
        transform: translateY(-2px);
        box-shadow: ${commonShadows.medium};
    }
    
    &:active {
        transform: translateY(0);
    }
`;

export const TabContent = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    
    /* 스크롤바 스타일링 */
    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 10px;
    }

    &::-webkit-scrollbar-thumb {
        background: #ccc;
        border-radius: 10px;
    }

    &::-webkit-scrollbar-thumb:hover {
        background: #aaa;
    }
`;

export const TabSection = styled.div`
    margin-bottom: 1rem;
    animation: ${fadeIn} 0.3s ease-out;
`;

export const TabSectionHeader = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 0.75rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #e0e0e0;
`;

export const TabSectionTitle = styled.h3`
    font-size: 1rem;
    margin: 0;
    color: ${commonColors.dark};
    flex: 1;
`;

export const TabSectionCount = styled.span`
    background-color: #e9ecef;
    color: ${commonColors.secondary};
    font-size: 0.8rem;
    padding: 0.2rem 0.5rem;
    border-radius: 1rem;
    font-weight: 600;
`; 