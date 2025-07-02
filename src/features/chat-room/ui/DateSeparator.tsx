import React from 'react';
import styled from 'styled-components';

const DateSeparatorContainer = styled.div`
    display: flex;
    align-items: center;
    margin: 20px 0;
    width: 100%;
`;

const DateLine = styled.div`
    flex: 1;
    height: 1px;
    background: #ddd;
`;

const DateText = styled.div`
    background: #f8f9fa;
    color: #666;
    font-size: 0.75rem;
    padding: 6px 12px;
    border-radius: 12px;
    margin: 0 10px;
    white-space: nowrap;
    border: 1px solid #e9ecef;
`;

interface DateSeparatorProps {
    date: string;
}

export const DateSeparator: React.FC<DateSeparatorProps> = ({ date }) => {
    const formatDateLabel = (dateString: string) => {
        const messageDate = new Date(dateString);
        
        const year = messageDate.getFullYear();
        const month = String(messageDate.getMonth() + 1).padStart(2, '0');
        const day = String(messageDate.getDate()).padStart(2, '0');
        
        const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
        const weekday = weekdays[messageDate.getDay()];
        
        return `${year}-${month}-${day} (${weekday})`;
    };

    return (
        <DateSeparatorContainer>
            <DateLine />
            <DateText>{formatDateLabel(date)}</DateText>
            <DateLine />
        </DateSeparatorContainer>
    );
}; 