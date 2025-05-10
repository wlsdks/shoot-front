export interface ChatRoomResponse {
    roomId: number;
    title: string;
    lastMessage: string | null;
    unreadMessages: number;
    isPinned: boolean;
    timestamp: string;
}

export interface DirectChatRoomResponse {
    roomId: number;
    title: string;
    lastMessage: string | null;
    unreadMessages: number;
    isPinned: boolean;
    timestamp: string;
} 

export interface FindDirectChatRoomParams {
    myId: number;
    otherUserId: number;
}