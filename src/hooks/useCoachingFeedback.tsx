import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface CoachingFeedback {
  id: string;
  coach_id: string;
  athlete_id: string;
  feedback_type: string;
  title: string;
  performance_rating: number | null;
  technique_notes: string | null;
  next_session_goals: string | null;
  general_comments: string | null;
  related_session_id: string | null;
  related_program_id: string | null;
  data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface CreateFeedbackData {
  athlete_id: string;
  feedback_type: string;
  title: string;
  performance_rating?: number | null;
  technique_notes?: string | null;
  next_session_goals?: string | null;
  general_comments?: string | null;
  related_session_id?: string | null;
  related_program_id?: string | null;
}

export function useCoachingFeedback() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const createFeedback = useCallback(async (data: CreateFeedbackData) => {
    if (!user) return { error: new Error('Not authenticated') };
    setLoading(true);

    const { data: feedback, error } = await supabase
      .from('coaching_feedback' as any)
      .insert({
        coach_id: user.id,
        athlete_id: data.athlete_id,
        feedback_type: data.feedback_type,
        title: data.title,
        performance_rating: data.performance_rating || null,
        technique_notes: data.technique_notes || null,
        next_session_goals: data.next_session_goals || null,
        general_comments: data.general_comments || null,
        related_session_id: data.related_session_id || null,
        related_program_id: data.related_program_id || null,
      } as any)
      .select()
      .single();

    if (error) {
      setLoading(false);
      return { error };
    }

    // Send auto-message to inbox
    try {
      const { data: convId } = await supabase.rpc('start_or_get_conversation', {
        recipient_id: data.athlete_id,
      });

      if (convId) {
        await supabase.from('messages').insert({
          conversation_id: convId,
          sender_id: user.id,
          content: `📋 New coach update: "${data.title}". View your updates in 121 Coaching.`,
        });
      }
    } catch (e) {
      console.error('Auto-message failed:', e);
    }

    setLoading(false);
    return { data: feedback as unknown as CoachingFeedback, error: null };
  }, [user]);

  const getFeedbackForAthlete = useCallback(async (athleteId: string) => {
    const { data, error } = await supabase
      .from('coaching_feedback' as any)
      .select('*')
      .eq('athlete_id', athleteId)
      .order('created_at', { ascending: false });

    if (error) return { data: [], error };
    return { data: (data || []) as unknown as CoachingFeedback[], error: null };
  }, []);

  const getMyCoachFeedback = useCallback(async () => {
    if (!user) return { data: [], error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('coaching_feedback' as any)
      .select('*')
      .eq('athlete_id', user.id)
      .order('created_at', { ascending: false });

    if (error) return { data: [], error };
    return { data: (data || []) as unknown as CoachingFeedback[], error: null };
  }, [user]);

  const updateFeedback = useCallback(async (id: string, updates: Partial<CreateFeedbackData>) => {
    const { error } = await supabase
      .from('coaching_feedback' as any)
      .update(updates as any)
      .eq('id', id);

    return { error };
  }, []);

  const deleteFeedback = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('coaching_feedback' as any)
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete feedback');
      return { error };
    }
    toast.success('Feedback deleted');
    return { error: null };
  }, []);

  return { createFeedback, getFeedbackForAthlete, getMyCoachFeedback, updateFeedback, deleteFeedback, loading };
}
