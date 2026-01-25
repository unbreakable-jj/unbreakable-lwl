import logoLight from '@/assets/logo-light.png';
import logoDark from '@/assets/logo-dark.png';
import { useUserSettings } from '@/hooks/useUserSettings';

interface ThemedLogoProps {
  className?: string;
  alt?: string;
}

export function ThemedLogo({ className = 'h-10 object-contain', alt = 'Unbreakable - Live Without Limits' }: ThemedLogoProps) {
  const { settings } = useUserSettings();
  
  // Default to dark theme logo (black background) if settings not loaded
  const isDark = settings?.theme !== 'light';
  const logo = isDark ? logoDark : logoLight;

  return (
    <img
      src={logo}
      alt={alt}
      className={className}
    />
  );
}
