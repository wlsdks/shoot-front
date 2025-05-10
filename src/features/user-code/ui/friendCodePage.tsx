import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { useAuth } from "../../../shared/lib/context/AuthContext";
import { useUserCode } from "../model/useUserCode";
import { UserCode } from "../types";

interface FriendCodePageProps {
    onClose: () => void;
}

// 슬라이드 다운 애니메이션 정의
const slideDown = keyframes`
    from {
        transform: translateY(-20px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
`;

// 단일 카드 컨테이너 (부모 컨테이너의 100% 폭에 맞게)
const Container = styled.div`
    background: #fff;
    width: 100%;
    padding: 16px;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    box-sizing: border-box;
    margin-bottom: 16px;
    animation: ${slideDown} 0.3s ease-out;
    position: relative;
`;

const Title = styled.h2`
    text-align: center;
    font-size: 20px;
    margin-bottom: 24px;
    color: #333;
`;

const FormGroup = styled.div`
    margin-bottom: 16px;
`;

const Label = styled.label`
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    color: #555;
    font-weight: bold;
`;

const Input = styled.input`
    width: 100%;
    padding: 12px;
    font-size: 16px;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-sizing: border-box;
    transition: border 0.2s ease;
    &:focus {
        outline: none;
        border-color: #007bff;
    }
`;

const ButtonRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 8px;
`;

const Button = styled.button`
    flex: 1;
    padding: 12px;
    background: #007bff;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
    transition: background 0.2s;
    &:hover {
        background: #0056b3;
    }
    &:disabled {
        background: #ccc;
        cursor: not-allowed;
    }
`;

const UserInfoCard = styled.div`
    background: #f9f9f9;
    border-radius: 12px;
    padding: 16px;
    margin-top: 16px;
    border: 1px solid #eee;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
    p {
        margin: 4px 0;
        font-size: 16px;
        color: #333;
    }
`;

const Message = styled.p<{ $isError?: boolean }>`
    text-align: center;
    color: ${props => props.$isError ? '#e53935' : '#2e7d32'};
    font-size: 16px;
    font-weight: bold;
    margin-top: 16px;
    background-color: ${props => props.$isError ? '#ffebee' : '#e8f5e9'};
    padding: 0.6rem;
    border-radius: 4px;
    border-left: 3px solid ${props => props.$isError ? '#e53935' : '#2e7d32'};
`;

const CloseButton = styled.button`
    position: absolute;
    top: 16px;
    right: 16px;
    background: none;
    border: none;
    color: #666;
    cursor: pointer;
    padding: 4px;
    font-size: 1.2rem;
    
    &:hover {
        color: #333;
    }
`;

const FriendCodePage: React.FC<FriendCodePageProps> = ({ onClose }) => {
    const { user } = useAuth();
    const [code, setCode] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [isError, setIsError] = useState(false);
    const [searchedUser, setSearchedUser] = useState<UserCode | null>(null);

    const {
        findUser,
        sendFriendRequest,
        isFindingUser,
        isSendingRequest
    } = useUserCode(user?.id || 0);

    // 검색 핸들러
    const handleSearch = () => {
        setMessage(null);
        setIsError(false);
        findUser(code, {
            onSuccess: (response) => {
                if (response.success) {
                    if (response.data) {
                        setSearchedUser(response.data);
                        setMessage("유저를 찾았습니다.");
                        setIsError(false);
                    } else {
                        setMessage(response.message || "해당 코드의 사용자가 없습니다.");
                        setIsError(true);
                        setSearchedUser(null);
                    }
                } else {
                    setMessage(response.message || "검색 중 오류가 발생했습니다.");
                    setIsError(true);
                    setSearchedUser(null);
                }
            },
            onError: () => {
                setMessage("검색 중 오류가 발생했습니다.");
                setIsError(true);
                setSearchedUser(null);
            }
        });
    };

    // 친구 요청 보내기
    const handleSendRequest = () => {
        if (!searchedUser || !searchedUser.userCode) return;
        sendFriendRequest(searchedUser.userCode, {
            onSuccess: () => {
                setMessage("친구 요청을 보냈습니다.");
                setIsError(false);
                setSearchedUser(null);
            },
            onError: () => {
                setMessage("친구 요청 전송에 실패했습니다.");
                setIsError(true);
            }
        });
    };

    return (
        <Container>
            <CloseButton onClick={onClose}>&times;</CloseButton>
            <Title>코드로 친구 찾기</Title>
            <FormGroup>
                <Label>코드 입력</Label>
                <Input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="사용자 코드를 입력하세요"
                />
            </FormGroup>
            <ButtonRow>
                <Button 
                    onClick={handleSearch}
                    disabled={isFindingUser}
                >
                    {isFindingUser ? "검색중..." : "검색"}
                </Button>
                {searchedUser && (
                    <Button 
                        onClick={handleSendRequest}
                        disabled={isSendingRequest}
                    >
                        {isSendingRequest ? "처리중..." : "친구 신청"}
                    </Button>
                )}
            </ButtonRow>
            {searchedUser && (
                <UserInfoCard>
                    <p>
                        <strong>{searchedUser.nickname || searchedUser.username}</strong>
                    </p>
                    <p>Username: {searchedUser.username}</p>
                    {searchedUser.userCode && <p>코드: {searchedUser.userCode}</p>}
                </UserInfoCard>
            )}
            {message && <Message $isError={isError}>{message}</Message>}
        </Container>
    );
};

export default FriendCodePage;