import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MainNavigation } from '@/components/MainNavigation';
import { UnifiedFooter } from '@/components/UnifiedFooter';
import { CardioTrackerModal } from '@/components/tracker/CardioTrackerModal';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from '@/components/tracker/AuthModal';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Timer, Footprints, Zap, Bike, Flame, ArrowRight } from 'lucide-react';

type ActivityType = 'walk' | 'run' | 'cycle' | null;

const activityOptions = [
  { value: 'walk' as const, label: 'WALK', icon: <Footprints className="w-10 h-10" />, description: 'Low-impact, steady state' },
  { value: 'run' as const, label: 'RUN', icon: <Zap className="w-10 h-10" />, description: 'Build speed & power' },
  { value: 'cycle' as const, label: 'CYCLE', icon: <Bike className="w-10 h-10" />, description: 'Leg power, zero impact' },
];

export default function TrackerQuickTrack() {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCardioModal, setShowCardioModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityType>(null);

  const handleActivitySelect = (activity: ActivityType) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setSelectedActivity(activity);
    setShowCardioModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />

      {/* Hero Section */}
      <section className="pt-24 pb-12 md:pt-28 md:pb-16 border-b border-border">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto neon-glow">
              <Timer className="w-10 h-10 text-primary" />
            </div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl tracking-wide leading-none">
              <span className="text-primary neon-glow-subtle">UNBREAKABLE </span>
              <span className="text-foreground">SESSION</span>
            </h1>
            <p className="text-primary font-display text-xl tracking-wide neon-glow-subtle">
              START MOVING NOW
            </p>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Start a cardio session immediately. Choose your activity and move.
              No plan needed — just{' '}
              <span className="text-primary font-semibold">KEEP SHOWING UP</span>.
            </p>
          </motion.div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {activityOptions.map((option) => (
              <Card
                key={option.value}
                className="cursor-pointer transition-all border-2 border-border hover:border-primary/50 hover:bg-primary/5"
                onClick={() => handleActivitySelect(option.value)}
              >
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <div className="text-primary">{option.icon}</div>
                  </div>
                  <h3 className="font-display text-2xl tracking-wide mb-2">{option.label}</h3>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </CardContent>
              </Card>
            ))}
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
                    Get personalised guidance on cardio programming and pacing
                  </p>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-primary hidden sm:block" />
            </div>
          </Card>
        </Link>
      </section>

      <UnifiedFooter className="mt-auto" />
      
      <CardioTrackerModal
        isOpen={showCardioModal}
        onClose={() => {
          setShowCardioModal(false);
          setSelectedActivity(null);
        }}
        initialActivity={selectedActivity || undefined}
      />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
