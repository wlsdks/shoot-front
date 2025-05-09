import styled, { keyframes } from 'styled-components';

export const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
`;

export const slideUp = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

export const spin = keyframes`
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
`;

export const commonColors = {
    primary: '#007bff',
    secondary: '#6c757d',
    success: '#28a745',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#17a2b8',
    light: '#f8f9fa',
    dark: '#343a40',
    white: '#ffffff',
    black: '#000000',
};

export const commonShadows = {
    small: '0 2px 5px rgba(0, 0, 0, 0.1)',
    medium: '0 4px 8px rgba(0, 0, 0, 0.1)',
    large: '0 8px 16px rgba(0, 0, 0, 0.1)',
};

export const commonBorderRadius = {
    small: '4px',
    medium: '8px',
    large: '12px',
    circle: '50%',
};

// 탭 컨테이너
export const TabContainer = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #ffffff;
`;

// 헤더 - 다른 탭들과 일관된 스타일
export const Header = styled.div`
    padding: 1rem;
    background-color: #fff;
    border-bottom: 1px solid #e9ecef;
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

export const Title = styled.h2`
    font-size: 1.25rem;
    font-weight: 700;
    color: #333;
    margin: 0;
`;

export const HeaderActions = styled.div`
    display: flex;
    gap: 0.5rem;
`;

export const IconButton = styled.button`
    background: #f0f5ff;
    border: none;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    color: #007bff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    transition: all 0.2s;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    
    &:hover {
        background: #e1ecff;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
`;

// 스크롤 영역
export const ScrollArea = styled.div`
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

// 카드 스타일
export const Card = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    background-color: #fff;
    margin-bottom: 0.75rem;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    cursor: pointer;
    transition: all 0.3s ease;
    animation: ${fadeIn} 0.3s ease-out;
    
    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    }
    
    &:active {
        transform: translateY(-1px);
    }
`;

// 텍스트 영역
export const TextArea = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
`;

export const CardTitle = styled.span`
    font-weight: 600;
    color: #333;
    font-size: 1rem;
`;

export const CardDescription = styled.span`
    font-size: 0.85rem;
    color: #6c757d;
    margin-top: 0.3rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

// 아이콘 컨테이너
export const IconContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    color: #007bff;
    margin-left: 1rem;
    flex-shrink: 0;
`;

// 모달 스타일
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
    border-radius: 10px;
    width: 280px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

export const ModalTitle = styled.h2`
    font-size: 1.2rem;
    font-weight: 600;
    color: #333;
    margin: 0 0 1rem 0;
    text-align: center;
`;

export const ModalText = styled.p`
    font-size: 0.9rem;
    color: #666;
    margin: 0 0 1.5rem 0;
    text-align: center;
`;

export const ModalButtonGroup = styled.div`
    display: flex;
    gap: 0.75rem;
    justify-content: center;
`;

export const ModalButton = styled.button<{ $primary?: boolean }>`
    padding: 0.6rem 1.2rem;
    border: none;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    flex: 1;
    max-width: 120px;
    
    background: ${props => props.$primary ? '#007bff' : '#f1f3f5'};
    color: ${props => props.$primary ? 'white' : '#666'};
    
    &:hover {
        background: ${props => props.$primary ? '#0056b3' : '#e9ecef'};
    }
`; 