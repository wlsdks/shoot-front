import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute: React.FC = () => {
    const { isAuthenticated } = useAuth();
    
    // isAuthenticated가 false이면 로그인 페이지로 리디렉션
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;