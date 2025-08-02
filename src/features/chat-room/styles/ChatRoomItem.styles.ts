import styled from 'styled-components';
import { itemContainer, fadeIn } from '../../../shared/ui/commonStyles';

export const RoomItemContainer = styled.div`
    ${itemContainer}
    display: flex;
    align-items: center;
    padding: 0.85rem;
    position: relative;
    animation: ${fadeIn} 0.3s ease-out;
`;

export const ProfileContainer = styled.div`
    position: relative;
    margin-right: 1rem;
`;

export const ProfileImage = styled.img`
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #e1ecff;
    background-color: #f0f5ff;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
`;

export const ProfileInitial = styled.div`
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: linear-gradient(135deg, #4a6cf7, #2a4cdf);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 1.3rem;
    border: 2px solid #e1ecff;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
`;

export const RoomDetails = styled.div`
    flex: 1;
    min-width: 0;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
`;

export const LeftContainer = styled.div`
    flex: 1;
    min-width: 0;
    margin-right: 0.5rem;
`;

export const RoomTitle = styled.div`
    font-size: 0.95rem;
    color: #333;
    font-weight: 600;
    margin-bottom: 0.3rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

export const LastMessage = styled.div`
    font-size: 0.8rem;
    color: #666;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 250px;
`;

export const RightContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.35rem;
`;

export const Timestamp = styled.div`
    font-size: 0.7rem;
    color: #888;
`;

export const UnreadBadge = styled.div`
    background-color: #007bff;
    color: white;
    font-size: 0.7rem;
    padding: 0.2rem 0.5rem;
    border-radius: 10px;
    min-width: 1.5rem;
    text-align: center;
    font-weight: 600;
    box-shadow: 0 2px 4px rgba(0, 123, 255, 0.2);
`;

export const PinIndicator = styled.div`
    position: absolute;
    top: -5px;
    right: -5px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background-color: #4a6cf7;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`; 