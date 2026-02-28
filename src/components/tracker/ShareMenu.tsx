import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BookImage, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShareMenuProps {
  onShareToStory?: () => void;
}

export function ShareMenu({ onShareToStory }: ShareMenuProps) {
  const [shared, setShared] = useState(false);

  if (!onShareToStory) return null;

  const handleClick = async () => {
    await onShareToStory();
    setShared(true);
    setTimeout(() => setShared(false), 2500);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`gap-1.5 transition-all ${shared ? 'text-primary' : 'text-muted-foreground'}`}
      onClick={handleClick}
      disabled={shared}
    >
      <AnimatePresence mode="wait">
        {shared ? (
          <motion.div
            key="check"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className="flex items-center gap-1.5"
          >
            <Check className="w-5 h-5 text-primary" />
            <span className="text-xs font-display tracking-wide text-primary">SHARED!</span>
          </motion.div>
        ) : (
          <motion.div
            key="share"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="flex items-center gap-1.5"
          >
            <BookImage className="w-5 h-5" />
            <span className="text-xs hidden sm:inline">Story</span>
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  );
}
