import { useState } from 'react';
import { motion } from 'framer-motion';
import { MainNavigation } from '@/components/MainNavigation';
import { UnifiedFooter } from '@/components/UnifiedFooter';
import { MyFuel } from '@/components/fuel/MyFuel';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from '@/components/tracker/AuthModal';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Flame } from 'lucide-react';

export default function FuelMyFuel() {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

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
              <BarChart3 className="w-10 h-10 text-primary" />
            </div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl tracking-wide leading-none">
              <span className="text-foreground">MY </span>
              <span className="text-primary neon-glow-subtle">FUEL</span>
            </h1>
            <p className="text-primary font-display text-xl tracking-wide neon-glow-subtle">
              GOALS & PROGRESS
            </p>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Set your nutrition goals and track your progress. See how you're performing
              against your targets —{' '}
              <span className="text-primary font-semibold">MEASURE WHAT MATTERS</span>.
            </p>
          </motion.div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8 md:py-12">
        {user ? (
          <div className="max-w-4xl mx-auto">
            <MyFuel />
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 text-center border-2 border-primary/30 neon-border-subtle">
              <Flame className="w-16 h-16 text-primary mx-auto mb-6" />
              <h2 className="font-display text-2xl tracking-wide mb-4">
                SIGN IN TO VIEW GOALS
              </h2>
              <p className="text-muted-foreground mb-6">
                Set nutrition goals and track your progress toward them.
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
