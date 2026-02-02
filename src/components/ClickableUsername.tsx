import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface ClickableUsernameProps {
  userId: string;
  displayName?: string | null;
  username?: string | null;
  className?: string;
  onClick?: () => void;
}

export function ClickableUsername({
  userId,
  displayName,
  username,
  className,
  onClick,
}: ClickableUsernameProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    
    // Navigate to own profile or other user's profile
    if (user?.id === userId) {
      navigate('/profile');
    } else {
      navigate(`/user/${userId}`);
    }
  };

  const name = displayName || username || 'User';

  return (
    <button
      onClick={handleClick}
      className={cn(
        'font-medium text-foreground hover:text-primary transition-colors cursor-pointer text-left',
        className
      )}
    >
      {name}
    </button>
  );
}
