import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserSettings } from '@/hooks/useUserSettings';

export function ThemeToggle() {
  const { settings, toggleTheme, loading } = useUserSettings();
  
  if (loading) return null;

  const isDark = settings?.theme === 'dark';

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="relative overflow-hidden"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <Sun
        className={`w-5 h-5 transition-all duration-300 ${
          isDark 
            ? 'rotate-90 scale-0 opacity-0' 
            : 'rotate-0 scale-100 opacity-100'
        }`}
      />
      <Moon
        className={`absolute w-5 h-5 transition-all duration-300 ${
          isDark 
            ? 'rotate-0 scale-100 opacity-100' 
            : '-rotate-90 scale-0 opacity-0'
        }`}
      />
    </Button>
  );
}
