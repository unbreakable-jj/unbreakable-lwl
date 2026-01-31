import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface BlockedUser {
  id: string;
  blocked_id: string;
  created_at: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
}

export function useBlockedUsers() {
  const { user } = useAuth();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBlockedUsers = useCallback(async () => {
    if (!user) {
      setBlockedUsers([]);
      setLoading(false);
      return;
    }

    try {
      // Fetch blocked user IDs
      const { data: blocks, error: blocksError } = await supabase
        .from('blocked_users')
        .select('id, blocked_id, created_at')
        .eq('blocker_id', user.id);

      if (blocksError) throw blocksError;

      if (!blocks || blocks.length === 0) {
        setBlockedUsers([]);
        setLoading(false);
        return;
      }

      // Fetch profiles for blocked users
      const blockedIds = blocks.map(b => b.blocked_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, display_name, username, avatar_url')
        .in('user_id', blockedIds);

      if (profilesError) throw profilesError;

      const blockedWithProfiles: BlockedUser[] = blocks.map(block => {
        const profile = profiles?.find(p => p.user_id === block.blocked_id);
        return {
          id: block.id,
          blocked_id: block.blocked_id,
          created_at: block.created_at,
          display_name: profile?.display_name || null,
          username: profile?.username || null,
          avatar_url: profile?.avatar_url || null,
        };
      });

      setBlockedUsers(blockedWithProfiles);
    } catch (error) {
      console.error('Error fetching blocked users:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBlockedUsers();
  }, [fetchBlockedUsers]);

  const blockUser = async (blockedId: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('blocked_users')
        .insert({
          blocker_id: user.id,
          blocked_id: blockedId,
        });

      if (error) throw error;

      // Also remove any existing friendship
      await supabase
        .from('friendships')
        .delete()
        .or(`and(requester_id.eq.${user.id},addressee_id.eq.${blockedId}),and(requester_id.eq.${blockedId},addressee_id.eq.${user.id})`);

      await fetchBlockedUsers();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const unblockUser = async (blockedId: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('blocked_users')
        .delete()
        .eq('blocker_id', user.id)
        .eq('blocked_id', blockedId);

      if (error) throw error;
      await fetchBlockedUsers();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const isUserBlocked = useCallback((userId: string): boolean => {
    return blockedUsers.some(b => b.blocked_id === userId);
  }, [blockedUsers]);

  const checkIfBlockedBy = async (otherUserId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('blocked_users')
        .select('id')
        .eq('blocker_id', otherUserId)
        .eq('blocked_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking if blocked by:', error);
      return false;
    }
  };

  return {
    blockedUsers,
    loading,
    refetch: fetchBlockedUsers,
    blockUser,
    unblockUser,
    isUserBlocked,
    checkIfBlockedBy,
  };
}
