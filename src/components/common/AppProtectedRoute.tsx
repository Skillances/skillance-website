import React, { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { isAppPublicPath } from '@/lib/appRoutes';

interface AppProtectedRouteProps {
  children: ReactNode;
}

/**
 * Guest-aware guard for `/app/*` routes.
 * Public discovery routes pass through; protected routes redirect to `/app/login`.
 */
const AppProtectedRoute: React.FC<AppProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isAppPublicPath(location.pathname)) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-300 border-t-neutral-900" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/app/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AppProtectedRoute;
