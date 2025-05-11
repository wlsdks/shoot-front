import styled from 'styled-components';
import { commonColors, commonShadows, commonBorderRadius } from '../../../shared/ui/commonStyles';
import { fadeIn } from '../../../shared/ui/commonStyles';

export const Container = styled.div`
    padding: 1.25rem;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    box-sizing: border-box;
    background-color: white;
    background-color: #fff;
    border-radius: 14px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    padding: 1.5rem;
    animation: ${fadeIn} 0.3s ease-out;
`;

export const Title = styled.h3`
    font-size: 1.1rem;
    font-weight: 700;
    color: ${commonColors.dark};
    margin-bottom: 0.6rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #e9ecef;
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
    margin: 0 0 1.2rem 0;
    position: relative;
    padding-left: 0.8rem;
    
    &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 18px;
        background: #4a6cf7;
        border-radius: 3px;
    }
`;

export const Description = styled.h3`
    font-size: 1rem;
    font-weight: 600;
    color: ${commonColors.dark};
    margin-bottom: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: #64748b;
    line-height: 1.6;
    margin: 0 0 1.5rem 0;

    &::before {
        content: '#';
        color: ${commonColors.primary};
        font-size: 1.1rem;
    }
`;

export const InputGroup = styled.div`
    margin-bottom: 1rem;
    position: relative;
    width: 100%;
    box-sizing: border-box;
    padding-top: 0.75rem;
    border-top: 1px solid #e9ecef;
    margin-bottom: 1.2rem;
`;

export const Label = styled.label`
    display: block;
    font-size: 0.8rem;
    font-weight: 600;
    color: ${commonColors.dark};
    margin-bottom: 0.35rem;
    font-size: 0.85rem;
    color: #475569;
    margin-bottom: 0.5rem;
    font-weight: 500;
`;

export const Input = styled.input`
    width: 100%;
    padding: 0.65rem 0.75rem;
    border: 1px solid #e0e0e0;
    border-radius: ${commonBorderRadius.medium};
    font-size: 0.8rem;
    transition: all 0.2s;
    background-color: white;
    box-sizing: border-box;
    width: 100%;
    padding: 0.8rem 1rem 0.8rem 2.2rem;
    border: 1px solid #e1e8ed;
    border-radius: 10px;
    font-size: 0.95rem;
    background: #f8fafc;
    transition: all 0.3s;
    
    &:focus {
        outline: none;
        border-color: ${commonColors.primary};
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
    }

    &::placeholder {
        color: #adb5bd;
    }
`;

export const ButtonGroup = styled.div`
    display: flex;
    gap: 0.65rem;
    margin-top: 1rem;
    width: 100%;
    box-sizing: border-box;
    padding-top: 0.75rem;
    border-top: 1px solid #e9ecef;
`;

export const Button = styled.button<{ $primary?: boolean; $danger?: boolean }>`
    flex: 1;
    padding: 0.65rem 0.75rem;
    border: 1px solid ${props => 
        props.$danger ? '#dc3545' : 
        props.$primary ? commonColors.primary : '#e0e0e0'};
    border-radius: ${commonBorderRadius.medium};
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    background-color: ${props => 
        props.$danger ? '#dc3545' : 
        props.$primary ? commonColors.primary : 'white'};
    color: ${props => props.$primary || props.$danger ? '#fff' : commonColors.dark};
    min-width: 0;

    &:hover {
        transform: translateY(-1px);
        box-shadow: ${commonShadows.small};
    }

    &:active {
        transform: translateY(0);
    }

    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }
`;

export const MessageContainer = styled.div`
    margin-top: 0.5rem;
    padding: 0.65rem;
    border-radius: ${commonBorderRadius.medium};
    font-size: 0.75rem;
    line-height: 1.3;
    opacity: 0;
    transform: translateY(-10px);
    animation: slideIn 0.3s ease forwards, fadeOut 0.3s ease 2.7s forwards;

    @keyframes slideIn {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes fadeOut {
        to {
            opacity: 0;
            transform: translateY(-10px);
        }
    }
`;

export const ErrorMessage = styled(MessageContainer)`
    background-color: #fff5f5;
    border: 1px solid #ffd7d7;
    color: #dc3545;
`;

export const SuccessMessage = styled(MessageContainer)`
    background-color: #f0fff4;
    border: 1px solid #c6f6d5;
    color: #28a745;
`;

