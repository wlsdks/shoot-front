import React from 'react';
import styled from 'styled-components';

const EmptyContainer = styled.div`
    text-align: center;
    padding: 2rem 1rem;
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    margin: 1rem 0;
`;

const EmptyIcon = styled.div`
    color: #adb5bd;
    margin-bottom: 1rem;
    
    svg {
        width: 48px;
        height: 48px;
    }
`;

const EmptyText = styled.p`
    color: #6c757d;
    font-size: 0.95rem;
    margin: 0;
`;

interface EmptyStateProps {
    icon?: React.ReactNode;
    text: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, text }) => {
    return (
        <EmptyContainer>
            {icon && <EmptyIcon>{icon}</EmptyIcon>}
            <EmptyText>{text}</EmptyText>
        </EmptyContainer>
    );
};

export default EmptyState; 