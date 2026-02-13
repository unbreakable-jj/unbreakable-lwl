import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ThemedLogo } from '@/components/ThemedLogo';
import { Button } from '@/components/ui/button';
import { NavigationDrawer } from '@/components/NavigationDrawer';
import { UnifiedFooter } from '@/components/UnifiedFooter';
import { PageNavigation, SwipeNavigationWrapper } from '@/components/PageNavigation';
import { ThemeToggle } from '@/components/hub/ThemeToggle';
import { Card } from '@/components/ui/card';
import {
  Flame,
  Dumbbell,
  Brain,
  Heart,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface LandingPageProps {
  onSignIn: () => void;
  onSignUp: () => void;
}

export function LandingPage({ onSignIn, onSignUp }: LandingPageProps) {
  return (
    <SwipeNavigationWrapper>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <Link to="/" className="flex items-center gap-3">
                  <ThemedLogo />
                  <span className="font-display text-lg tracking-wide text-foreground hidden sm:block">
                    UNBREAKABLE
                  </span>
                </Link>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  className="font-display tracking-wide"
                  onClick={onSignIn}
                >
                  SIGN UP / LOGIN
                </Button>
                <NavigationDrawer />
              </div>
            </div>
          </div>
        </header>

        {/* Page Navigation */}
        <div className="pt-[72px]">
          <PageNavigation />
        </div>

        {/* Hero Section */}
        <section className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center text-center px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <ThemedLogo className="h-32 md:h-48 lg:h-56 object-contain mx-auto mb-8" />

            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-foreground tracking-wide leading-none mb-2">
              BECOME
            </h1>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-primary tracking-wide leading-none neon-glow-subtle mb-6">
              UNBREAKABLE
            </h1>

            <p className="text-primary font-display text-xl md:text-2xl tracking-wide neon-glow-subtle mb-4">
              LIVE WITHOUT LIMITS. KEEP SHOWING UP.
            </p>

            <div className="max-w-2xl mx-auto space-y-4 mb-10">
              <p className="text-muted-foreground text-lg leading-relaxed">
                We all care about how we look.{' '}
                <span className="text-foreground font-medium">Let's stop pretending we don't.</span>
              </p>
              <p className="text-muted-foreground leading-relaxed">
                But somewhere along the way, fitness became about chasing someone else's ideal — 
                a body, a shape, a standard that was never built for you.
              </p>
              <p className="text-foreground font-semibold text-lg">
                Unbreakable is about something deeper.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                It's about what your body <span className="text-primary">can do</span>. 
                How long it can <span className="text-primary">keep going</span>. 
                And who you become when you <span className="text-primary">show up anyway</span>.
              </p>
            </div>

            <Button
              size="lg"
              className="font-display text-lg tracking-wide px-12 py-6"
              onClick={onSignUp}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              START YOUR JOURNEY
            </Button>
          </motion.div>
        </section>

        {/* Not About Perfection Section */}
        <section className="py-20 md:py-28 bg-card/30">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl mx-auto text-center"
            >
              <h2 className="font-display text-3xl md:text-5xl text-foreground mb-2 tracking-wide">
                THIS ISN'T ABOUT
              </h2>
              <h2 className="font-display text-3xl md:text-5xl text-primary mb-6 tracking-wide neon-glow-subtle">
                PERFECTION
              </h2>
              <p className="text-muted-foreground uppercase tracking-widest text-sm mb-10">
                It's About Ability, Mindset, and Longevity
              </p>

              <div className="bg-card border-2 border-primary/30 neon-border-subtle rounded-lg p-8 md:p-10 text-left space-y-6">
                <p className="text-muted-foreground leading-relaxed text-lg">
                  Being Unbreakable doesn't mean never struggling.{' '}
                  <span className="text-foreground font-medium">
                    It means building a body and mindset that can handle life.
                  </span>
                </p>

                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <Dumbbell className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      <span className="text-foreground font-medium">Strength that carries into real life</span> — 
                      not just the gym
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Heart className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      <span className="text-foreground font-medium">Fitness that supports you for decades</span>, 
                      not months
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Brain className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      <span className="text-foreground font-medium">A mindset that doesn't crumble</span> when 
                      motivation fades
                    </span>
                  </li>
                </ul>

                <p className="text-muted-foreground leading-relaxed pt-4 border-t border-border">
                  You don't train just to look good in photos.{' '}
                  <span className="text-primary font-semibold">
                    You train so your body works, your mind stays sharp, and your future stays open.
                  </span>
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stop Chasing Section */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl mx-auto text-center"
            >
              <h2 className="font-display text-3xl md:text-5xl text-foreground mb-2 tracking-wide">
                STOP CHASING THE IDEAL
              </h2>
              <h2 className="font-display text-3xl md:text-5xl text-primary mb-10 tracking-wide neon-glow-subtle">
                START BECOMING UNBREAKABLE
              </h2>

              <div className="space-y-6 text-left max-w-2xl mx-auto">
                <p className="text-muted-foreground leading-relaxed text-lg">
                  When you focus only on aesthetics, progress is fragile.
                </p>
                <p className="text-foreground leading-relaxed text-lg font-medium">
                  When you focus on performance, consistency, and resilience — everything changes.
                </p>

                <div className="bg-primary/10 border-l-4 border-primary p-6 my-8">
                  <p className="text-muted-foreground italic text-lg">
                    Here's the truth most people miss:
                  </p>
                  <p className="text-primary font-display text-2xl md:text-3xl tracking-wide mt-2 neon-glow-subtle">
                    WHEN YOU BECOME UNBREAKABLE, YOUR PHYSIQUE FOLLOWS.
                  </p>
                </div>

                <div className="text-center space-y-1 text-muted-foreground">
                  <p>Not forced.</p>
                  <p>Not starved.</p>
                  <p>Not obsessed.</p>
                  <p className="text-primary font-semibold text-lg pt-2">It flows.</p>
                  <p className="text-foreground">It matches who you are becoming.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* What Unbreakable Means Section */}
        <section className="py-20 md:py-28 bg-card/30">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="max-w-5xl mx-auto"
            >
              <h2 className="font-display text-3xl md:text-5xl text-center mb-4 tracking-wide">
                WHAT <span className="text-primary neon-glow-subtle">"UNBREAKABLE"</span> REALLY MEANS
              </h2>
              <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
                This isn't about doing more. It's about doing what actually matters — consistently.
              </p>

              <div className="grid md:grid-cols-3 gap-8">
                <Card className="bg-card border-2 border-primary/30 neon-border-subtle p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 neon-border-subtle flex items-center justify-center mx-auto mb-6">
                    <Dumbbell className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-display text-2xl text-primary mb-4 tracking-wide neon-glow-subtle">
                    ABILITY
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    To lift, move, run, push, pull, and live without fear of your body failing you.
                  </p>
                </Card>

                <Card className="bg-card border-2 border-primary/30 neon-border-subtle p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 neon-border-subtle flex items-center justify-center mx-auto mb-6">
                    <Brain className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-display text-2xl text-primary mb-4 tracking-wide neon-glow-subtle">
                    MINDSET
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    To keep going when it's boring, hard, or inconvenient — and to rebuild when life knocks you sideways.
                  </p>
                </Card>

                <Card className="bg-card border-2 border-primary/30 neon-border-subtle p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 neon-border-subtle flex items-center justify-center mx-auto mb-6">
                    <Heart className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-display text-2xl text-primary mb-4 tracking-wide neon-glow-subtle">
                    LONGEVITY
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    To train for the long game. Strong joints. Capable muscles. A body that lasts.
                  </p>
                </Card>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Keep Showing Up Section */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h2 className="font-display text-4xl md:text-6xl text-primary mb-8 tracking-wide neon-glow-subtle">
                KEEP SHOWING UP
              </h2>

              <div className="space-y-4 text-muted-foreground text-lg leading-relaxed mb-10">
                <p>Some days you'll feel unstoppable.</p>
                <p>Some days you'll feel tired, busy, or unmotivated.</p>
                <p className="text-foreground font-medium pt-4">
                  Unbreakable isn't built on perfect weeks.
                </p>
                <p className="text-foreground font-medium">
                  It's built on the decision to show up again.
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-4 text-primary font-display text-xl tracking-wide mb-8">
                <span className="px-4 py-2 bg-primary/10 rounded-lg neon-border-subtle">ONE SESSION</span>
                <span className="px-4 py-2 bg-primary/10 rounded-lg neon-border-subtle">ONE WALK</span>
                <span className="px-4 py-2 bg-primary/10 rounded-lg neon-border-subtle">ONE MEAL</span>
                <span className="px-4 py-2 bg-primary/10 rounded-lg neon-border-subtle">ONE CHOICE</span>
              </div>

              <p className="text-foreground font-semibold text-xl">
                That's how limits disappear.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-24 md:py-32 bg-card/50">
          <div className="container mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto"
            >
              <h2 className="font-display text-3xl md:text-4xl text-foreground mb-6 tracking-wide">
                THIS IS YOUR INVITATION
              </h2>

              <div className="space-y-2 text-muted-foreground text-lg mb-10">
                <p>If you're done chasing shortcuts...</p>
                <p>If you're tired of fitness that doesn't last...</p>
                <p>If you want strength, confidence, and freedom for the long run...</p>
                <p className="text-primary font-semibold pt-4">Then you're in the right place.</p>
              </div>

              <div className="space-y-2 mb-10">
                <p className="font-display text-2xl md:text-3xl text-foreground tracking-wide">
                  BECOME UNBREAKABLE.
                </p>
                <p className="font-display text-2xl md:text-3xl text-primary tracking-wide neon-glow-subtle">
                  LIVE WITHOUT LIMITS.
                </p>
                <p className="font-display text-2xl md:text-3xl text-foreground tracking-wide">
                  KEEP SHOWING UP.
                </p>
              </div>

              <Button
                size="lg"
                className="font-display text-xl tracking-wide px-12 py-7"
                onClick={onSignUp}
              >
                SIGN UP TO GET STARTED
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <p className="text-muted-foreground text-sm mt-6">
                Start building a body — and mindset — that lasts.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Coach Banner */}
        <section className="container mx-auto px-6 py-12 border-t border-border">
          <Link to="/help" className="block max-w-3xl mx-auto">
            <Card className="border-2 border-primary/40 bg-primary/5 p-6 hover:bg-primary/10 transition-all neon-border-subtle">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center neon-glow">
                    <Flame className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <p className="font-display text-2xl tracking-wide text-foreground">
                      UNBREAKABLE <span className="text-primary neon-glow-subtle">COACHING</span>
                    </p>
                    <p className="text-muted-foreground mt-1">
                      Your personal coach for training, nutrition, mindset, and beyond.
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 text-primary hidden sm:block" />
              </div>
            </Card>
          </Link>
        </section>

        <UnifiedFooter />
      </div>
    </SwipeNavigationWrapper>
  );
}
