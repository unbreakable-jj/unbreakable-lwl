import { Button } from '@/components/ui/button';
import { BookImage } from 'lucide-react';

interface ShareMenuProps {
  onShareToStory?: () => void;
}

export function ShareMenu({ onShareToStory }: ShareMenuProps) {
  if (!onShareToStory) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-muted-foreground gap-1.5"
      onClick={onShareToStory}
    >
      <BookImage className="w-5 h-5" />
      <span className="text-xs hidden sm:inline">Story</span>
    </Button>
  );
}
