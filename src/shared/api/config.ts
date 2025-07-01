export const API_CONFIG = {
  BASE_URL: 'http://localhost:8100/api/v1',
  TIMEOUT: 10000,
  SSE_HEARTBEAT_TIMEOUT: 60000,
  SSE_RECONNECT_DELAY: 5000,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  TOKEN_STORAGE_KEYS: {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
    ACTIVE_TAB: 'activeTab',
  },
  QUERY_STALE_TIME: {
    SHORT: 30 * 1000, // 30초
    MEDIUM: 5 * 60 * 1000, // 5분
    LONG: 30 * 60 * 1000, // 30분
  }
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh-token',
    ME: '/auth/me',
  },
  USERS: {
    DELETE_ME: '/users/me',
  },
  CHAT_ROOMS: {
    SSE_UPDATES: (userId: number) => `/chatrooms/updates/${userId}`,
  }
} as const; 