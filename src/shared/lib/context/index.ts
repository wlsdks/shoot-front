// Auth types and hooks re-export from features/auth
export type { User } from '../../../entities';
export { useAuth as useAuthContext, AuthProvider } from '../../../features/auth/model/AuthContext'; 