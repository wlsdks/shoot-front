import React from 'react';
import styled from 'styled-components';
import Icon from '../common/Icon';
import { fadeIn, commonColors, commonShadows, commonBorderRadius } from '../../shared/ui/commonStyles';

const SettingItem = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    background-color: ${commonColors.white};
    margin-bottom: 0.75rem;
    border-radius: ${commonBorderRadius.large};
    box-shadow: ${commonShadows.small};
    cursor: pointer;
    transition: all 0.3s ease;
    animation: ${fadeIn} 0.3s ease-out;
    
    &:hover {
        transform: translateY(-3px);
        box-shadow: ${commonShadows.medium};
    }
    
    &:active {
        transform: translateY(-1px);
    }
`;

const SettingText = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
`;

const SettingTitle = styled.span`
    font-weight: 600;
    color: ${commonColors.dark};
    font-size: 1rem;
`;

const SettingDescription = styled.span`
    font-size: 0.85rem;
    color: ${commonColors.secondary};
    margin-top: 0.3rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const IconContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${commonColors.primary};
    margin-left: 1rem;
    flex-shrink: 0;
`;

interface SettingItemProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick: () => void;
}

const SettingItemComponent: React.FC<SettingItemProps> = ({
    title,
    description,
    icon,
    onClick,
}) => {
    return (
        <SettingItem onClick={onClick}>
            <SettingText>
                <SettingTitle>{title}</SettingTitle>
                <SettingDescription>{description}</SettingDescription>
            </SettingText>
            <IconContainer>
                <Icon size={24}>{icon}</Icon>
            </IconContainer>
        </SettingItem>
    );
};

export default SettingItemComponent; 