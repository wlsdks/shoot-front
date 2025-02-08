import React, { useState } from "react";
import styled from "styled-components";
import FriendTab from "./tabs/FriendsTab";  // 친구 탭
import SocialTab from "./tabs/SocialTab";  // 소셜 탭
import ChatTab from "./tabs/ChatTab";      // 채팅 탭
import SettingsTab from "./tabs/SettingsTab"; // 설정 탭

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;  /* 화면을 꽉 채우는 구조 */
  background-color: #f5f5f5;  /* 배경색 */
`;

const MobileScreen = styled.div`
  width: 375px;  /* 일반적인 모바일 화면 너비 (아이폰X 기준) */
  height: 667px; /* 일반적인 모바일 화면 높이 (아이폰X 기준) */
  background-color: #fff;
  border-radius: 30px;  /* 둥근 모서리 */
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 2px solid #ddd;  /* 회색 테두리 */
`;

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 10px;
  overflow-y: auto;  /* 스크롤 가능 */
`;

const TabBar = styled.div`
  display: flex;
  background-color: #fff;
  border-top: 1px solid #ddd;
`;

const TabButton = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 1rem;
  background: ${(props) => (props.active ? "#f2f2f2" : "#fff")};
  border: none;
  border-bottom: ${(props) => (props.active ? "3px solid #007bff" : "3px solid transparent")};
  color: ${(props) => (props.active ? "#007bff" : "#333")};
  font-weight: ${(props) => (props.active ? "600" : "400")};
  cursor: pointer;
  &:hover {
    background-color: #f9f9f9;
  }
`;

const BottomNav = styled.div`
  display: flex;
  background: #fff;
  border-top: 1px solid #ddd;
`;

const NavButton = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 1rem;
  background: ${(props) => (props.active ? "#f2f2f2" : "#fff")};
  border: none;
  border-bottom: ${(props) => (props.active ? "3px solid #007bff" : "3px solid transparent")};
  color: ${(props) => (props.active ? "#007bff" : "#333")};
  font-weight: ${(props) => (props.active ? "600" : "400")};
  cursor: pointer;
`;

const BottomNavLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0); // 0: 친구, 1: 소셜, 2: 채팅, 3: 설정

  // 하단 네비게이션 버튼 클릭 시 탭 변경
  const handleTabChange = (index: number) => {
    setActiveTab(index);
  };

  return (
    <Container>
      <MobileScreen>
        <ContentArea>
          {/* 탭별 페이지 렌더링 */}
          {activeTab === 0 && <FriendTab />}
          {activeTab === 1 && <SocialTab />}
          {activeTab === 2 && <ChatTab />}
          {activeTab === 3 && <SettingsTab />}
        </ContentArea>

        {/* 하단 네비게이션 */}
        <BottomNav>
          <NavButton active={activeTab === 0} onClick={() => handleTabChange(0)}>친구</NavButton>
          <NavButton active={activeTab === 1} onClick={() => handleTabChange(1)}>소셜</NavButton>
          <NavButton active={activeTab === 2} onClick={() => handleTabChange(2)}>채팅</NavButton>
          <NavButton active={activeTab === 3} onClick={() => handleTabChange(3)}>설정</NavButton>
        </BottomNav>
      </MobileScreen>
    </Container>
  );
};

export default BottomNavLayout;
