import styled, { keyframes, css } from 'styled-components';

const rotate = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

export const SpinnerIcon = styled.div`
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: ${rotate} 0.8s linear infinite;
`;

export const StyledButton = styled.button<{isLoading?: boolean}>`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
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
        transform: translateY(0);
        box-shadow: 0 4px 10px rgba(74, 108, 247, 0.2);
    }
    
    &:disabled {
        background: #94a3b8;
        cursor: not-allowed;
        box-shadow: none;
        transform: none;
    }

    ${({ isLoading }) => isLoading && css`
        cursor: wait;
        background: #94a3b8;
    `}
`;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean;
    loadingText?: string;
}

export const Button: React.FC<ButtonProps> = ({ children, isLoading, loadingText, ...props }) => {
    return (
        <StyledButton isLoading={isLoading} {...props}>
            {isLoading ? (
                <>
                    <SpinnerIcon />
                    {loadingText || '로딩 중...'}
                </>
            ) : (
                children
            )}
        </StyledButton>
    );
};

export default Button; 