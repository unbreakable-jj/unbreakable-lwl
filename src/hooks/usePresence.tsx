import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserPresence {
  user_id: string;
  is_online: boolean;
  last_seen: string;
}

export function usePresence() {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<Map<string, UserPresence>>(new Map());

  // Update own presence
  const updatePresence = useCallback(async (isOnline: boolean) => {
    if (!user) return;

    await supabase.from('user_presence').upsert(
      {
        user_id: user.id,
        is_online: isOnline,
        last_seen: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );
  }, [user]);

  // Set online when component mounts
  useEffect(() => {
    if (!user) return;

    updatePresence(true);

    // Update presence periodically
    const interval = setInterval(() => {
      updatePresence(true);
    }, 60000); // Every minute

    // Set offline when tab closes
    const handleVisibilityChange = () => {
      updatePresence(!document.hidden);
    };

    const handleBeforeUnload = () => {
      // Use sendBeacon for reliable offline status
      const data = JSON.stringify({
        user_id: user.id,
        is_online: false,
        last_seen: new Date().toISOString(),
      });
      navigator.sendBeacon(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/user_presence?on_conflict=user_id`,
        data
      );
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      updatePresence(false);
    };
  }, [user, updatePresence]);

  // Fetch presence for specific users
  const fetchPresence = useCallback(async (userIds: string[]) => {
    if (!userIds.length) return;

    const { data, error } = await supabase
      .from('user_presence')
      .select('*')
      .in('user_id', userIds);

    if (!error && data) {
      const presenceMap = new Map<string, UserPresence>();
      data.forEach((p) => {
        presenceMap.set(p.user_id, p as UserPresence);
      });
      setOnlineUsers(presenceMap);
    }
  }, []);

  // Subscribe to presence changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('presence-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_presence' },
        (payload) => {
          if (payload.new) {
            const presence = payload.new as UserPresence;
            setOnlineUsers((prev) => {
              const newMap = new Map(prev);
              newMap.set(presence.user_id, presence);
              return newMap;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const isUserOnline = (userId: string): boolean => {
    const presence = onlineUsers.get(userId);
    if (!presence) return false;
    
    // Consider online if last_seen within 2 minutes
    const lastSeen = new Date(presence.last_seen);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastSeen.getTime()) / (1000 * 60);
    
    return presence.is_online && diffMinutes < 2;
  };

  return {
    onlineUsers,
    fetchPresence,
    isUserOnline,
    updatePresence,
  };
}
