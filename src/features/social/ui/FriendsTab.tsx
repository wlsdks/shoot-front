// src/features/social/ui/FriendsTab.tsx
import React, { useState, useCallback } from "react";
import { useAuthContext } from "../../auth";
import { useFriends } from "../model/hooks/useFriends";
import FriendSearch from "./FriendSearch";
import { useNavigate } from "react-router-dom";
import TabContainer from "../../../shared/ui/TabContainer";
import TabHeader, { IconButton } from "../../../shared/ui/TabHeader";
import LoadingSpinner from "../../../shared/ui/LoadingSpinner";
import EmptyState from "../../../shared/ui/EmptyState";
import Icon from "../../../shared/ui/Icon";
import FriendItem from "./FriendItem";
import {
    TabContent,
    TabSection,
    TabSectionHeader,
    TabSectionTitle,
    TabSectionCount,
} from "../../../shared/ui/tabStyles";
import {
    ProfileSection,
} from "../styles/FriendsTab.styles";
import { Friend } from "../../../entities";

interface FriendsTabProps {
    FriendCodePageComponent?: React.ComponentType<{ onClose: () => void }>;
    onCreateDirectChat?: (myId: number, friendId: number) => Promise<{ roomId: number }>;
}

const FriendsTab: React.FC<FriendsTabProps> = ({ 
    FriendCodePageComponent, 
    onCreateDirectChat 
}) => {
    const { user } = useAuthContext();
    const navigate = useNavigate();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isFriendCodePageOpen, setIsFriendCodePageOpen] = useState(false);

    const { data: friends = [], isLoading, error } = useFriends(user?.id || 0) as { data: Friend[], isLoading: boolean, error: any };

    const handleChatClick = useCallback(async (friendId: number) => {
        if (!user?.id || !onCreateDirectChat) return;
        
        try {
            const result = await onCreateDirectChat(user.id, friendId);
            navigate(`/chat/${result.roomId}`);
        } catch (error) {
            console.error('Failed to create chat room:', error);
        }
    }, [user?.id, navigate, onCreateDirectChat]);

    const openFriendSearch = () => setIsSearchOpen(true);
    const closeFriendSearch = () => setIsSearchOpen(false);
    const openFriendCodePage = () => setIsFriendCodePageOpen(true);
    const closeFriendCodePage = () => setIsFriendCodePageOpen(false);

    if (isSearchOpen) {
        return (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <TabHeader 
                    title="친구 찾기" 
                    showAppIcon={false}
                    showBackButton={true}
                    onBack={closeFriendSearch}
                />
                <div style={{ flex: 1, overflow: 'auto' }}>
                    <FriendSearch onClose={closeFriendSearch} />
                </div>
            </div>
        );
    }

    if (isFriendCodePageOpen && FriendCodePageComponent) {
        return (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <TabHeader 
                    title="친구 추가" 
                    showAppIcon={false}
                    showBackButton={true}
                    onBack={closeFriendCodePage}
                />
                <div style={{ flex: 1, overflow: 'auto' }}>
                    <FriendCodePageComponent onClose={closeFriendCodePage} />
                </div>
            </div>
        );
    }

    const headerActions = (
        <>
            <IconButton onClick={openFriendSearch} title="친구 찾기">
                <Icon name="search" />
            </IconButton>
            {FriendCodePageComponent && (
                <IconButton onClick={openFriendCodePage} title="친구 추가">
                    <Icon name="user-plus" />
                </IconButton>
            )}
        </>
    );

    if (error) {
        return (
            <TabContainer>
                <TabHeader title="친구" actions={headerActions} />
                <TabContent>
                    <EmptyState text="친구 목록을 불러올 수 없습니다." />
                </TabContent>
            </TabContainer>
        );
    }

    return (
        <TabContainer>
            <TabHeader title="친구" actions={headerActions} />
            <TabContent>
                {/* 내 프로필 카드 */}
                {user && (
                    <ProfileSection>
                        <FriendItem
                            friend={{
                                id: user.id,
                                username: user.username,
                                nickname: user.nickname || user.username,
                                status: "나",
                                profileImageUrl: user.profileImageUrl || undefined,
                                backgroundImageUrl: undefined,
                                bio: user.bio || undefined,
                                userCode: user.userCode || "",
                                lastSeenAt: undefined,
                                isFriend: false,
                                isPending: false,
                                isIncoming: false,
                                isOutgoing: false
                            }}
                            onChatClick={() => {}}
                        />
                    </ProfileSection>
                )}
                
                {isLoading ? (
                    <LoadingSpinner />
                ) : (
                    <TabSection>
                        <TabSectionHeader>
                            <TabSectionTitle>친구</TabSectionTitle>
                            <TabSectionCount>{friends.length}</TabSectionCount>
                        </TabSectionHeader>
                        
                        {friends.length === 0 ? (
                            <EmptyState text="아직 친구가 없습니다. 친구를 추가해보세요!" />
                        ) : (
                            friends.map((friend) => (
                                <FriendItem
                                    key={friend.id}
                                    friend={friend}
                                    onChatClick={onCreateDirectChat ? handleChatClick : () => {}}
                                />
                            ))
                        )}
                    </TabSection>
                )}
            </TabContent>
        </TabContainer>
    );
};

export default FriendsTab;