import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface FeedRun {
  id: string;
  user_id: string;
  title: string | null;
  description: string | null;
  distance_km: number;
  duration_seconds: number;
  pace_per_km_seconds: number | null;
  started_at: string;
  visibility: 'public' | 'friends' | 'private';
  comments_enabled: boolean;
  is_gps_tracked: boolean | null;
  route_polyline: string | null;
  elevation_gain_m: number | null;
  calories_burned: number | null;
  average_speed_kph: number | null;
}

export interface FeedPost {
  id: string;
  user_id: string;
  content: string | null;
  image_url: string | null;
  visibility: 'public' | 'friends' | 'private';
  comments_enabled: boolean;
  created_at: string;
}

export interface FeedWorkout {
  id: string;
  user_id: string;
  program_id: string | null;
  week_number: number;
  day_name: string;
  session_type: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  status: 'in_progress' | 'completed' | 'cancelled';
  notes: string | null;
  visibility: 'public' | 'friends' | 'private';
  comments_enabled: boolean;
  exercise_count?: number;
  sets_completed?: number;
}

export interface FeedProfile {
  display_name: string | null;
  avatar_url: string | null;
  username: string | null;
}

export interface FeedItemBase {
  timestamp: Date;
  profiles?: FeedProfile;
  kudos_count?: number;
  comments_count?: number;
  has_kudos?: boolean;
}

export type FeedItem =
  | { type: 'run'; data: FeedRun & FeedItemBase }
  | { type: 'post'; data: FeedPost & FeedItemBase }
  | { type: 'workout'; data: FeedWorkout & FeedItemBase };

