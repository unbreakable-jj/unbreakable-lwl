import { motion } from 'framer-motion';
import { MainNavigation } from '@/components/MainNavigation';
import { UnifiedFooter } from '@/components/UnifiedFooter';
import { Card } from '@/components/ui/card';
import { GraduationCap, Flame, BookOpen, Dumbbell, Brain, Apple } from 'lucide-react';

export default function University() {
  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />

      {/* Hero */}
      <section className="pt-24 pb-16 md:pt-28 md:pb-20 border-b border-primary/20">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-wide leading-none">
              <span className="text-primary neon-glow-subtle">UNBREAKABLE </span>
              <span className="text-foreground">UNIVERSITY</span>
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Master the science behind the strength. Learn the principles that make you{' '}
              <span className="text-primary font-semibold">UNBREAKABLE</span> — from programming fundamentals
              to nutrition strategy, mindset conditioning, and beyond. Keep showing up.
            </p>
            <p className="text-primary font-display text-2xl tracking-wider neon-glow-subtle">
              #UNBREAKABLEUNIVERSITY
            </p>
          </motion.div>
        </div>
      </section>

      {/* Coming Soon Content */}
      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="border-2 border-primary/30 neon-border-subtle p-12 md:p-16 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent shadow-[0_0_30px_hsl(var(--primary)/0.15)]">
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-8 neon-glow">
                <GraduationCap className="w-12 h-12 text-primary" />
              </div>
              
              <h2 className="font-display text-3xl md:text-4xl tracking-wider text-foreground mb-4">
                <span className="text-primary neon-glow-subtle">COMING</span> SOON
              </h2>
              
              <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-xl mx-auto">
                The Unbreakable University is being built. A complete learning platform covering everything
                you need to train smarter, eat better, and think stronger.
              </p>

              {/* Preview Categories */}
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {[
                  { icon: Dumbbell, label: 'TRAINING SCIENCE', desc: 'Programming principles & periodisation' },
                  { icon: Apple, label: 'NUTRITION MASTERY', desc: 'Fuel strategies & body composition' },
                  { icon: Brain, label: 'MINDSET CONDITIONING', desc: 'Mental resilience & focus' },
                  { icon: BookOpen, label: 'EXERCISE TECHNIQUE', desc: 'Movement mastery & injury prevention' },
                ].map((cat) => (
                  <div key={cat.label} className="p-4 rounded-lg border border-primary/20 bg-primary/5 text-left">
                    <cat.icon className="w-6 h-6 text-primary mb-2" />
                    <p className="font-display text-sm tracking-wider text-foreground">{cat.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{cat.desc}</p>
                  </div>
                ))}
              </div>

              <p className="text-primary font-display text-xl tracking-wider neon-glow-subtle">
                KEEP SHOWING UP.
              </p>
            </Card>
          </motion.div>
        </div>
      </main>

      <UnifiedFooter className="mt-auto" />
    </div>
  );
}
