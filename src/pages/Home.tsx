// src/pages/Home.tsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

// 전체 화면 가운데 정렬 배경 (채팅방과 유사하게)
const OuterWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 60px); /* 상단 네비게이션 높이를 뺀 화면 높이 등으로 조정 가능 */
    background: #f7f7f7;
`;

// 홈 컨테이너: 채팅방과 비슷하게 고정 높이, 테두리, 그림자 적용
const HomeContainer = styled.div`
    width: 500px;
    height: 600px;
    display: flex;
    flex-direction: column;
    justify-content: center;   /* 수직 가운데 정렬 */
    align-items: center;       /* 수평 가운데 정렬 */
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    padding: 2rem;
`;

const Title = styled.h1`
    font-size: 2.5rem;
    margin-bottom: 1rem;
    color: #333;
`;

const SubTitle = styled.p`
    font-size: 1.2rem;
    color: #666;
    margin-bottom: 2rem;
    text-align: center;
    max-width: 80%;
`;

const ButtonWrapper = styled.div`
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 1.5rem;
`;

const StyledLink = styled(Link)`
    display: inline-block;
    padding: 0.8rem 1.5rem;
    background: #007bff;
    color: #fff;
    border-radius: 4px;
    text-decoration: none;
    font-size: 1rem;
    &:hover {
        background: #0056b3;
    }
`;

const Home: React.FC = () => {
    const { isAuthenticated } = useAuth();

    return (
        <OuterWrapper>
            <HomeContainer>
                <Title>SHOOT 채팅</Title>
                <SubTitle>
                    모던한 채팅 애플리케이션에 오신 것을 환영합니다!<br />
                    지금 로그인하여 다양한 채팅을 즐겨보세요.
                </SubTitle>
                {isAuthenticated ? (
                    // 로그인 상태라면 '채팅방' 버튼만 보이게
                    <ButtonWrapper>
                        <StyledLink to="/chatrooms">채팅방 목록으로 가기</StyledLink>
                    </ButtonWrapper>
                ) : (
                    // 비로그인 상태라면 '로그인/회원가입' 버튼 표시
                    <ButtonWrapper>
                        <StyledLink to="/login">로그인</StyledLink>
                        <StyledLink to="/signup">회원가입</StyledLink>
                    </ButtonWrapper>
                )}
            </HomeContainer>
        </OuterWrapper>
    );
};

export default Home;
