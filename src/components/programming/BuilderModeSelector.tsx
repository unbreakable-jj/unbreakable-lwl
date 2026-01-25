import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Sparkles, Wrench, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BuilderModeSelectorProps {
  onSelectMode: (mode: 'auto' | 'manual') => void;
}

export function BuilderModeSelector({ onSelectMode }: BuilderModeSelectorProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      {/* Auto Builder Card */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Card
          onClick={() => onSelectMode('auto')}
          className={cn(
            'relative overflow-hidden cursor-pointer p-6',
            'border-2 border-primary/30 hover:border-primary',
            'bg-gradient-to-br from-primary/5 to-transparent',
            'transition-all duration-300',
            'neon-border-subtle'
          )}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center mb-4 neon-glow">
              <Sparkles className="w-7 h-7 text-primary" />
            </div>
            
            <h3 className="font-display text-2xl text-foreground mb-2">
              AUTO PROGRAMME BUILDER
            </h3>
            
            <p className="text-muted-foreground text-sm mb-6">
              Answer a few questions about your goals, schedule, and experience. 
              Let the system build a personalised 12-week programme tailored to you.
            </p>
            
            <div className="flex items-center text-primary font-medium text-sm gap-2">
              Start Building
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
            'relative overflow-hidden cursor-pointer p-6',
            'border-2 border-border hover:border-primary/50',
            'bg-card',
            'transition-all duration-300'
          )}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-muted/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center mb-4">
              <Wrench className="w-7 h-7 text-foreground" />
            </div>
            
            <h3 className="font-display text-2xl text-foreground mb-2">
              MANUAL PROGRAMME BUILDER
            </h3>
            
            <p className="text-muted-foreground text-sm mb-6">
              Full control over your programme. Select exercises from our library, 
              create supersets, and customise every detail of your training plan.
            </p>
            
            <div className="flex items-center text-foreground font-medium text-sm gap-2">
              Build Manually
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
