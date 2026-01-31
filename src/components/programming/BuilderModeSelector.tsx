import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Sparkles, ArrowRight, Wrench, Dumbbell, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BuilderModeSelectorProps {
  onSelectMode: (mode: 'auto' | 'manual') => void;
}

export function BuilderModeSelector({ onSelectMode }: BuilderModeSelectorProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="grid md:grid-cols-2 gap-6 md:gap-8">
        {/* Auto Builder Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card
            onClick={() => onSelectMode('auto')}
            className={cn(
              'relative overflow-hidden cursor-pointer p-6 h-full',
              'border-2 border-primary/30 hover:border-primary',
              'bg-gradient-to-br from-primary/5 to-transparent',
              'transition-all duration-300',
              'neon-border-subtle'
            )}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10 space-y-4">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-primary/20 flex items-center justify-center neon-glow">
                <Sparkles className="w-7 h-7 md:w-8 md:h-8 text-primary" />
              </div>
              
              <h3 className="font-display text-xl md:text-2xl text-foreground">
                AUTO <span className="text-primary neon-glow-subtle">BUILDER</span>
              </h3>
              
              <p className="text-muted-foreground text-sm leading-relaxed">
                Answer a few questions about your goals, schedule, and experience. 
                Let us build a personalised 12-week programme tailored to you.
              </p>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MessageCircle className="w-4 h-4 text-primary shrink-0" />
                <span>Includes coaching support & feedback</span>
              </div>
              
              <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-display tracking-wide text-sm">
                START AUTO BUILD
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Manual Builder Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card
            onClick={() => onSelectMode('manual')}
            className={cn(
              'relative overflow-hidden cursor-pointer p-6 h-full',
              'border-2 border-border hover:border-primary/50',
              'bg-gradient-to-br from-muted/20 to-transparent',
              'transition-all duration-300'
            )}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-muted/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10 space-y-4">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-muted/40 flex items-center justify-center">
                <Wrench className="w-7 h-7 md:w-8 md:h-8 text-muted-foreground" />
              </div>
              
              <h3 className="font-display text-xl md:text-2xl text-foreground">
                MANUAL <span className="text-muted-foreground">BUILDER</span>
              </h3>
              
              <p className="text-muted-foreground text-sm leading-relaxed">
                Full control over your programme. Pick exercises from our comprehensive library, 
                set your own sets, reps, and progression. Perfect for experienced lifters.
              </p>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Dumbbell className="w-4 h-4 text-primary shrink-0" />
                <span>150+ exercises with coaching tips</span>
              </div>
              
              <div className="inline-flex items-center gap-2 bg-muted text-foreground px-5 py-2.5 rounded-lg font-display tracking-wide text-sm">
                BUILD MANUALLY
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
