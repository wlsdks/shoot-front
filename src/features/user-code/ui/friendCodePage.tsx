import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { useAuth } from "../../../shared/lib/context/AuthContext";
import { useUserCode } from "../model/useUserCode";
import { UserCode } from "../types";

interface FriendCodePageProps {
    onClose: () => void;
}

// 애니메이션 정의
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
    0% { transform: scale(1); }
    50% { transform: scale(1.02); }
    100% { transform: scale(1); }
`;

// 메인 컨테이너
const Container = styled.div`
    background: #ffffff;
    width: 100%;
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    animation: ${fadeIn} 0.4s ease-out;
    position: relative;
    border: 1px solid rgba(230, 230, 230, 0.7);
`;

// 헤더 영역
const Header = styled.div`
    padding: 20px 24px;
    border-bottom: 1px solid #f0f0f0;
    position: relative;
    background: linear-gradient(to right, #f9f9f9, #ffffff);
`;

const Title = styled.h2`
    font-size: 1.2rem;
    font-weight: 600;
    color: #333;
    margin: 0;
    text-align: center;
`;

// 컨텐츠 영역
const Content = styled.div`
    padding: 24px;
`;

// 폼 그룹
const FormGroup = styled.div`
    margin-bottom: 20px;
    position: relative;
`;

const Label = styled.label`
    display: inline-block;
    margin-bottom: 8px;
    font-size: 0.85rem;
    color: #555;
    font-weight: 500;
    position: relative;
    padding-left: 6px;
    
    &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 14px;
        background: #4a6cf7;
        border-radius: 2px;
    }
`;

// 입력 필드 래퍼
const InputWrapper = styled.div`
    position: relative;
    display: flex;
    align-items: center;
`;

const InputIcon = styled.div`
    position: absolute;
    left: 16px;
    color: #999;
    z-index: 2;
    
    svg {
        width: 16px;
        height: 16px;
    }
`;

const Input = styled.input`
    width: 100%;
    padding: 14px 16px;
    padding-left: 42px;
    font-size: 0.95rem;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    background: #f9f9f9;
    transition: all 0.25s ease;
    box-sizing: border-box;
    
    &:focus {
        outline: none;
        border-color: #4a6cf7;
        background: #fff;
        box-shadow: 0 0 0 4px rgba(74, 108, 247, 0.12);
    }
    
    &::placeholder {
        color: #aaa;
    }
`;

// 버튼 그룹
const ButtonGroup = styled.div`
    display: flex;
    gap: 12px;
    margin-top: 16px;
`;

const Button = styled.button<{ $primary?: boolean }>`
    flex: 1;
    padding: 14px 16px;
    font-size: 0.95rem;
    font-weight: 500;
    border-radius: 12px;
    border: none;
    background: ${props => props.$primary ? '#4a6cf7' : '#f5f5f5'};
    color: ${props => props.$primary ? 'white' : '#555'};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.25s ease;
    box-shadow: ${props => props.$primary ? '0 4px 12px rgba(74, 108, 247, 0.15)' : 'none'};
    
    &:hover {
        background: ${props => props.$primary ? '#3a5be0' : '#ececec'};
        transform: translateY(-1px);
        box-shadow: ${props => props.$primary ? '0 6px 14px rgba(74, 108, 247, 0.2)' : '0 4px 6px rgba(0, 0, 0, 0.05)'};
    }
    
    &:active {
        transform: translateY(0);
    }
    
    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
        background: ${props => props.$primary ? '#a0aef0' : '#e8e8e8'};
        box-shadow: none;
    }
    
    svg {
        width: 18px;
        height: 18px;
    }
`;

// 사용자 카드
const UserCard = styled.div`
    margin-top: 24px;
    padding: 20px;
    border-radius: 16px;
    background: #f8faff;
    border: 1px solid #e8eeff;
    box-shadow: 0 4px 12px rgba(74, 108, 247, 0.08);
    animation: ${fadeIn} 0.4s ease;
    
    &:hover {
        animation: ${pulse} 0.5s ease;
    }
