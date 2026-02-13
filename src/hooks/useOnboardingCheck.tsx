import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useOnboardingCheck() {
  const { user, loading: authLoading } = useAuth();
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      if (authLoading) return;
      if (!user) {
        setNeedsOnboarding(false);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('coaching_profiles')
        .select('onboarding_completed')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Onboarding check error:', error);
      }

      setNeedsOnboarding(!data?.onboarding_completed);
      setLoading(false);
    };

    check();
  }, [user, authLoading]);

  return { needsOnboarding, loading: loading || authLoading };
}
