import styled from 'styled-components';
import { fadeIn } from '../../../shared/ui/commonStyles';

export const Form = styled.form`
    display: flex;
    flex-direction: column;
    padding: 1rem;
    gap: 1rem;
    flex: 1;
    animation: ${fadeIn} 0.3s ease-out;
`;

export const ProfileImageSection = styled.div`
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
`;

export const ProfileImageContainer = styled.div`
    position: relative;
    width: 100px;
    height: 100px;
    border-radius: 50%;
    overflow: hidden;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
    background-color: #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: center;
`;

export const ProfileImage = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
`;

export const UploadButton = styled.label`
    position: absolute;
    bottom: 5px;
    right: 5px;
    background: #007bff;
    color: white;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
    transition: all 0.2s;
    
    &:hover {
        background: #0056b3;
        transform: scale(1.1);
    }

    &.add-button {
        position: static;
        width: 100%;
        height: 100%;
        background: transparent;
        color: #666;
        box-shadow: none;
        
        &:hover {
        background: rgba(0, 0, 0, 0.05);
        }

        svg {
        width: 32px;
        height: 32px;
        }
    }
`;

export const FileInput = styled.input`
    display: none;
`;

export const InputGroup = styled.div`
    display: flex;
    flex-direction: column;
`;

export const Label = styled.label`
    font-size: 0.85rem;
    color: #444;
    margin-bottom: 0.3rem;
    font-weight: 500;
`;

export const Input = styled.input`
    padding: 0.7rem 0.9rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 0.95rem;
    background-color: #f9f9f9;
    
    &:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
        background-color: #fff;
    }
`;

export const TextArea = styled.textarea`
    padding: 0.7rem 0.9rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 0.95rem;
    resize: vertical;
    min-height: 80px;
    max-height: 150px;
    background-color: #f9f9f9;
    
    &:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
        background-color: #fff;
    }
`;

export const PasswordToggle = styled.div`
    margin-top: 0.5rem;
    border-top: 1px solid #eee;
    padding-top: 1rem;
`;

export const ToggleTitle = styled.h3`
    font-size: 0.95rem;
    font-weight: 600;
    color: #333;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    margin: 0;
    padding: 0.3rem 0;
    
    &:hover {
        color: #007bff;
    }
`;

export const PasswordSection = styled.div<{ isVisible: boolean }>`
    max-height: ${props => props.isVisible ? '300px' : '0'};
    overflow: hidden;
    transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out;
    opacity: ${props => props.isVisible ? '1' : '0'};
    margin-top: ${props => props.isVisible ? '0.8rem' : '0'};
`;

export const ButtonGroup = styled.div`
    display: flex;
    gap: 0.8rem;
    margin-top: auto;
    padding-top: 1.5rem;
`;

// Button 스타일은 shared ActionButton으로 대체됨

export const ErrorMessage = styled.p`
    color: #e53935;
    font-size: 0.8rem;
    margin: 0.3rem 0 0;
    background-color: #ffebee;
    padding: 0.4rem 0.6rem;
    border-radius: 4px;
    border-left: 3px solid #e53935;
`;

export const SuccessMessage = styled.p`
    color: #2e7d32;
    font-size: 0.8rem;
    margin: 0.5rem 0;
    text-align: center;
    background-color: #e8f5e9;
    padding: 0.6rem;
    border-radius: 4px;
    border-left: 3px solid #2e7d32;
    animation: ${fadeIn} 0.3s ease-out;
`; 