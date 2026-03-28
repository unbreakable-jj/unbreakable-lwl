import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUniversityAdmin } from './useUniversityAdmin';

export function useUniversityProgress() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { effectiveUnlockAll } = useUniversityAdmin();

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

  const { data: chapterQuizResults = [] } = useQuery({
    queryKey: ['university-chapter-quizzes', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('university_chapter_quizzes' as any)
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data as any[];
    },
    enabled: !!user,
  });

  const completeChapter = useMutation({
    mutationFn: async ({ level, unitNumber, chapterNumber, courseType = 'gym' }: { level: number; unitNumber: number; chapterNumber: number; courseType?: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('university_progress')
        .upsert({
          user_id: user.id,
          level,
          unit_number: unitNumber,
          chapter_number: chapterNumber,
          course_type: courseType,
        }, { onConflict: 'user_id,level,unit_number,chapter_number,course_type' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['university-progress'] });
    },
  });

  const submitAssessment = useMutation({
    mutationFn: async ({ level, unitNumber, isFinal, score, total, passed, answers, courseType = 'gym' }: {
      level: number; unitNumber: number; isFinal: boolean;
      score: number; total: number; passed: boolean; answers: number[]; courseType?: string;
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
          course_type: courseType,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['university-assessments'] });
    },
  });

  const submitChapterQuiz = useMutation({
    mutationFn: async ({ level, unitNumber, chapterNumber, score, total, passed, answers, courseType = 'gym' }: {
      level: number; unitNumber: number; chapterNumber: number;
      score: number; total: number; passed: boolean; answers: number[]; courseType?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('university_chapter_quizzes' as any)
        .insert({
          user_id: user.id,
          level,
          unit_number: unitNumber,
          chapter_number: chapterNumber,
          score,
          total,
          passed,
          answers: answers as any,
          course_type: courseType,
        } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['university-chapter-quizzes'] });
    },
  });

  const isChapterComplete = (level: number, unitNumber: number, chapterNumber: number, courseType: string = 'gym') => {
    if (effectiveUnlockAll) return true;
    return progress.some(
      (p: any) => p.level === level && p.unit_number === unitNumber && p.chapter_number === chapterNumber && (p.course_type || 'gym') === courseType
    );
  };

  const getUnitCompletedChapters = (level: number, unitNumber: number, courseType: string = 'gym') => {
    return progress.filter(
      (p: any) => p.level === level && p.unit_number === unitNumber && (p.course_type || 'gym') === courseType
    ).length;
  };

  const getLevelCompletedChapters = (level: number, courseType: string = 'gym') => {
    return progress.filter((p: any) => p.level === level && (p.course_type || 'gym') === courseType).length;
  };

  const getBestAssessment = (level: number, unitNumber: number, courseType: string = 'gym') => {
    const attempts = assessments.filter(
      (a: any) => a.level === level && a.unit_number === unitNumber && (a.course_type || 'gym') === courseType
    );
    if (attempts.length === 0) return null;
    return attempts.reduce((best: any, curr: any) => curr.score > best.score ? curr : best, attempts[0]);
  };

  const hasPassedAssessment = (level: number, unitNumber: number, courseType: string = 'gym') => {
    if (effectiveUnlockAll) return true;
    return assessments.some(
      (a: any) => a.level === level && a.unit_number === unitNumber && a.passed && (a.course_type || 'gym') === courseType
    );
  };

  const hasPassedChapterQuiz = (level: number, unitNumber: number, chapterNumber: number, courseType: string = 'gym') => {
    if (effectiveUnlockAll) return true;
    return chapterQuizResults.some(
      (q: any) => q.level === level && q.unit_number === unitNumber && q.chapter_number === chapterNumber && q.passed && (q.course_type || 'gym') === courseType
    );
  };

  const getChapterQuizBest = (level: number, unitNumber: number, chapterNumber: number, courseType: string = 'gym') => {
    const attempts = chapterQuizResults.filter(
      (q: any) => q.level === level && q.unit_number === unitNumber && q.chapter_number === chapterNumber && (q.course_type || 'gym') === courseType
    );
    if (attempts.length === 0) return null;
    return attempts.reduce((best: any, curr: any) => curr.score > best.score ? curr : best, attempts[0]);
  };

  const allChapterQuizzesPassed = (level: number, totalChaptersPerUnit: { unitNumber: number; chapters: number }[], courseType: string = 'gym') => {
    return totalChaptersPerUnit.every(({ unitNumber, chapters }) =>
      Array.from({ length: chapters }, (_, i) => i + 1).every(ch =>
        hasPassedChapterQuiz(level, unitNumber, ch, courseType)
      )
    );
  };

  return {
    progress,
    assessments,
    chapterQuizResults,
    isLoading,
    completeChapter,
    submitAssessment,
    submitChapterQuiz,
    isChapterComplete,
    getUnitCompletedChapters,
    getLevelCompletedChapters,
    getBestAssessment,
    hasPassedAssessment,
    hasPassedChapterQuiz,
    getChapterQuizBest,
    allChapterQuizzesPassed,
  };
}
