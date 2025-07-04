// React Query 키 중앙 관리 시스템
// FSD 원칙에 따라 shared 레이어에서 쿼리 키를 통합 관리

// 기본 키들
const BASE_KEYS = {
  users: ['users'] as const,
  friends: ['friends'] as const,
  chatRooms: ['chatRooms'] as const,
  messages: ['messages'] as const,
  reactions: ['reactions'] as const,
  userCode: ['userCode'] as const,
  auth: ['auth'] as const
} as const;

export const QUERY_KEYS = {
  // User 관련
  USER: {
    all: BASE_KEYS.users,
    detail: (userId: number) => [...BASE_KEYS.users, 'detail', userId] as const,
    me: () => [...BASE_KEYS.users, 'me'] as const,
    profile: (userId: number) => [...BASE_KEYS.users, 'profile', userId] as const,
    code: (userId: number) => [...BASE_KEYS.users, 'code', userId] as const,
    status: (userId: number) => [...BASE_KEYS.users, 'status', userId] as const
  },

  // Friends 관련
  FRIENDS: {
    all: BASE_KEYS.friends,
    list: (userId: number) => [...BASE_KEYS.friends, 'list', userId] as const,
    incoming: (userId: number) => [...BASE_KEYS.friends, 'incoming', userId] as const,
    outgoing: (userId: number) => [...BASE_KEYS.friends, 'outgoing', userId] as const,
    recommendations: (userId: number, options?: any) => 
      [...BASE_KEYS.friends, 'recommendations', userId, options] as const,
    search: (query: string) => [...BASE_KEYS.friends, 'search', query] as const
  },

  // ChatRooms 관련
  CHAT_ROOMS: {
    all: BASE_KEYS.chatRooms,
    list: (userId: number) => [...BASE_KEYS.chatRooms, 'list', userId] as const,
    detail: (roomId: number) => [...BASE_KEYS.chatRooms, 'detail', roomId] as const,
    direct: (myId: number, otherUserId: number) => 
      [...BASE_KEYS.chatRooms, 'direct', myId, otherUserId] as const,
    favorite: (roomId: number, userId: number) => 
      [...BASE_KEYS.chatRooms, 'favorite', roomId, userId] as const
  },

  // Messages 관련
  MESSAGES: {
    all: BASE_KEYS.messages,
    list: (roomId: number, options?: any) => 
      [...BASE_KEYS.messages, 'list', roomId, options] as const,
    pinned: (roomId: number) => [...BASE_KEYS.messages, 'pinned', roomId] as const,
    reactions: (messageId: string) => [...BASE_KEYS.messages, 'reactions', messageId] as const,
    detail: (messageId: string) => [...BASE_KEYS.messages, 'detail', messageId] as const
  },

  // Reactions 관련
  REACTIONS: {
    all: BASE_KEYS.reactions,
    types: () => [...BASE_KEYS.reactions, 'types'] as const,
    byMessage: (messageId: string) => [...BASE_KEYS.reactions, 'message', messageId] as const
  },

  // UserCode 관련
  USER_CODE: {
    all: BASE_KEYS.userCode,
    my: (userId: number) => [...BASE_KEYS.userCode, 'my', userId] as const,
    search: (code: string) => [...BASE_KEYS.userCode, 'search', code] as const
  },

  // Auth 관련
  AUTH: {
    all: BASE_KEYS.auth,
    me: () => [...BASE_KEYS.auth, 'me'] as const,
    session: () => [...BASE_KEYS.auth, 'session'] as const
  }
} as const;

// 타입 안전성을 위한 헬퍼 함수들
export const createQueryKey = {
  user: {
    all: () => QUERY_KEYS.USER.all,
    detail: (userId: number) => QUERY_KEYS.USER.detail(userId),
    me: () => QUERY_KEYS.USER.me(),
    profile: (userId: number) => QUERY_KEYS.USER.profile(userId),
    code: (userId: number) => QUERY_KEYS.USER.code(userId)
  },
  friends: {
    all: () => QUERY_KEYS.FRIENDS.all,
    list: (userId: number) => QUERY_KEYS.FRIENDS.list(userId),
    incoming: (userId: number) => QUERY_KEYS.FRIENDS.incoming(userId),
    outgoing: (userId: number) => QUERY_KEYS.FRIENDS.outgoing(userId),
    recommendations: (userId: number, options?: any) => QUERY_KEYS.FRIENDS.recommendations(userId, options)
  },
  chatRooms: {
    all: () => QUERY_KEYS.CHAT_ROOMS.all,
    list: (userId: number) => QUERY_KEYS.CHAT_ROOMS.list(userId),
    detail: (roomId: number) => QUERY_KEYS.CHAT_ROOMS.detail(roomId)
  },
  messages: {
    all: () => QUERY_KEYS.MESSAGES.all,
    list: (roomId: number, options?: any) => QUERY_KEYS.MESSAGES.list(roomId, options),
    pinned: (roomId: number) => QUERY_KEYS.MESSAGES.pinned(roomId)
  }
};

// 쿼리 무효화 헬퍼
export const invalidateQueries = {
  user: {
    all: (queryClient: any) => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER.all }),
    detail: (queryClient: any, userId: number) => 
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER.detail(userId) }),
    me: (queryClient: any) => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER.me() })
  },
  friends: {
    all: (queryClient: any) => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FRIENDS.all }),
    list: (queryClient: any, userId: number) => 
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FRIENDS.list(userId) })
  },
  chatRooms: {
    all: (queryClient: any) => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CHAT_ROOMS.all }),
    list: (queryClient: any, userId: number) => 
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CHAT_ROOMS.list(userId) })
  },
  messages: {
    all: (queryClient: any) => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MESSAGES.all }),
    pinned: (queryClient: any, roomId: number) => 
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MESSAGES.pinned(roomId) })
  }
}; 