// 전역 상태 관리 (예: 인증 상태)
import React, { createContext, useState, useContext, ReactNode } from 'react';

interface AuthContextType {
    user: { id: string; username: string } | null;
    login: (userData: { id: string; username: string }) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<{ id: string; username: string } | null>(null);
  
    const login = (userData: { id: string; username: string }) => setUser(userData);
    const logout = () => setUser(null);
  
    return (
      <AuthContext.Provider value={{ user, login, logout }}>
        {children}
      </AuthContext.Provider>
    );
  };

  export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
  };