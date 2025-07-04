// Message feature public API

// API
export * from './api/message';

// Utilities
export * from './lib/timeUtils';

// Types
export * from './types/ChatRoom.types';

// NOTE: Message state management hooks have been moved to shared layer
// Use the following imports instead:
// import { 
//   useMessageState, 
//   useMessageHandlers, 
//   useScrollManager, 
//   useTypingState, 
//   useTypingHandlers,
//   useContextMenu 
// } from '../../shared';

// Hooks - Context Menu (moved to shared layer)
// export { useContextMenu } from './model/useContextMenu'; 