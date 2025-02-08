import React from "react";
import styled from "styled-components";
import { useAuth } from "../../context/AuthContext";

// 스타일링
const Container = styled.div`
  padding: 1rem;
`;

const Title = styled.h2`
  font-size: 1.4rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
`;

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const ListItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background-color: #fff;
  margin-bottom: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #f1f1f1;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }
`;

const Button = styled.button`
  background-color: #007bff;
  color: white;
  font-size: 1rem;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #0056b3;
  }
`;

const SettingsTab: React.FC = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm("정말 로그아웃 하시겠습니까?")) {
      logout();
    }
  };

  return (
    <Container>
      <Title>설정</Title>
      <List>
        {/* 로그아웃 버튼 */}
        <ListItem onClick={handleLogout}>
          <span>로그아웃</span>
          <Button>로그아웃</Button>
        </ListItem>
        {/* 다른 설정 항목을 여기에 추가 가능 */}
      </List>
    </Container>
  );
};

export default SettingsTab;
