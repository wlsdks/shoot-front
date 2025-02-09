import React, { useState } from "react";
import styled from "styled-components";
import { createMyCode, sendFriendRequestByCode, findUserByCode } from "../services/friendCodeApi";
import { useAuth } from "../context/AuthContext";

const Container = styled.div`
  padding: 1rem;
  max-width: 375px;
  margin: 0 auto;
  box-sizing: border-box;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  font-size: 1rem;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  background: #007bff;
  color: #fff;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  font-size: 1rem;
  margin-right: 0.5rem;
`;

const Message = styled.p`
  color: green;
  font-weight: bold;
  margin-top: 1rem;
`;

const UserInfo = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #f9f9f9;
`;

const FriendCodePage: React.FC = () => {
  const { user } = useAuth(); // 실제 로그인한 사용자 정보 (user.id가 올바른 ObjectId 문자열이어야 함)
  const [code, setCode] = useState("");
  const [searchedUser, setSearchedUser] = useState<any>(null);
  const [message, setMessage] = useState<string | null>(null);

  // "검색" 버튼 클릭: 입력된 코드로 사용자 조회
  const handleSearch = async () => {
    try {
      setSearchedUser(null);
      setMessage(null);
      const response = await findUserByCode(code);
      // 만약 대상 사용자가 없으면 response.data는 null이 됨
      if (!response.data) {
        setMessage("검색된 유저가 없습니다.");
      } else {
        setSearchedUser(response.data);
        setMessage("유저를 찾았습니다.");
      }
    } catch (error: any) {
      setMessage("검색 중 오류가 발생했습니다.");
    }
  };

  // "코드 등록/수정" 버튼 클릭: 본인의 코드를 등록/수정
  const handleRegisterCode = async () => {
    if (!user) {
      setMessage("로그인 후 이용하세요.");
      return;
    }
    try {
    await createMyCode(user.id, code);
      setMessage("코드 등록/수정 성공!");
    } catch (error) {
      setMessage("코드 등록 실패");
    }
  };

  // "친구 신청" 버튼 클릭: 조회된 대상에게 친구 요청
  const handleSendRequest = async () => {
    if (!user) {
      setMessage("로그인 후 이용하세요.");
      return;
    }
    try {
      const response = await sendFriendRequestByCode(user.id, code);
      setMessage(`친구 요청 성공: ${response.data}`);
    } catch (error) {
      setMessage("친구 요청에 실패했습니다.");
    }
  };

  return (
    <Container>
      <h2>코드로 친구 찾기 / 코드 등록</h2>
      <FormGroup>
        <Label>코드 입력:</Label>
        <Input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="사용자 코드를 입력하세요"
        />
      </FormGroup>
      <FormGroup>
        <Button onClick={handleRegisterCode}>코드 등록/수정</Button>
        <Button onClick={handleSearch}>검색</Button>
        {searchedUser && <Button onClick={handleSendRequest}>친구 신청</Button>}
      </FormGroup>
      {searchedUser && (
        <UserInfo>
          <p>
            <strong>{searchedUser.nickname || searchedUser.username}</strong>
          </p>
          <p>Username: {searchedUser.username}</p>
          {searchedUser.userCode && <p>코드: {searchedUser.userCode}</p>}
        </UserInfo>
      )}
      {message && <Message>{message}</Message>}
    </Container>
  );
};

export default FriendCodePage;