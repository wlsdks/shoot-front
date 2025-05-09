import React from 'react';
import styled from 'styled-components';

const Header = styled.div`
    padding: 1rem;
    background-color: #fff;
    border-bottom: 1px solid #e9ecef;
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const Title = styled.h2`
    font-size: 1.25rem;
    font-weight: 700;
    color: #333;
    margin: 0;
`;

const HeaderActions = styled.div`
    display: flex;
    gap: 0.5rem;
`;

const IconButton = styled.button`
    background: #f0f5ff;
    border: none;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    color: #007bff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    transition: all 0.2s;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    
    &:hover {
        background: #e1ecff;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
`;

interface TabHeaderProps {
    title: string;
    actions?: React.ReactNode;
}

const TabHeader: React.FC<TabHeaderProps> = ({ title, actions }) => {
    return (
        <Header>
            <Title>{title}</Title>
            {actions && <HeaderActions>{actions}</HeaderActions>}
        </Header>
    );
};

export default TabHeader; 