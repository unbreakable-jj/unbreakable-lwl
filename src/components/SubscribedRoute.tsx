import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useOnboardingCheck } from '@/hooks/useOnboardingCheck';
import { useSubscription } from '@/hooks/useSubscription';
import { useUserRole } from '@/hooks/useUserRole';

interface SubscribedRouteProps {
  children: ReactNode;
}

export function SubscribedRoute({ children }: SubscribedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { needsOnboarding, loading: onboardingLoading } = useOnboardingCheck();
  const { subscribed, loading: subLoading } = useSubscription();
  const { isAdminOrOwner, loading: roleLoading } = useUserRole();
  const location = useLocation();

  if (authLoading || onboardingLoading || subLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (needsOnboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // Dev and coach roles bypass subscription check
  if (isAdminOrOwner) {
    return <>{children}</>;
  }

  if (!subscribed) {
    return <Navigate to="/plans" replace />;
  }

  return <>{children}</>;
}
