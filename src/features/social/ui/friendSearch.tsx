import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { useAuth } from "../../../shared/lib/context/AuthContext";
import { Friend } from "../types/friend";
import { useFriendSearch } from "../model/hooks/useFriendSearch";

interface FriendSearchProps {
    onClose: () => void;
}

// 애니메이션 정의
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
    0% { transform: scale(1); }
    50% { transform: scale(1.01); }
    100% { transform: scale(1); }
`;

// 메인 컨테이너
const SearchContainer = styled.div`
    background-color: #fff;
    padding: 20px;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
    animation: ${fadeIn} 0.3s ease-out;
    position: relative;
    z-index: 10;
    transition: all 0.3s ease;
    border: 1px solid rgba(230, 230, 230, 0.7);
    max-width: 100%;
`;

// 헤더 영역
const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
`;

const Title = styled.h2`
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
    margin: 0;
`;

// 검색 입력 영역
const SearchInputWrapper = styled.div`
    position: relative;
    margin-bottom: 16px;
`;

const SearchIcon = styled.div`
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #aaa;
    pointer-events: none;
    transition: color 0.2s;

    svg {
        width: 18px;
        height: 18px;
    }
`;

const ClearButton = styled.button`
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #aaa;
    cursor: pointer;
    padding: 4px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;

    &:hover {
        color: #666;
        background: #f5f5f5;
    }

    svg {
        width: 16px;
        height: 16px;
    }
`;

const SearchInput = styled.input`
    width: 100%;
    padding: 14px 40px;
    font-size: 0.95rem;
    border: 1px solid #e8e8e8;
    border-radius: 12px;
    background: #f9fafb;
    transition: all 0.25s ease;
    box-sizing: border-box;
    
    &:focus {
        outline: none;
        border-color: #4a6cf7;
        background: #fff;
        box-shadow: 0 0 0 4px rgba(74, 108, 247, 0.12);
    }
    
    &:focus + ${SearchIcon} {
        color: #4a6cf7;
    }
    
    &::placeholder {
        color: #aaa;
    }
`;

// 로딩 표시
const LoadingWrapper = styled.div`
    padding: 16px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
`;

const Spinner = styled.div`
    width: 20px;
    height: 20px;
    border: 2px solid rgba(74, 108, 247, 0.3);
    border-radius: 50%;
    border-top-color: #4a6cf7;
    animation: spin 0.7s linear infinite;
    margin-right: 8px;
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;

// 결과 목록
const ResultList = styled.ul`
    list-style: none;
    margin: 0;
    padding: 0;
    max-height: 300px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    
    /* 스크롤바 스타일링 */
    &::-webkit-scrollbar {
        width: 8px;
    }
    
    &::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 8px;
    }
    
    &::-webkit-scrollbar-thumb {
        background: #ddd;
        border-radius: 8px;
    }
    
    &::-webkit-scrollbar-thumb:hover {
        background: #ccc;
    }
`;

const ResultItem = styled.li`
    padding: 12px 16px;
    margin: 8px 0;
    border-radius: 12px;
    background-color: #f8faff;
    border: 1px solid #e8eeff;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    cursor: pointer;
    
    &:hover {
        background-color: #eff3ff;
        transform: translateY(-1px);
        box-shadow: 0 4px 10px rgba(74, 108, 247, 0.08);
    }
    
    &:active {
        transform: translateY(0);
    }
`;

const UserAvatar = styled.div`
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background: linear-gradient(135deg, #4a6cf7, #3a5be0);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 1.2rem;
    margin-right: 12px;
    flex-shrink: 0;
`;

const UserInfo = styled.div`
    flex: 1;
    overflow: hidden;
`;

const UserName = styled.div`
    font-size: 0.95rem;
    font-weight: 500;
    color: #333;
    margin-bottom: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const Username = styled.div`
    font-size: 0.8rem;
    color: #777;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

// 검색 결과 없음 메시지
const EmptyState = styled.div`
    padding: 24px 0;
    text-align: center;
    color: #666;
    
    svg {
        color: #ccc;
        width: 40px;
        height: 40px;
        margin-bottom: 8px;
    }
    
    h4 {
        margin: 0 0 4px;
        font-size: 0.95rem;
        color: #555;
        font-weight: 500;
    }
    
    p {
        margin: 0;
        font-size: 0.85rem;
        color: #888;
    }
`;

// 닫기 버튼
const CloseButton = styled.button`
    background: none;
    border: none;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    color: #666;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    
    &:hover {
        background-color: #f5f5f5;
        color: #333;
    }
    
    svg {
        width: 18px;
        height: 18px;
    }
`;

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
                    onChange={(e) => setQuery(e.target.value)}
                />
                <SearchIcon>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </SearchIcon>
                {query && (
                    <ClearButton onClick={clearSearch}>
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </ClearButton>
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
                    <h4>검색 결과가 없습니다</h4>
                    <p>다른 검색어로 다시 시도해보세요</p>
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