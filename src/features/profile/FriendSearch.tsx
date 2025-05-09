import React, { useState, useEffect, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import { searchFriends } from "../../features/social/api/friends";
import { useAuth } from "../../shared/lib/context/AuthContext";
import { useQuery } from "@tanstack/react-query";

// Friend 인터페이스 정의
interface Friend {
    id: number;
    username: string;
}

interface FriendSearchProps {
    onClose: () => void;
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

const CloseButton = styled.button`
    position: absolute;
    top: 16px;
    right: 16px;
    background: none;
    border: none;
    color: #666;
    cursor: pointer;
    padding: 4px;
    font-size: 1.2rem;
    
    &:hover {
        color: #333;
    }
`;

const FriendSearch: React.FC<FriendSearchProps> = ({ onClose }) => {
    const { user } = useAuth();
    const [query, setQuery] = useState("");

    // 친구 검색 쿼리
    const { data: results = [], isLoading } = useQuery({
        queryKey: ['friends', 'search', query],
        queryFn: async () => {
            if (!user || !query.trim()) return [];
            return searchFriends(user.id, query);
        },
        enabled: !!user && query.trim() !== "",
        staleTime: 1000 * 60, // 1분 동안 캐시 유지
    });

    return (
        <SearchContainer>
            <CloseButton onClick={onClose}>&times;</CloseButton>
            <SearchInput
                type="text"
                placeholder="친구 검색..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            {isLoading && <LoadingMessage>검색 중...</LoadingMessage>}
            {query.trim() !== "" && !isLoading && results.length === 0 && (
                <NoResultsMessage>검색된 유저가 없습니다.</NoResultsMessage>
            )}
            {results.length > 0 && (
                <ResultList>
                    {results.map((friend) => (
                        <ResultItem key={friend.id}>
                            {friend.username}
                        </ResultItem>
                    ))}
                </ResultList>
            )}
        </SearchContainer>
    );
};

export default FriendSearch;