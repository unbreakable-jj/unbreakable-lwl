import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useUserRole } from './useUserRole';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface UniversityAdminState {
  adminMode: boolean;
  unlockAll: boolean;
  showAnswers: boolean;
  studentPreview: boolean;
  canAccessAdmin: boolean;
  setAdminMode: (v: boolean) => void;
  setUnlockAll: (v: boolean) => void;
  setShowAnswers: (v: boolean) => void;
  setStudentPreview: (v: boolean) => void;
  resetProgress: () => Promise<void>;
  isResetting: boolean;
  /** Effective unlock: unlockAll AND adminMode AND NOT studentPreview */
  effectiveUnlockAll: boolean;
  /** Effective showAnswers */
  effectiveShowAnswers: boolean;
}

const UniversityAdminContext = createContext<UniversityAdminState | null>(null);

function getStored(key: string, fallback: boolean): boolean {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? v === 'true' : fallback;
  } catch {
    return fallback;
  }
}

export function UniversityAdminProvider({ children }: { children: ReactNode }) {
  const { isDev, isCoach } = useUserRole();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const canAccessAdmin = isDev || isCoach;

  const [adminMode, setAdminModeRaw] = useState(() => getStored('uni-admin-mode', false));
  const [unlockAll, setUnlockAllRaw] = useState(() => getStored('uni-unlock-all', false));
  const [showAnswers, setShowAnswersRaw] = useState(() => getStored('uni-show-answers', false));
  const [studentPreview, setStudentPreviewRaw] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const persist = (key: string, v: boolean) => {
    try { localStorage.setItem(key, String(v)); } catch {}
  };

  const setAdminMode = useCallback((v: boolean) => {
    setAdminModeRaw(v);
    persist('uni-admin-mode', v);
    if (!v) {
      setUnlockAllRaw(false);
      setShowAnswersRaw(false);
      setStudentPreviewRaw(false);
      persist('uni-unlock-all', false);
      persist('uni-show-answers', false);
    }
  }, []);

  const setUnlockAll = useCallback((v: boolean) => {
    setUnlockAllRaw(v);
    persist('uni-unlock-all', v);
  }, []);

  const setShowAnswers = useCallback((v: boolean) => {
    setShowAnswersRaw(v);
    persist('uni-show-answers', v);
  }, []);

  const setStudentPreview = useCallback((v: boolean) => {
    setStudentPreviewRaw(v);
  }, []);

  const resetProgress = useCallback(async () => {
    if (!user) return;
    setIsResetting(true);
    try {
      await supabase.from('university_progress').delete().eq('user_id', user.id);
      await supabase.from('university_assessments').delete().eq('user_id', user.id);
      await supabase.from('university_chapter_quizzes' as any).delete().eq('user_id', user.id);
      queryClient.invalidateQueries({ queryKey: ['university-progress'] });
      queryClient.invalidateQueries({ queryKey: ['university-assessments'] });
      queryClient.invalidateQueries({ queryKey: ['university-chapter-quizzes'] });
      toast.success('Course progress reset');
    } catch (err) {
      console.error('Reset failed:', err);
      toast.error('Failed to reset progress');
    } finally {
      setIsResetting(false);
    }
  }, [user, queryClient]);

  const active = canAccessAdmin && adminMode && !studentPreview;

  return (
    <UniversityAdminContext.Provider value={{
      adminMode: canAccessAdmin && adminMode,
      unlockAll,
      showAnswers,
      studentPreview,
      canAccessAdmin,
      setAdminMode,
      setUnlockAll,
      setShowAnswers,
      setStudentPreview,
      resetProgress,
      isResetting,
      effectiveUnlockAll: active && unlockAll,
      effectiveShowAnswers: active && showAnswers,
    }}>
      {children}
    </UniversityAdminContext.Provider>
  );
}

export function useUniversityAdmin(): UniversityAdminState {
  const ctx = useContext(UniversityAdminContext);
  if (!ctx) {
    // Return safe defaults when outside provider
    return {
      adminMode: false, unlockAll: false, showAnswers: false, studentPreview: false,
      canAccessAdmin: false, setAdminMode: () => {}, setUnlockAll: () => {},
      setShowAnswers: () => {}, setStudentPreview: () => {}, resetProgress: async () => {},
      isResetting: false, effectiveUnlockAll: false, effectiveShowAnswers: false,
    };
  }
  return ctx;
}
