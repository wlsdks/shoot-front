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