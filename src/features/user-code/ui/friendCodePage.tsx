// src/features/user-code/ui/friendCodePage.tsx
import React, { useState, useEffect, useRef } from "react";
import { useAuthContext } from "../../auth";
import { useUserCode } from "../model/useUserCode";
import { UserCode } from "../types";
import {
    Container,
    Header,
    Title,
    Content,
    FormGroup,
    Label,
    InputWrapper,
    InputPrefix,
    Input,
    ButtonGroup,
    Button,
    UserCard,
    UserHeader,
    UserAvatar,
    UserInfo,
    UserName,
    UserUsername,
    UserDetail,
    Message,
    MessageIcon,
    MessageText,
    CloseButton,
    Spinner
} from "../styles/friendCodePage.styles";

interface FriendCodePageProps {
    onClose: () => void;
}

const FriendCodePage: React.FC<FriendCodePageProps> = ({ onClose }) => {
    const { user } = useAuthContext();
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
            onError: (error: any) => {
                // API 응답의 message를 우선적으로 사용
                const errorMessage = error?.message || "검색 중 오류가 발생했습니다";
                setMessage(errorMessage);
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
            onError: (error: any) => {
                // API 응답의 message를 우선적으로 사용
                const errorMessage = error?.message || "친구 요청 전송에 실패했습니다";
                setMessage(errorMessage);
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