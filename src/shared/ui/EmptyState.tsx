import React from 'react';
import styled from 'styled-components';

const EmptyContainer = styled.div`
    text-align: center;
    padding: 2rem 1rem;
    background-color: white;
    border-radius: 12px;
    border: 1px solid #e0e0e0;
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