import React from 'react';
import styled from 'styled-components';
import { fadeIn } from '../commonStyles';

export const ProfileContainer = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
`;

export const ProfileImage = styled.div<{ 
    $imageUrl: string | null; 
    $size?: 'small' | 'medium' | 'large';
    $bordered?: boolean;
}>`
    width: ${props => {
        switch (props.$size) {
            case 'small': return '32px';
            case 'large': return '80px';
            default: return '50px';
        }
    }};
    height: ${props => {
        switch (props.$size) {
            case 'small': return '32px';
            case 'large': return '80px';
            default: return '50px';
        }
    }};
    border-radius: 50%;
    background: ${props => 
        props.$imageUrl 
            ? `url(${props.$imageUrl}) center/cover` 
            : '#e0e0e0'
    };
    border: ${props => props.$bordered ? '3px solid #fff' : 'none'};
    box-shadow: ${props => props.$bordered ? '0 2px 8px rgba(0,0,0,0.15)' : 'none'};
    animation: ${fadeIn} 0.3s ease-out;
`;

export const ProfileInitial = styled.div<{ 
    $size?: 'small' | 'medium' | 'large';
    $backgroundColor?: string;
}>`
    width: ${props => {
        switch (props.$size) {
            case 'small': return '32px';
            case 'large': return '80px';
            default: return '50px';
        }
    }};
    height: ${props => {
        switch (props.$size) {
            case 'small': return '32px';
            case 'large': return '80px';
            default: return '50px';
        }
    }};
    border-radius: 50%;
    background: ${props => props.$backgroundColor || '#007bff'};
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: ${props => {
        switch (props.$size) {
            case 'small': return '0.75rem';
            case 'large': return '1.5rem';
            default: return '1rem';
        }
    }};
    text-transform: uppercase;
    animation: ${fadeIn} 0.3s ease-out;
`;

export const StatusIndicator = styled.div<{ 
    $isOnline: boolean; 
    $size?: 'small' | 'medium' | 'large' 
}>`
    position: absolute;
    bottom: ${props => {
        switch (props.$size) {
            case 'small': return '2px';
            case 'large': return '6px';
            default: return '4px';
        }
    }};
    right: ${props => {
        switch (props.$size) {
            case 'small': return '2px';
            case 'large': return '6px';
            default: return '4px';
        }
    }};
    width: ${props => {
        switch (props.$size) {
            case 'small': return '8px';
            case 'large': return '16px';
            default: return '12px';
        }
    }};
    height: ${props => {
        switch (props.$size) {
            case 'small': return '8px';
            case 'large': return '16px';
            default: return '12px';
        }
    }};
    border-radius: 50%;
    background-color: ${props => props.$isOnline ? '#28a745' : '#6c757d'};
    border: 2px solid white;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
`;

interface ProfileAvatarProps {
    imageUrl?: string | null;
    name: string;
    isOnline?: boolean;
    size?: 'small' | 'medium' | 'large';
    showStatus?: boolean;
    bordered?: boolean;
    backgroundColor?: string;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
    imageUrl,
    name,
    isOnline = false,
    size = 'medium',
    showStatus = false,
    bordered = false,
    backgroundColor
}) => {
    const initial = name ? name.charAt(0).toUpperCase() : '?';

    return (
        <ProfileContainer>
            {imageUrl ? (
                <ProfileImage 
                    $imageUrl={imageUrl} 
                    $size={size} 
                    $bordered={bordered}
                />
            ) : (
                <ProfileInitial 
                    $size={size} 
                    $backgroundColor={backgroundColor}
                >
                    {initial}
                </ProfileInitial>
            )}
            {showStatus && (
                <StatusIndicator $isOnline={isOnline} $size={size} />
            )}
        </ProfileContainer>
    );
}; 