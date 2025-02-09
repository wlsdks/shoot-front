import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useAuth } from "../../context/AuthContext";
import { getFriends } from "../../services/friendApi"; // 친구 목록 API 호출 함수
import FriendSearch from "../FriendSearch";
import FriendCodePage from "../FriendCodePage";

const Container = styled.div`
    padding: 1rem;
    position: relative;
`;

const TopBar = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
`;

const SectionTitle = styled.h2`
    font-size: 1.1rem;
    margin: 0;
    padding-bottom: 4px;
    border-bottom: 1px solid #eee;
`;

const List = styled.ul`
    list-style: none;
    margin: 0;
    padding: 0;
`;

const ListItem = styled.li`
    padding: 0.5rem 0;
    border-bottom: 1px solid #f3f3f3;
    &:last-child {
        border-bottom: none;
    }
`;

const Button = styled.button`
    background: #007bff;
    border: none;
    color: #fff;
    border-radius: 4px;
    padding: 6px 10px;
    cursor: pointer;
    &:hover {
        background: #0056b3;
    }
`;

const SearchToggleButton = styled(Button)`
    background: transparent;
    color: #007bff;
    padding: 0;
    border: none;
    font-size: 1.2rem;
`;

const CodeToggleButton = styled(Button)`
    font-size: 1rem;
    margin-left: 1rem;
`;

const ModalOverlay = styled.div`
    position: fixed; 
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const ModalContent = styled.div`
    background: #fff;
    width: 90%;
    max-width: 400px;
    max-height: 90vh;
    overflow-y: auto;
    padding: 1rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
`;

const FriendTab: React.FC = () => {
    const { user } = useAuth();
    const [friends, setFriends] = useState<string[]>([]);
    const [showSearch, setShowSearch] = useState<boolean>(false);
    const [showCodeModal, setShowCodeModal] = useState<boolean>(false);

    const fetchFriends = async () => {
        if (!user) return;
        try {
        const friendRes = await getFriends(user.id);
        setFriends(friendRes.data);
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
        <Container>
            <TopBar>
                <SectionTitle>내 친구 목록</SectionTitle>
                <div>
                    <SearchToggleButton onClick={() => setShowSearch(prev => !prev)}>
                        {showSearch ? "닫기" : "🔍 검색"}
                    </SearchToggleButton>
                    <CodeToggleButton onClick={() => setShowCodeModal(true)}>
                        코드 등록/찾기
                    </CodeToggleButton>
                </div>
            </TopBar>
            {showSearch && <FriendSearch />}
            {friends.length === 0 ? (
                <p>친구가 없습니다.</p>
            ) : (
                <List>
                {friends.map((friend) => (
                    <ListItem key={friend}>{friend}</ListItem>
                ))}
                </List>
            )}
            {showCodeModal && (
                <ModalOverlay onClick={() => setShowCodeModal(false)}>
                    <ModalContent onClick={e => e.stopPropagation()}>
                        <FriendCodePage />
                        <Button onClick={() => setShowCodeModal(false)} style={{ marginTop: "1rem", width: "100%" }}>
                            닫기
                        </Button>
                    </ModalContent>
                </ModalOverlay>
            )}
        </Container>
    );
};

export default FriendTab;