import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { 
  AgeGroup, 
  DistanceBucket, 
  getAgeGroupFromDate, 
  getDistanceBucket, 
  buildCategoryId,
  TrophyRank,
} from '@/lib/trophyDefinitions';

export interface Trophy {
  id: string;
  user_id: string;
  run_id: string | null;
  category: string;
  age_group: AgeGroup | null;
  distance_bucket: DistanceBucket;
  rank: TrophyRank;
  pace_per_km_seconds: number;
  earned_at: string;
  created_at: string;
}

export interface TrophyCounts {
  gold: number;
  silver: number;
  bronze: number;
}

export interface LeaderboardEntry {
  user_id: string;
  run_id: string;
  pace_per_km_seconds: number;
  distance_km: number;
  started_at: string;
  display_name: string | null;
  avatar_url: string | null;
  rank: number;
}

export function useTrophies() {
  const { user } = useAuth();
  const [trophies, setTrophies] = useState<Trophy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTrophies();
    } else {
      setTrophies([]);
      setLoading(false);
    }
  }, [user]);

  const fetchTrophies = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('trophies')
      .select('*')
      .eq('user_id', user.id)
      .order('earned_at', { ascending: false });

    if (error) {
      console.error('Error fetching trophies:', error);
    } else {
      setTrophies((data || []) as Trophy[]);
    }
    setLoading(false);
  };

  const getTrophyCounts = useCallback((): TrophyCounts => {
    return {
      gold: trophies.filter(t => t.rank === 1).length,
      silver: trophies.filter(t => t.rank === 2).length,
      bronze: trophies.filter(t => t.rank === 3).length,
    };
  }, [trophies]);

  const getGroupedTrophies = useCallback(() => {
    const grouped: Record<string, Trophy[]> = {};
    for (const trophy of trophies) {
      if (!grouped[trophy.category]) {
        grouped[trophy.category] = [];
      }
      grouped[trophy.category].push(trophy);
    }
    return grouped;
  }, [trophies]);

  const checkAndAwardTrophies = async (runData: {
    id: string;
    user_id: string;
    distance_km: number;
    duration_seconds: number;
    started_at: string;
    pace_per_km_seconds: number;
  }): Promise<{ category: string; rank: TrophyRank }[]> => {
    if (!user) return [];

    // Get user's date of birth
    const { data: profile } = await supabase
      .from('profiles')
      .select('date_of_birth')
      .eq('user_id', user.id)
      .single();

    const runDate = new Date(runData.started_at);
    const userAgeGroup = profile?.date_of_birth 
      ? getAgeGroupFromDate(new Date(profile.date_of_birth), runDate)
      : null;
    
    const distanceBucket = getDistanceBucket(runData.distance_km);
    if (!distanceBucket) return [];

    const awardedTrophies: { category: string; rank: TrophyRank }[] = [];

    // Categories to check: Overall + age-specific (if DOB available)
    const categoriesToCheck: { ageGroup: AgeGroup | null; distanceBucket: DistanceBucket }[] = [
      // Overall categories
      { ageGroup: null, distanceBucket },
      { ageGroup: null, distanceBucket: 'any' },
    ];

    // Add age-specific categories if user has DOB
    if (userAgeGroup) {
      categoriesToCheck.push(
        { ageGroup: userAgeGroup, distanceBucket },
        { ageGroup: userAgeGroup, distanceBucket: 'any' }
      );
    }

    for (const { ageGroup, distanceBucket: bucket } of categoriesToCheck) {
      const categoryId = buildCategoryId(ageGroup, bucket);
      
      // Get top 3 for this category
      const rank = await getRunRankInCategory(
        runData.id,
        runData.pace_per_km_seconds,
        bucket,
        ageGroup
      );

      if (rank && rank <= 3) {
        // Check if user already has a trophy in this category
        const { data: existingTrophy } = await supabase
          .from('trophies')
          .select('id, rank, pace_per_km_seconds')
          .eq('user_id', user.id)
          .eq('category', categoryId)
          .single();

        // Only award if new or better
        if (!existingTrophy || runData.pace_per_km_seconds < existingTrophy.pace_per_km_seconds) {
          if (existingTrophy) {
            // Update existing trophy
            await supabase
              .from('trophies')
              .update({
                run_id: runData.id,
                rank: rank as TrophyRank,
                pace_per_km_seconds: runData.pace_per_km_seconds,
                earned_at: new Date().toISOString(),
              })
              .eq('id', existingTrophy.id);
          } else {
            // Insert new trophy
            await supabase.from('trophies').insert({
              user_id: user.id,
              run_id: runData.id,
              category: categoryId,
              age_group: ageGroup,
              distance_bucket: bucket,
              rank: rank as TrophyRank,
              pace_per_km_seconds: runData.pace_per_km_seconds,
            });
          }
          
          awardedTrophies.push({ category: categoryId, rank: rank as TrophyRank });
        }
      }
    }

    if (awardedTrophies.length > 0) {
      await fetchTrophies();
    }

    return awardedTrophies;
  };

  return {
    trophies,
    loading,
    refetch: fetchTrophies,
    getTrophyCounts,
    getGroupedTrophies,
    checkAndAwardTrophies,
  };
}

