import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ThemedLogo } from '@/components/ThemedLogo';
import { Button } from '@/components/ui/button';
import { NavigationDrawer } from '@/components/NavigationDrawer';
import { UnifiedFooter } from '@/components/UnifiedFooter';
import { ThemeToggle } from '@/components/hub/ThemeToggle';
import { AuthModal } from '@/components/tracker/AuthModal';
import { Card } from '@/components/ui/card';
import {
  Dumbbell,
  Brain,
  Heart,
  ArrowRight,
  Sparkles,
  User,
} from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const beliefs = [
  { title: 'Aesthetics are a byproduct, not the goal.', desc: 'When your body can perform, endure, and recover — looking good is inevitable.' },
  { title: 'Education beats motivation every time.', desc: 'Anyone can hype you up for a week. Real change comes from understanding why — and how.' },
  { title: 'Consistency isn\'t sexy, but it\'s everything.', desc: 'One good week means nothing. One good year changes your entire life.' },
  { title: 'Strength is for everyone.', desc: 'Not just gym bros. Not just athletes. If you have a body, you have a reason to train it.' },
  { title: 'Mental health and physical training aren\'t separate.', desc: 'They\'re the same conversation. We treat them that way.' },
  { title: 'Community over competition.', desc: 'We cheer, challenge, and carry each other. There are no levels here — just people showing up.' },
];

const chips = [
  'TRAIN HARD', 'EAT SMART', 'SLEEP WELL', 'LEARN DAILY',
  'MOVE YOUR BODY', 'PROTECT YOUR MIND', 'BUILD YOUR PEOPLE',
  'DO THE HARD THING', 'STAY HONEST', 'KEEP GOING',
];

const timeline = [
  { label: 'The Spark', title: 'Years of training, coaching, and learning', desc: 'From personal transformation to helping others — the blueprint started forming.' },
  { label: 'The Problem', title: 'Fitness was broken', desc: 'Too much hype. Too little substance. No platform combined training, nutrition, mindset, and community properly.' },
  { label: 'The Build', title: 'Unbreakable was born', desc: 'Not as a business plan — as a solution. Built from real experience, real science, and real frustration.' },
  { label: 'The Mission', title: 'Make strength accessible', desc: 'No gatekeeping. No ego. Just honest tools and a community that gives a damn.' },
];

