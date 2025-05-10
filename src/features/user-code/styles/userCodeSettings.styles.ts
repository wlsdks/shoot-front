import styled from 'styled-components';
import { commonColors, commonShadows, commonBorderRadius } from '../../../shared/ui/commonStyles';

export const Container = styled.div`
    padding: 1.25rem;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    box-sizing: border-box;
    background-color: white;
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

    &::before {
        content: '#';
        color: ${commonColors.primary};
        font-size: 1.2rem;
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
`;

export const Label = styled.label`
    display: block;
    font-size: 0.8rem;
    font-weight: 600;
    color: ${commonColors.dark};
    margin-bottom: 0.35rem;
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
`;

export const HelpTitle = styled.div`
    font-weight: 600;
    margin-bottom: 0.35rem;
    color: ${commonColors.dark};
    font-size: 0.8rem;
`;

export const HelpList = styled.ul`
    margin: 0;
    padding-left: 1rem;
    list-style-type: disc;
`;

export const HelpItem = styled.li`
    margin-bottom: 0.2rem;
    line-height: 1.3;
    &:last-child {
        margin-bottom: 0;
    }
`; 