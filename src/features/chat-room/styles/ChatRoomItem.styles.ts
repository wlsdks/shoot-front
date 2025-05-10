import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const RoomItem = styled(Link)`
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #eee;
    text-decoration: none;
    color: inherit;
    background-color: #ffffff;
    transition: background-color 0.2s;

    &:hover {
        background-color: #f8f9fa;
    }
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

export const SenderName = styled.div`
    font-size: 0.75rem;
    color: #666;
    font-weight: 600;
    margin-bottom: 0.15rem;
`;

export const LastMessage = styled.div`
    font-size: 0.9rem;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

export const RightContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.25rem;
`;

export const Timestamp = styled.div`
    font-size: 0.75rem;
    color: #666;
`;

export const UnreadBadge = styled.div`
    background-color: #007bff;
    color: white;
    font-size: 0.75rem;
    padding: 0.2rem 0.5rem;
    border-radius: 1rem;
    min-width: 1.5rem;
    text-align: center;
    font-weight: 600;
`;

export const ProfileImage = styled.img`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    margin-right: 1rem;
`;

export const ProfileInitial = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #007bff;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 1.2rem;
    margin-right: 1rem;
`; 