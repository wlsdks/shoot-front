import styled, { keyframes } from 'styled-components';
import { slideUp } from '../../../shared/ui/commonStyles';

// 애니메이션 정의
export const pulse = keyframes`
    0% { transform: scale(1); }
    50% { transform: scale(1.01); }
    100% { transform: scale(1); }
`;

// 메인 컨테이너
export const SearchContainer = styled.div`
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

// 헤더 영역
export const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
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
    margin-bottom: 1rem;
`;

export const SearchInput = styled.input`
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

export const SearchIcon = styled.div`
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #a0aec0;
    display: flex;
    align-items: center;
    justify-content: center;
`;

export const ClearButton = styled.button`
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

// 로딩 표시
export const LoadingWrapper = styled.div`
    padding: 2rem 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #64748b;
    gap: 0.8rem;
`;

export const Spinner = styled.div`
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

// 결과 목록
export const ResultList = styled.div`
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

export const ResultItem = styled.div`
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

export const UserAvatar = styled.div`
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

export const UserInfo = styled.div`
    flex: 1;
    overflow: hidden;
`;

export const UserName = styled.div`
    font-size: 0.95rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 0.2rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

export const Username = styled.div`
    font-size: 0.8rem;
    color: #64748b;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

// 검색 결과 없음 메시지
export const EmptyState = styled.div`
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

export const EmptyTitle = styled.h4`
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
    font-weight: 600;
    color: #475569;
`;

export const EmptyMessage = styled.p`
    margin: 0;
    font-size: 0.85rem;
    color: #64748b;
    line-height: 1.5;
`;

// 닫기 버튼
export const CloseButton = styled.button`
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

