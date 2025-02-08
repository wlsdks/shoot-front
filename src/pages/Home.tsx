// src/pages/Home.tsx
import React, { useEffect } from "react";
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
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
    const navigate = useNavigate();

    useEffect(() => {
        // 이미 로그인 상태라면 메인 화면 대신 /friends 바로 이동
        if (isAuthenticated) {
            navigate("/");
        }
    }, [isAuthenticated, navigate]);
    
    if (isAuthenticated) {
        // 로그인된 경우 위에서 /friends 이동 중
        return null;
    }

    // 비로그인 사용자가 "/"로 들어온 경우 간단 안내
    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h1>안녕하세요, Shoot 채팅 서비스입니다!</h1>
            <p>로그인 후 다양한 기능을 사용할 수 있습니다.</p>
        </div>
    );
};

export default Home;
