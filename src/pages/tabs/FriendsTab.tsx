import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useAuth } from "../../context/AuthContext";
import { getFriends } from "../../services/friendApi";
import FriendSearch from "../FriendSearch";
import FriendCodePage from "../FriendCodePage";

// FriendTab 컨테이너 (ContentArea에 채워질 카드)
const TabContainer = styled.div`
    padding: 16px;
`;

// 헤더 영역: 제목과 버튼 그룹
const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
`;

// 제목 스타일
const Title = styled.h2`
    font-size: 20px;
    font-weight: 600;
    color: #333;
    margin: 0;
`;

// 버튼 그룹
const ButtonGroup = styled.div`
    display: flex;
    gap: 8px;
`;

// 아이콘 버튼 (검색 토글)
const IconButton = styled.button`
    background: transparent;
    border: none;
    font-size: 24px;
    color: #007bff;
    cursor: pointer;
`;

// 텍스트 버튼 (코드 등록/찾기)
const TextButton = styled.button`
    background: transparent;
    border: none;
    font-size: 14px;
    color: #007bff;
    cursor: pointer;
`;

// 친구 목록 (카드 스타일)
const FriendList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
`;

const FriendItem = styled.li`
    padding: 12px;
    background: #f9f9f9;
    border-radius: 12px;
    margin-bottom: 12px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    font-size: 16px;
    color: #333;
    transition: transform 0.2s, box-shadow 0.2s;
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
`;

const FriendTab: React.FC = () => {
    const { user } = useAuth();
    const [friends, setFriends] = useState<string[]>([]);
    const [showSearch, setShowSearch] = useState<boolean>(false);
    const [showCode, setShowCode] = useState<boolean>(false);

    const fetchFriends = async () => {
        if (!user) return;
        try {
            const response = await getFriends(user.id);
            setFriends(response.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (user?.id) {
            fetchFriends();
        }
    }, [user]);

    return (
        <TabContainer>
            <Header>
                <Title>내 친구 목록</Title>
                <ButtonGroup>
                    <IconButton onClick={() => setShowSearch((prev) => !prev)}>
                        {showSearch ? "✖" : "🔍"}
                    </IconButton>
                    <TextButton onClick={() => setShowCode((prev) => !prev)}>
                        코드 등록/찾기
                    </TextButton>
                </ButtonGroup>
            </Header>
            {showSearch && <FriendSearch />}
            {showCode && <FriendCodePage />}
            {friends.length === 0 ? (
                <p style={{ textAlign: "center", color: "#888", fontSize: "16px" }}>
                친구가 없습니다.
                </p>
            ) : (
                <FriendList>
                {friends.map((friend) => (
                    <FriendItem key={friend}>{friend}</FriendItem>
                ))}
                </FriendList>
            )}
        </TabContainer>
    );
};

export default FriendTab;