import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface LiveStream {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: 'starting' | 'live' | 'ended' | 'cancelled';
  viewer_count: number;
  started_at: string | null;
  ended_at: string | null;
  stream_key: string;
  visibility: 'public' | 'friends' | 'private';
  allow_comments: boolean;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
  profile?: {
    display_name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
}

export function useLiveStreams() {
  const { user } = useAuth();
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [myStream, setMyStream] = useState<LiveStream | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStreams = useCallback(async () => {
    // Fetch active live streams
    const { data, error } = await supabase
      .from('live_streams')
      .select('*')
      .in('status', ['starting', 'live'])
      .order('started_at', { ascending: false });

    if (!error && data) {
      // Fetch profiles for streamers
      const userIds = [...new Set(data.map(s => s.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, username, avatar_url')
        .in('user_id', userIds);

      const profileMap = (profiles || []).reduce((acc, p) => {
        acc[p.user_id] = p;
        return acc;
      }, {} as Record<string, any>);

      const streamsWithProfiles = data.map(s => ({
        ...s,
        profile: profileMap[s.user_id],
      })) as LiveStream[];

      setStreams(streamsWithProfiles);
    }
    setLoading(false);
  }, []);

  const fetchMyStream = useCallback(async () => {
    if (!user) {
      setMyStream(null);
      return;
    }

    const { data, error } = await supabase
      .from('live_streams')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['starting', 'live'])
      .maybeSingle();

    if (!error) {
      setMyStream(data as LiveStream | null);
    }
  }, [user]);

  useEffect(() => {
    fetchStreams();
    fetchMyStream();
  }, [fetchStreams, fetchMyStream]);

  // Real-time subscription for stream updates
  useEffect(() => {
    const channel = supabase
      .channel('live-streams-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'live_streams' },
        () => {
          fetchStreams();
          fetchMyStream();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchStreams, fetchMyStream]);

  const startStream = async (
    title: string,
    visibility: 'public' | 'friends' | 'private' = 'public',
    description?: string
  ) => {
    if (!user) return { error: new Error('Not authenticated'), stream: null };

    // Check if user already has an active stream
    if (myStream) {
      return { error: new Error('You already have an active stream'), stream: null };
    }

    const { data, error } = await supabase
      .from('live_streams')
      .insert({
        user_id: user.id,
        title,
        description,
        visibility,
        status: 'starting',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (!error && data) {
      setMyStream(data as LiveStream);
    }

    return { error, stream: data as LiveStream | null };
  };

  const goLive = async () => {
    if (!user || !myStream) return { error: new Error('No stream to start') };

    const { error } = await supabase
      .from('live_streams')
      .update({ status: 'live' })
      .eq('id', myStream.id)
      .eq('user_id', user.id);

    if (!error) {
      setMyStream({ ...myStream, status: 'live' });
    }

    return { error };
  };

  const endStream = async () => {
    if (!user || !myStream) return { error: new Error('No stream to end') };

    const { error } = await supabase
      .from('live_streams')
      .update({
        status: 'ended',
        ended_at: new Date().toISOString(),
      })
      .eq('id', myStream.id)
      .eq('user_id', user.id);

    if (!error) {
      setMyStream(null);
    }

    return { error };
  };

  const updateViewerCount = async (streamId: string, delta: number) => {
    // Update viewer count directly - in production this would be handled by a backend function
    try {
      const stream = streams.find(s => s.id === streamId);
      if (!stream) return { error: new Error('Stream not found') };
      
      const { error } = await supabase
        .from('live_streams')
        .update({ viewer_count: Math.max(0, stream.viewer_count + delta) })
        .eq('id', streamId);
      
      return { error };
    } catch (err) {
      return { error: err as Error };
    }
  };

  return {
    streams,
    myStream,
    loading,
    startStream,
    goLive,
    endStream,
    updateViewerCount,
    refetch: fetchStreams,
  };
}
