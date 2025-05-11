import styled from "styled-components";
import { fadeIn, slideUp } from "../../../shared/ui/commonStyles";

export const Container = styled.div`
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    animation: ${slideUp} 0.3s ease-out;
    position: relative;
    border: 1px solid #eef2f7;
    margin-bottom: 1.2rem;
`;

export const Header = styled.div`
    padding: 1.2rem 1.5rem;
    background: linear-gradient(to right, #f2f8ff, #f8fafc);
    border-bottom: 1px solid #f0f5ff;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
`;

export const Title = styled.h2`
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
    margin: 0;
    text-align: center;
`;

export const Content = styled.div`
    padding: 1.5rem;
`;

export const FormGroup = styled.div`
    margin-bottom: 1.2rem;
    position: relative;
`;

export const Label = styled.label`
    display: inline-block;
    margin-bottom: 0.6rem;
    font-size: 0.85rem;
    color: #475569;
    font-weight: 500;
    position: relative;
    padding-left: 0.5rem;
    
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

export const InputWrapper = styled.div`
    position: relative;
    display: flex;
    align-items: center;
`;

export const InputPrefix = styled.div`
    position: absolute;
    left: 1rem;
    color: #4a6cf7;
    font-weight: 600;
    font-size: 1rem;
    pointer-events: none;
`;

export const Input = styled.input`
    width: 100%;
    padding: 0.85rem 1rem 0.85rem 2.2rem;
    font-size: 0.95rem;
    border: 1px solid #e1e8ed;
    border-radius: 12px;
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

export const ButtonGroup = styled.div`
    display: flex;
    gap: 0.8rem;
    margin-top: 1.5rem;
`;

export const Button = styled.button<{ $primary?: boolean }>`
    flex: 1;
    padding: 0.85rem 1rem;
    font-size: 0.9rem;
    font-weight: 600;
    border-radius: 12px;
    border: none;
    background: ${props => props.$primary ? '#4a6cf7' : '#f1f5f9'};
    color: ${props => props.$primary ? 'white' : '#475569'};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.3s;
    
    &:hover {
        background: ${props => props.$primary ? '#3a5be0' : '#e2e8f0'};
        transform: translateY(-2px);
        box-shadow: ${props => props.$primary ? '0 6px 14px rgba(74, 108, 247, 0.2)' : '0 4px 6px rgba(0, 0, 0, 0.05)'};
    }
    
    &:active {
        transform: translateY(-1px);
    }
    
    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
        background: ${props => props.$primary ? '#a0aef0' : '#e2e8f0'};
        box-shadow: none;
    }
`;

export const UserCard = styled.div`
    margin-top: 1.5rem;
    padding: 1.2rem;
    border-radius: 14px;
    background: #f0f7ff;
    border: 1px solid #d9e6ff;
    box-shadow: 0 4px 12px rgba(74, 108, 247, 0.08);
    animation: ${fadeIn} 0.4s ease;
`;

export const UserHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
`;

export const UserAvatar = styled.div`
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: linear-gradient(135deg, #4a6cf7, #3a5be0);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 1.5rem;
    box-shadow: 0 4px 8px rgba(74, 108, 247, 0.2);
    border: 2px solid #fff;
`;

export const UserInfo = styled.div`
    flex: 1;
`;

export const UserName = styled.h3`
    margin: 0 0 0.3rem 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
`;

export const UserUsername = styled.div`
    font-size: 0.85rem;
    color: #64748b;
`;

export const UserDetail = styled.div`
    display: flex;
    align-items: center;
    margin-top: 0.8rem;
    padding: 0.8rem 1rem;
    background: white;
    border-radius: 10px;
    border: 1px solid #d9e6ff;
    
    svg {
        color: #4a6cf7;
        width: 18px;
        height: 18px;
        margin-right: 0.8rem;
        flex-shrink: 0;
    }
    
    div {
        font-size: 0.9rem;
        color: #475569;
        
        span {
            font-weight: 600;
            color: #333;
            margin-left: 0.3rem;
        }
    }
`;

export const Message = styled.div<{ $type: 'success' | 'error' }>`
    margin-top: 1.2rem;
    padding: 1rem;
    border-radius: 12px;
    font-size: 0.9rem;
    animation: ${fadeIn} 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.8rem;
    
    ${props => props.$type === 'success' 
        ? `
        background: #ecfdf5;
        border: 1px solid #d1fae5;
        color: #059669;
        `
        : `
        background: #fef2f2;
        border: 1px solid #fee2e2;
        color: #dc2626;
        `
    }
`;

export const MessageIcon = styled.div`
    display: flex;
    flex-shrink: 0;
    
    svg {
        width: 18px;
        height: 18px;
    }
`;

export const MessageText = styled.div`
    flex: 1;
    font-weight: 500;
`;

export const CloseButton = styled.button`
    position: absolute;
    top: 1.2rem;
    left: 1.2rem;
    width: 30px;
    height: 30px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.8);
    border: none;
    color: #64748b;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    backdrop-filter: blur(4px);
    
    &:hover {
        background: white;
        color: #4a6cf7;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }
    
    svg {
        width: 18px;
        height: 18px;
    }
`;

export const Spinner = styled.div`
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 0.7s linear infinite;
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`; 