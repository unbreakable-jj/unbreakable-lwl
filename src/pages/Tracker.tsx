import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MainNavigation } from '@/components/MainNavigation';
import { UnifiedFooter } from '@/components/UnifiedFooter';
import { Card } from '@/components/ui/card';
import { 
  Footprints,
  Wrench,
  BookOpen,
  Timer,
  ArrowRight,
  Flame
} from 'lucide-react';

export default function Tracker() {
  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />

      {/* Hero */}
      <section className="pt-24 pb-12 md:pt-28 md:pb-16 border-b border-border">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-wide leading-none">
              <span className="text-foreground">BECOME </span>
              <span className="text-primary neon-glow-subtle">UNBREAKABLE</span>
            </h1>
            <p className="text-primary font-display text-xl md:text-2xl tracking-wide neon-glow-subtle">
              LIVE WITHOUT LIMITS
            </p>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Build bespoke cardio programmes for Walk, Run, or Cycle — or start tracking immediately.
              Every session is designed with <span className="text-primary font-semibold">over 10 years of coaching expertise</span>.
            </p>
            <p className="text-primary font-display text-lg neon-glow-subtle">KEEP SHOWING UP.</p>
          </motion.div>
        </div>
      </section>

      {/* Hub Navigation Cards */}
      <main className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl text-foreground mb-8 text-center">
            EXPLORE <span className="text-primary">MOVEMENT</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Create Card */}
            <Link to="/tracker/create">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="relative overflow-hidden p-6 h-full border-2 border-primary/30 hover:border-primary bg-gradient-to-br from-primary/5 to-transparent transition-all duration-300 neon-border-subtle group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  
                  <div className="relative z-10 space-y-3">
                    <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center neon-glow">
                      <Wrench className="w-7 h-7 text-primary" />
                    </div>
                    
                    <h3 className="font-display text-xl text-foreground">
                      <span className="text-primary neon-glow-subtle">CREATE</span>
                    </h3>
                    
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Build a new cardio programme using our Auto Builder.
                    </p>
                    
                    <div className="inline-flex items-center gap-2 text-primary font-display tracking-wide text-sm group-hover:gap-3 transition-all">
                      START BUILDING
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            </Link>

            {/* Library Card */}
            <Link to="/tracker/my-programmes">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="relative overflow-hidden p-6 h-full border-2 border-border hover:border-primary/50 bg-gradient-to-br from-muted/20 to-transparent transition-all duration-300 group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-muted/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  
                  <div className="relative z-10 space-y-3">
                    <div className="w-14 h-14 rounded-xl bg-muted/40 flex items-center justify-center">
                      <BookOpen className="w-7 h-7 text-muted-foreground" />
                    </div>
                    
                    <h3 className="font-display text-xl text-foreground">
                      LIBRARY
                    </h3>
                    
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      View saved programmes and activity logs.
                    </p>
                    
                    <div className="inline-flex items-center gap-2 text-muted-foreground font-display tracking-wide text-sm group-hover:gap-3 group-hover:text-primary transition-all">
                      VIEW PROGRAMMES
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            </Link>

            {/* Quick Track Card */}
            <Link to="/tracker/quick-track">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="relative overflow-hidden p-6 h-full border-2 border-border hover:border-primary/50 bg-gradient-to-br from-muted/20 to-transparent transition-all duration-300 group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-muted/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  
                  <div className="relative z-10 space-y-3">
                    <div className="w-14 h-14 rounded-xl bg-muted/40 flex items-center justify-center">
                      <Timer className="w-7 h-7 text-muted-foreground" />
                    </div>
                    
                    <h3 className="font-display text-xl text-foreground">
                      QUICK TRACK
                    </h3>
                    
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Start a cardio session immediately.
                    </p>
                    
                    <div className="inline-flex items-center gap-2 text-muted-foreground font-display tracking-wide text-sm group-hover:gap-3 group-hover:text-primary transition-all">
                      START NOW
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            </Link>
          </div>
        </div>
      </main>

      {/* Coach Banner - Bottom of page */}
      <section className="container mx-auto px-4 py-12 border-t border-border">
        <Link to="/help" className="block max-w-3xl mx-auto">
          <Card className="border-2 border-primary/40 bg-primary/5 p-6 hover:bg-primary/10 transition-all neon-border-subtle">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center neon-glow">
                  <Flame className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <p className="font-display text-xl tracking-wide text-foreground">
                    NEED HELP? <span className="text-primary neon-glow-subtle">ASK YOUR COACH</span>
                  </p>
                  <p className="text-muted-foreground mt-1">
                    Get personalised guidance on cardio programming, pacing, and endurance training
                  </p>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-primary hidden sm:block" />
            </div>
          </Card>
        </Link>
      </section>

      <UnifiedFooter className="mt-auto" />
    </div>
  );
}