export const LoadingSpinner = styled.div`
    width: 16px;
    height: 16px;
    border: 2px solid #ffffff;
    border-top: 2px solid transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

export const CurrentCodeDisplay = styled.div`
    background-color: white;
    border: 1px solid #e0e0e0;
    border-radius: ${commonBorderRadius.medium};
    padding: 0.75rem;
    margin-bottom: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: all 0.2s ease;

    &:hover {
        border-color: ${commonColors.primary};
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
    }
`;

export const CodeText = styled.div`
    font-size: 0.9rem;
    font-weight: 600;
    color: ${commonColors.primary};
    font-family: monospace;
    letter-spacing: 0.5px;
`;

export const HelpText = styled.div`
    font-size: 0.75rem;
    color: ${commonColors.secondary};
    margin-top: 1rem;
    padding: 0.75rem;
    background-color: white;
    border-radius: ${commonBorderRadius.medium};
    border: 1px solid #e0e0e0;
    border-left: 2px solid ${commonColors.primary};
    background: #f8fafc;
    border-radius: 10px;
    padding: 1rem;
    font-size: 0.8rem;
    color: #64748b;
    margin-bottom: 1.5rem;
    border-left: 3px solid #4a6cf7;
`;

export const HelpTitle = styled.div`
    font-weight: 600;
    margin-bottom: 0.35rem;
    color: ${commonColors.dark};
    font-size: 0.8rem;
    font-weight: 600;
    color: #475569;
    margin-bottom: 0.5rem;
`;

export const HelpList = styled.ul`
    margin: 0;
    padding-left: 1rem;
    list-style-type: disc;
    margin: 0;
    padding-left: 1.2rem;
    
    li {
        margin-bottom: 0.4rem;
        line-height: 1.5;
        
        &:last-child {
            margin-bottom: 0;
        }
    }
`;

export const HelpItem = styled.li`
    margin-bottom: 0.2rem;
    line-height: 1.3;
    &:last-child {
        margin-bottom: 0;
    }
`;

export const CurrentCodeCard = styled.div`
    background: linear-gradient(145deg, #f0f7ff, #f8fafc);
    border-radius: 12px;
    padding: 1.2rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    border: 1px solid #d9e6ff;
    position: relative;
    
    &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(to right, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.5));
        border-radius: 12px;
        pointer-events: none;
    }
`;

export const CodeLabel = styled.div`
    font-size: 0.8rem;
    color: #64748b;
    margin-bottom: 0.5rem;
    font-weight: 500;
`;

export const CodeDisplay = styled.div`
    display: flex;
    align-items: center;
    font-size: 1.5rem;
    font-weight: 700;
    color: #4a6cf7;
    font-family: 'Courier New', monospace;
    letter-spacing: 1px;
`;

export const CodePrefix = styled.span`
    color: #94a3b8;
    margin-right: 0.2rem;
`;

export const CodeActions = styled.div`
    display: flex;
    gap: 0.8rem;
    margin-top: 1rem;
`;

export const CodeButton = styled.button<{ $primary?: boolean }>`
    background: ${props => props.$primary ? '#4a6cf7' : 'white'};
    color: ${props => props.$primary ? 'white' : '#475569'};
    border: 1px solid ${props => props.$primary ? '#4a6cf7' : '#e2e8f0'};
    border-radius: 8px;
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    transition: all 0.2s;
    
    &:hover {
        background: ${props => props.$primary ? '#3a5be0' : '#f8fafc'};
        transform: translateY(-2px);
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }
    
    svg {
        width: 14px;
        height: 14px;
    }
`;

export const FormSection = styled.div`
    margin-top: 1.5rem;
`;

export const FormTitle = styled.h4`
    font-size: 1rem;
    font-weight: 600;
    color: #333;
    margin: 0 0 1rem 0;
    position: relative;
`;

export const InputWrapper = styled.div`
    position: relative;
`;

export const InputPrefix = styled.div`
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #4a6cf7;
    font-weight: 600;
    font-size: 1rem;
`;

export const SubmitButton = styled.button`
    width: 100%;
    background: #4a6cf7;
    color: white;
    border: none;
    border-radius: 10px;
    padding: 0.9rem;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.3s;
    
    &:hover {
        background: #3a5be0;
        transform: translateY(-2px);
        box-shadow: 0 4px 10px rgba(74, 108, 247, 0.15);
    }
    
    &:disabled {
        background: #a0aef0;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }
`;

export const Spinner = styled.div`
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 0.7s linear infinite;
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;

export const Message = styled.div<{ $type: 'success' | 'error' }>`
    margin: 1rem 0;
    padding: 0.8rem 1rem;
    border-radius: 10px;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    animation: ${fadeIn} 0.3s ease;
    
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
    
    svg {
        width: 16px;
        height: 16px;
    }
`; 