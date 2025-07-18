// Social feature public API

// API
export * from './api';

// Model (Hooks)
export { useFriends } from './model/hooks/useFriends';
export { useFriendSearch } from './model/hooks/useFriendSearch';
export { useSocialData } from './model/hooks/useSocialData';

// UI Components
export { default as FriendsTab } from './ui/FriendsTab';
export { default as SocialTab } from './ui/SocialTab';
export { default as FriendItem } from './ui/FriendItem';
export { default as SocialItem } from './ui/SocialItem';
export { default as FriendSearch } from './ui/FriendSearch'; 