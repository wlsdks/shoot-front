import styled, { keyframes } from "styled-components";

// 애니메이션 정의
export const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
`;

export const pulse = keyframes`
    0% { transform: scale(1); }
    50% { transform: scale(1.01); }
    100% { transform: scale(1); }
`;

// 메인 컨테이너
export const SearchContainer = styled.div`
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
export const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
`;

export const Title = styled.h2`
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
    margin: 0;
`;

// 검색 입력 영역
export const SearchInputWrapper = styled.div`
    position: relative;
    margin-bottom: 16px;
`;

export const SearchIcon = styled.div`
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

export const ClearButton = styled.button`
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

export const SearchInput = styled.input`
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
export const LoadingWrapper = styled.div`
    padding: 16px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
`;

export const Spinner = styled.div`
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
export const ResultList = styled.ul`
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

export const ResultItem = styled.li`
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

export const UserAvatar = styled.div`
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

export const UserInfo = styled.div`
    flex: 1;
    overflow: hidden;
`;

export const UserName = styled.div`
    font-size: 0.95rem;
    font-weight: 500;
    color: #333;
    margin-bottom: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

export const Username = styled.div`
    font-size: 0.8rem;
    color: #777;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

// 검색 결과 없음 메시지
export const EmptyState = styled.div`
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
export const CloseButton = styled.button`
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