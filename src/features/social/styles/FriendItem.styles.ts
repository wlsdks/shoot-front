import styled from 'styled-components';
import { fadeIn } from '../../../shared/ui/commonStyles';

export const FriendItemContainer = styled.div`
    display: flex;
    align-items: center;
    padding: 0.85rem;
    background-color: white;
    border-radius: 14px;
    margin-bottom: 0.8rem;
    cursor: pointer;
    transition: all 0.3s ease;
    animation: ${fadeIn} 0.3s ease-out;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    position: relative;

    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
    }

    &:active {
        transform: translateY(-1px);
    }
`;

export const ProfileImageContainer = styled.div`
    width: 48px;
    height: 48px;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 0.75rem;
    background-color: #f0f5ff;
    flex-shrink: 0;
    border: 2px solid #e1ecff;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
    position: relative;
`;

export const ProfileImage = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
`;

export const ProfileInitial = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #4a6cf7, #2a4cdf);
    color: white;
    font-weight: 600;
    font-size: 1.2rem;
`;

export const StatusIndicator = styled.div<{ isOnline: boolean }>`
    position: absolute;
    bottom: 0;
    right: 0;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: ${props => props.isOnline ? '#4CAF50' : '#9e9e9e'};
    border: 2px solid white;
`;

export const UserInfo = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-width: 0;
`;

export const UserName = styled.div`
    font-weight: 600;
    font-size: 0.95rem;
    margin-bottom: 0.2rem;
    color: #333;
`;

export const UserStatus = styled.div`
    font-size: 0.8rem;
    color: #666;
    display: flex;
    align-items: center;
`;

export const Username = styled.span`
    font-size: 0.75rem;
    color: #888;
    margin-top: 0.1rem;
`;

export const ChatButton = styled.button`
    background: #f0f7ff;
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #007bff;
    cursor: pointer;
    transition: all 0.2s;
    flex-shrink: 0;
    
    &:hover {
        background: #007bff;
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 123, 255, 0.25);
    }
    
    &:active {
        transform: translateY(-1px);
    }
    
    svg {
        width: 20px;
        height: 20px;
    }
`; 