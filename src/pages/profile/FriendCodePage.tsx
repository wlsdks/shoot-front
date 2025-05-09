import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { createMyCode, sendFriendRequestByCode, findUserByCode } from "../../shared/api/userCode";
import { useAuth } from "../../shared/lib/context/AuthContext";
import { useMutation, useQuery } from "@tanstack/react-query";

interface FriendCodePageProps {
    onClose: () => void;
}

interface SearchedUser {
    nickname?: string;
    username: string;
    userCode?: string;
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

    // 사용자 검색 쿼리
    const { data: searchedUser, isLoading: isSearching, refetch: searchUser } = useQuery<SearchedUser | null>({
        queryKey: ['userByCode', code],
        queryFn: async () => {
            const response = await findUserByCode(code);
            return response.data;
        },
        enabled: false, // 수동으로 실행되도록 설정
    });

    // 검색 결과 처리
    React.useEffect(() => {
        if (searchedUser === undefined) return;
        if (!searchedUser) {
            setMessage("검색된 유저가 없습니다.");
            setIsError(true);
        } else {
            setMessage("유저를 찾았습니다.");
            setIsError(false);
        }
    }, [searchedUser]);

    // 코드 등록/수정 mutation
    const registerCodeMutation = useMutation({
        mutationFn: async () => {
            if (!user) throw new Error("로그인 후 이용하세요.");
            return createMyCode(user.id, code);
        },
        onSuccess: () => {
            setMessage("코드 등록/수정 성공!");
            setIsError(false);
        },
        onError: (error: any) => {
            setMessage(error.message || "코드 등록 실패");
            setIsError(true);
        }
    });

    // 친구 요청 mutation
    const sendRequestMutation = useMutation({
        mutationFn: async () => {
            if (!user) throw new Error("로그인 후 이용하세요.");
            const response = await sendFriendRequestByCode(user.id, code);
            return response.data;
        },
        onSuccess: (data) => {
            setMessage(`친구 요청 성공: ${data}`);
            setIsError(false);
        },
        onError: () => {
            setMessage("친구 요청에 실패했습니다.");
            setIsError(true);
        }
    });

    // 검색 핸들러
    const handleSearch = () => {
        setMessage(null);
        setIsError(false);
        searchUser();
    };

    // 코드 등록/수정 핸들러
    const handleRegisterCode = () => {
        registerCodeMutation.mutate();
    };

    // 친구 신청 핸들러
    const handleSendRequest = () => {
        sendRequestMutation.mutate();
    };

    return (
        <Container>
            <CloseButton onClick={onClose}>&times;</CloseButton>
            <Title>코드로 친구 찾기 / 코드 등록</Title>
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
                    onClick={handleRegisterCode}
                    disabled={registerCodeMutation.isPending}
                >
                    {registerCodeMutation.isPending ? "처리중..." : "코드 등록/수정"}
                </Button>
                <Button 
                    onClick={handleSearch}
                    disabled={isSearching}
                >
                    {isSearching ? "검색중..." : "검색"}
                </Button>
                {searchedUser && (
                    <Button 
                        onClick={handleSendRequest}
                        disabled={sendRequestMutation.isPending}
                    >
                        {sendRequestMutation.isPending ? "처리중..." : "친구 신청"}
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