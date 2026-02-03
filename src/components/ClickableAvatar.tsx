import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface ClickableAvatarProps {
  userId: string;
  displayName?: string | null;
  username?: string | null;
  avatarUrl?: string | null;
  className?: string;
  fallbackClassName?: string;
  onClick?: () => void;
}

export function ClickableAvatar({
  userId,
  displayName,
  username,
  avatarUrl,
  className,
  fallbackClassName,
  onClick,
}: ClickableAvatarProps) {
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
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`View ${name} profile`}
      className="inline-flex rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
    >
      <Avatar className={cn('cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all', className)}>
        <AvatarImage src={avatarUrl || undefined} />
        <AvatarFallback className={cn('bg-primary/20 text-primary font-display', fallbackClassName)}>
          {initials}
        </AvatarFallback>
      </Avatar>
    </button>
  );
}
