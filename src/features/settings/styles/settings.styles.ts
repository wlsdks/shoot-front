import styled from 'styled-components';
import { fadeIn, slideUp } from '../../../shared/ui/commonStyles';

export const SettingsContent = styled.div`
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

export const SettingItem = styled.div`
    display: flex;
    align-items: center;
    padding: 1rem;
    background-color: white;
    border-radius: 14px;
    margin-bottom: 0.8rem;
    cursor: pointer;
    transition: all 0.3s ease;
    animation: ${fadeIn} 0.3s ease-out;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    
    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
    }
    
    &:active {
        transform: translateY(-1px);
    }
`;

export const IconContainer = styled.div<{ color?: string }>`
    width: 45px;
    height: 45px;
    border-radius: 12px;
    background-color: ${props => props.color || '#f0f5ff'};
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 1rem;
    color: ${props => props.color ? 'white' : '#007bff'};
    transition: all 0.3s ease;
    
    ${SettingItem}:hover & {
        transform: scale(1.05);
    }
    
    svg {
        width: 22px;
        height: 22px;
    }
`;

export const SettingInfo = styled.div`
    flex: 1;
`;

export const SettingTitle = styled.div`
    font-weight: 600;
    font-size: 1rem;
    color: #333;
    margin-bottom: 0.2rem;
`;

export const SettingDescription = styled.div`
    font-size: 0.8rem;
    color: #666;
`;

export const CategoryHeader = styled.div`
    font-weight: 600;
    color: #666;
    font-size: 0.9rem;
    padding: 0.5rem 0.5rem 0.5rem 0.75rem;
    margin: 1.5rem 0 0.75rem 0;
    position: relative;
    
    &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 70%;
        background-color: #007bff;
        border-radius: 3px;
    }
    
    &:first-of-type {
        margin-top: 0.5rem;
    }
`;

export const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    animation: ${fadeIn} 0.2s ease-out;
`;

export const ModalContent = styled.div`
    background: white;
    padding: 1.5rem;
    border-radius: 16px;
    width: 300px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    animation: ${slideUp} 0.3s ease-out;
`;

export const ModalTitle = styled.h2`
    font-size: 1.2rem;
    font-weight: 600;
    color: #333;
    margin: 0 0 1rem 0;
    text-align: center;
`;

export const ModalText = styled.p`
    font-size: 0.95rem;
    color: #666;
    margin: 0 0 1.5rem 0;
    text-align: center;
    line-height: 1.5;
`;

export const ModalButtonGroup = styled.div`
    display: flex;
    gap: 0.75rem;
    justify-content: center;
`;

export const ModalButton = styled.button<{ $primary?: boolean }>`
    padding: 0.75rem 1.2rem;
    border: none;
    border-radius: 12px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    flex: 1;
    
    background: ${props => props.$primary ? '#007bff' : '#f1f3f5'};
    color: ${props => props.$primary ? 'white' : '#666'};
    
    &:hover {
        background: ${props => props.$primary ? '#0069d9' : '#e9ecef'};
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    
    &:active {
        transform: translateY(-1px);
    }
`;

export const ArrowIcon = styled.div`
    color: #ccc;
    display: flex;
    align-items: center;
    justify-content: center;
    
    svg {
        width: 20px;
        height: 20px;
    }
    
    ${SettingItem}:hover & {
        color: #007bff;
    }
`; 