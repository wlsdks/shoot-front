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

export const ErrorContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 0.8rem;
    background-color: #fef2f2;
    color: #ef4444;
    padding: 1rem;
    border-radius: 12px;
    margin-top: 1rem;
    border: 1px solid #fecaca;
    animation: ${fadeIn} 0.3s;
`;

export const ErrorIcon = styled.div`
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    color: #ef4444;
`;

export const ErrorText = styled.p`
    margin: 0;
    font-size: 0.9rem;
    font-weight: 500;
`;

export const AccountLinks = styled.div`
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid #e2e8f0;
`;

export const AccountLink = styled(Link)`
    color: #64748b;
    font-size: 0.85rem;
    font-weight: 500;
    text-decoration: none;
    transition: color 0.2s;
    
    &:hover {
        color: #4a6cf7;
    }
`; 