const Founder = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authDefaultMode, setAuthDefaultMode] = useState<'signin' | 'signup'>('signin');

  const handleSignUp = () => {
    setAuthDefaultMode('signup');
    setShowAuthModal(true);
  };

  return (
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
              <Button className="font-display tracking-wide" onClick={handleSignUp}>
                START YOUR JOURNEY
              </Button>
              <NavigationDrawer />
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-[100px] pb-14 text-center px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[radial-gradient(circle,hsl(var(--primary)/0.08)_0%,transparent_60%)] pointer-events-none" />
        <motion.div {...fadeUp} className="max-w-lg mx-auto relative z-10">
          <span className="inline-block font-mono text-[9px] tracking-[3px] text-primary uppercase border border-border px-4 py-1.5 rounded-full mb-6">
            The Founder
          </span>
          <h1 className="font-display text-[clamp(58px,14vw,96px)] leading-[0.88] tracking-wide text-foreground mb-6">
            NOT A<br />
            <span className="text-primary neon-glow-subtle">GURU.</span><br />
            JUST SOMEONE<br />
            WHO GETS IT.
          </h1>
          <p className="text-muted-foreground text-[15px] leading-relaxed max-w-[320px] mx-auto mb-8">
            I built Unbreakable because I needed it and it didn't exist. Not a programme, not a coaching package, not another influencer selling a transformation.{' '}
            <strong className="text-foreground">
              A community built on truth, education, and the kind of honest connection that the fitness industry never bothered to offer.
            </strong>
          </p>
          <p className="font-mono text-[10px] tracking-[3px] text-primary uppercase">
            Live Without Limits · Keep Showing Up
          </p>
        </motion.div>
      </section>

      <div className="border-t border-border" />

      {/* Founder Photo */}
      <section className="py-11 flex flex-col items-center gap-5 border-b border-border">
        <motion.div {...fadeUp}>
          <div className="relative w-[150px] h-[150px]">
            {/* Spinning ring */}
            <div className="absolute inset-[-4px] rounded-full animate-[spin_8s_linear_infinite] opacity-60"
              style={{ background: 'conic-gradient(hsl(var(--primary)) 0deg, transparent 180deg, hsl(var(--primary)) 360deg)' }}
            />
            <div className="absolute inset-1 rounded-full bg-card overflow-hidden flex items-center justify-center">
              <User className="w-12 h-12 text-muted-foreground/20" />
            </div>
          </div>
        </motion.div>
        <div className="text-center">
          <h2 className="font-display text-[32px] tracking-[3px] text-foreground">THE FOUNDER</h2>
          <p className="font-mono text-[9px] tracking-[2px] text-primary uppercase">Founder & Creator · Unbreakable LWL</p>
        </div>
      </section>

      {/* Opener Statement */}
      <section className="py-11 px-6 border-b border-border">
        <motion.div {...fadeUp} className="max-w-lg mx-auto">
          <h2 className="font-display text-[clamp(28px,7vw,42px)] leading-[1.1] tracking-wide text-foreground mb-5">
            I DIDN'T BUILD THIS TO BE <span className="text-primary neon-glow-subtle">ANOTHER FITNESS APP.</span>
          </h2>
          <p className="text-muted-foreground text-[15px] leading-[1.85]">
            I built it because <strong className="text-foreground">I've been the person searching for something real</strong> — 
            and finding nothing but recycled programmes, generic advice, and platforms that treat you like a number.{' '}
            <em className="text-primary not-italic">Unbreakable exists because the fitness industry needed something honest.</em>{' '}
            Something that combines <strong className="text-foreground">real education, real tools, and a real community</strong> — 
            without the ego, the gatekeeping, or the nonsense.
          </p>
        </motion.div>
      </section>

      {/* Origin Story */}
      <section className="py-11 px-6 border-b border-border">
        <motion.div {...fadeUp} className="max-w-lg mx-auto">
          <p className="font-mono text-[9px] tracking-[3px] text-primary uppercase mb-2.5">Where It Started</p>
          <h2 className="font-display text-[clamp(30px,7vw,44px)] leading-none tracking-wide text-foreground mb-5">
            FROM <span className="text-primary neon-glow-subtle">PERSONAL BATTLE</span> TO PLATFORM
          </h2>
          <p className="text-muted-foreground text-[15px] leading-[1.85] mb-4">
            Like a lot of people, I came to fitness through frustration — <strong className="text-foreground">frustration with my body, my energy, and the feeling that I was falling behind.</strong>
          </p>
          <p className="text-muted-foreground text-[15px] leading-[1.85] mb-4">
            I tried the programmes. I followed the influencers. I bought the supplements. And some of it worked — for a while. But <strong className="text-foreground">none of it lasted</strong>, because none of it was built on understanding.
          </p>

          {/* Pull quote */}
          <div className="bg-card border-l-4 border-primary rounded-r-lg p-5 my-7 relative overflow-hidden">
            <span className="absolute top-[-10px] right-4 font-display text-[80px] text-primary/[0.08] leading-none">"</span>
            <p className="font-display text-[clamp(18px,5vw,26px)] tracking-wide leading-[1.2] text-primary relative z-10">
              THE MOMENT I STOPPED CHASING AESTHETICS AND STARTED CHASING ABILITY — EVERYTHING CHANGED.
            </p>
          </div>

          <p className="text-muted-foreground text-[15px] leading-[1.85]">
            I didn't just get stronger — I got <em className="text-primary not-italic">consistent</em>. I didn't just look better — I <em className="text-primary not-italic">felt better</em>. And I realised that the transformation everyone chases is actually a byproduct of something deeper: <strong className="text-foreground">building a body and mind that simply refuse to quit.</strong>
          </p>
        </motion.div>
      </section>

      {/* Three Pillars */}
      <section className="py-11 px-6 border-b border-border bg-card/30">
        <motion.div {...fadeUp} className="max-w-lg mx-auto">
          <p className="font-mono text-[9px] tracking-[3px] text-primary uppercase mb-2.5">The Foundation</p>
          <h2 className="font-display text-[clamp(30px,7vw,44px)] leading-none tracking-wide text-foreground mb-5">
            BUILT ON <span className="text-primary neon-glow-subtle">THREE PILLARS</span>
          </h2>
          <p className="text-muted-foreground text-[15px] leading-[1.85] mb-6">
            Unbreakable isn't random. Every feature, every piece of content, every tool is designed around <strong className="text-foreground">three non-negotiable pillars</strong>:
          </p>

          <div className="flex flex-col gap-3">
            {[
              { icon: <Dumbbell className="w-5 h-5 text-primary" />, name: 'ABILITY', desc: 'Train your body to perform — not just look good. Strength, speed, endurance, and movement that carries into real life.' },
              { icon: <Brain className="w-5 h-5 text-primary" />, name: 'MINDSET', desc: 'Build the mental resilience to keep going when motivation fades. Discipline, focus, and emotional strength.' },
              { icon: <Heart className="w-5 h-5 text-primary" />, name: 'LONGEVITY', desc: 'Train for the long game. Recovery, nutrition, joint health, and sustainable habits that last decades.' },
            ].map(p => (
              <Card key={p.name} className="bg-card border border-border p-5 flex gap-4 items-start">
                <div className="w-11 h-11 min-w-[44px] rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center shadow-[0_0_16px_hsl(var(--primary)/0.25)]">
                  {p.icon}
                </div>
                <div>
                  <h3 className="font-display text-xl tracking-[2px] text-primary mb-1">{p.name}</h3>
                  <p className="text-muted-foreground text-[13px] leading-relaxed">{p.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Core Beliefs */}
      <section className="py-11 px-6 border-b border-border">
        <motion.div {...fadeUp} className="max-w-lg mx-auto">
          <p className="font-mono text-[9px] tracking-[3px] text-primary uppercase mb-2.5">What I Believe</p>
          <h2 className="font-display text-[clamp(30px,7vw,44px)] leading-none tracking-wide text-foreground mb-5">
            THE <span className="text-primary neon-glow-subtle">NON-NEGOTIABLES</span>
          </h2>

          <div className="flex flex-col gap-2.5 mt-6">
            {beliefs.map((b, i) => (
              <Card key={i} className="bg-card border border-border rounded-lg p-[18px] flex gap-3.5 items-start">
                <span className="font-display text-[30px] leading-none text-primary/70 min-w-[30px]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="pt-0.5">
                  <strong className="text-foreground text-[15px] block mb-0.5">{b.title}</strong>
                  <span className="text-muted-foreground text-sm leading-relaxed">{b.desc}</span>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      </section>

      {/* What Showing Up Looks Like */}
      <section className="py-11 px-6 border-b border-border bg-card/30">
        <motion.div {...fadeUp} className="max-w-lg mx-auto">
          <p className="font-mono text-[9px] tracking-[3px] text-primary uppercase mb-2.5">Daily Practice</p>
          <h2 className="font-display text-[clamp(30px,7vw,44px)] leading-none tracking-wide text-foreground mb-5">
            WHAT <span className="text-primary neon-glow-subtle">SHOWING UP</span> LOOKS LIKE
          </h2>
          <p className="text-muted-foreground text-[15px] leading-[1.85] mb-5">
            Being Unbreakable isn't about grand gestures. It's about <strong className="text-foreground">daily choices</strong> that stack into something extraordinary.
          </p>
          <div className="flex flex-wrap gap-2">
            {chips.map(c => (
              <span key={c} className="border border-primary rounded-lg px-4 py-2.5 font-display text-sm tracking-[2px] text-primary bg-primary/10">
                {c}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Timeline */}
      <section className="py-11 px-6 border-b border-border">
        <motion.div {...fadeUp} className="max-w-lg mx-auto">
          <p className="font-mono text-[9px] tracking-[3px] text-primary uppercase mb-2.5">The Journey</p>
          <h2 className="font-display text-[clamp(30px,7vw,44px)] leading-none tracking-wide text-foreground mb-6">
            HOW WE <span className="text-primary neon-glow-subtle">GOT HERE</span>
          </h2>

          <div className="relative pl-5 mt-6">
            {/* Vertical line */}
            <div className="absolute left-[15px] top-5 bottom-0 w-0.5 bg-gradient-to-b from-primary to-transparent" />

            {timeline.map((t, i) => (
              <div key={i} className="relative pl-8 pb-7">
                {/* Dot */}
                <div className="absolute left-[-6px] top-1.5 w-3 h-3 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.25)]" />
                <p className="font-mono text-[8px] tracking-[2px] text-primary uppercase mb-1">{t.label}</p>
                <p className="text-foreground font-semibold text-sm mb-0.5">{t.title}</p>
                <p className="text-muted-foreground text-[13px] leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Orange Block */}
      <section className="py-11 px-6 border-b border-border">
        <motion.div {...fadeUp} className="max-w-lg mx-auto">
          <div className="bg-primary rounded-xl p-7">
            <p className="font-mono text-[8px] tracking-[3px] text-primary-foreground/50 uppercase mb-2.5">From The Founder</p>
            <p className="text-primary-foreground text-[15px] leading-[1.8] font-medium">
              <strong>Unbreakable isn't perfect. It's not supposed to be.</strong> It's built by real people, for real people — 
              and it will keep evolving as long as people keep showing up. That's the deal. You show up, we show up. 
              Every tool, every update, every feature exists because <strong>someone in this community needed it.</strong> 
              That's how we build. That's how we grow. That's how we stay Unbreakable.
            </p>
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="py-11 px-6 pb-16">
        <motion.div {...fadeUp} className="max-w-lg mx-auto">
          <Card className="bg-card border border-border rounded-xl p-9 text-center relative overflow-hidden">
            <div className="absolute bottom-[-60px] left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-[radial-gradient(circle,hsl(var(--primary)/0.08)_0%,transparent_65%)] pointer-events-none" />

            <p className="font-mono text-[9px] tracking-[3px] text-primary uppercase mb-3.5 relative z-10">
              Your Journey Starts Here
            </p>
            <h2 className="font-display text-[clamp(34px,9vw,52px)] tracking-[2px] leading-[0.95] text-foreground mb-2 relative z-10">
              BECOME<br />
              <span className="text-primary neon-glow-subtle">UNBREAKABLE</span>
            </h2>
            <p className="text-muted-foreground text-[13px] leading-relaxed max-w-[300px] mx-auto mb-7 relative z-10">
              Join a community that trains for ability, builds mental resilience, and plays the long game.
            </p>
            <Button
              size="lg"
              className="w-full font-display text-[13px] tracking-wider py-5 relative z-10"
              onClick={handleSignUp}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              START YOUR JOURNEY
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <p className="text-muted-foreground text-[11px] italic mt-3 relative z-10">
              7-day free trial · Cancel anytime
            </p>
          </Card>
        </motion.div>
      </section>

      <UnifiedFooter />

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} defaultMode={authDefaultMode} />
    </div>
  );
};

export default Founder;
