import styled from 'styled-components';
import { itemContainer, fadeIn } from '../../../shared/ui/commonStyles';

export const SocialItemContainer = styled.div`
    ${itemContainer}
    display: flex;
    justify-content: space-between;
    align-items: center;
    animation: ${fadeIn} 0.3s ease-out;
`;

export const UserInfo = styled.div`
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
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

    ${SocialItemContainer}:hover & {
        transform: scale(1.1);
    }
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
    transition: all 0.3s ease;

    ${SocialItemContainer}:hover & {
        transform: scale(1.1);
    }
`;

export const FriendInfo = styled.div`
    display: flex;
    flex-direction: column;
    min-width: 0;
`;

export const FriendName = styled.span`
    font-weight: 600;
    color: #333;
    font-size: 0.95rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-bottom: 0.2rem;
    transition: color 0.3s ease;

    ${SocialItemContainer}:hover & {
        color: #007bff;
    }
`;

export const FriendStatus = styled.span`
    font-size: 0.8rem;
    color: #666;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

export const FriendUsername = styled.span`
    font-size: 0.75rem;
    color: #888;
    margin-top: 0.1rem;
`;

export const Actions = styled.div`
    display: flex;
    gap: 0.5rem;
    margin-left: 0.75rem;
`;

export const ActionButton = styled.button<{ $primary?: boolean; $danger?: boolean; disabled?: boolean }>`
    background: ${(props) => 
        props.disabled ? '#f1f3f5' :
        props.$primary ? '#007bff' : 
        props.$danger ? '#dc3545' : 'white'};
    color: ${(props) => 
        props.disabled ? '#adb5bd' :
        (props.$primary || props.$danger) ? '#ffffff' : '#333'};
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
    border: 1px solid ${(props) => 
        props.disabled ? '#e9ecef' :
        props.$primary ? '#007bff' : 
        props.$danger ? '#dc3545' : '#e0e0e0'};
    border-radius: 10px;
    cursor: ${(props) => props.disabled ? 'default' : 'pointer'};
    font-weight: 500;
    display: flex;
    align-items: center;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    
    &:hover {
        transform: ${props => props.disabled ? 'none' : 'translateY(-2px)'};
        box-shadow: ${props => props.disabled ? 'none' : '0 4px 8px rgba(0, 0, 0, 0.1)'};
        background: ${(props) => 
            props.disabled ? '#f1f3f5' :
            props.$primary ? '#0069d9' : 
            props.$danger ? '#c82333' : '#f8f9fa'};
    }
    
    &:active {
        transform: translateY(-1px);
    }
    
    svg {
        margin-right: 0.5rem;
        width: 14px;
        height: 14px;
    }
`; 