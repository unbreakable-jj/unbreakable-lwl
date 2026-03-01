import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';
import { Crown, CreditCard, Calendar, Loader2, ExternalLink } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { useState } from 'react';

export function MembershipTab() {
  const { subscribed, tierName, subscriptionEnd, status, canCancel, loading, openCustomerPortal } = useSubscription();
  const navigate = useNavigate();
  const [portalLoading, setPortalLoading] = useState(false);

  const handleManage = async () => {
    setPortalLoading(true);
    try {
      await openCustomerPortal();
    } catch {
      toast.error('Failed to open subscription management');
    } finally {
      setPortalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!subscribed) {
    return (
      <Card className="p-6 border-2 border-border text-center space-y-4">
        <Crown className="w-12 h-12 text-muted-foreground mx-auto" />
        <h3 className="font-display text-xl tracking-wide">NO ACTIVE PLAN</h3>
        <p className="text-muted-foreground">Subscribe to unlock all training tools.</p>
        <Button onClick={() => navigate('/plans')} className="font-display tracking-wide">
          <CreditCard className="w-4 h-4 mr-2" />
          VIEW PLANS
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-2 border-primary/30 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
          <Crown className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg tracking-wide text-foreground">{tierName || 'ACTIVE PLAN'}</h3>
            <Badge className="bg-primary/20 text-primary text-xs font-display">
              {status === 'trialing' ? 'TRIAL' : 'ACTIVE'}
            </Badge>
          </div>
          {subscriptionEnd && (
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {status === 'trialing' ? 'Trial ends' : 'Renews'} {format(parseISO(subscriptionEnd), 'dd MMM yyyy')}
            </p>
          )}
        </div>
      </div>

      {!canCancel && (
        <p className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
          You're within your 3-month commitment period. After this period, your plan will continue as a monthly subscription that you can cancel anytime.
        </p>
      )}

      <Button
        variant="outline"
        onClick={handleManage}
        disabled={portalLoading}
        className="w-full font-display tracking-wide"
      >
        {portalLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ExternalLink className="w-4 h-4 mr-2" />}
        MANAGE SUBSCRIPTION
      </Button>
    </Card>
  );
}
