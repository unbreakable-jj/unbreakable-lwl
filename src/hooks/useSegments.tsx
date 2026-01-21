import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import {
  decodePolyline,
  encodePolyline,
  findSegmentMatch,
  generateSegmentCandidates,
  areSegmentsSimilar,
  generateSegmentName,
  haversineDistance,
  Coordinate,
} from '@/lib/segmentUtils';

export interface Segment {
  id: string;
  name: string;
  description: string | null;
  start_lat: number;
  start_lng: number;
  end_lat: number;
  end_lng: number;
  distance_m: number;
  elevation_gain_m: number | null;
  polyline: string;
  created_by: string | null;
  total_efforts: number;
  created_at: string;
  updated_at: string;
}

export interface SegmentEffort {
  id: string;
  segment_id: string;
  user_id: string;
  run_id: string | null;
  elapsed_time_seconds: number;
  start_index: number | null;
  end_index: number | null;
  is_kom: boolean;
  is_pr: boolean;
  rank: number | null;
  created_at: string;
}

export interface SegmentWithEfforts extends Segment {
  efforts: SegmentEffort[];
  userBestEffort?: SegmentEffort;
  komHolder?: { userId: string; time: number };
  userRank?: number;
  isLocalLegend?: boolean;
}

export interface SegmentMatchResult {
  segment: Segment;
  startIndex: number;
  endIndex: number;
  elapsedTimeSeconds: number;
  isNewPR: boolean;
  isNewKOM: boolean;
  previousRank?: number;
  newRank: number;
  prRank?: number; // 1, 2, or 3 for gold/silver/bronze
}

