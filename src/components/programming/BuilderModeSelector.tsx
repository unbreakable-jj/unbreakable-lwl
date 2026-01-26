import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BuilderModeSelectorProps {
  onSelectMode: (mode: 'auto') => void;
}

export function BuilderModeSelector({ onSelectMode }: BuilderModeSelectorProps) {
  return (
    <div className="max-w-2xl mx-auto">
      {/* Auto Builder Card - Now the only option */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Card
          onClick={() => onSelectMode('auto')}
          className={cn(
            'relative overflow-hidden cursor-pointer p-8',
            'border-2 border-primary/30 hover:border-primary',
            'bg-gradient-to-br from-primary/5 to-transparent',
            'transition-all duration-300',
            'neon-border-subtle'
          )}
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10 text-center">
            <div className="w-20 h-20 rounded-xl bg-primary/20 flex items-center justify-center mb-6 mx-auto neon-glow">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            
            <h3 className="font-display text-3xl text-foreground mb-3">
              BUILD YOUR <span className="text-primary neon-glow-subtle">UNBREAKABLE</span> PROGRAMME
            </h3>
            
            <p className="text-muted-foreground text-base mb-8 max-w-lg mx-auto">
              Answer a few questions about your goals, schedule, and experience. 
              Let the system build a personalised 12-week programme tailored to you.
              Track, log, and receive optional AI guidance.
            </p>
            
            <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-display tracking-wide">
              START BUILDING
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
