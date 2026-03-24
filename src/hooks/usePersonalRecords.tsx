import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { PR_DISTANCES, getMatchingPRDistance } from '@/lib/medalDefinitions';

export interface PersonalRecord {
  id: string;
  user_id: string;
  distance_type: string;
  distance_km: number | null;
  time_seconds: number | null;
  pace_per_km_seconds: number | null;
  run_id: string | null;
  achieved_at: string;
  created_at: string;
  activity_type: string;
}

export function usePersonalRecords() {
  const { user } = useAuth();
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRecords();
    } else {
      setRecords([]);
      setLoading(false);
    }
  }, [user]);

  const fetchRecords = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('personal_records')
      .select('*')
      .eq('user_id', user.id)
      .order('achieved_at', { ascending: false });

    if (error) {
      console.error('Error fetching personal records:', error);
    } else {
      setRecords(data || []);
    }
    setLoading(false);
  };

  const checkAndUpdatePRs = async (run: {
    id: string;
    distance_km: number;
    duration_seconds: number;
    started_at: string;
    activity_type?: string;
  }): Promise<{ distanceType: string; isNewPR: boolean }[]> => {
    if (!user) return [];

    const activityType = run.activity_type || 'run';
    const results: { distanceType: string; isNewPR: boolean }[] = [];

    // Check ALL distance buckets the run qualifies for
    // e.g., a 7km run qualifies for 1km, 3km, and 5km PRs
    for (const prDistance of PR_DISTANCES) {
      if (run.distance_km < prDistance.distanceKm) continue;

      // Calculate the time it would have taken to cover this PR distance
      // (proportional estimate for longer runs)
      const proportionalTime = Math.round(run.duration_seconds * (prDistance.distanceKm / run.distance_km));
      const pacePerKmSeconds = Math.round(proportionalTime / prDistance.distanceKm);

      // Check existing PR for this distance AND activity type
      const existingPR = records.find(r => r.distance_type === prDistance.type && r.activity_type === activityType);

      if (!existingPR || (existingPR.time_seconds && proportionalTime < existingPR.time_seconds)) {
        if (existingPR) {
          await supabase
            .from('personal_records')
            .update({
              time_seconds: proportionalTime,
              pace_per_km_seconds: pacePerKmSeconds,
              run_id: run.id,
              achieved_at: run.started_at,
              distance_km: run.distance_km,
            })
            .eq('id', existingPR.id);
        } else {
          await supabase
            .from('personal_records')
            .insert({
              user_id: user.id,
              distance_type: prDistance.type,
              distance_km: run.distance_km,
              time_seconds: proportionalTime,
              pace_per_km_seconds: pacePerKmSeconds,
              run_id: run.id,
              achieved_at: run.started_at,
              activity_type: activityType,
            } as any);
        }
        results.push({ distanceType: prDistance.type, isNewPR: true });
      } else {
        results.push({ distanceType: prDistance.type, isNewPR: false });
      }
    }

    if (results.some(r => r.isNewPR)) {
      await fetchRecords();
    }

    return results;
  };

  const getPRForDistance = (distanceType: string): PersonalRecord | undefined => {
    return records.find(r => r.distance_type === distanceType);
  };

  const getAllPRsWithLabels = (activityType?: string) => {
    return PR_DISTANCES.map(distance => ({
      ...distance,
      record: records.find(r =>
        r.distance_type === distance.type &&
        (activityType ? r.activity_type === activityType : true)
      ),
    }));
  };

  const resetPR = async (recordId: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('personal_records')
      .delete()
      .eq('id', recordId)
      .eq('user_id', user.id);
    if (error) {
      console.error('Error deleting PR:', error);
      throw error;
    }
    await fetchRecords();
  };

  const resetAllPRsForActivity = async (activityType: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('personal_records')
      .delete()
      .eq('user_id', user.id)
      .eq('activity_type', activityType);
    if (error) {
      console.error('Error deleting PRs:', error);
      throw error;
    }
    await fetchRecords();
  };

  return {
    records,
    loading,
    refetch: fetchRecords,
    checkAndUpdatePRs,
    getPRForDistance,
    getAllPRsWithLabels,
    resetPR,
    resetAllPRsForActivity,
  };
}
