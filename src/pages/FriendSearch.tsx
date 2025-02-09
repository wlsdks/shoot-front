import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { searchFriends } from "../services/friendApi"; // API 함수
import { useAuth } from "../context/AuthContext";
import { parseUserString, UserDTO } from "../utils/parseUserString";

const slideDown = keyframes`
    from { transform: translateY(-100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
`;

const SearchContainer = styled.div`
    background-color: #fff;
    padding: 16px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    animation: ${slideDown} 0.3s ease-out;
    position: relative;
    z-index: 10;
`;

const SearchInput = styled.input`
    width: 100%;
    padding: 8px;
    font-size: 1rem;
    margin-bottom: 8px;
`;

const SearchButton = styled.button`
    padding: 8px 16px;
    background-color: #007bff;
    border: none;
    color: #fff;
    border-radius: 4px;
    cursor: pointer;
`;

const ResultList = styled.ul`
    list-style: none;
    margin: 0;
    padding: 0;
`;

const ResultItem = styled.li`
    padding: 8px 0;
    border-bottom: 1px solid #eee;
`;

const NoResultsMessage = styled.p`
    color: green;
    font-weight: bold;
    margin-top: 8px;
`;

const FriendSearch: React.FC = () => {
    const [query, setQuery] = useState("");
    // results가 UserDTO 배열로 저장되도록 함
    const [results, setResults] = useState<UserDTO[]>([]);
    const { user } = useAuth();

    const handleSearch = async () => {
        try {
        if (!user) {
            console.error("로그인 정보가 없습니다.");
            return;
        }
        const response = await searchFriends(user.id, query);
        // 백엔드에서 반환하는 데이터가 배열인지 확인합니다.
        // 만약 응답 데이터가 문자열 배열이라면 각 문자열을 파싱합니다.
        if (Array.isArray(response.data)) {
            if (typeof response.data[0] === "string") {
            const parsedResults = response.data.map((item: string) =>
                parseUserString(item)
            );
            setResults(parsedResults);
            } else {
            // 만약 이미 객체 형태라면 그대로 사용합니다.
            setResults(response.data);
            }
        } else {
            setResults([]);
        }
        } catch (error) {
        console.error("검색 실패:", error);
        setResults([]);
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
            <SearchButton onClick={handleSearch}>검색하기</SearchButton>
            {query !== "" && results.length === 0 && (
                <NoResultsMessage>검색된 유저가 없습니다.</NoResultsMessage>
            )}
            {results.length > 0 && (
                <ResultList>
                    {results.map((friend) => (
                        <ResultItem key={friend.id}>
                        <strong>{friend.nickname || friend.username}</strong>{" "}
                        ({friend.username})
                        {friend.userCode && <span> - 코드: {friend.userCode}</span>}
                        </ResultItem>
                ))}
                </ResultList>
            )}
        </SearchContainer>
    );
};

export default FriendSearch;