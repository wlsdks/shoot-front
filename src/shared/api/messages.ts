import { apiGet, apiPost, apiPut, apiDelete } from '../lib/apiUtils';

// Message CRUD operations
export const getMessage = async (messageId: string) => {
    return apiGet(`/messages/${messageId}`);
};

export const sendMessage = async (roomId: number, content: string, tempId?: string) => {
    return apiPost('/messages', { roomId, content, tempId });
};

export const updateMessage = async (messageId: string, content: string) => {
    return apiPut(`/messages/${messageId}`, { content });
};

export const deleteMessage = async (messageId: string) => {
    return apiDelete(`/messages/${messageId}`);
};

// Message status operations
export const markMessageAsRead = async (messageId: string, userId: number) => {
    return apiPost(`/messages/${messageId}/read`, { userId });
};

export const markAllMessagesAsRead = async (roomId: number, userId: number) => {
    return apiPost(`/chat-rooms/${roomId}/read-all`, { userId });
};

// Pinned messages operations
export const getPinnedMessages = async (roomId: number) => {
    const data = await apiGet<any>('/messages/pins', { roomId });
    return { data }; // Match the expected format
};

// Message history operations
export const getMessageHistory = async (
    roomId: number, 
    direction: 'before' | 'after' = 'before',
    cursor?: string,
    limit: number = 50
) => {
    const params = new URLSearchParams({
        direction,
        limit: limit.toString()
    });
    
    if (cursor) {
        params.append('cursor', cursor);
    }
    
    return apiGet(`/chat-rooms/${roomId}/messages?${params.toString()}`);
};

// Search messages
export const searchMessages = async (
    roomId: number,
    query: string,
    limit: number = 20
) => {
    return apiGet(`/chat-rooms/${roomId}/messages/search`, {
        q: query,
        limit
    });
};

// Message forwarding operations
export const forwardMessage = async (
    originalMessageId: string,
    targetRoomId: number,
    forwardingUserId: number
) => {
    return apiPost<any>('/messages/forward', { 
        originalMessageId, 
        targetRoomId, 
        forwardingUserId 
    });
};

export const forwardMessageToUser = async (
    originalMessageId: string,
    targetUserId: number,
    forwardingUserId: number
) => {
    return apiPost<any>('/messages/forward/user', { 
        originalMessageId, 
        targetUserId, 
        forwardingUserId 
    });
}; 