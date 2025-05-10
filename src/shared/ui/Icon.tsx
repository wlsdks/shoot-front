import React from 'react';

interface IconProps {
    children: React.ReactNode;
    size?: number;
}

const Icon: React.FC<IconProps> = ({ children, size = 20 }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {children}
        </svg>
    );
};

export default Icon; 