export function useSegments() {
  const { user } = useAuth();
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSegments = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('segments')
      .select('*')
      .order('total_efforts', { ascending: false });

    if (error) {
      console.error('Error fetching segments:', error);
    } else {
      setSegments((data as Segment[]) || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSegments();
  }, [fetchSegments]);

  // Match a run against all existing segments
  const matchRunToSegments = useCallback(
    async (
      runPolyline: string,
      runDurationSeconds: number,
      runId: string
    ): Promise<SegmentMatchResult[]> => {
      if (!user) return [];

      const runCoords = decodePolyline(runPolyline);
      if (runCoords.length < 10) return [];

      const results: SegmentMatchResult[] = [];

      for (const segment of segments) {
        const segmentStart: Coordinate = {
          lat: Number(segment.start_lat),
          lng: Number(segment.start_lng),
        };
        const segmentEnd: Coordinate = {
          lat: Number(segment.end_lat),
          lng: Number(segment.end_lng),
        };

        const match = findSegmentMatch(runCoords, segmentStart, segmentEnd, 25);

        if (match) {
          // Calculate elapsed time for this segment portion
          const fraction = (match.endIndex - match.startIndex) / runCoords.length;
          const elapsedTime = Math.round(runDurationSeconds * fraction);

          // Get existing efforts for ranking
          const { data: efforts } = await supabase
            .from('segment_efforts')
            .select('*')
            .eq('segment_id', segment.id)
            .order('elapsed_time_seconds', { ascending: true });

          const existingEfforts = (efforts as SegmentEffort[]) || [];

          // Check if this is a new KOM
          const currentKomTime = existingEfforts[0]?.elapsed_time_seconds ?? Infinity;
          const isNewKOM = elapsedTime < currentKomTime;

          // Calculate new rank
          let newRank = 1;
          for (const effort of existingEfforts) {
            if (effort.elapsed_time_seconds < elapsedTime) {
              newRank++;
            } else {
              break;
            }
          }

          // Get user's previous efforts for PR check
          const userEfforts = existingEfforts
            .filter((e) => e.user_id === user.id)
            .sort((a, b) => a.elapsed_time_seconds - b.elapsed_time_seconds);

          const userBestTime = userEfforts[0]?.elapsed_time_seconds ?? Infinity;
          const isNewPR = elapsedTime < userBestTime;

          // Calculate PR rank (1st, 2nd, or 3rd best personal time)
          let prRank: number | undefined;
          if (isNewPR) {
            prRank = 1;
          } else {
            const betterTimes = userEfforts.filter((e) => e.elapsed_time_seconds < elapsedTime);
            if (betterTimes.length < 3) {
              prRank = betterTimes.length + 1;
            }
          }

          results.push({
            segment,
            startIndex: match.startIndex,
            endIndex: match.endIndex,
            elapsedTimeSeconds: elapsedTime,
            isNewPR,
            isNewKOM,
            newRank,
            prRank,
            previousRank: userEfforts[0]
              ? existingEfforts.findIndex((e) => e.id === userEfforts[0].id) + 1
              : undefined,
          });
        }
      }

      return results;
    },
    [segments, user]
  );

  // Save segment efforts and update rankings
  const saveSegmentEfforts = useCallback(
    async (runId: string, matchResults: SegmentMatchResult[]) => {
      if (!user) return;

      for (const result of matchResults) {
        // Insert the new effort
        const { error: insertError } = await supabase.from('segment_efforts').insert({
          segment_id: result.segment.id,
          user_id: user.id,
          run_id: runId,
          elapsed_time_seconds: result.elapsedTimeSeconds,
          start_index: result.startIndex,
          end_index: result.endIndex,
          is_kom: result.isNewKOM,
          is_pr: result.isNewPR,
          rank: result.newRank,
        });

        if (insertError) {
          console.error('Error inserting segment effort:', insertError);
          continue;
        }

        // Update KOM status if this is a new KOM
        if (result.isNewKOM) {
          // Remove KOM from previous holder
          await supabase
            .from('segment_efforts')
            .update({ is_kom: false })
            .eq('segment_id', result.segment.id)
            .neq('user_id', user.id);
        }

        // Update segment total efforts
        await supabase
          .from('segments')
          .update({ total_efforts: result.segment.total_efforts + 1 })
          .eq('id', result.segment.id);

        // Update local legend stats
        await updateLocalLegendStats(result.segment.id, user.id);
      }
    },
    [user]
  );

  // Update local legend stats (90-day rolling count)
  const updateLocalLegendStats = async (segmentId: string, userId: string) => {
    // Get current stats
    const { data: existingStats } = await supabase
      .from('local_legend_stats')
      .select('*')
      .eq('segment_id', segmentId)
      .eq('user_id', userId)
      .single();

    if (existingStats) {
      // Update existing
      await supabase
        .from('local_legend_stats')
        .update({
          effort_count: (existingStats.effort_count || 0) + 1,
          last_effort_at: new Date().toISOString(),
        })
        .eq('id', existingStats.id);
    } else {
      // Create new
      await supabase.from('local_legend_stats').insert({
        segment_id: segmentId,
        user_id: userId,
        effort_count: 1,
        last_effort_at: new Date().toISOString(),
      });
    }

    // Recalculate who is the local legend
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const { data: allStats } = await supabase
      .from('local_legend_stats')
      .select('*')
      .eq('segment_id', segmentId)
      .gte('last_effort_at', ninetyDaysAgo.toISOString())
      .order('effort_count', { ascending: false });

    if (allStats && allStats.length > 0) {
      // Reset all to not legend
      await supabase
        .from('local_legend_stats')
        .update({ is_local_legend: false })
        .eq('segment_id', segmentId);

      // Set the top one as legend
      await supabase
        .from('local_legend_stats')
        .update({ is_local_legend: true })
        .eq('id', allStats[0].id);
    }
  };

  // Auto-detect and create segments from a new run
  const autoDetectSegments = useCallback(
    async (runPolyline: string, userId: string): Promise<Segment[]> => {
      const runCoords = decodePolyline(runPolyline);
      if (runCoords.length < 20) return [];

      const candidates = generateSegmentCandidates(runCoords, 400, 5000);
      const newSegments: Segment[] = [];

      for (let i = 0; i < Math.min(candidates.length, 5); i++) {
        const candidate = candidates[i];

        // Check if a similar segment already exists
        const existingSimilar = segments.find((seg) =>
          areSegmentsSimilar(
            candidate.startCoord,
            candidate.endCoord,
            { lat: Number(seg.start_lat), lng: Number(seg.start_lng) },
            { lat: Number(seg.end_lat), lng: Number(seg.end_lng) },
            50
          )
        );

        if (!existingSimilar) {
          const name = generateSegmentName(candidate.distanceM, i);
          const polylineStr = encodePolyline(candidate.polyline);

          const { data, error } = await supabase
            .from('segments')
            .insert({
              name,
              start_lat: candidate.startCoord.lat,
              start_lng: candidate.startCoord.lng,
              end_lat: candidate.endCoord.lat,
              end_lng: candidate.endCoord.lng,
              distance_m: candidate.distanceM,
              polyline: polylineStr,
              created_by: userId,
              total_efforts: 0,
            })
            .select()
            .single();

          if (!error && data) {
            newSegments.push(data as Segment);
          }
        }
      }

      if (newSegments.length > 0) {
        await fetchSegments();
      }

      return newSegments;
    },
    [segments, fetchSegments]
  );

  return {
    segments,
    loading,
    fetchSegments,
    matchRunToSegments,
    saveSegmentEfforts,
    autoDetectSegments,
  };
}

