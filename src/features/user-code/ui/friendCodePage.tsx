// src/features/user-code/ui/friendCodePage.tsx
import React, { useState, useEffect, useRef } from "react";
import { useUserCode } from "../model/useUserCode";
import { UserCode } from "../types";
import { User } from "../../../entities";
import {
    Container,
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
    Spinner
} from "../styles/friendCodePage.styles";

interface FriendCodePageProps {
    user: User | null;
    onClose: () => void;
}

const FriendCodePage: React.FC<FriendCodePageProps> = ({ user, onClose }) => {
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
                                <UserUsername>#{searchedUser.userCode}</UserUsername>
                            </UserInfo>
                        </UserHeader>
                        <UserDetail>
                            친구 요청을 보낼 수 있습니다.
                        </UserDetail>
                    </UserCard>
                )}
                
                {message && (
                    <Message $type={isError ? 'error' : 'success'}>
                        <MessageIcon>
                            {isError ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                    <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                                    <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                                </svg>
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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