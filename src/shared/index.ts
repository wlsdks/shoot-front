// Shared layer public API - FSD compliant exports

// === API Layer ===
export * from './api';

// === UI Components ===
export * from './ui';

// === Library Layer ===

// Core hooks
export * from './lib/hooks';

// Specialized hooks
export * from './lib/hooks/useContextMenu';
export * from './lib/hooks/useQueryFactory';
export * from './lib/hooks/useAsync';
export * from './lib/hooks/useConnection';
export * from './lib/hooks/useMessageManagement';

// WebSocket functionality
export * from './lib/websocket';

// API utilities
export * from './lib/api/queryKeys';
export * from './lib/api/responseHandler';

// Business services
export * from './lib/services/messageReactionService';

// Utility functions
export * from './lib/parseUserString';
export * from './lib/reactionsUtils';
export * from './lib/timeUtils';

// === Types ===
export * from './lib/types/common'; 