// src/widgets/layout/BottomNavLayout.tsx
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { fadeIn } from "../../shared/ui/commonStyles";

const Container = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f8fafc;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
`;

const MobileScreen = styled.div`
    width: 375px;
    height: 667px;
    background-color: #fff;
    border-radius: 30px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1.5px solid #eaeaea;
    position: relative;
    animation: ${fadeIn} 0.5s ease-out;
`;

const ContentArea = styled.div`
    flex: 1;
    overflow-y: auto;
    position: relative;
    background-color: #f8fafc;
    
    &::-webkit-scrollbar {
        width: 4px;
    }
    
    &::-webkit-scrollbar-thumb {
        background: #ddd;
        border-radius: 4px;
    }
    
    &::-webkit-scrollbar-track {
        background: transparent;
    }
`;

const BottomNav = styled.div`
    display: flex;
    background: #fff;
    border-top: 1px solid #eaeaea;
    height: 64px;
    padding: 0.3rem 0.5rem;
`;

const NavButton = styled.button<{ $active: boolean }>`
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    background: ${(props) => (props.$active ? "#f0f7ff" : "transparent")};
    border: none;
    border-radius: 12px;
    color: ${(props) => (props.$active ? "#007bff" : "#94a3b8")};
    font-weight: ${(props) => (props.$active ? "600" : "400")};
    cursor: pointer;
    padding: 0.5rem 0;
    transition: all 0.3s ease;
    margin: 0 0.25rem;
    
    &:hover {
        background: ${(props) => props.$active ? "#e1eeff" : "#f8fafc"};
        transform: translateY(-2px);
    }
`;

const IconWrapper = styled.div<{ $active: boolean }>`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 24px;
    height: 24px;
    transition: all 0.3s ease;
    
    svg {
        width: 24px;
        height: 24px;
        stroke-width: ${props => props.$active ? '2.2px' : '1.8px'};
        transition: all 0.3s ease;
    }
`;

const ButtonLabel = styled.span`
    font-size: 0.7rem;
    transition: all 0.3s ease;
`;

interface TabComponent {
    component: React.ComponentType<any>;
    label: string;
    icon: React.ReactNode;
}

interface BottomNavLayoutProps {
    tabs: TabComponent[];
}

const BottomNavLayout: React.FC<BottomNavLayoutProps> = ({ tabs }) => {
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
                    {tabs[activeTab] && React.createElement(tabs[activeTab].component)}
                </ContentArea>
                <BottomNav>
                    {tabs.map((tab, index) => (
                        <NavButton 
                            key={index} 
                            $active={activeTab === index} 
                            onClick={() => setActiveTab(index)}
                        >
                            <IconWrapper $active={activeTab === index}>
                                {tab.icon}
                            </IconWrapper>
                            <ButtonLabel>{tab.label}</ButtonLabel>
                        </NavButton>
                    ))}
                </BottomNav>
            </MobileScreen>
        </Container>
    );
};

export default BottomNavLayout;