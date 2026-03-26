import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useUniversityProgress() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: progress = [], isLoading } = useQuery({
    queryKey: ['university-progress', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('university_progress')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: assessments = [] } = useQuery({
    queryKey: ['university-assessments', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('university_assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('attempted_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const completeChapter = useMutation({
    mutationFn: async ({ level, unitNumber, chapterNumber }: { level: number; unitNumber: number; chapterNumber: number }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('university_progress')
        .upsert({
          user_id: user.id,
          level,
          unit_number: unitNumber,
          chapter_number: chapterNumber,
        }, { onConflict: 'user_id,level,unit_number,chapter_number' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['university-progress'] });
    },
  });

  const submitAssessment = useMutation({
    mutationFn: async ({ level, unitNumber, isFinal, score, total, passed, answers }: {
      level: number; unitNumber: number; isFinal: boolean;
      score: number; total: number; passed: boolean; answers: number[];
    }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('university_assessments')
        .insert({
          user_id: user.id,
          level,
          unit_number: unitNumber,
          is_final: isFinal,
          score,
          total,
          passed,
          answers: answers as any,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['university-assessments'] });
    },
  });

  const isChapterComplete = (level: number, unitNumber: number, chapterNumber: number) => {
    return progress.some(
      (p: any) => p.level === level && p.unit_number === unitNumber && p.chapter_number === chapterNumber
    );
  };

  const getUnitCompletedChapters = (level: number, unitNumber: number) => {
    return progress.filter(
      (p: any) => p.level === level && p.unit_number === unitNumber
    ).length;
  };

  const getLevelCompletedChapters = (level: number) => {
    return progress.filter((p: any) => p.level === level).length;
  };

  const getBestAssessment = (level: number, unitNumber: number) => {
    const attempts = assessments.filter(
      (a: any) => a.level === level && a.unit_number === unitNumber
    );
    if (attempts.length === 0) return null;
    return attempts.reduce((best: any, curr: any) => curr.score > best.score ? curr : best, attempts[0]);
  };

  const hasPassedAssessment = (level: number, unitNumber: number) => {
    return assessments.some(
      (a: any) => a.level === level && a.unit_number === unitNumber && a.passed
    );
  };

  return {
    progress,
    assessments,
    isLoading,
    completeChapter,
    submitAssessment,
    isChapterComplete,
    getUnitCompletedChapters,
    getLevelCompletedChapters,
    getBestAssessment,
    hasPassedAssessment,
  };
}
