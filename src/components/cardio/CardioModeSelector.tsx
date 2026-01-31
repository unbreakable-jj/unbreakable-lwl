import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Sparkles, ArrowRight, Timer, Footprints, Zap, Bike, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CardioModeSelectorProps {
  onSelectMode: (mode: 'auto' | 'manual') => void;
}

export function CardioModeSelector({ onSelectMode }: CardioModeSelectorProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid md:grid-cols-2 gap-6">
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
            
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center mb-4 neon-glow">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              
              <h3 className="font-display text-2xl text-foreground mb-2">
                AUTO <span className="text-primary neon-glow-subtle">PROGRAMME</span>
              </h3>
              
              <p className="text-muted-foreground text-sm mb-4">
                Build a personalised 12-week cardio plan. Choose your activity, 
                set goals, and get a structured programme with progressive training.
              </p>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border-2 border-background">
                    <Footprints className="w-4 h-4 text-primary" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border-2 border-background">
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border-2 border-background">
                    <Bike className="w-4 h-4 text-primary" />
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">Walk • Run • Cycle</span>
              </div>
              
              <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-display tracking-wide text-sm">
                BUILD PROGRAMME
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Manual Tracking Card */}
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
            
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-xl bg-muted/40 flex items-center justify-center mb-4">
                <Timer className="w-8 h-8 text-muted-foreground" />
              </div>
              
              <h3 className="font-display text-2xl text-foreground mb-2">
                QUICK <span className="text-muted-foreground">TRACK</span>
              </h3>
              
              <p className="text-muted-foreground text-sm mb-4">
                Start a cardio session immediately. Track time, distance, and pace 
                with GPS or log manually. Perfect for spontaneous workouts.
              </p>

              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                <Flame className="w-4 h-4 text-primary" />
                <span>Live tracking with coaching support</span>
              </div>
              
              <div className="inline-flex items-center gap-2 bg-muted text-foreground px-4 py-2 rounded-lg font-display tracking-wide text-sm">
                START TRACKING
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
