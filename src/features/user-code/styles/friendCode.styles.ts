import styled, { keyframes } from "styled-components";

// 애니메이션 정의
export const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
`;

export const pulse = keyframes`
    0% { transform: scale(1); }
    50% { transform: scale(1.02); }
    100% { transform: scale(1); }
`;

// 메인 컨테이너
export const Container = styled.div`
    background: #ffffff;
    width: 100%;
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    animation: ${fadeIn} 0.4s ease-out;
    position: relative;
    border: 1px solid rgba(230, 230, 230, 0.7);
`;

// 헤더 영역
export const Header = styled.div`
    padding: 20px 24px;
    border-bottom: 1px solid #f0f0f0;
    position: relative;
    background: linear-gradient(to right, #f9f9f9, #ffffff);
`;

export const Title = styled.h2`
    font-size: 1.2rem;
    font-weight: 600;
    color: #333;
    margin: 0;
    text-align: center;
`;

// 컨텐츠 영역
export const Content = styled.div`
    padding: 24px;
`;

// 폼 그룹
export const FormGroup = styled.div`
    margin-bottom: 20px;
    position: relative;
`;

export const Label = styled.label`
    display: inline-block;
    margin-bottom: 8px;
    font-size: 0.85rem;
    color: #555;
    font-weight: 500;
    position: relative;
    padding-left: 6px;
    
    &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 14px;
        background: #4a6cf7;
        border-radius: 2px;
    }
`;

// 입력 필드 래퍼
export const InputWrapper = styled.div`
    position: relative;
    display: flex;
    align-items: center;
`;

export const InputIcon = styled.div`
    position: absolute;
    left: 16px;
    color: #999;
    z-index: 2;
    
    svg {
        width: 16px;
        height: 16px;
    }
`;

export const Input = styled.input`
    width: 100%;
    padding: 14px 16px;
    padding-left: 42px;
    font-size: 0.95rem;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    background: #f9f9f9;
    transition: all 0.25s ease;
    box-sizing: border-box;
    
    &:focus {
        outline: none;
        border-color: #4a6cf7;
        background: #fff;
        box-shadow: 0 0 0 4px rgba(74, 108, 247, 0.12);
    }
    
    &::placeholder {
        color: #aaa;
    }
`;

// 버튼 그룹
export const ButtonGroup = styled.div`
    display: flex;
    gap: 12px;
    margin-top: 16px;
`;

export const Button = styled.button<{ $primary?: boolean }>`
    flex: 1;
    padding: 14px 16px;
    font-size: 0.95rem;
    font-weight: 500;
    border-radius: 12px;
    border: none;
    background: ${props => props.$primary ? '#4a6cf7' : '#f5f5f5'};
    color: ${props => props.$primary ? 'white' : '#555'};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.25s ease;
    box-shadow: ${props => props.$primary ? '0 4px 12px rgba(74, 108, 247, 0.15)' : 'none'};
    
    &:hover {
        background: ${props => props.$primary ? '#3a5be0' : '#ececec'};
        transform: translateY(-1px);
        box-shadow: ${props => props.$primary ? '0 6px 14px rgba(74, 108, 247, 0.2)' : '0 4px 6px rgba(0, 0, 0, 0.05)'};
    }
    
    &:active {
        transform: translateY(0);
    }
    
    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
        background: ${props => props.$primary ? '#a0aef0' : '#e8e8e8'};
        box-shadow: none;
    }
    
    svg {
        width: 18px;
        height: 18px;
    }
`;

// 사용자 카드
export const UserCard = styled.div`
    margin-top: 24px;
    padding: 20px;
    border-radius: 16px;
    background: #f8faff;
    border: 1px solid #e8eeff;
    box-shadow: 0 4px 12px rgba(74, 108, 247, 0.08);
    animation: ${fadeIn} 0.4s ease;
    
    &:hover {
        animation: ${pulse} 0.5s ease;
    }
`;

export const UserHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 16px;
`;

export const UserAvatar = styled.div`
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, #4a6cf7, #3a5be0);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 1.3rem;
    box-shadow: 0 4px 8px rgba(74, 108, 247, 0.2);
`;

export const UserInfo = styled.div`
    flex: 1;
`;

export const UserName = styled.h3`
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
`;

export const UserDetail = styled.div`
    display: flex;
    align-items: center;
    margin-top: 12px;
    padding: 10px;
    background: white;
    border-radius: 10px;
    border: 1px solid #e8eeff;
    
    svg {
        color: #4a6cf7;
        width: 20px;
        height: 20px;
        margin-right: 8px;
    }
    
    div {
        font-size: 0.9rem;
        color: #666;
        
        span {
            font-weight: 600;
            color: #333;
            margin-left: 4px;
        }
    }
`;

// 메시지 스타일
export const Message = styled.div<{ $type: 'success' | 'error' }>`
    margin-top: 20px;
    padding: 14px 16px;
    border-radius: 12px;
    font-size: 0.9rem;
    animation: ${fadeIn} 0.3s ease;
    display: flex;
    align-items: center;
    gap: 10px;
    
    ${props => props.$type === 'success' 
        ? `
        background: #eefbf4;
        border: 1px solid #d1f2e1;
        color: #10b981;
        `
        : `
        background: #fef2f2;
        border: 1px solid #fde8e8;
        color: #ef4444;
        `
    }
`;

export const MessageIcon = styled.div`
    display: flex;
`;

// 닫기 버튼
export const CloseButton = styled.button`
    position: absolute;
    top: 18px;
    right: 16px;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: #f5f5f5;
    border: none;
    color: #666;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.25s ease;
    
    &:hover {
        background: #ebebeb;
        color: #333;
        transform: rotate(90deg);
    }
    
    svg {
        width: 16px;
        height: 16px;
    }
`;

// 로딩 표시
export const Spinner = styled.div`
    width: 16px;
    height: 16px;
    border: 2px solid currentColor;
    border-radius: 50%;
    border-right-color: transparent;
    animation: spin 0.75s linear infinite;
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`; 