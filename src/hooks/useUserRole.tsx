import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type AppRole = 'owner' | 'admin' | 'user';

interface UserRoleState {
  role: AppRole | null;
  isOwner: boolean;
  isAdmin: boolean;
  isAdminOrOwner: boolean;
  loading: boolean;
}

export function useUserRole() {
  const { user } = useAuth();
  const [state, setState] = useState<UserRoleState>({
    role: null,
    isOwner: false,
    isAdmin: false,
    isAdminOrOwner: false,
    loading: true,
  });

  useEffect(() => {
    if (!user) {
      setState({
        role: null,
        isOwner: false,
        isAdmin: false,
        isAdminOrOwner: false,
        loading: false,
      });
      return;
    }

    fetchUserRole();
  }, [user]);

  const fetchUserRole = async () => {
    if (!user) return;

    try {
      // First check if user has owner role
      const { data: ownerData } = await supabase
        .rpc('has_role', { _user_id: user.id, _role: 'owner' });

      if (ownerData) {
        setState({
          role: 'owner',
          isOwner: true,
          isAdmin: false,
          isAdminOrOwner: true,
          loading: false,
        });
        return;
      }

      // Check for admin role
      const { data: adminData } = await supabase
        .rpc('has_role', { _user_id: user.id, _role: 'admin' });

      if (adminData) {
        setState({
          role: 'admin',
          isOwner: false,
          isAdmin: true,
          isAdminOrOwner: true,
          loading: false,
        });
        return;
      }

      // Default to user role
      setState({
        role: 'user',
        isOwner: false,
        isAdmin: false,
        isAdminOrOwner: false,
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching user role:', error);
      setState({
        role: 'user',
        isOwner: false,
        isAdmin: false,
        isAdminOrOwner: false,
        loading: false,
      });
    }
  };

  return {
    ...state,
    refetch: fetchUserRole,
  };
}
