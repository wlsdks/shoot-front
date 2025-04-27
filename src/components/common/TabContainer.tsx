import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #f8f9fa;
`;

interface TabContainerProps {
    children: React.ReactNode;
}

const TabContainer: React.FC<TabContainerProps> = ({ children }) => {
    return <Container>{children}</Container>;
};

export default TabContainer; 