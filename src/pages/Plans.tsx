import { useNavigate } from 'react-router-dom';
import { PlanSelectionPage } from '@/components/subscription/PlanSelectionPage';
import { toast } from 'sonner';

export default function Plans() {
  const navigate = useNavigate();

  const handleSelectPlan = (tier: string, duration: string) => {
    // TODO: Wire to Stripe checkout
    toast.info('Stripe checkout coming soon — plan selected: ' + duration);
  };

  return <PlanSelectionPage onSelectPlan={handleSelectPlan} />;
}
