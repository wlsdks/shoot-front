import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';

const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const slideUp = keyframes`
    from { opacity: 0; transform: translateY(40px); }
    to { opacity: 1; transform: translateY(0); }
`;

export const PageWrapper = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(145deg, #f8fafc, #e2e8f0);
    z-index: 1000;
    overflow: hidden;
`;

export const MobileContainer = styled.div`
    width: 100%;
    max-width: 375px;
    height: 100%;
    max-height: 667px;
    background-color: #fff;
    border-radius: 30px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: ${fadeIn} 0.5s ease-out;
    position: relative;
    border: 1px solid #eaeaea;
`;

export const LoginContent = styled.div`
    display: flex;
    flex-direction: column;
    padding: 2.5rem;
    height: 100%;
    background: white;
    overflow-y: auto;
`;

export const LogoArea = styled.div`
    margin-bottom: 3rem;
    text-align: center;
    animation: ${slideUp} 0.5s ease-out;
`;

export const Logo = styled.div`
    font-size: 3rem;
    font-weight: 800;
    color: #4a6cf7;
    letter-spacing: -1px;
    margin-bottom: 0.8rem;
    position: relative;
    display: inline-block;
    
    &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 5px;
        background: linear-gradient(to right, #4a6cf7, #3a5be0);
        border-radius: 5px;
        transform: scaleX(0.7);
        transform-origin: left;
        transition: transform 0.3s;
    }
    
    &:hover::after {
        transform: scaleX(1);
    }
`;

export const LogoTagline = styled.div`
    font-size: 1rem;
    color: #64748b;
    font-weight: 500;
`;

export const FormTitle = styled.h2`
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 1.5rem;
    text-align: center;
`;

export const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
    animation: ${slideUp} 0.5s ease-out;
    animation-delay: 0.1s;
    animation-fill-mode: both;
`;

export const InputGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

export const Label = styled.label`
    font-size: 0.9rem;
    font-weight: 600;
    color: #475569;
`;

export const InputWrapper = styled.div`
    position: relative;
`;

export const InputIcon = styled.div`
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    display: flex;
    align-items: center;
    justify-content: center;
`;

export const Input = styled.input`
    width: 100%;
    padding: 0.9rem 1rem 0.9rem 2.8rem;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    font-size: 0.95rem;
    background-color: #f8fafc;
    transition: all 0.3s;
    
    &:focus {
        outline: none;
        border-color: #4a6cf7;
        background-color: #fff;
        box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.1);
    }
    
    &::placeholder {
        color: #cbd5e1;
    }
`;

export const RememberContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.85rem;
    margin-top: -0.5rem;
`;

export const RememberMeLabel = styled.label`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    color: #475569;
    font-weight: 500;
`;

export const CheckboxContainer = styled.div`
    position: relative;
    width: 18px;
    height: 18px;
    flex-shrink: 0;
`;

export const Checkbox = styled.input.attrs({ type: 'checkbox' })`
    position: absolute;
    opacity: 0;
    width: 18px;
    height: 18px;
    cursor: pointer;
    
    &:checked + span {
        background-color: #4a6cf7;
        border-color: #4a6cf7;
    }
    
    &:checked + span::after {
        opacity: 1;
    }
`;

export const CheckboxControl = styled.span`
    position: absolute;
    top: 0;
    left: 0;
    width: 18px;
    height: 18px;
    border-radius: 4px;
    border: 2px solid #cbd5e1;
    background: white;
    transition: all 0.2s;
    pointer-events: none;
    
    &::after {
        content: '';
        position: absolute;
        left: 5px;
        top: 2px;
        width: 5px;
        height: 9px;
        border: solid white;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
        opacity: 0;
        transition: opacity 0.2s;
    }
`;

export const ForgotPasswordLink = styled(Link)`
    color: #4a6cf7;
    font-size: 0.85rem;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.2s;
    
    &:hover {
        color: #3a5be0;
        text-decoration: underline;
    }
`;

export const Button = styled.button`
    padding: 1rem 1.5rem;
    background: linear-gradient(to right, #4a6cf7, #3a5be0);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    margin-top: 1rem;
    box-shadow: 0 4px 10px rgba(74, 108, 247, 0.2);
    
    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 15px rgba(74, 108, 247, 0.3);
    }
    
    &:active:not(:disabled) {
        transform: translateY(-1px);
    }
    
    &:disabled {
        background: linear-gradient(to right, #a0aef0, #94a3b8);
        cursor: not-allowed;
        box-shadow: none;
    }
`;

export const ErrorContainer = styled.div`
    padding: 1rem;
    margin-top: 1rem;
    background-color: #fef2f2;
    border-radius: 10px;
    border-left: 4px solid #dc2626;
    display: flex;
    align-items: center;
    gap: 0.8rem;
    animation: ${fadeIn} 0.3s ease;
`;

export const ErrorIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    color: #dc2626;
    flex-shrink: 0;
    
    svg {
        width: 20px;
        height: 20px;
    }
`;

export const ErrorText = styled.div`
    color: #b91c1c;
    font-size: 0.9rem;
    font-weight: 500;
    flex: 1;
`;

export const AccountLinks = styled.div`
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 2rem;
    position: relative;
    padding-top: 1.5rem;
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 1px;
        background: #e2e8f0;
    }
`;

export const AccountLink = styled(Link)`
    font-size: 0.85rem;
    color: #64748b;
    text-decoration: none;
    position: relative;
    font-weight: 500;
    
    &:hover {
        color: #4a6cf7;
    }
    
    &::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        width: 100%;
        height: 1px;
        background-color: #4a6cf7;
        transform: scaleX(0);
        transition: transform 0.3s ease;
    }
    
    &:hover::after {
        transform: scaleX(1);
    }
    
    &:not(:last-child) {
        padding-right: 1rem;
    }
    
    &:not(:last-child)::before {
        content: '';
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 1px;
        height: 12px;
        background-color: #e2e8f0;
    }
`;

export const SpinnerIcon = styled.div`
    display: inline-block;
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 0.8s linear infinite;
    margin-right: 8px;
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`; 