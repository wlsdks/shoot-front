export interface ChatRoom {
    roomId: number;
    title: string;
    lastMessage: string | null;
    unreadMessages: number;
    isPinned: boolean;
    timestamp?: string;
    type: 'INDIVIDUAL' | 'GROUP';
    profileImageUrl?: string;
}

export interface ChatMessage {
    id: number;
    roomId: number;
    senderId: number;
    content: string;
    timestamp: string;
    isRead: boolean;
}

export interface ChatParticipant {
    userId: number;
    username: string;
    profileImageUrl?: string;
    isOnline: boolean;
    lastSeen?: string;
} 