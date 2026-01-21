import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { MEDAL_DEFINITIONS, MedalCheckStats, MedalDefinition } from '@/lib/medalDefinitions';

export interface Medal {
  id: string;
  user_id: string;
  code: string;
  name: string;
  description: string | null;
  icon: string | null;
  earned_at: string;
  run_id: string | null;
  created_at: string;
}

export function useMedals() {
  const { user } = useAuth();
  const [medals, setMedals] = useState<Medal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMedals();
    } else {
      setMedals([]);
      setLoading(false);
    }
  }, [user]);

  const fetchMedals = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('medals')
      .select('*')
      .eq('user_id', user.id)
      .order('earned_at', { ascending: false });

    if (error) {
      console.error('Error fetching medals:', error);
    } else {
      setMedals(data || []);
    }
    setLoading(false);
  };

  const checkAndAwardMedals = async (
    stats: MedalCheckStats,
    runId?: string
  ): Promise<MedalDefinition[]> => {
    if (!user) return [];

    const earnedCodes = new Set(medals.map(m => m.code));
    const newMedals: MedalDefinition[] = [];

    for (const definition of MEDAL_DEFINITIONS) {
      // Skip if already earned
      if (earnedCodes.has(definition.code)) continue;

      // Check if condition is met
      if (definition.checkCondition(stats)) {
        const { error } = await supabase.from('medals').insert({
          user_id: user.id,
          code: definition.code,
          name: definition.name,
          description: definition.description,
          icon: definition.icon,
          run_id: runId || null,
        });

        if (!error) {
          newMedals.push(definition);
        }
      }
    }

    if (newMedals.length > 0) {
      await fetchMedals();
    }

    return newMedals;
  };

  const hasMedal = (code: string): boolean => {
    return medals.some(m => m.code === code);
  };

  const getMedalsByCategory = (category: MedalDefinition['category']) => {
    return MEDAL_DEFINITIONS.filter(d => d.category === category).map(definition => ({
      ...definition,
      earned: medals.find(m => m.code === definition.code),
    }));
  };

  const getAllMedalsWithStatus = () => {
    return MEDAL_DEFINITIONS.map(definition => ({
      ...definition,
      earned: medals.find(m => m.code === definition.code),
    }));
  };

  return {
    medals,
    loading,
    refetch: fetchMedals,
    checkAndAwardMedals,
    hasMedal,
    getMedalsByCategory,
    getAllMedalsWithStatus,
  };
}
