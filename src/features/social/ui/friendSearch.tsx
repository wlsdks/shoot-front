// src/features/social/ui/friendSearch.tsx
import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import { useAuth } from "../../../shared/lib/context/AuthContext";
import { Friend } from "../types/friend";
import { useFriendSearch } from "../model/hooks/useFriendSearch";
import styled from "styled-components";
import { fadeIn, slideUp } from "../../../shared/ui/commonStyles";

const SearchContainer = styled.div`
    background-color: #fff;
    padding: 1.2rem;
    border-radius: 16px;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
    animation: ${slideUp} 0.3s ease-out;
    position: relative;
    z-index: 10;
    margin-bottom: 1.2rem;
    border: 1px solid #eef2f7;
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
`;

const Title = styled.h2`
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
    margin: 0;
`;

const SearchInputWrapper = styled.div`
    position: relative;
    margin-bottom: 1rem;
`;

const SearchInput = styled.input`
    width: 100%;
    padding: 0.85rem 2.8rem 0.85rem 1rem;
    border: 1px solid #e1e8ed;
    border-radius: 12px;
    font-size: 0.9rem;
    background-color: #f8fafc;
    transition: all 0.3s;
    
    &:focus {
        outline: none;
        border-color: #4a6cf7;
        background-color: #fff;
        box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.1);
    }

    &::placeholder {
        color: #a0aec0;
    }
`;

const SearchIcon = styled.div`
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #a0aec0;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const ClearButton = styled.button`
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #a0aec0;
    cursor: pointer;
    padding: 0.3rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;

    &:hover {
        color: #4a6cf7;
        background: #f5f9ff;
    }

    svg {
        width: 16px;
        height: 16px;
    }
`;

const LoadingWrapper = styled.div`
    padding: 2rem 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #64748b;
    gap: 0.8rem;
`;

const Spinner = styled.div`
    width: 24px;
    height: 24px;
    border: 2px solid #e2e8f0;
    border-radius: 50%;
    border-top-color: #4a6cf7;
    animation: spin 0.7s linear infinite;
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;

const ResultList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    max-height: 320px;
    overflow-y: auto;
    padding: 0.3rem 0;
    
    &::-webkit-scrollbar {
        width: 5px;
    }
    
    &::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 5px;
    }
    
    &::-webkit-scrollbar-thumb {
        background: #ddd;
        border-radius: 5px;
    }
    
    &::-webkit-scrollbar-thumb:hover {
        background: #ccc;
    }
`;

const ResultItem = styled.div`
    display: flex;
    align-items: center;
    padding: 0.8rem;
    border-radius: 12px;
    background-color: #f8fafc;
    border: 1px solid #eef2f7;
    transition: all 0.3s ease;
    cursor: pointer;
    
    &:hover {
        background-color: #f0f7ff;
        transform: translateY(-2px);
        box-shadow: 0 4px 10px rgba(74, 108, 247, 0.1);
    }
`;

const UserAvatar = styled.div`
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background: linear-gradient(135deg, #4a6cf7, #2a4cdf);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 1.1rem;
    margin-right: 0.8rem;
    flex-shrink: 0;
    border: 2px solid #e1ecff;
`;

const UserInfo = styled.div`
    flex: 1;
    overflow: hidden;
`;

const UserName = styled.div`
    font-size: 0.95rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 0.2rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const Username = styled.div`
    font-size: 0.8rem;
    color: #64748b;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const EmptyState = styled.div`
    padding: 2.5rem 1rem;
    text-align: center;
    color: #64748b;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    
    svg {
        color: #cbd5e1;
        width: 48px;
        height: 48px;
        margin-bottom: 1rem;
    }
`;

const EmptyTitle = styled.h4`
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
    font-weight: 600;
    color: #475569;
`;

const EmptyMessage = styled.p`
    margin: 0;
    font-size: 0.85rem;
    color: #64748b;
    line-height: 1.5;
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    color: #64748b;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    
    &:hover {
        background-color: #f1f5f9;
        color: #334155;
    }
    
    svg {
        width: 18px;
        height: 18px;
    }
`;

interface FriendSearchProps {
    onClose: () => void;
}

const FriendSearch: React.FC<FriendSearchProps> = ({ onClose }) => {
    const { user } = useAuth();
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
    
    const clearSearch = () => {
        setQuery("");
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };
    
    // 이니셜 가져오기
    const getInitial = (name: string) => {
        return name.charAt(0).toUpperCase();
    };

    return (
        <SearchContainer>
            <Header>
                <Title>친구 검색</Title>
                <CloseButton onClick={onClose}>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </CloseButton>
            </Header>
            
            <SearchInputWrapper>
                <SearchInput
                    ref={inputRef}
                    type="text"
                    placeholder="이름으로 친구 검색..."
                    value={query}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                />
                {query ? (
                    <ClearButton onClick={clearSearch}>
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </ClearButton>
                ) : (
                    <SearchIcon>
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </SearchIcon>
                )}
            </SearchInputWrapper>
            
            {isLoading && (
                <LoadingWrapper>
                    <Spinner />
                    <span>검색 중...</span>
                </LoadingWrapper>
            )}
            
            {!isLoading && query.trim() !== "" && results.length === 0 && (
                <EmptyState>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M23 21V19C22.9986 17.1771 21.765 15.5857 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16 3.13C17.7699 3.58317 19.0078 5.17999 19.0078 7.005C19.0078 8.83 17.7699 10.4268 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M3 3L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <EmptyTitle>검색 결과가 없습니다</EmptyTitle>
                    <EmptyMessage>다른 검색어로 다시 시도해보세요</EmptyMessage>
                </EmptyState>
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