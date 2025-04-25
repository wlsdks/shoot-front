import React, { useState, useEffect, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import { searchFriends } from "../services/friends";
import { useAuth } from "../context/AuthContext";

// Friend 인터페이스 정의
interface Friend {
    id: number;
    username: string;
}

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
    const [results, setResults] = useState<Friend[]>([]);
    const [loading, setLoading] = useState(false);

    // 검색
    const performSearch = useCallback(async () => {
        if (!user) {
            console.error("로그인 정보가 없습니다.");
            return;
        }
    
        setLoading(true);
    
        try {
            const response = await searchFriends(user.id, query);
            // 응답 구조 변경: response.data.data에서 데이터 추출
            if (response.data.success && response.data.data) {
                setResults(response.data.data);
            } else {
                setResults([]);
            }
        } catch (error) {
            console.error("검색 실패:", error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, [user, query]);

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
    }, [query, performSearch]);

    return (
        <SearchContainer>
            <SearchInput
                type="text"
                placeholder="친구 검색..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            {loading && <LoadingMessage>검색 중...</LoadingMessage>}
            {query.trim() !== "" && !loading && results.length === 0 && (
                <NoResultsMessage>검색된 유저가 없습니다.</NoResultsMessage>
            )}
            {results.length > 0 && (
                <ResultList>
                    {results.map((friend) => (
                        <ResultItem key={friend.id}>
                            {friend.username} {/* Friend.name 사용 */}
                        </ResultItem>
                    ))}
                </ResultList>
            )}
        </SearchContainer>
    );
};

export default FriendSearch;