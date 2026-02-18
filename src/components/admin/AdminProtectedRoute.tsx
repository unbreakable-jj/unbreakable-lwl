import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';

interface AdminProtectedRouteProps {
  children: ReactNode;
  requireOwner?: boolean;
}

export function AdminProtectedRoute({ children, requireOwner = false }: AdminProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { isOwner, isAdminOrOwner, loading: roleLoading } = useUserRole();

  const loading = authLoading || roleLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground font-display">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const hasAccess = requireOwner ? isOwner : isAdminOrOwner;

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🚫</span>
          </div>
          <h1 className="font-display text-2xl text-foreground mb-2">ACCESS DENIED</h1>
          <p className="text-muted-foreground mb-6">
            You don't have permission to access this area. 
            {requireOwner 
              ? ' Dev access is required.'
              : ' Coach or Dev access is required.'}
          </p>
          <a 
            href="/"
            className="inline-block px-6 py-3 bg-primary text-primary-foreground font-display rounded-lg hover:bg-primary/90 transition-colors"
          >
            RETURN HOME
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
