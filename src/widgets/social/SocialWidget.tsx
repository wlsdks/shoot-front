import React from 'react';
import { FriendsTab, SocialTab } from '../../features/social';
import { FriendCodePage as FriendCodeComponent } from '../../features/user-code';
import { createDirectChat } from '../../features/chat-room';

interface SocialWidgetProps {
    activeTab: 'friends' | 'social';
    onTabChange?: (tab: 'friends' | 'social') => void;
}

/**
 * SocialWidget - 소셜 관련 기능들을 조합하는 위젯
 * FSD 원칙에 따라 여러 features를 조합하여 복합적인 UI 블록을 생성
 */
export const SocialWidget: React.FC<SocialWidgetProps> = ({
    activeTab,
    onTabChange
}) => {
    // Adapter function to match the expected interface
    const handleCreateDirectChat = async (myId: number, friendId: number): Promise<{ roomId: number }> => {
        const result = await createDirectChat(myId, friendId);
        return { roomId: result.data.roomId };
    };

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'friends':
                return (
                    <FriendsTab 
                        FriendCodePageComponent={FriendCodeComponent}
                        onCreateDirectChat={handleCreateDirectChat}
                    />
                );
            case 'social':
                return <SocialTab />;
            default:
                return <FriendsTab 
                    FriendCodePageComponent={FriendCodeComponent}
                    onCreateDirectChat={handleCreateDirectChat}
                />;
        }
    };

    return renderActiveTab();
}; 