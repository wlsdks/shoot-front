// src/features/user-code/ui/friendCodePage.tsx
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../shared/lib/context/AuthContext";
import { useUserCode } from "../model/useUserCode";
import { UserCode } from "../types";
import styled from "styled-components";
import { fadeIn, slideUp } from "../../../shared/ui/commonStyles";

const Container = styled.div`
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    animation: ${slideUp} 0.3s ease-out;
    position: relative;
    border: 1px solid #eef2f7;
    margin-bottom: 1.2rem;
`;

const Header = styled.div`
    padding: 1.2rem 1.5rem;
    background: linear-gradient(to right, #f2f8ff, #f8fafc);
    border-bottom: 1px solid #f0f5ff;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const Title = styled.h2`
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
    margin: 0;
    text-align: center;
`;

const Content = styled.div`
    padding: 1.5rem;
`;

const FormGroup = styled.div`
    margin-bottom: 1.2rem;
    position: relative;
`;

const Label = styled.label`
    display: inline-block;
    margin-bottom: 0.6rem;
    font-size: 0.85rem;
    color: #475569;
    font-weight: 500;
    position: relative;
    padding-left: 0.5rem;
    
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

const InputWrapper = styled.div`
    position: relative;
    display: flex;
    align-items: center;
`;

const InputPrefix = styled.div`
    position: absolute;
    left: 1rem;
    color: #4a6cf7;
    font-weight: 600;
    font-size: 1rem;
    pointer-events: none;
`;

const Input = styled.input`
    width: 100%;
    padding: 0.85rem 1rem 0.85rem 2.2rem;
    font-size: 0.95rem;
    border: 1px solid #e1e8ed;
    border-radius: 12px;
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

const ButtonGroup = styled.div`
    display: flex;
    gap: 0.8rem;
    margin-top: 1.5rem;
`;

const Button = styled.button<{ $primary?: boolean }>`
    flex: 1;
    padding: 0.85rem 1rem;
    font-size: 0.9rem;
    font-weight: 600;
    border-radius: 12px;
    border: none;
    background: ${props => props.$primary ? '#4a6cf7' : '#f1f5f9'};
    color: ${props => props.$primary ? 'white' : '#475569'};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.3s;
    
    &:hover {
        background: ${props => props.$primary ? '#3a5be0' : '#e2e8f0'};
        transform: translateY(-2px);
        box-shadow: ${props => props.$primary ? '0 6px 14px rgba(74, 108, 247, 0.2)' : '0 4px 6px rgba(0, 0, 0, 0.05)'};
    }
    
    &:active {
        transform: translateY(-1px);
    }
    
    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
        background: ${props => props.$primary ? '#a0aef0' : '#e2e8f0'};
        box-shadow: none;
    }
`;

const UserCard = styled.div`
    margin-top: 1.5rem;
    padding: 1.2rem;
    border-radius: 14px;
    background: #f0f7ff;
    border: 1px solid #d9e6ff;
    box-shadow: 0 4px 12px rgba(74, 108, 247, 0.08);
    animation: ${fadeIn} 0.4s ease;
`;

const UserHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
`;

const UserAvatar = styled.div`
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: linear-gradient(135deg, #4a6cf7, #3a5be0);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 1.5rem;
    box-shadow: 0 4px 8px rgba(74, 108, 247, 0.2);
    border: 2px solid #fff;
`;

const UserInfo = styled.div`
    flex: 1;
`;

const UserName = styled.h3`
    margin: 0 0 0.3rem 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
`;

const UserUsername = styled.div`
    font-size: 0.85rem;
    color: #64748b;
`;

const UserDetail = styled.div`
    display: flex;
    align-items: center;
    margin-top: 0.8rem;
    padding: 0.8rem 1rem;
    background: white;
    border-radius: 10px;
    border: 1px solid #d9e6ff;
    
    svg {
        color: #4a6cf7;
        width: 18px;
        height: 18px;
        margin-right: 0.8rem;
        flex-shrink: 0;
    }
    
    div {
        font-size: 0.9rem;
        color: #475569;
        
        span {
            font-weight: 600;
            color: #333;
            margin-left: 0.3rem;
        }
    }
`;

const Message = styled.div<{ $type: 'success' | 'error' }>`
    margin-top: 1.2rem;
    padding: 1rem;
    border-radius: 12px;
    font-size: 0.9rem;
    animation: ${fadeIn} 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.8rem;
    
    ${props => props.$type === 'success' 
        ? `
        background: #ecfdf5;
        border: 1px solid #d1fae5;
        color: #059669;
        `
        : `
        background: #fef2f2;
        border: 1px solid #fee2e2;
        color: #dc2626;
        `
    }
`;

const MessageIcon = styled.div`
    display: flex;
    flex-shrink: 0;
    
    svg {
        width: 18px;
        height: 18px;
    }
`;

const MessageText = styled.div`
    flex: 1;
    font-weight: 500;
`;

const CloseButton = styled.button`
    position: absolute;
    top: 1.2rem;
    left: 1.2rem;
    width: 30px;
    height: 30px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.8);
    border: none;
    color: #64748b;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    backdrop-filter: blur(4px);
    
    &:hover {
        background: white;
        color: #4a6cf7;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }
    
    svg {
        width: 18px;
        height: 18px;
    }
`;

const Spinner = styled.div`
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 0.7s linear infinite;
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;

interface FriendCodePageProps {
    onClose: () => void;
}

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
                        <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </CloseButton>
            </Header>
            
            <Content>
                <FormGroup>
                    <Label>친구 코드</Label>
                    <InputWrapper>
                        <InputPrefix>#</InputPrefix>
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
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <line x1="20" y1="8" x2="20" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <line x1="23" y1="11" x2="17" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                                    <UserUsername>@{searchedUser.username}</UserUsername>
                                )}
                            </UserInfo>
                        </UserHeader>
                        
                        {searchedUser.userCode && (
                            <UserDetail>
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                                    <path d="M10 9L7 12L10 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M14 9L17 12L14 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <div>친구 코드: <span>#{searchedUser.userCode}</span></div>
                            </UserDetail>
                        )}
                    </UserCard>
                )}
                
                {message && (
                    <Message $type={isError ? 'error' : 'success'}>
                        <MessageIcon>
                            {isError ? (
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                    <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    <path d="M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            ) : (
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.86" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                        </MessageIcon>
                        <MessageText>{message}</MessageText>
                    </Message>
                )}
            </Content>
        </Container>
    );
};

export default FriendCodePage;