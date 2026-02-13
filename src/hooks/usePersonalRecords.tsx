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

    const matchingDistance = getMatchingPRDistance(run.distance_km);
    if (!matchingDistance) return [];

    const pacePerKmSeconds = Math.round(run.duration_seconds / run.distance_km);
    const activityType = run.activity_type || 'run';
    const results: { distanceType: string; isNewPR: boolean }[] = [];

    // Check if there's an existing PR for this distance AND activity type
    const existingPR = records.find(r => r.distance_type === matchingDistance.type && r.activity_type === activityType);

    if (!existingPR || (existingPR.time_seconds && run.duration_seconds < existingPR.time_seconds)) {
      // This is a new PR!
      if (existingPR) {
        // Update existing record
        await supabase
          .from('personal_records')
          .update({
            time_seconds: run.duration_seconds,
            pace_per_km_seconds: pacePerKmSeconds,
            run_id: run.id,
            achieved_at: run.started_at,
            distance_km: run.distance_km,
          })
          .eq('id', existingPR.id);
      } else {
        // Insert new record
        await supabase
          .from('personal_records')
          .insert({
            user_id: user.id,
            distance_type: matchingDistance.type,
            distance_km: run.distance_km,
            time_seconds: run.duration_seconds,
            pace_per_km_seconds: pacePerKmSeconds,
            run_id: run.id,
            achieved_at: run.started_at,
            activity_type: activityType,
          } as any);
      }

      results.push({ distanceType: matchingDistance.type, isNewPR: true });
      await fetchRecords();
    } else {
      results.push({ distanceType: matchingDistance.type, isNewPR: false });
    }

    return results;
  };

  const getPRForDistance = (distanceType: string): PersonalRecord | undefined => {
    return records.find(r => r.distance_type === distanceType);
  };

  const getAllPRsWithLabels = () => {
    return PR_DISTANCES.map(distance => ({
      ...distance,
      record: records.find(r => r.distance_type === distance.type),
    }));
  };

  return {
    records,
    loading,
    refetch: fetchRecords,
    checkAndUpdatePRs,
    getPRForDistance,
    getAllPRsWithLabels,
  };
}