// Get leaderboard for a specific category
export async function getLeaderboard(
  distanceBucket: DistanceBucket,
  ageGroup: AgeGroup | null,
  limit = 50
): Promise<LeaderboardEntry[]> {
  const bucket = DISTANCE_BUCKETS_MAP[distanceBucket];
  
  // Build query for runs in distance range
  let query = supabase
    .from('runs')
    .select(`
      id,
      user_id,
      distance_km,
      duration_seconds,
      pace_per_km_seconds,
      started_at
    `)
    .eq('is_public', true)
    .not('pace_per_km_seconds', 'is', null);

  // Filter by distance bucket
  if (distanceBucket !== 'any') {
    query = query
      .gte('distance_km', bucket.minKm)
      .lte('distance_km', bucket.maxKm);
  }

  const { data: runs, error } = await query
    .order('pace_per_km_seconds', { ascending: true })
    .limit(200); // Get more to filter by age

  if (error || !runs) return [];

  // Get unique user IDs
  const userIds = [...new Set(runs.map(r => r.user_id))];

  // Get profiles with DOB for age filtering
  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, display_name, avatar_url, date_of_birth')
    .in('user_id', userIds);

  const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

  // Filter and rank runs
  const eligibleRuns: LeaderboardEntry[] = [];
  const seenUsers = new Set<string>();

  for (const run of runs) {
    // Only show best run per user
    if (seenUsers.has(run.user_id)) continue;
    
    const profile = profileMap.get(run.user_id);
    
    // Filter by age group if specified
    if (ageGroup && profile?.date_of_birth) {
      const runDate = new Date(run.started_at);
      const userAgeGroup = getAgeGroupFromDate(new Date(profile.date_of_birth), runDate);
      if (userAgeGroup !== ageGroup) continue;
    } else if (ageGroup && !profile?.date_of_birth) {
      // Skip users without DOB when age filter is active
      continue;
    }

    seenUsers.add(run.user_id);
    eligibleRuns.push({
      user_id: run.user_id,
      run_id: run.id,
      pace_per_km_seconds: run.pace_per_km_seconds!,
      distance_km: Number(run.distance_km),
      started_at: run.started_at,
      display_name: profile?.display_name || null,
      avatar_url: profile?.avatar_url || null,
      rank: 0,
    });

    if (eligibleRuns.length >= limit) break;
  }

  // Assign ranks
  return eligibleRuns.map((entry, idx) => ({ ...entry, rank: idx + 1 }));
}

// Helper to get a specific run's rank in a category
async function getRunRankInCategory(
  runId: string,
  pacePerKmSeconds: number,
  distanceBucket: DistanceBucket,
  ageGroup: AgeGroup | null
): Promise<number | null> {
  const leaderboard = await getLeaderboard(distanceBucket, ageGroup, 50);
  
  // Count how many have better pace
  const betterCount = leaderboard.filter(e => 
    e.pace_per_km_seconds < pacePerKmSeconds && e.run_id !== runId
  ).length;

  return betterCount + 1;
}

// Distance bucket constants for queries
const DISTANCE_BUCKETS_MAP: Record<DistanceBucket, { minKm: number; maxKm: number }> = {
  '5k': { minKm: 4.5, maxKm: 5.5 },
  '10k': { minKm: 9.0, maxKm: 11.0 },
  'half': { minKm: 19.1, maxKm: 23.1 },
  'any': { minKm: 0, maxKm: 999 },
};

// Get trophy counts for any user
export async function getUserTrophyCounts(userId: string): Promise<TrophyCounts> {
  const { data } = await supabase
    .from('trophies')
    .select('rank')
    .eq('user_id', userId);

  if (!data) return { gold: 0, silver: 0, bronze: 0 };

  return {
    gold: data.filter(t => t.rank === 1).length,
    silver: data.filter(t => t.rank === 2).length,
    bronze: data.filter(t => t.rank === 3).length,
  };
}