`;

const UserHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 16px;
`;

const UserAvatar = styled.div`
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, #4a6cf7, #3a5be0);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 1.3rem;
    box-shadow: 0 4px 8px rgba(74, 108, 247, 0.2);
`;

const UserInfo = styled.div`
    flex: 1;
`;

const UserName = styled.h3`
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
`;

const UserDetail = styled.div`
    display: flex;
    align-items: center;
    margin-top: 12px;
    padding: 10px;
    background: white;
    border-radius: 10px;
    border: 1px solid #e8eeff;
    
    svg {
        color: #4a6cf7;
        width: 20px;
        height: 20px;
        margin-right: 8px;
    }
    
    div {
        font-size: 0.9rem;
        color: #666;
        
        span {
            font-weight: 600;
            color: #333;
            margin-left: 4px;
        }
    }
`;

// 메시지 스타일
const Message = styled.div<{ $type: 'success' | 'error' }>`
    margin-top: 20px;
    padding: 14px 16px;
    border-radius: 12px;
    font-size: 0.9rem;
    animation: ${fadeIn} 0.3s ease;
    display: flex;
    align-items: center;
    gap: 10px;
    
    ${props => props.$type === 'success' 
        ? `
        background: #eefbf4;
        border: 1px solid #d1f2e1;
        color: #10b981;
        `
        : `
        background: #fef2f2;
        border: 1px solid #fde8e8;
        color: #ef4444;
        `
    }
`;

const MessageIcon = styled.div`
    display: flex;
`;

// 닫기 버튼
const CloseButton = styled.button`
    position: absolute;
    top: 18px;
    right: 16px;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: #f5f5f5;
    border: none;
    color: #666;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.25s ease;
    
    &:hover {
        background: #ebebeb;
        color: #333;
        transform: rotate(90deg);
    }
    
    svg {
        width: 16px;
        height: 16px;
    }
`;

