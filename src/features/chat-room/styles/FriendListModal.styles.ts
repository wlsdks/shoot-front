import styled from 'styled-components';

export const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

export const ModalContent = styled.div`
    background: white;
    padding: 20px;
    border-radius: 12px;
    width: 90%;
    max-width: 320px;
    max-height: 60vh;
    overflow-y: auto;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

export const Title = styled.h3`
    margin: 0 0 15px 0;
    font-size: 1.1rem;
    color: #333;
`;

export const FriendList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

export const FriendItem = styled.div`
    display: flex;
    align-items: center;
    padding: 10px;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
        background-color: #f5f5f5;
    }
`;

export const ProfileImage = styled.img`
    width: 36px;
    height: 36px;
    border-radius: 50%;
    margin-right: 10px;
    object-fit: cover;
`;

export const ProfileInitial = styled.div`
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: #007bff;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 1.1rem;
    margin-right: 10px;
`;

export const FriendInfo = styled.div`
    flex: 1;
`;

export const Username = styled.div`
    font-weight: 500;
    color: #333;
    font-size: 0.9rem;
`;

export const Nickname = styled.div`
    font-size: 0.8rem;
    color: #666;
`;

export const CloseButton = styled.button`
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #666;
    padding: 5px;

    &:hover {
        color: #333;
    }
`; 