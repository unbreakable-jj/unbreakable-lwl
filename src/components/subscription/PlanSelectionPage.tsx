import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dumbbell,
  Brain,
  Heart,
  Flame,
  Users,
  MessageSquare,
  BarChart3,
  BookOpen,
  Target,
  Shield,
  ArrowRight,
  Check,
  Crown,
  Sparkles,
} from 'lucide-react';

interface PlanSelectionPageProps {
  onSelectPlan: (tier: string, duration: string) => void;
}

const tier1Features = [
  { icon: Dumbbell, label: 'Full Power programme builder (manual & coach-built)' },
  { icon: Target, label: 'Session logging, tracking & progression tools' },
  { icon: Flame, label: 'Fuel tracker, meal planning & recipe library' },
  { icon: Brain, label: 'Mindset programmes, breathing & focus games' },
  { icon: BarChart3, label: 'Movement programmes (run, cycle, swim, row, walk)' },
  { icon: MessageSquare, label: 'Unlimited Unbreakable Coach conversations' },
  { icon: Sparkles, label: 'Coach-built bespoke programmes & meal plans' },
  { icon: BookOpen, label: 'University learning hub & calculators' },
  { icon: Users, label: 'Community Hub — feed, stories, posts & messaging' },
  { icon: Shield, label: 'Full profile, records, trophies & leaderboards' },
  { icon: Heart, label: 'Daily habit diary & lifestyle tracking' },
];

const tier2Extras = [
  { icon: Crown, label: 'Dedicated 1-to-1 human coach' },
  { icon: MessageSquare, label: 'Bi-weekly check-ins & progress reviews' },
  { icon: Target, label: 'Personalised feedback on sessions & form' },
  { icon: BookOpen, label: 'Bespoke programming adjustments each block' },
  { icon: Heart, label: 'Nutrition & lifestyle guidance from your coach' },
  { icon: Shield, label: 'Priority support & accountability' },
];

const tier1Plans = [
  {
    duration: '3 months',
    price: 150,
    days: 91,
    key: 'tier1_3mo',
    badge: null,
  },
  {
    duration: '6 months',
    price: 275,
    days: 182,
    key: 'tier1_6mo',
    badge: 'BEST VALUE',
  },
  {
    duration: '12 months',
    price: 500,
    days: 365,
    key: 'tier1_12mo',
    badge: 'MOST POPULAR',
  },
];

export function PlanSelectionPage({ onSelectPlan }: PlanSelectionPageProps) {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-4xl md:text-6xl text-foreground tracking-wide mb-1">
            CHOOSE YOUR
          </h1>
          <h1 className="font-display text-4xl md:text-6xl text-primary tracking-wide neon-glow-subtle mb-4">
            UNBREAKABLE PLAN
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            14-day free trial on every plan. Cancel anytime before your first payment.
          </p>
        </motion.div>

        {/* Tier 1 — Unbreakable Coaching */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <h2 className="font-display text-2xl md:text-3xl text-foreground tracking-wide mb-1 text-center">
            UNBREAKABLE <span className="text-primary neon-glow-subtle">COACHING</span>
          </h2>
          <p className="text-muted-foreground text-center mb-6">
            Full platform access with your personal Unbreakable Coach
          </p>

          {/* Duration cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {tier1Plans.map((plan) => {
              const perDay = (plan.price / plan.days).toFixed(2);
              return (
                <Card
                  key={plan.key}
                  className="relative bg-card border-2 border-primary/20 hover:border-primary/50 transition-all p-6 text-center group cursor-pointer"
                  onClick={() => onSelectPlan('tier1', plan.key)}
                >
                  {plan.badge && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground font-display tracking-wide text-xs px-3">
                      {plan.badge}
                    </Badge>
                  )}
                  <p className="font-display text-xl tracking-wide text-foreground mb-2">
                    {plan.duration.toUpperCase()}
                  </p>
                  <p className="font-display text-4xl text-primary neon-glow-subtle mb-1">
                    £{plan.price}
                  </p>
                  <p className="text-muted-foreground text-sm mb-4">
                    That's just <span className="text-foreground font-semibold">£{perDay}/day</span> for:
                  </p>
                  <Button
                    className="w-full font-display tracking-wide group-hover:scale-[1.02] transition-transform"
                  >
                    START FREE TRIAL
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Card>
              );
            })}
          </div>

          {/* Features list */}
          <Card className="bg-card border border-border p-6 md:p-8">
            <p className="font-display text-lg tracking-wide text-foreground mb-4">
              EVERYTHING INCLUDED:
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {tier1Features.map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-muted-foreground text-sm leading-snug">
                    {feature.label}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Tier 2 — Unbreakable 1-to-1 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="font-display text-2xl md:text-3xl text-foreground tracking-wide mb-1 text-center">
            UNBREAKABLE <span className="text-primary neon-glow-subtle">1-TO-1</span>
          </h2>
          <p className="text-muted-foreground text-center mb-6">
            Everything in Coaching, plus a dedicated human coach by your side
          </p>

          <Card className="relative bg-card border-2 border-primary/40 neon-border-subtle p-6 md:p-8">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground font-display tracking-wide text-xs px-3">
              PREMIUM
            </Badge>

            <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
              <div className="text-center md:text-left flex-1">
                <p className="font-display text-xl tracking-wide text-foreground mb-1">
                  3-MONTH BLOCKS
                </p>
                <p className="font-display text-4xl text-primary neon-glow-subtle mb-1">
                  £300
                </p>
                <p className="text-muted-foreground text-sm">
                  That's just <span className="text-foreground font-semibold">£3.30/day</span> for 
                  full coaching access + your own dedicated coach
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  Auto-renews every 3 months. Cancel anytime.
                </p>
              </div>
              <Button
                size="lg"
                className="font-display tracking-wide shrink-0"
                onClick={() => onSelectPlan('tier2', 'tier2_3mo')}
              >
                <Crown className="w-5 h-5 mr-2" />
                START FREE TRIAL
              </Button>
            </div>

            <div className="border-t border-border pt-6">
              <p className="font-display text-lg tracking-wide text-foreground mb-4">
                EVERYTHING IN COACHING, PLUS:
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {tier2Extras.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Crown className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-muted-foreground text-sm leading-snug">
                      {feature.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-muted-foreground text-sm mt-10"
        >
          All plans include a 14-day free trial. Payment details collected upfront.
          <br />
          Cancel from your profile anytime before the trial ends — no charge.
        </motion.p>
      </div>
    </div>
  );
}