// 로딩 표시
const Spinner = styled.div`
    width: 16px;
    height: 16px;
    border: 2px solid currentColor;
    border-radius: 50%;
    border-right-color: transparent;
    animation: spin 0.75s linear infinite;
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;

const FriendCodePage: React.FC<FriendCodePageProps> = ({ onClose }) => {
    const { user } = useAuth();
    const [code, setCode] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [isError, setIsError] = useState(false);
    const [searchedUser, setSearchedUser] = useState<UserCode | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const {
        findUser,
        sendFriendRequest,
        isFindingUser,
        isSendingRequest
    } = useUserCode(user?.id || 0);

    // 컴포넌트 마운트 시 input에 포커스
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    // 검색 핸들러
    const handleSearch = () => {
        if (!code.trim()) {
            setMessage("코드를 입력해주세요");
            setIsError(true);
            return;
        }
        
        setMessage(null);
        setIsError(false);
        
        findUser(code, {
            onSuccess: (response) => {
                if (response.success) {
                    if (response.data) {
                        setSearchedUser(response.data);
                        setMessage("유저를 찾았습니다!");
                        setIsError(false);
                    } else {
                        setMessage(response.message || "해당 코드의 사용자가 없습니다");
                        setIsError(true);
                        setSearchedUser(null);
                    }
                } else {
                    setMessage(response.message || "검색 중 오류가 발생했습니다");
                    setIsError(true);
                    setSearchedUser(null);
                }
            },
            onError: () => {
                setMessage("검색 중 오류가 발생했습니다");
                setIsError(true);
                setSearchedUser(null);
            }
        });
    };

    // 친구 요청 보내기
    const handleSendRequest = () => {
        if (!searchedUser || !searchedUser.userCode) return;
        
        sendFriendRequest(searchedUser.userCode, {
            onSuccess: () => {
                setMessage("친구 요청을 보냈습니다!");
                setIsError(false);
                // 성공 후에도 사용자 정보는 유지
            },
            onError: () => {
                setMessage("친구 요청 전송에 실패했습니다");
                setIsError(true);
            }
        });
    };

    // 이니셜 가져오기
    const getInitial = (name?: string) => {
        if (!name || name.length === 0) return "?";
        return name.charAt(0).toUpperCase();
    };

    return (
        <Container>
            <Header>
                <Title>코드로 친구 찾기</Title>
                <CloseButton onClick={onClose}>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </CloseButton>
            </Header>
            
            <Content>
                <FormGroup>
                    <Label>친구 코드</Label>
                    <InputWrapper>
                        <InputIcon>
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10 13.5L7 10.5L10 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M14 7.5L17 10.5L14 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="1.5"/>
                            </svg>
                        </InputIcon>
                        <Input
                            ref={inputRef}
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="친구의 코드를 입력하세요"
                        />
                    </InputWrapper>
                </FormGroup>
                
                <ButtonGroup>
                    <Button 
                        $primary 
                        onClick={handleSearch}
                        disabled={isFindingUser}
                    >
                        {isFindingUser ? (
                            <>
                                <Spinner />
                                검색 중...
                            </>
                        ) : (
                            <>
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                코드 검색
                            </>
                        )}
                    </Button>
                    
                    {searchedUser && (
                        <Button 
                            onClick={handleSendRequest}
                            disabled={isSendingRequest}
                        >
                            {isSendingRequest ? (
                                <>
                                    <Spinner />
                                    처리 중...
                                </>
                            ) : (
                                <>
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M19 8L15 12H18C18 15.3137 15.3137 18 12 18C10.3431 18 8.84311 17.3284 7.75732 16.2426" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M5.00001 16L9.00001 12H6.00001C6.00001 8.68629 8.6863 6 12 6C13.6569 6 15.1569 6.67157 16.2427 7.75736" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    친구 신청
                                </>
                            )}
                        </Button>
                    )}
                </ButtonGroup>
                
                {searchedUser && (
                    <UserCard>
                        <UserHeader>
                            <UserAvatar>
                                {getInitial(searchedUser.nickname || searchedUser.username)}
                            </UserAvatar>
                            <UserInfo>
                                <UserName>{searchedUser.nickname || searchedUser.username}</UserName>
                                {searchedUser.username && searchedUser.nickname && (
                                    <div style={{ fontSize: '0.85rem', color: '#777', marginTop: '4px' }}>
                                        @{searchedUser.username}
                                    </div>
                                )}
                            </UserInfo>
                        </UserHeader>
                        
                        {searchedUser.userCode && (
                            <UserDetail>
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10 13.5L7 10.5L10 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M14 7.5L17 10.5L14 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="1.5"/>
                                </svg>
                                <div>친구 코드: <span>{searchedUser.userCode}</span></div>
                            </UserDetail>
                        )}
                    </UserCard>
                )}
                
                {message && (
                    <Message $type={isError ? 'error' : 'success'}>
                        <MessageIcon>
                            {isError ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22 11.0857V12.0057C21.9988 14.1621 21.3005 16.2604 20.0093 17.9875C18.7182 19.7147 16.9033 20.9782 14.8354 21.5896C12.7674 22.201 10.5573 22.1276 8.53447 21.3803C6.51168 20.633 4.78465 19.2518 3.61096 17.4428C2.43727 15.6338 1.87979 13.4938 2.02168 11.342C2.16356 9.19029 2.99721 7.14205 4.39828 5.5028C5.79935 3.86354 7.69279 2.72111 9.79619 2.24587C11.8996 1.77063 14.1003 1.98806 16.07 2.86572" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            )}
                        </MessageIcon>
                        {message}
                    </Message>
                )}
            </Content>
        </Container>
    );
};

export default FriendCodePage;