export function useUnifiedFeed() {
  const { user } = useAuth();
  const [runs, setRuns] = useState<(FeedRun & FeedItemBase)[]>([]);
  const [posts, setPosts] = useState<(FeedPost & FeedItemBase)[]>([]);
  const [workouts, setWorkouts] = useState<(FeedWorkout & FeedItemBase)[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRuns = useCallback(async () => {
    const { data, error } = await supabase
      .from('runs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(30);

    if (error || !data) return [];

    const enriched = await Promise.all(
      data.map(async (run) => {
        const [kudosRes, commentsRes, hasKudosRes, profileRes] = await Promise.all([
          supabase.from('kudos').select('id', { count: 'exact', head: true }).eq('run_id', run.id),
          supabase.from('comments').select('id', { count: 'exact', head: true }).eq('run_id', run.id),
          user
            ? supabase.from('kudos').select('id').eq('run_id', run.id).eq('user_id', user.id).maybeSingle()
            : Promise.resolve({ data: null }),
          supabase.from('profiles').select('display_name, avatar_url, username').eq('user_id', run.user_id).maybeSingle(),
        ]);

        return {
          ...run,
          visibility: (run.visibility || 'public') as 'public' | 'friends' | 'private',
          timestamp: new Date(run.started_at),
          profiles: profileRes.data || undefined,
          kudos_count: kudosRes.count || 0,
          comments_count: commentsRes.count || 0,
          has_kudos: !!hasKudosRes.data,
        };
      })
    );

    return enriched;
  }, [user]);

  const fetchPosts = useCallback(async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);

    if (error || !data) return [];

    const enriched = await Promise.all(
      data.map(async (post) => {
        const [kudosRes, commentsRes, hasKudosRes, profileRes] = await Promise.all([
          supabase.from('post_kudos').select('id', { count: 'exact', head: true }).eq('post_id', post.id),
          supabase.from('post_comments').select('id', { count: 'exact', head: true }).eq('post_id', post.id),
          user
            ? supabase.from('post_kudos').select('id').eq('post_id', post.id).eq('user_id', user.id).maybeSingle()
            : Promise.resolve({ data: null }),
          supabase.from('profiles').select('display_name, avatar_url, username').eq('user_id', post.user_id).maybeSingle(),
        ]);

        return {
          ...post,
          visibility: (post.visibility || 'public') as 'public' | 'friends' | 'private',
          timestamp: new Date(post.created_at),
          profiles: profileRes.data || undefined,
          kudos_count: kudosRes.count || 0,
          comments_count: commentsRes.count || 0,
          has_kudos: !!hasKudosRes.data,
        };
      })
    );

    return enriched;
  }, [user]);

  const fetchWorkouts = useCallback(async () => {
    const { data, error } = await supabase
      .from('workout_sessions')
      .select('*, exercise_logs(id, completed)')
      .eq('status', 'completed')
      .order('started_at', { ascending: false })
      .limit(30);

    if (error || !data) return [];

    const enriched = await Promise.all(
      data.map(async (session) => {
        const exerciseLogs = session.exercise_logs || [];
        const [kudosRes, commentsRes, hasKudosRes, profileRes] = await Promise.all([
          supabase.from('workout_kudos').select('id', { count: 'exact', head: true }).eq('workout_id', session.id),
          supabase.from('workout_comments').select('id', { count: 'exact', head: true }).eq('workout_id', session.id),
          user
            ? supabase.from('workout_kudos').select('id').eq('workout_id', session.id).eq('user_id', user.id).maybeSingle()
            : Promise.resolve({ data: null }),
          supabase.from('profiles').select('display_name, avatar_url, username').eq('user_id', session.user_id).maybeSingle(),
        ]);

        return {
          id: session.id,
          user_id: session.user_id,
          program_id: session.program_id,
          week_number: session.week_number,
          day_name: session.day_name,
          session_type: session.session_type,
          started_at: session.started_at,
          ended_at: session.ended_at,
          duration_seconds: session.duration_seconds,
          status: session.status as 'in_progress' | 'completed' | 'cancelled',
          notes: session.notes,
          visibility: (session.visibility || 'public') as 'public' | 'friends' | 'private',
          comments_enabled: session.comments_enabled,
          exercise_count: new Set(exerciseLogs.map((l: { id: string }) => l.id)).size,
          sets_completed: exerciseLogs.filter((l: { completed: boolean }) => l.completed).length,
          timestamp: new Date(session.started_at),
          profiles: profileRes.data || undefined,
          kudos_count: kudosRes.count || 0,
          comments_count: commentsRes.count || 0,
          has_kudos: !!hasKudosRes.data,
        };
      })
    );

    return enriched;
  }, [user]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [runsData, postsData, workoutsData] = await Promise.all([
      fetchRuns(),
      fetchPosts(),
      fetchWorkouts(),
    ]);
    setRuns(runsData);
    setPosts(postsData);
    setWorkouts(workoutsData);
    setLoading(false);
  }, [fetchRuns, fetchPosts, fetchWorkouts]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const feedItems = useMemo((): FeedItem[] => {
    const items: FeedItem[] = [
      ...runs.map((run) => ({ type: 'run' as const, data: run })),
      ...posts.map((post) => ({ type: 'post' as const, data: post })),
      ...workouts.map((workout) => ({ type: 'workout' as const, data: workout })),
    ];
    return items.sort((a, b) => b.data.timestamp.getTime() - a.data.timestamp.getTime());
  }, [runs, posts, workouts]);

  // Kudos toggles
  const toggleRunKudos = async (runId: string) => {
    if (!user) return;
    const run = runs.find((r) => r.id === runId);
    if (!run) return;
    if (run.has_kudos) {
      await supabase.from('kudos').delete().eq('run_id', runId).eq('user_id', user.id);
    } else {
      await supabase.from('kudos').insert({ run_id: runId, user_id: user.id });
    }
    fetchAll();
  };

  const togglePostKudos = async (postId: string) => {
    if (!user) return;
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    if (post.has_kudos) {
      await supabase.from('post_kudos').delete().eq('post_id', postId).eq('user_id', user.id);
    } else {
      await supabase.from('post_kudos').insert({ post_id: postId, user_id: user.id });
    }
    fetchAll();
  };

  const toggleWorkoutKudos = async (workoutId: string) => {
    if (!user) return;
    const workout = workouts.find((w) => w.id === workoutId);
    if (!workout) return;
    if (workout.has_kudos) {
      await supabase.from('workout_kudos').delete().eq('workout_id', workoutId).eq('user_id', user.id);
    } else {
      await supabase.from('workout_kudos').insert({ workout_id: workoutId, user_id: user.id });
    }
    fetchAll();
  };

  // Delete actions
  const deleteRun = async (runId: string) => {
    const { error } = await supabase.from('runs').delete().eq('id', runId);
    if (!error) fetchAll();
    return { error };
  };

  const deletePost = async (postId: string) => {
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (!error) fetchAll();
    return { error };
  };

  const deleteWorkout = async (workoutId: string) => {
    const { error } = await supabase.from('workout_sessions').delete().eq('id', workoutId);
    if (!error) fetchAll();
    return { error };
  };

  // Toggle comments
  const toggleRunComments = async (runId: string) => {
    if (!user) return { error: new Error('Not authenticated') };
    const run = runs.find((r) => r.id === runId);
    if (!run || run.user_id !== user.id) return { error: new Error('Not authorized') };
    const { error } = await supabase.from('runs').update({ comments_enabled: !run.comments_enabled }).eq('id', runId);
    if (!error) fetchAll();
    return { error };
  };

  const togglePostComments = async (postId: string) => {
    if (!user) return { error: new Error('Not authenticated') };
    const post = posts.find((p) => p.id === postId);
    if (!post || post.user_id !== user.id) return { error: new Error('Not authorized') };
    const { error } = await supabase.from('posts').update({ comments_enabled: !post.comments_enabled }).eq('id', postId);
    if (!error) fetchAll();
    return { error };
  };

  const toggleWorkoutComments = async (workoutId: string) => {
    if (!user) return { error: new Error('Not authenticated') };
    const workout = workouts.find((w) => w.id === workoutId);
    if (!workout || workout.user_id !== user.id) return { error: new Error('Not authorized') };
    const { error } = await supabase.from('workout_sessions').update({ comments_enabled: !workout.comments_enabled }).eq('id', workoutId);
    if (!error) fetchAll();
    return { error };
  };

  return {
    feedItems,
    loading,
    refetch: fetchAll,
    toggleRunKudos,
    togglePostKudos,
    toggleWorkoutKudos,
    deleteRun,
    deletePost,
    deleteWorkout,
    toggleRunComments,
    togglePostComments,
    toggleWorkoutComments,
  };
}
