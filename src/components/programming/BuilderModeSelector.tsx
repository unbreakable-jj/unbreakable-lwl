import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Sparkles, ArrowRight, Wrench, Dumbbell, Flame, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BuilderModeSelectorProps {
  onSelectMode: (mode: 'auto' | 'manual') => void;
}

export function BuilderModeSelector({ onSelectMode }: BuilderModeSelectorProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Coaching Link Banner */}
      <Link to="/help" className="block">
        <Card className="border-2 border-primary/40 bg-primary/5 p-4 hover:bg-primary/10 transition-all neon-border-subtle">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Flame className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-display text-lg tracking-wide text-foreground">
                  NEED HELP? <span className="text-primary">ASK YOUR COACH</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Get personalised guidance on exercises, form, programming, and more
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-primary" />
          </div>
        </Card>
      </Link>

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
                AUTO <span className="text-primary neon-glow-subtle">BUILDER</span>
              </h3>
              
              <p className="text-muted-foreground text-sm mb-4">
                Answer a few questions about your goals, schedule, and experience. 
                Let us build a personalised 12-week programme tailored to you.
              </p>

              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                <MessageCircle className="w-4 h-4 text-primary" />
                <span>Includes coaching support & feedback</span>
              </div>
              
              <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-display tracking-wide text-sm">
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
            
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-xl bg-muted/40 flex items-center justify-center mb-4">
                <Wrench className="w-8 h-8 text-muted-foreground" />
              </div>
              
              <h3 className="font-display text-2xl text-foreground mb-2">
                MANUAL <span className="text-muted-foreground">BUILDER</span>
              </h3>
              
              <p className="text-muted-foreground text-sm mb-4">
                Full control over your programme. Pick exercises from our comprehensive library, 
                set your own sets, reps, and progression. Perfect for experienced lifters.
              </p>

              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                <Dumbbell className="w-4 h-4 text-primary" />
                <span>150+ exercises with coaching tips</span>
              </div>
              
              <div className="inline-flex items-center gap-2 bg-muted text-foreground px-4 py-2 rounded-lg font-display tracking-wide text-sm">
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
