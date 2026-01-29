import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dumbbell, Sparkles } from 'lucide-react';

interface ProgrammeCTAProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  showIcon?: boolean;
  label?: string;
}

export function ProgrammeCTA({
  variant = 'default',
  size = 'default',
  className = '',
  showIcon = true,
  label = 'Create Programme with Coach',
}: ProgrammeCTAProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    // Set context for programme request
    sessionStorage.setItem('coach_context', JSON.stringify({
      type: 'programme_request',
      name: 'New Programme',
    }));
    navigate('/help');
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={`gap-2 ${className}`}
    >
      {showIcon && <Sparkles className="w-4 h-4" />}
      {label}
    </Button>
  );
}

export function AskForProgrammeCTA({
  variant = 'outline',
  size = 'sm',
  className = '',
}: Omit<ProgrammeCTAProps, 'label' | 'showIcon'>) {
  const navigate = useNavigate();

  const handleClick = () => {
    sessionStorage.setItem('coach_context', JSON.stringify({
      type: 'programme_request',
      name: 'Custom Programme',
    }));
    navigate('/help');
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={`gap-2 ${className}`}
    >
      <Dumbbell className="w-4 h-4" />
      Ask for a Programme
    </Button>
  );
}
