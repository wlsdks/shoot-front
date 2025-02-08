// PrivateRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute: React.FC = () => {
    const { isAuthenticated, loading } = useAuth();

    // 아직 /me 결과를 기다리는 중이면 '로딩중' UI만 표시
    if (loading) {
        return <div>로딩중...</div>;
    }

    // 로딩 끝났는데 인증 안된 경우 => 로그인 화면으로
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // 인증 완료 => 자식 라우트 렌더링
    return <Outlet />;
};

export default PrivateRoute;