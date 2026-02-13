import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Flame, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

export function U86Completion() {
  return (
    <div className="max-w-xl mx-auto text-center py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="space-y-8"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto neon-glow"
        >
          <Trophy className="w-12 h-12 text-primary" />
        </motion.div>

        <div className="space-y-4">
          <h1 className="font-display text-4xl md:text-5xl tracking-wider text-foreground">
            <span className="text-primary neon-glow-subtle">UNBREAKABLE</span>
          </h1>
          <div className="space-y-2">
            <p className="text-xl text-foreground font-display tracking-wider">
              You didn't complete a programme.
            </p>
            <p className="text-xl text-primary font-display tracking-wider neon-glow-subtle">
              You proved who you are.
            </p>
          </div>
        </div>

        <div className="space-y-1 text-sm text-muted-foreground">
          <p className="font-display tracking-wider">UNBREAKABLE</p>
          <p className="font-display tracking-wider">LIVE WITHOUT LIMITS</p>
          <p className="font-display tracking-wider text-primary">KEEP SHOWING UP</p>
        </div>

        <div className="flex flex-col gap-3 items-center pt-4">
          <Link to="/programming">
            <Button size="lg" className="gap-2 font-display tracking-wider px-8">
              <Flame className="w-5 h-5" /> RETURN TO POWER
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