// Hook to get detailed segment data with leaderboard
export function useSegmentDetail(segmentId: string | null) {
  const { user } = useAuth();
  const [segment, setSegment] = useState<SegmentWithEfforts | null>(null);
  const [leaderboard, setLeaderboard] = useState<
    Array<{
      rank: number;
      userId: string;
      displayName: string;
      time: number;
      date: string;
      isCurrentUser: boolean;
    }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!segmentId) {
      setSegment(null);
      setLeaderboard([]);
      setLoading(false);
      return;
    }

    const fetchSegmentDetail = async () => {
      setLoading(true);

      // Fetch segment
      const { data: segmentData, error: segmentError } = await supabase
        .from('segments')
        .select('*')
        .eq('id', segmentId)
        .single();

      if (segmentError || !segmentData) {
        console.error('Error fetching segment:', segmentError);
        setLoading(false);
        return;
      }

      // Fetch top 10 efforts with profile info
      const { data: effortsData } = await supabase
        .from('segment_efforts')
        .select('*')
        .eq('segment_id', segmentId)
        .order('elapsed_time_seconds', { ascending: true })
        .limit(10);

      const efforts = (effortsData as SegmentEffort[]) || [];

      // Fetch profiles for the leaderboard
      const userIds = [...new Set(efforts.map((e) => e.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', userIds);

      const profileMap = new Map(
        (profilesData || []).map((p) => [p.user_id, p.display_name || 'Anonymous'])
      );

      // Check local legend status for current user
      let isLocalLegend = false;
      if (user) {
        const { data: legendData } = await supabase
          .from('local_legend_stats')
          .select('is_local_legend')
          .eq('segment_id', segmentId)
          .eq('user_id', user.id)
          .single();

        isLocalLegend = legendData?.is_local_legend ?? false;
      }

      // Get user's best effort
      const userBestEffort = user
        ? efforts.find((e) => e.user_id === user.id)
        : undefined;

      // Build leaderboard
      const leaderboardData = efforts.map((effort, index) => ({
        rank: index + 1,
        userId: effort.user_id,
        displayName: profileMap.get(effort.user_id) || 'Anonymous',
        time: effort.elapsed_time_seconds,
        date: effort.created_at,
        isCurrentUser: effort.user_id === user?.id,
      }));

      setSegment({
        ...(segmentData as Segment),
        efforts,
        userBestEffort,
        komHolder: efforts[0]
          ? { userId: efforts[0].user_id, time: efforts[0].elapsed_time_seconds }
          : undefined,
        userRank: user
          ? efforts.findIndex((e) => e.user_id === user.id) + 1 || undefined
          : undefined,
        isLocalLegend,
      });

      setLeaderboard(leaderboardData);
      setLoading(false);
    };

    fetchSegmentDetail();
  }, [segmentId, user]);

  return { segment, leaderboard, loading };
}

// Hook to get user's achievement summary
export function useUserAchievements() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<{
    komCount: number;
    trophyCount: number;
    prMedals: { gold: number; silver: number; bronze: number };
    localLegendCount: number;
    totalEfforts: number;
  }>({
    komCount: 0,
    trophyCount: 0,
    prMedals: { gold: 0, silver: 0, bronze: 0 },
    localLegendCount: 0,
    totalEfforts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchAchievements = async () => {
      setLoading(true);

      // Get all user's efforts
      const { data: efforts } = await supabase
        .from('segment_efforts')
        .select('*')
        .eq('user_id', user.id);

      const allEfforts = (efforts as SegmentEffort[]) || [];

      // Count KOMs (rank 1)
      const komCount = allEfforts.filter((e) => e.is_kom).length;

      // Count trophies (rank 2-10, best effort per segment)
      const bestEffortsBySegment = new Map<string, SegmentEffort>();
      for (const effort of allEfforts) {
        const existing = bestEffortsBySegment.get(effort.segment_id);
        if (!existing || effort.elapsed_time_seconds < existing.elapsed_time_seconds) {
          bestEffortsBySegment.set(effort.segment_id, effort);
        }
      }

      let trophyCount = 0;
      for (const effort of bestEffortsBySegment.values()) {
        if (effort.rank && effort.rank > 1 && effort.rank <= 10) {
          trophyCount++;
        }
      }

      // Count PR medals (personal 1st, 2nd, 3rd on each segment)
      // Group efforts by segment and count top 3 personal bests
      const prMedals = { gold: 0, silver: 0, bronze: 0 };
      const effortsBySegment = new Map<string, SegmentEffort[]>();
      for (const effort of allEfforts) {
        const list = effortsBySegment.get(effort.segment_id) || [];
        list.push(effort);
        effortsBySegment.set(effort.segment_id, list);
      }

      for (const segmentEfforts of effortsBySegment.values()) {
        const sorted = segmentEfforts.sort(
          (a, b) => a.elapsed_time_seconds - b.elapsed_time_seconds
        );
        if (sorted.length >= 1) prMedals.gold++;
        if (sorted.length >= 2) prMedals.silver++;
        if (sorted.length >= 3) prMedals.bronze++;
      }

      // Count local legends
      const { data: legendStats } = await supabase
        .from('local_legend_stats')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_local_legend', true);

      const localLegendCount = legendStats?.length || 0;

      setAchievements({
        komCount,
        trophyCount,
        prMedals,
        localLegendCount,
        totalEfforts: allEfforts.length,
      });

      setLoading(false);
    };

    fetchAchievements();
  }, [user]);

  return { achievements, loading };
}
