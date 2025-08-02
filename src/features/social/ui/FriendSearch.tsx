// src/features/social/ui/FriendSearch.tsx
import React, { useState, useEffect, useRef } from "react";
import { useAuthContext } from "../../auth";
import { Friend } from "../../../entities";
import { useFriendSearch } from "../model/hooks/useFriendSearch";
import { SearchInput, LoadingDisplay, EmptyStateDisplay } from "../../../shared/ui";
import {
    SearchContainer,
    ResultList,
    ResultItem,
    UserAvatar,
    UserInfo,
    UserName,
    Username,
} from "../styles/FriendSearch.styles";

interface FriendSearchProps {
    onClose: () => void;
}

const FriendSearch: React.FC<FriendSearchProps> = ({ onClose }) => {
    const { user } = useAuthContext();
    const [query, setQuery] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    
    // 친구 검색 쿼리
    const { data: results = [], isLoading } = useFriendSearch(user?.id, query);
    
    // 컴포넌트 마운트 시 input에 포커스
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);
    
    // clearSearch는 SearchInput의 내장 clear 버튼으로 대체됨
    
    // 이니셜 가져오기
    const getInitial = (name: string) => {
        return name.charAt(0).toUpperCase();
    };

    return (
        <SearchContainer>
            <SearchInput
                placeholder="이름으로 친구 검색..."
                value={query}
                onChange={setQuery}
                autoFocus
            />
            
            {isLoading && (
                <LoadingDisplay message="검색 중..." />
            )}
            
            {!isLoading && query.trim() !== "" && results.length === 0 && (
                <EmptyStateDisplay
                    icon={
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M23 21V19C22.9986 17.1771 21.765 15.5857 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M16 3.13C17.7699 3.58317 19.0078 5.17999 19.0078 7.005C19.0078 8.83 17.7699 10.4268 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M3 3L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    }
                    title="검색 결과가 없습니다"
                    description="다른 검색어로 다시 시도해보세요"
                />
            )}
            
            {results.length > 0 && (
                <ResultList>
                    {results.map((friend: Friend) => (
                        <ResultItem key={friend.id}>
                            <UserAvatar>
                                {getInitial(friend.nickname || friend.username)}
                            </UserAvatar>
                            <UserInfo>
                                <UserName>{friend.nickname || friend.username}</UserName>
                                {friend.username && friend.nickname && (
                                    <Username>@{friend.username}</Username>
                                )}
                            </UserInfo>
                        </ResultItem>
                    ))}
                </ResultList>
            )}
        </SearchContainer>
    );
};

export default FriendSearch;