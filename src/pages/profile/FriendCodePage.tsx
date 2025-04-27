import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { createMyCode, sendFriendRequestByCode, findUserByCode } from "../../services/userCode";
import { useAuth } from "../../context/AuthContext";

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

const Message = styled.p`
    text-align: center;
    color: green;
    font-size: 16px;
    font-weight: bold;
    margin-top: 16px;
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
    const { user } = useAuth(); // AuthContext를 통해 로그인한 사용자 정보 사용
    const [code, setCode] = useState("");
    const [searchedUser, setSearchedUser] = useState<any>(null);
    const [message, setMessage] = useState<string | null>(null);

    // "검색" 버튼 클릭 시: 입력된 코드로 대상 사용자를 조회
    const handleSearch = async () => {
        try {
            setSearchedUser(null);
            setMessage(null);
            const response = await findUserByCode(code);
            // 대상 사용자가 없으면 response.data가 null로 반환됨
            if (!response.data) {
                setMessage("검색된 유저가 없습니다.");
            } else {
                setSearchedUser(response.data);
                setMessage("유저를 찾았습니다.");
            }
        } catch (error: any) {
            console.error(error);
            setMessage("검색 중 오류가 발생했습니다.");
        }
    };

    // "코드 등록/수정" 버튼 클릭 시: 본인의 코드를 등록/수정
    const handleRegisterCode = async () => {
        if (!user) {
            setMessage("로그인 후 이용하세요.");
            return;
        }
        try {
            await createMyCode(user.id, code);
            setMessage("코드 등록/수정 성공!");
        } catch (error) {
            console.error(error);
            setMessage("코드 등록 실패");
        }
    };

    // "친구 신청" 버튼 클릭 시: 조회된 대상에게 친구 요청
    const handleSendRequest = async () => {
        if (!user) {
            setMessage("로그인 후 이용하세요.");
            return;
        }
        try {
            const response = await sendFriendRequestByCode(user.id, code);
            setMessage(`친구 요청 성공: ${response.data}`);
        } catch (error) {
            console.error(error);
            setMessage("친구 요청에 실패했습니다.");
        }
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
                <Button onClick={handleRegisterCode}>코드 등록/수정</Button>
                <Button onClick={handleSearch}>검색</Button>
                {searchedUser && <Button onClick={handleSendRequest}>친구 신청</Button>}
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
            {message && <Message>{message}</Message>}
        </Container>
    );
};

export default FriendCodePage;