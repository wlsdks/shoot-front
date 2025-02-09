import React, { useState } from "react";
import styled from "styled-components";
import { createMyCode, sendFriendRequestByCode } from "../services/friendCodeApi";

const Container = styled.div`
    padding: 1rem;
`;

const FormGroup = styled.div`
    margin-bottom: 1rem;
`;

const Button = styled.button`
    padding: 0.5rem 1rem;
    background: #007bff;
    color: #fff;
    border: none;
    cursor: pointer;
    border-radius: 4px;
`;

const FriendCodePage: React.FC = () => {
    const [code, setCode] = useState("");
    const [result, setResult] = useState<string | null>(null);

    const handleRegisterCode = async () => {
        try {
            // 예시: 현재 사용자 id를 context나 props에서 가져온다고 가정
            const userId = "현재사용자ID";
            await createMyCode(userId, code);
            alert("코드 등록/수정 성공!");
        } catch (error) {
            alert("코드 등록 실패");
        }
    };

    const handleSearchByCode = async () => {
        try {
            // 친구 찾기 API 호출 (예: /friends/request/by-code)
            const userId = "현재사용자ID";
            const response = await sendFriendRequestByCode(userId, code);
            setResult(`친구 요청 성공: ${response.data}`);
        } catch (error) {
            setResult("친구 찾기 실패");
        }
    };

    return (
        <Container>
            <h2>코드로 친구 찾기 / 코드 등록</h2>
            <FormGroup>
                <label>코드 입력: </label>
                <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="사용자 코드를 입력하세요"
                />
            </FormGroup>
            <FormGroup>
                <Button onClick={handleRegisterCode}>코드 등록/수정</Button>
                <Button style={{ marginLeft: "1rem" }} onClick={handleSearchByCode}>
                    코드로 친구 찾기
                </Button>
            </FormGroup>
            {result && <p>{result}</p>}
        </Container>
    );
};

export default FriendCodePage;