import { Link } from 'react-router-dom';
import logo from '@/assets/logo.png';
import { Button } from '@/components/ui/button';
import { NavigationDrawer } from '@/components/NavigationDrawer';
import { Dumbbell, Flame, Timer, Target, Heart, Zap, Brain } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Minimal Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img src={logo} alt="Unbreakable - Live Without Limits" className="h-10 object-contain" />
              <span className="font-display text-lg tracking-wide text-foreground hidden sm:block">
                UNBREAKABLE
              </span>
            </Link>
            <NavigationDrawer />
          </div>
        </div>
      </header>

      {/* Hero Section - Centered, Large, Dramatic */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20">
        <div className="max-w-4xl mx-auto">
          {/* Large centered logo */}
          <img
            src={logo}
            alt="Unbreakable - Live Without Limits"
            className="h-48 md:h-64 lg:h-72 object-contain mx-auto mb-8"
          />
          
          {/* Dramatic title */}
          <h1 className="font-display text-6xl md:text-8xl lg:text-9xl text-foreground tracking-wide leading-none">
            BECOME
          </h1>
          <h1 className="font-display text-6xl md:text-8xl lg:text-9xl text-primary tracking-wide leading-none mb-10">
            UNBREAKABLE
          </h1>
          
          {/* Subtitle copy */}
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-4 uppercase tracking-wide">
            Live Without Limits. Build a body to last — not just look good.
          </p>
          
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
            Strength. Fuel. Speed. Mindset. Train with purpose, regardless of age.{' '}
            <span className="text-primary font-semibold">BUILD A BODY AND MIND THAT DON'T BREAK.</span>
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Link to="/calculators?tab=strength">
              <Button size="lg" className="font-display text-lg tracking-wide px-8 py-6 w-full sm:w-auto">
                <Dumbbell className="w-5 h-5 mr-2" />
                CALCULATE YOUR STRENGTH
              </Button>
            </Link>
            <Link to="/calculators?tab=fuel">
              <Button size="lg" variant="outline" className="font-display text-lg tracking-wide px-8 py-6 w-full sm:w-auto">
                <Flame className="w-5 h-5 mr-2" />
                CALCULATE YOUR FUEL
              </Button>
            </Link>
            <Link to="/calculators?tab=speed">
              <Button size="lg" variant="outline" className="font-display text-lg tracking-wide px-8 py-6 w-full sm:w-auto">
                <Timer className="w-5 h-5 mr-2" />
                CALCULATE YOUR SPEED
              </Button>
            </Link>
          </div>
          
          {/* Tagline */}
          <p className="text-primary font-display text-2xl md:text-3xl tracking-wide">
            KEEP SHOWING UP
          </p>
        </div>
      </section>

      {/* Why Section */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-6">
          <h2 className="font-display text-4xl md:text-5xl text-primary text-center mb-4 tracking-wide">
            WHY BECOME UNBREAKABLE?
          </h2>
          <p className="text-muted-foreground text-center mb-16 text-lg uppercase tracking-wide">
            We don't train for moments. We train for decades. Keep showing up.
          </p>
          
          {/* Central philosophy card */}
          <div className="max-w-4xl mx-auto mb-20">
            <div className="bg-card border border-border rounded-lg p-10 text-center">
              <p className="text-muted-foreground uppercase tracking-wide text-sm mb-4">
                The Unbreakable method is built on one truth:
              </p>
              <h3 className="font-display text-3xl md:text-4xl text-foreground mb-6 tracking-wide">
                LIVE WITHOUT LIMITS
              </h3>
              <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Not a project to fix. Not a problem to solve. Your body is the vessel that carries your dreams, 
                your ambitions, and everyone who depends on you. When you build it with intention — 
                when you fuel it with purpose — you become unstoppable. Regardless of age.
              </p>
            </div>
          </div>
          
          {/* Four pillars */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Dumbbell className="w-10 h-10 text-primary" />
              </div>
              <h3 className="font-display text-2xl text-foreground mb-4 tracking-wide">STRENGTH</h3>
              <p className="text-muted-foreground leading-relaxed">
                Your body is your armour. Build it to last. Strength isn't about lifting heavy once — it's about a foundation that carries you through life.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Flame className="w-10 h-10 text-primary" />
              </div>
              <h3 className="font-display text-2xl text-foreground mb-4 tracking-wide">FUEL</h3>
              <p className="text-muted-foreground leading-relaxed">
                Food is not the enemy. It's the weapon. Strategic fuel to perform, recover, and dominate for decades — not days.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Timer className="w-10 h-10 text-primary" />
              </div>
              <h3 className="font-display text-2xl text-foreground mb-4 tracking-wide">SPEED</h3>
              <p className="text-muted-foreground leading-relaxed">
                Every finish line is a new starting point. Build speed that lasts — unbreakable endurance for every race, every decade.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Brain className="w-10 h-10 text-primary" />
              </div>
              <h3 className="font-display text-2xl text-foreground mb-4 tracking-wide">MINDSET</h3>
              <p className="text-muted-foreground leading-relaxed">
                The body follows the mind. Cultivate unbreakable discipline, resilience, and the mental fortitude to keep showing up — every single day.
              </p>
            </div>
          </div>
          
          {/* Quote */}
          <div className="mt-20 max-w-3xl mx-auto">
            <blockquote className="text-center">
              <p className="text-xl md:text-2xl text-muted-foreground italic leading-relaxed">
                "We don't chase quick fixes. We build bodies and minds that don't break — at 30, at 50, at 70. That's the Unbreakable way."
              </p>
            </blockquote>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 md:py-32 bg-card/50">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-card border border-border rounded-lg p-8">
              <Target className="w-12 h-12 text-primary mb-6" />
              <h3 className="font-display text-xl text-foreground mb-3 tracking-wide">AGE-ADJUSTED STANDARDS</h3>
              <p className="text-muted-foreground">
                Your standards adjust to your age, giving you realistic and motivating targets at every stage of life.
              </p>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-8">
              <Heart className="w-12 h-12 text-primary mb-6" />
              <h3 className="font-display text-xl text-foreground mb-3 tracking-wide">CONTEXT-AWARE CALCULATIONS</h3>
              <p className="text-muted-foreground">
                No more generic formulas. Get personalized results based on your body, your goals, and your lifestyle.
              </p>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-8">
              <Zap className="w-12 h-12 text-primary mb-6" />
              <h3 className="font-display text-xl text-foreground mb-3 tracking-wide">BUILD LONGEVITY</h3>
              <p className="text-muted-foreground">
                The goal isn't to peak for a moment. It's to build a body that performs, recovers, and thrives for decades.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-display text-5xl md:text-6xl text-foreground mb-4 tracking-wide">
            READY TO <span className="text-primary">LIVE WITHOUT LIMITS?</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-10 text-lg">
            The goal isn't to "look good" for a moment. It's to build a body and mind that support every dream you have — regardless of age. Keep showing up.
          </p>
          <Link to="/calculators">
            <Button size="lg" className="font-display text-xl tracking-wide px-12 py-7">
              START CALCULATING
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 text-center">
        <p className="text-muted-foreground text-sm">
          © 2024 Unbreakable - Live Without Limits. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Index;
