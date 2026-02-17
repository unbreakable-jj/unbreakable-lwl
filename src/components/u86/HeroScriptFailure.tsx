import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface HeroScriptFailureProps {
  onRestart: () => void;
}

export function HeroScriptFailure({ onRestart }: HeroScriptFailureProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15, stiffness: 200 }}
        className="max-w-md mx-4 text-center space-y-8"
      >
        {/* Warning Icon */}
        <motion.div
          initial={{ rotate: -10 }}
          animate={{ rotate: [0, -5, 5, -5, 0] }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mx-auto w-20 h-20 rounded-full bg-destructive/20 border-2 border-destructive flex items-center justify-center"
        >
          <AlertTriangle className="w-10 h-10 text-destructive" />
        </motion.div>

        {/* Title */}
        <div className="space-y-3">
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="font-display text-4xl md:text-5xl tracking-wider text-destructive"
          >
            HERO SCRIPT
          </motion.h2>
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="font-display text-4xl md:text-5xl tracking-wider text-foreground"
          >
            FAILURE
          </motion.h2>
        </div>

        {/* Message */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <p className="text-muted-foreground text-sm leading-relaxed">
            You missed a day. Every exercise. Every habit. Every run.
            They all matter. That's the deal you made.
          </p>
          <p className="text-foreground text-sm font-semibold leading-relaxed">
            The programme resets to Day 1. No shortcuts. No exceptions.
          </p>
          <p className="text-primary font-display text-xs tracking-[0.2em] pt-2">
            THE ONLY WAY OUT IS THROUGH
          </p>
        </motion.div>

        {/* Restart Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Button
            onClick={onRestart}
            size="lg"
            className="w-full gap-3 font-display tracking-wider text-lg py-6 bg-destructive hover:bg-destructive/90 shadow-[0_0_30px_hsl(var(--destructive)/0.4)]"
          >
            RESTART FROM DAY 1
          </Button>
          <p className="text-[10px] text-muted-foreground/50 font-display tracking-wider mt-3">
            #UNBREAKABLE86 · KEEP SHOWING UP
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
