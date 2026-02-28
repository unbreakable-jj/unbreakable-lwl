import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from 'sonner';

export interface CoachingAssignment {
  id: string;
  coach_id: string;
  athlete_id: string;
  assigned_by: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  athlete_profile?: {
    display_name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
  coach_profile?: {
    display_name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
}

export function useCoachingAssignments() {
  const { user } = useAuth();
  const { role, isAdminOrOwner } = useUserRole();
  const [assignments, setAssignments] = useState<CoachingAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAssignments = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('coaching_assignments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching assignments:', error);
      setLoading(false);
      return;
    }

    // Fetch profiles for all unique user IDs
    const userIds = [...new Set((data || []).flatMap(a => [a.coach_id, a.athlete_id]))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, display_name, username, avatar_url')
      .in('user_id', userIds);

    const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));

    const enriched: CoachingAssignment[] = (data || []).map(a => ({
      ...a,
      athlete_profile: profileMap.get(a.athlete_id) ? {
        display_name: profileMap.get(a.athlete_id)!.display_name,
        username: profileMap.get(a.athlete_id)!.username,
        avatar_url: profileMap.get(a.athlete_id)!.avatar_url,
      } : undefined,
      coach_profile: profileMap.get(a.coach_id) ? {
        display_name: profileMap.get(a.coach_id)!.display_name,
        username: profileMap.get(a.coach_id)!.username,
        avatar_url: profileMap.get(a.coach_id)!.avatar_url,
      } : undefined,
    }));

    setAssignments(enriched);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const assignCoach = async (coachId: string, athleteId: string, notes?: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('coaching_assignments')
      .insert({
        coach_id: coachId,
        athlete_id: athleteId,
        assigned_by: user.id,
        status: 'active',
        notes: notes || null,
      });

    if (error) {
      if (error.code === '23505') {
        toast.error('This coach-athlete pair already exists');
      } else {
        toast.error('Failed to assign coach');
        console.error(error);
      }
      return;
    }
    toast.success('Coach assigned successfully');
    fetchAssignments();
  };

  const requestCoach = async (coachId: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('coaching_assignments')
      .insert({
        coach_id: coachId,
        athlete_id: user.id,
        status: 'pending',
      });

    if (error) {
      if (error.code === '23505') {
        toast.error('You already have a request with this coach');
      } else {
        toast.error('Failed to request coaching');
        console.error(error);
      }
      return;
    }
    toast.success('Coaching request sent');
    fetchAssignments();
  };

  const updateStatus = async (assignmentId: string, status: 'active' | 'declined' | 'ended') => {
    const { error } = await supabase
      .from('coaching_assignments')
      .update({ status })
      .eq('id', assignmentId);

    if (error) {
      toast.error('Failed to update assignment');
      console.error(error);
      return;
    }
    toast.success(status === 'active' ? 'Request accepted' : status === 'declined' ? 'Request declined' : 'Coaching ended');
    fetchAssignments();
  };

  const removeAssignment = async (assignmentId: string) => {
    const { error } = await supabase
      .from('coaching_assignments')
      .delete()
      .eq('id', assignmentId);

    if (error) {
      toast.error('Failed to remove assignment');
      console.error(error);
      return;
    }
    toast.success('Assignment removed');
    fetchAssignments();
  };

  // Helpers
  const myAthletes = assignments.filter(a => a.coach_id === user?.id && a.status === 'active');
  const pendingRequests = assignments.filter(a => a.coach_id === user?.id && a.status === 'pending');
  const myCoach = assignments.find(a => a.athlete_id === user?.id && a.status === 'active');
  const myPendingRequest = assignments.find(a => a.athlete_id === user?.id && a.status === 'pending');

  return {
    assignments,
    myAthletes,
    pendingRequests,
    myCoach,
    myPendingRequest,
    loading,
    assignCoach,
    requestCoach,
    updateStatus,
    removeAssignment,
    refetch: fetchAssignments,
  };
}
