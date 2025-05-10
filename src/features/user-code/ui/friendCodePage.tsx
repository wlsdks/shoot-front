import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../shared/lib/context/AuthContext";
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
    InputIcon,
    Input,
    ButtonGroup,
    Button,
    UserCard,
    UserHeader,
    UserAvatar,
    UserInfo,
    UserName,
    UserDetail,
    Message,
    MessageIcon,
    CloseButton,
    Spinner
} from "../styles/friendCode.styles";

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