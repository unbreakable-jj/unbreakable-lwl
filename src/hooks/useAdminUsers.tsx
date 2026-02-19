import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useUserRole, AppRole } from './useUserRole';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';


export interface AdminUser {
  user_id: string;
  email: string | null;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
  is_suspended: boolean;
  suspension_reason?: string;
  role?: AppRole;
}

export interface UserSuspension {
  id: string;
  user_id: string;
  suspended_by: string;
  reason: string;
  suspended_at: string;
  expires_at: string | null;
  is_permanent: boolean;
  lifted_at: string | null;
}

export function useAdminUsers() {
  const { user } = useAuth();
  const { isAdminOrOwner, isOwner } = useUserRole();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const fetchUsers = useCallback(async (
    search?: string,
    page: number = 0,
    pageSize: number = 20
  ) => {
    if (!user || !isAdminOrOwner) return;

    setLoading(true);
    try {
      let query = supabase
        .from('profiles')
        .select('user_id, display_name, username, avatar_url, created_at', { count: 'exact' });

      if (search) {
        query = query.or(`display_name.ilike.%${search}%,username.ilike.%${search}%`);
      }

      const { data: profiles, error, count } = await query
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) throw error;

      // Fetch suspension status for each user
      const userIds = profiles?.map(p => p.user_id) || [];
      const { data: suspensions } = await supabase
        .from('user_suspensions')
        .select('user_id, reason')
        .in('user_id', userIds)
        .is('lifted_at', null);

      const suspensionMap = new Map(suspensions?.map(s => [s.user_id, s.reason]) || []);

      // Fetch roles for each user (only if owner)
      let roleMap = new Map<string, AppRole>();
      if (isOwner) {
        const { data: roles } = await supabase
          .from('user_roles')
          .select('user_id, role')
          .in('user_id', userIds);
        
        roles?.forEach(r => {
          roleMap.set(r.user_id, r.role as AppRole);
        });
      }

      const enrichedUsers: AdminUser[] = (profiles || []).map(p => ({
        user_id: p.user_id,
        email: null, // Email not available from profiles
        display_name: p.display_name,
        username: p.username,
        avatar_url: p.avatar_url,
        created_at: p.created_at,
        is_suspended: suspensionMap.has(p.user_id),
        suspension_reason: suspensionMap.get(p.user_id),
        role: roleMap.get(p.user_id) || 'user',
      }));

      setUsers(enrichedUsers);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [user, isAdminOrOwner, isOwner]);

  const suspendUser = useCallback(async (
    targetUserId: string,
    reason: string,
    isPermanent: boolean = false,
    expiresAt?: Date
  ) => {
    if (!user || !isAdminOrOwner) {
      toast.error('Unauthorized');
      return { error: new Error('Unauthorized') };
    }

    try {
      const { error } = await supabase
        .from('user_suspensions')
        .insert({
          user_id: targetUserId,
          suspended_by: user.id,
          reason,
          is_permanent: isPermanent,
          expires_at: expiresAt?.toISOString() || null,
        });

      if (error) throw error;

      // Log the action
      await supabase.from('admin_activity_logs').insert([{
        admin_id: user.id,
        action_type: 'suspend_user',
        target_type: 'user',
        target_id: targetUserId,
        details: { reason, is_permanent: isPermanent } as Json,
      }]);

      toast.success('User suspended successfully');
      return { error: null };
    } catch (error) {
      console.error('Error suspending user:', error);
      toast.error('Failed to suspend user');
      return { error };
    }
  }, [user, isAdminOrOwner]);

  const liftSuspension = useCallback(async (targetUserId: string) => {
    if (!user || !isAdminOrOwner) {
      toast.error('Unauthorized');
      return { error: new Error('Unauthorized') };
    }

    try {
      const { error } = await supabase
        .from('user_suspensions')
        .update({
          lifted_at: new Date().toISOString(),
          lifted_by: user.id,
        })
        .eq('user_id', targetUserId)
        .is('lifted_at', null);

      if (error) throw error;

      // Log the action
      await supabase.from('admin_activity_logs').insert([{
        admin_id: user.id,
        action_type: 'lift_suspension',
        target_type: 'user',
        target_id: targetUserId,
      }]);

      toast.success('Suspension lifted');
      return { error: null };
    } catch (error) {
      console.error('Error lifting suspension:', error);
      toast.error('Failed to lift suspension');
      return { error };
    }
  }, [user, isAdminOrOwner]);

  const assignRole = useCallback(async (targetUserId: string, role: AppRole) => {
    if (!user || !isOwner) {
      toast.error('Only owners can assign roles');
      return { error: new Error('Unauthorized') };
    }

    try {
      // Remove existing roles first
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', targetUserId);

      // Assign new role (skip if 'user' since that's the default)
      if (role !== 'user') {
        const { error } = await supabase
          .from('user_roles')
          .insert([{
            user_id: targetUserId,
            role,
            assigned_by: user.id,
          }]);

        if (error) throw error;
      }

      // Log the action
      await supabase.from('admin_activity_logs').insert([{
        admin_id: user.id,
        action_type: 'assign_role',
        target_type: 'user',
        target_id: targetUserId,
        details: { new_role: role } as Json,
      }]);

      toast.success(`Role updated to ${role}`);
      return { error: null };
    } catch (error) {
      console.error('Error assigning role:', error);
      toast.error('Failed to assign role');
      return { error };
    }
  }, [user, isOwner]);

  const globalBlockUser = useCallback(async (targetUserId: string, reason: string) => {
    if (!user || !isAdminOrOwner) {
      toast.error('Unauthorized');
      return { error: new Error('Unauthorized') };
    }

    // Suspend permanently as a global block
    return suspendUser(targetUserId, `Global Block: ${reason}`, true);
  }, [user, isAdminOrOwner, suspendUser]);

  const deleteUser = useCallback(async (targetUserId: string) => {
    if (!user || !isOwner) {
      toast.error('Only Devs can delete users');
      return { error: new Error('Unauthorized') };
    }

    try {
      const { data, error } = await supabase.functions.invoke('admin-delete-user', {
        body: { target_user_id: targetUserId },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success('User permanently deleted');
      return { error: null };
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'Failed to delete user');
      return { error };
    }
  }, [user, isOwner]);

  return {
    users,
    loading,
    totalCount,
    fetchUsers,
    suspendUser,
    liftSuspension,
    assignRole,
    globalBlockUser,
    deleteUser,
  };
}
