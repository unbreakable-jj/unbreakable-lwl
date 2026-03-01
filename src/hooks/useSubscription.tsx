import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { TIERS } from '@/lib/subscriptionTiers';

interface SubscriptionState {
  subscribed: boolean;
  productId: string | null;
  tierName: string | null;
  subscriptionEnd: string | null;
  status: string | null;
  canCancel: boolean;
  loading: boolean;
}

export function useSubscription() {
  const { user, session } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    subscribed: false,
    productId: null,
    tierName: null,
    subscriptionEnd: null,
    status: null,
    canCancel: false,
    loading: true,
  });

  const checkSubscription = useCallback(async () => {
    if (!session?.access_token) {
      setState(prev => ({ ...prev, loading: false, subscribed: false }));
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');

      if (error) {
        console.error('check-subscription error:', error);
        setState(prev => ({ ...prev, loading: false }));
        return;
      }

      // Determine tier name from product_id
      let tierName: string | null = null;
      if (data?.product_id) {
        if (data.product_id === TIERS.tier2.product_id) {
          tierName = 'Unbreakable 1-to-1';
        } else if (data.product_id === TIERS.tier1.product_id) {
          tierName = 'Unbreakable Coaching';
        }
      }

      setState({
        subscribed: data?.subscribed ?? false,
        productId: data?.product_id ?? null,
        tierName,
        subscriptionEnd: data?.subscription_end ?? null,
        status: data?.status ?? null,
        canCancel: data?.can_cancel ?? false,
        loading: false,
      });
    } catch (err) {
      console.error('Subscription check failed:', err);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [session?.access_token]);

  // Check on mount and when session changes
  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [user, checkSubscription]);

  const openCustomerPortal = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      console.error('Customer portal error:', err);
      throw err;
    }
  };

  return {
    ...state,
    refresh: checkSubscription,
    openCustomerPortal,
  };
}
