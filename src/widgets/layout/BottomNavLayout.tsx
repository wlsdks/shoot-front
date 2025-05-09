import React, { useEffect, useState } from "react";
import styled from "styled-components";
import FriendTab from "../../widgets/tabs/FriendsTab";      // 위에서 완성한 친구 탭
import SocialTab from "../../widgets/tabs/SocialTab";       // 소셜 탭
import ChatTab from "../../widgets/tabs/ChatRoomListTab";   // 채팅방 목록 탭
import SettingsTab from "../../widgets/tabs/SettingsTab";   // 설정 탭 (EditProfile 포함)

const Container = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;  /* 화면을 꽉 채우는 구조 */
    background-color: #ffffff;  /* 배경색 */
`;

const MobileScreen = styled.div`
    width: 375px;
    height: 667px;
    background-color: #fff;
    border-radius: 30px;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 2px solid #ddd;
    position: relative;
`;

const ContentArea = styled.div`
    flex: 1;
    overflow-y: auto;
    position: relative;
`;

const BottomNav = styled.div`
    display: flex;
    background: #fff;
    border-top: 1px solid #ddd;
    height: 60px; /* 하단 네비게이션 높이 고정 */
`;

const NavButton = styled.button<{ $active: boolean }>`
    flex: 1;
    padding: 0.75rem 0;
    background: ${(props) => (props.$active ? "#f2f2f2" : "#fff")};
    border: none;
    border-bottom: ${(props) =>
        props.$active ? "3px solid #007bff" : "3px solid transparent"};
    color: ${(props) => (props.$active ? "#007bff" : "#333")};
    font-weight: ${(props) => (props.$active ? "600" : "400")};
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
`;

const IconWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
`;

const ButtonLabel = styled.span`
    font-size: 0.75rem;
`;

const BottomNavLayout: React.FC = () => {
    // 초기 activeTab을 로컬 스토리지에서 가져오거나 기본값 0으로 설정
    const [activeTab, setActiveTab] = useState<number>(() => {
        const savedTab = localStorage.getItem("activeTab");
        return savedTab ? parseInt(savedTab) : 0;
    });

    // activeTab이 변경될 때마다 로컬 스토리지에 저장
    useEffect(() => {
        localStorage.setItem("activeTab", activeTab.toString());
    }, [activeTab]);

    // 브라우저 뒤로가기/앞으로가기 처리
    useEffect(() => {
        const handlePopState = () => {
            const savedTab = localStorage.getItem("activeTab");
            if (savedTab) {
                setActiveTab(parseInt(savedTab));
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

    return (
        <Container>
            <MobileScreen>
                <ContentArea>
                    {activeTab === 0 && <FriendTab />}
                    {activeTab === 1 && <SocialTab />}
                    {activeTab === 2 && <ChatTab />}
                    {activeTab === 3 && <SettingsTab />}
                </ContentArea>
                <BottomNav>
                    <NavButton $active={activeTab === 0} onClick={() => setActiveTab(0)}>
                        <IconWrapper>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                        </IconWrapper>
                        <ButtonLabel>친구</ButtonLabel>
                    </NavButton>
                    <NavButton $active={activeTab === 1} onClick={() => setActiveTab(1)}>
                        <IconWrapper>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                            </svg>
                        </IconWrapper>
                        <ButtonLabel>소셜</ButtonLabel>
                    </NavButton>
                    <NavButton $active={activeTab === 2} onClick={() => setActiveTab(2)}>
                        <IconWrapper>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                        </IconWrapper>
                        <ButtonLabel>채팅</ButtonLabel>
                    </NavButton>
                    <NavButton $active={activeTab === 3} onClick={() => setActiveTab(3)}>
                        <IconWrapper>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="3"></circle>
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                            </svg>
                        </IconWrapper>
                        <ButtonLabel>설정</ButtonLabel>
                    </NavButton>
                </BottomNav>
            </MobileScreen>
        </Container>
    );
};

export default BottomNavLayout;