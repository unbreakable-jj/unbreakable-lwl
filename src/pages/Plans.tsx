import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlanSelectionPage } from '@/components/subscription/PlanSelectionPage';
import { TIERS, TierKey } from '@/lib/subscriptionTiers';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function Plans() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSelectPlan = async (tier: string) => {
    const tierData = TIERS[tier as TierKey];
    if (!tierData) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: tierData.price_id },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return <PlanSelectionPage onSelectPlan={handleSelectPlan} loading={loading} />;
}
