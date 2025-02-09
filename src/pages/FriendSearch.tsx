import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { searchFriends } from "../services/friendApi"; // API 함수
import { useAuth } from "../context/AuthContext";
import { parseUserString, UserDTO } from "../utils/parseUserString";

const slideDown = keyframes`
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const SearchContainer = styled.div`
  background-color: #fff;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  animation: ${slideDown} 0.3s ease-out;
  position: relative;
  z-index: 10;
  transition: all 0.3s ease;
`;

const SearchInput = styled.input`
  width: 92%;
  padding: 10px 12px;
  font-size: 1rem;
  margin-bottom: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  transition: border 0.2s ease;
  &:focus {
    border-color: #007bff;
    outline: none;
  }
`;

const LoadingMessage = styled.p`
  color: #555;
  font-size: 0.9rem;
  margin-top: 8px;
`;

const SearchButton = styled.button`
  padding: 8px 16px;
  background-color: #007bff;
  border: none;
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  &:hover {
    background-color: #0056b3;
  }
`;

const ResultList = styled.ul`
  list-style: none;
  margin: 12px 0 0 0;
  padding: 0;
`;

const ResultItem = styled.li`
  padding: 10px 0;
  border-bottom: 1px solid #eee;
  transition: background 0.2s ease;
  &:hover {
    background-color: #f7f7f7;
  }
`;

const NoResultsMessage = styled.p`
  color: green;
  font-weight: bold;
  margin-top: 12px;
  font-size: 0.95rem;
`;

const FriendSearch: React.FC = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(false);

  // 디바운스 효과: query가 변경되면 200ms 후에 API 호출
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim() !== "") {
        performSearch();
      } else {
        setResults([]);
      }
    }, 100);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const performSearch = async () => {
    if (!user) {
      console.error("로그인 정보가 없습니다.");
      return;
    }
    setLoading(true);
    try {
      const response = await searchFriends(user.id, query);
      // 만약 응답 데이터가 문자열 배열이면 파싱하고,
      if (Array.isArray(response.data)) {
        if (response.data.length > 0 && typeof response.data[0] === "string") {
          const parsedResults = response.data.map((item: string) => parseUserString(item));
          setResults(parsedResults);
        } else {
          // 이미 객체 형태라면 그대로 사용
          setResults(response.data);
        }
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error("검색 실패:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SearchContainer>
      <SearchInput
        type="text"
        placeholder="친구 검색..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {/* 만약 사용자가 직접 "검색" 버튼을 누르길 원한다면 아래 주석을 풀어서 사용하세요.
      <SearchButton onClick={performSearch}>검색하기</SearchButton>
      */}
      {loading && <LoadingMessage>검색 중...</LoadingMessage>}
      {query.trim() !== "" && !loading && results.length === 0 && (
        <NoResultsMessage>검색된 유저가 없습니다.</NoResultsMessage>
      )}
      {results.length > 0 && (
        <ResultList>
          {results.map((friend) => (
            <ResultItem key={friend.id}>
              <strong>{friend.nickname || friend.username}</strong> ({friend.username})
              {friend.userCode && <span> - 코드: {friend.userCode}</span>}
            </ResultItem>
          ))}
        </ResultList>
      )}
    </SearchContainer>
  );
};

export default FriendSearch;