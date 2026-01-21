import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Comment {
  id: string;
  run_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
    username: string | null;
  };
}

export function useComments(runId: string) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchComments = useCallback(async (limit?: number) => {
    setLoading(true);

    let query = supabase
      .from('comments')
      .select('*', { count: 'exact' })
      .eq('run_id', runId)
      .order('created_at', { ascending: true });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching comments:', error);
    } else if (data) {
      // Fetch profiles for each comment
      const commentsWithProfiles = await Promise.all(
        data.map(async (comment) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, avatar_url, username')
            .eq('user_id', comment.user_id)
            .maybeSingle();

          return {
            ...comment,
            profiles: profile || undefined,
          };
        })
      );

      setComments(commentsWithProfiles);
      setTotal(count || 0);
    }
    setLoading(false);
  }, [runId]);

  useEffect(() => {
    fetchComments(3); // Initially load only 3 comments
  }, [fetchComments]);

  const addComment = async (content: string) => {
    if (!user) return { error: new Error('Not authenticated'), data: null };

    const { data, error } = await supabase
      .from('comments')
      .insert({
        run_id: runId,
        user_id: user.id,
        content: content.trim(),
      })
      .select()
      .single();

    if (!error) {
      // Fetch with profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, avatar_url, username')
        .eq('user_id', user.id)
        .maybeSingle();

      const commentWithProfile = {
        ...data,
        profiles: profile || undefined,
      };

      setComments((prev) => [...prev, commentWithProfile]);
      setTotal((prev) => prev + 1);
    }

    return { error, data };
  };

  const deleteComment = async (commentId: string) => {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (!error) {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setTotal((prev) => prev - 1);
    }

    return { error };
  };

  const loadAllComments = () => {
    fetchComments();
  };

  return {
    comments,
    loading,
    total,
    addComment,
    deleteComment,
    loadAllComments,
    refetch: () => fetchComments(3),
  };
}
