import { useState } from 'react';
import { motion } from 'framer-motion';
import { MainNavigation } from '@/components/MainNavigation';
import { UnifiedFooter } from '@/components/UnifiedFooter';
import { SavedCardioPrograms } from '@/components/cardio/SavedCardioPrograms';
import { CardioProgramDisplay } from '@/components/cardio/CardioProgramDisplay';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from '@/components/tracker/AuthModal';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Footprints } from 'lucide-react';
import { GeneratedCardioProgram } from '@/lib/cardioTypes';

export default function TrackerMyProgrammes() {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [viewingProgram, setViewingProgram] = useState<GeneratedCardioProgram | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If viewing a specific program
  if (viewingProgram) {
    return (
      <div className="min-h-screen bg-background">
        <MainNavigation />
        <main className="container mx-auto px-4 py-24 md:py-28">
          <CardioProgramDisplay
            program={viewingProgram}
            onBack={() => setViewingProgram(null)}
            isSaving={false}
          />
        </main>
        <UnifiedFooter className="mt-auto" />
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
              <BookOpen className="w-10 h-10 text-primary" />
            </div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl tracking-wide leading-none">
              <span className="text-foreground">MY CARDIO </span>
              <span className="text-primary neon-glow-subtle">PROGRAMMES</span>
            </h1>
            <p className="text-primary font-display text-xl tracking-wide neon-glow-subtle">
              YOUR MOVEMENT LIBRARY
            </p>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              View and execute your saved cardio programmes. Each programme is designed with{' '}
              <span className="text-primary font-semibold">over 10 years of coaching expertise</span> —
              built for lasting endurance.
            </p>
          </motion.div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8 md:py-12">
        {user ? (
          <div className="max-w-3xl mx-auto">
            <SavedCardioPrograms onViewProgram={setViewingProgram} />
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 text-center border-2 border-primary/30 neon-border-subtle">
              <Footprints className="w-16 h-16 text-primary mx-auto mb-6" />
              <h2 className="font-display text-2xl tracking-wide mb-4">
                SIGN IN TO VIEW PROGRAMMES
              </h2>
              <p className="text-muted-foreground mb-6">
                Access your saved cardio programmes and start executing them today.
              </p>
              <Button 
                size="lg" 
                className="font-display tracking-wide"
                onClick={() => setShowAuthModal(true)}
              >
                GET STARTED
              </Button>
            </Card>
          </div>
        )}
      </main>

      <UnifiedFooter className="mt-auto" />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
