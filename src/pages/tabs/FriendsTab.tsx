import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useAuth } from "../../context/AuthContext";
import { getFriends } from "../../services/friendApi"; // 예시

const Container = styled.div`
  padding: 1rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.1rem;
  margin-top: 0;
  margin-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 4px;
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

const FriendActions = styled.div`
  margin-top: 1rem;
  display: flex;
  gap: 8px;
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

const FriendTab: React.FC = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<string[]>([]);

  const fetchFriends = async () => {
    if (!user) return;
    try {
      const friendRes = await getFriends(user.id);
      setFriends(friendRes.data);
    } catch (err: any) {
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
      <SectionTitle>내 친구 목록</SectionTitle>
      {friends.length === 0 ? (
        <p>친구가 없습니다.</p>
      ) : (
        <List>
          {friends.map((friend) => (
            <ListItem key={friend}>{friend}</ListItem>
          ))}
        </List>
      )}
    </Container>
  );
};

export default FriendTab;
