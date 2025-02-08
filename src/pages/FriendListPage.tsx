// src/pages/FriendListPage.tsx (예: 소셜 + 친구 목록 통합)
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import styled from "styled-components";
import {
  getFriends,
  getIncomingRequests,
  getOutgoingRequests,
  getRecommendations,
  // 필요 시 sendFriendRequest, acceptFriendRequest, rejectFriendRequest 등
} from "../services/friendApi"; // 예시 API
import { useNavigate } from "react-router-dom";

// 1) 전체 컨테이너 (가운데 정렬, 카드 형태)
const Container = styled.div`
  max-width: 600px;
  margin: 40px auto; /* 수직 40px, 수평 auto로 가운데 정렬 */
  background: #fff;
  border: 1px solid #ddd;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  padding: 20px;
  min-height: 500px; /* 예시로 높이 조금 주기 */
`;

// 2) 섹션 헤더
const SectionTitle = styled.h2`
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 1.3rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
`;

// 3) 리스트 스타일
const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

// 4) 리스트 아이템(친구/추천/요청)
const ListItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f3f3f3;

  &:last-child {
    border-bottom: none;
  }
`;

// 5) 우측 버튼 영역
const Actions = styled.div`
  display: flex;
  gap: 8px;
`;

// 6) 공용 버튼 스타일
const Button = styled.button`
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 6px 10px;
  cursor: pointer;
  &:hover {
    background: #0056b3;
  }
`;

const FriendListPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [friends, setFriends] = useState<string[]>([]);
  const [incoming, setIncoming] = useState<string[]>([]);
  const [outgoing, setOutgoing] = useState<string[]>([]);
  const [recommended, setRecommended] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError("");

      // 병렬 로드
      const [friendRes, incRes, outRes, recRes] = await Promise.all([
        getFriends(user.id),
        getIncomingRequests(user.id),
        getOutgoingRequests(user.id),
        getRecommendations(user.id, 3),
      ]);

      setFriends(friendRes.data);
      setIncoming(incRes.data);
      setOutgoing(outRes.data);
      setRecommended(recRes.data);
    } catch (e: any) {
      console.error(e);
      setError("데이터 로드 실패");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user]);

  if (!user) {
    return <div style={{ textAlign: "center", marginTop: "2rem" }}>로그인이 필요합니다.</div>;
  }

  if (loading) {
    return <Container>로딩중...</Container>;
  }

  return (
    <Container>
      {/* 상단 제목 */}
      <h1 style={{ marginTop: 0, marginBottom: "1rem" }}>친구 & 소셜</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* 1) 친구 목록 섹션 */}
      <section style={{ marginBottom: "1.5rem" }}>
        <SectionTitle>내 친구 목록</SectionTitle>
        {friends.length === 0 ? (
          <p>아직 친구가 없습니다.</p>
        ) : (
          <List>
            {friends.map((fid) => (
              <ListItem key={fid}>
                <span>{fid}</span>
                <Actions>
                  {/* 예: 채팅하기 버튼 */}
                  <Button onClick={() => alert(`채팅하기: ${fid} (createDirectChat)`)}>
                    채팅
                  </Button>
                  {/* 필요 시: 친구 삭제, 프로필 보기 등 */}
                </Actions>
              </ListItem>
            ))}
          </List>
        )}
      </section>

      {/* 2) 받은 친구 요청 (incoming) */}
      <section style={{ marginBottom: "1.5rem" }}>
        <SectionTitle>받은 친구 요청</SectionTitle>
        {incoming.length === 0 ? (
          <p>받은 요청이 없습니다.</p>
        ) : (
          <List>
            {incoming.map((rid) => (
              <ListItem key={rid}>
                <span>{rid}</span>
                <Actions>
                  <Button onClick={() => alert(`수락하기: ${rid}`)}>수락</Button>
                  <Button onClick={() => alert(`거절하기: ${rid}`)}>거절</Button>
                </Actions>
              </ListItem>
            ))}
          </List>
        )}
      </section>

      {/* 3) 보낸 친구 요청 (outgoing) */}
      <section style={{ marginBottom: "1.5rem" }}>
        <SectionTitle>보낸 친구 요청</SectionTitle>
        {outgoing.length === 0 ? (
          <p>보낸 요청이 없습니다.</p>
        ) : (
          <List>
            {outgoing.map((rid) => (
              <ListItem key={rid}>
                <span>{rid}</span>
                <span style={{ color: "#666" }}>대기중</span>
              </ListItem>
            ))}
          </List>
        )}
      </section>

      {/* 4) 추천 친구 */}
      <section>
        <SectionTitle>추천 친구</SectionTitle>
        {recommended.length === 0 ? (
          <p>추천할 친구가 없습니다.</p>
        ) : (
          <List>
            {recommended.map((rc) => (
              <ListItem key={rc}>
                <span>{rc}</span>
                <Actions>
                  <Button onClick={() => alert(`친구 요청: ${rc}`)}>추가</Button>
                </Actions>
              </ListItem>
            ))}
          </List>
        )}
      </section>
    </Container>
  );
};

export default FriendListPage;