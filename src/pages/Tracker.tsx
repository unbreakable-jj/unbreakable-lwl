import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '@/assets/logo.png';
import { useAuth } from '@/hooks/useAuth';
import { NavigationDrawer } from '@/components/NavigationDrawer';
import { CardioTrackerModal } from '@/components/tracker/CardioTrackerModal';
import { AuthModal } from '@/components/tracker/AuthModal';
import { CardioProgramBuilder } from '@/components/cardio/CardioProgramBuilder';
import { CardioProgramDisplay } from '@/components/cardio/CardioProgramDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { 
  Timer, 
  Footprints, 
  Zap, 
  Bike, 
  ArrowRight,
  TrendingUp,
  Target
} from 'lucide-react';
import { motion } from 'framer-motion';
import { GeneratedCardioProgram } from '@/lib/cardioTypes';

type ActivityType = 'walk' | 'run' | 'cycle' | null;
type ViewState = 'hub' | 'builder' | 'program';

const Tracker = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [view, setView] = useState<ViewState>('hub');
  const [showCardioModal, setShowCardioModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityType>(null);
  const [generatedProgram, setGeneratedProgram] = useState<GeneratedCardioProgram | null>(null);

  const handleActivitySelect = (activity: ActivityType) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setSelectedActivity(activity);
    setShowCardioModal(true);
  };

  const handleProgrammeBuilder = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setView('builder');
  };

  const handleProgramGenerated = (program: GeneratedCardioProgram) => {
    setGeneratedProgram(program);
    setView('program');
  };

  const handleSaveProgram = async () => {
    // For now, just show a toast - can be extended to save to database
    toast({
      title: 'Programme Saved',
      description: 'Your cardio programme has been saved to your profile.',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background brick-texture">
      {/* Minimal Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img src={logo} alt="Live Without Limits" className="h-10 object-contain" />
              <span className="font-display text-lg tracking-wide text-foreground hidden sm:block">
                LIVE WITHOUT LIMITS
              </span>
            </Link>
            <div className="flex items-center gap-3">
              {!user && (
                <Button
                  className="font-display tracking-wide"
                  onClick={() => setShowAuthModal(true)}
                >
                  SIGN IN
                </Button>
              )}
              <NavigationDrawer variant="minimal" />
            </div>
          </div>
        </div>
      </header>

      {/* Content based on view */}
      {view === 'builder' && (
        <section className="pt-28 pb-16 px-6">
          <div className="container mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-10"
            >
              <h1 className="font-display text-4xl md:text-5xl text-foreground tracking-wide mb-2">
                BUILD YOUR <span className="text-primary neon-glow-subtle">CARDIO PROGRAMME</span>
              </h1>
              <p className="text-muted-foreground">
                Personalised training. Driven by your goals.
              </p>
            </motion.div>
            
            <CardioProgramBuilder
              onProgramGenerated={handleProgramGenerated}
              onCancel={() => setView('hub')}
            />
          </div>
        </section>
      )}

      {view === 'program' && generatedProgram && (
        <section className="pt-28 pb-16 px-6">
          <div className="container mx-auto max-w-5xl">
            <CardioProgramDisplay
              program={generatedProgram}
              onSave={handleSaveProgram}
              onBack={() => setView('builder')}
            />
          </div>
        </section>
      )}

      {view === 'hub' && (
        <>
          {/* Hero Section */}
          <section className="pt-28 pb-16 px-6">
            <div className="container mx-auto max-w-5xl">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
              >
                <h1 className="font-display text-6xl md:text-8xl text-foreground tracking-wide leading-none mb-2">
                  CARDIO
                </h1>
                <h1 className="font-display text-6xl md:text-8xl text-primary tracking-wide leading-none neon-glow-subtle">
                  CENTRAL
                </h1>
                <p className="text-muted-foreground text-lg mt-6 max-w-xl mx-auto">
                  Build your programme. Track with intention. Zero excuses.
                </p>
              </motion.div>

              {/* Stats Grid - Premium Visual Treatment */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mb-12"
              >
                <Card className="bg-card border-border overflow-hidden">
                  <div className="grid grid-cols-3 divide-x divide-border">
                    <div className="p-6 md:p-8 text-center">
                      <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 neon-border-subtle">
                        <Timer className="w-7 h-7 md:w-8 md:h-8 text-primary" />
                      </div>
                      <div className="font-display text-2xl md:text-3xl text-primary mb-1">
                        TIME
                      </div>
                      <p className="text-xs md:text-sm text-muted-foreground">Precise tracking</p>
                    </div>
                    <div className="p-6 md:p-8 text-center">
                      <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 neon-border-subtle">
                        <TrendingUp className="w-7 h-7 md:w-8 md:h-8 text-primary" />
                      </div>
                      <div className="font-display text-2xl md:text-3xl text-primary mb-1">
                        DISTANCE
                      </div>
                      <p className="text-xs md:text-sm text-muted-foreground">GPS accuracy</p>
                    </div>
                    <div className="p-6 md:p-8 text-center">
                      <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 neon-border-subtle">
                        <Zap className="w-7 h-7 md:w-8 md:h-8 text-primary" />
                      </div>
                      <div className="font-display text-2xl md:text-3xl text-primary mb-1">
                        SPEED
                      </div>
                      <p className="text-xs md:text-sm text-muted-foreground">Real-time pace</p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Hashtag */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-12"
              >
                <p className="text-primary font-display text-2xl md:text-3xl tracking-wide neon-glow-subtle">
                  #UNBREAKABLEMOVEMENT
                </p>
              </motion.div>

              {/* Activity Tracker - Visual Selector Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="mb-10"
              >
                <h2 className="font-display text-2xl text-foreground mb-6 tracking-wide text-center">
                  TRACK ACTIVITY
                </h2>
                <p className="text-muted-foreground mb-8 text-center">
                  Choose your activity. Focus your mind. Move with intention.
                </p>
                
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Walk Card */}
                  <Card 
                    className="bg-card border-2 border-border hover:border-primary cursor-pointer transition-all group overflow-hidden"
                    onClick={() => handleActivitySelect('walk')}
                  >
                    <CardContent className="p-0">
                      <div className="bg-primary/5 group-hover:bg-primary/10 transition-colors p-8 text-center">
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:neon-border transition-all">
                          <Footprints className="w-10 h-10 text-primary" />
                        </div>
                        <h3 className="font-display text-3xl text-foreground tracking-wide mb-2">
                          WALK
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Low-impact, steady state
                        </p>
                      </div>
                      <div className="p-4 border-t border-border bg-background">
                        <Button 
                          variant="ghost" 
                          className="w-full font-display tracking-wide text-primary group-hover:bg-primary/10"
                        >
                          START SESSION
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Run Card */}
                  <Card 
                    className="bg-card border-2 border-border hover:border-primary cursor-pointer transition-all group overflow-hidden"
                    onClick={() => handleActivitySelect('run')}
                  >
                    <CardContent className="p-0">
                      <div className="bg-primary/5 group-hover:bg-primary/10 transition-colors p-8 text-center">
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:neon-border transition-all">
                          <Zap className="w-10 h-10 text-primary" />
                        </div>
                        <h3 className="font-display text-3xl text-foreground tracking-wide mb-2">
                          RUN
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Build speed & endurance
                        </p>
                      </div>
                      <div className="p-4 border-t border-border bg-background">
                        <Button 
                          variant="ghost" 
                          className="w-full font-display tracking-wide text-primary group-hover:bg-primary/10"
                        >
                          START SESSION
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Cycle Card */}
                  <Card 
                    className="bg-card border-2 border-border hover:border-primary cursor-pointer transition-all group overflow-hidden"
                    onClick={() => handleActivitySelect('cycle')}
                  >
                    <CardContent className="p-0">
                      <div className="bg-primary/5 group-hover:bg-primary/10 transition-colors p-8 text-center">
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:neon-border transition-all">
                          <Bike className="w-10 h-10 text-primary" />
                        </div>
                        <h3 className="font-display text-3xl text-foreground tracking-wide mb-2">
                          CYCLE
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Leg power, zero impact
                        </p>
                      </div>
                      <div className="p-4 border-t border-border bg-background">
                        <Button 
                          variant="ghost" 
                          className="w-full font-display tracking-wide text-primary group-hover:bg-primary/10"
                        >
                          START SESSION
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>

              {/* Programme Builder - Premium Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-card border-border overflow-hidden neon-border-subtle">
                  <div className="bg-primary/10 border-b border-border px-6 py-4">
                    <h3 className="font-display text-lg text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      PROGRAMME BUILDER
                    </h3>
                  </div>
                  <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                      <div className="flex-1">
                        <h2 className="font-display text-4xl md:text-5xl text-foreground tracking-wide mb-4">
                          BUILD YOUR <span className="text-primary neon-glow-subtle">CARDIO PLAN</span>
                        </h2>
                        <p className="text-muted-foreground mb-6">
                          Generate a personalized walk, run, or cycle programme based on your goals, 
                          fitness level, and target distances. Driven by you.
                        </p>
                        <div className="flex flex-wrap gap-4 mb-6">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Target className="w-4 h-4 text-primary" />
                            <span>Goal-driven plans</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <TrendingUp className="w-4 h-4 text-primary" />
                            <span>Progressive overload</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Timer className="w-4 h-4 text-primary" />
                            <span>12-week programmes</span>
                          </div>
                        </div>
                        <Button
                          size="lg"
                          className="font-display text-lg tracking-wide px-8 py-6"
                          onClick={handleProgrammeBuilder}
                        >
                          <Target className="w-5 h-5 mr-2" />
                          BUILD PROGRAMME
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      </div>
                      <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-primary/10 flex items-center justify-center neon-border">
                        <Target className="w-16 h-16 md:w-20 md:h-20 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </section>

          {/* Footer */}
          <footer className="border-t border-border py-10 text-center">
            <Link to="/" className="text-muted-foreground hover:text-foreground text-sm">
              ← Back to Live Without Limits
            </Link>
          </footer>
        </>
      )}

      {/* Modals */}
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
};

export default Tracker;
