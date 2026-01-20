import { Link } from 'react-router-dom';
import logo from '@/assets/logo.webp';
import { Button } from '@/components/ui/button';
import { Dumbbell, Flame, Timer, Target, Heart, Zap, Activity } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img src={logo} alt="Live Without Limits" className="h-12 object-contain" />
              <span className="font-display text-xl tracking-wide text-foreground hidden sm:block">
                LIVE WITHOUT LIMITS
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <Link to="/tracker">
                <Button variant="outline" className="font-display tracking-wide">
                  <Activity className="w-4 h-4 mr-2" />
                  Run Tracker
                </Button>
              </Link>
              <Link to="/calculators">
                <Button variant="outline" className="font-display tracking-wide">
                  Calculators
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 text-center border-b border-border">
        <div className="container mx-auto px-4">
          <img
            src={logo}
            alt="Live Without Limits"
            className="h-40 md:h-56 object-contain mx-auto mb-8"
          />
          
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-foreground mb-2 tracking-wide">
            LIVE WITHOUT
          </h1>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-primary mb-8 tracking-wide">
            LIMITS
          </h1>
          
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg mb-4">
            Building strength that supports your life — not just your lifts.
            <br />
            Fueling results that last — not short-term diets.
          </p>
          
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            Put your training and nutrition into context. Train with purpose. Build a{' '}
            <span className="text-primary font-semibold">STRONG, MOBILE, RESILIENT</span>{' '}
            body that carries you confidently through every stage of life.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link to="/calculators?tab=strength">
              <Button size="lg" className="font-display text-lg tracking-wide px-8 py-6">
                <Dumbbell className="w-5 h-5 mr-2" />
                Calculate Your Strength
              </Button>
            </Link>
            <Link to="/calculators?tab=fuel">
              <Button size="lg" variant="outline" className="font-display text-lg tracking-wide px-8 py-6">
                <Flame className="w-5 h-5 mr-2" />
                Calculate Your Macros
              </Button>
            </Link>
          </div>
          
          <p className="text-primary font-display text-2xl md:text-3xl tracking-wide">
            #LIVEWITHOUTLIMITS
          </p>
        </div>
      </section>

      {/* Why Section */}
      <section className="py-16 md:py-24 border-b border-border">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-4xl md:text-5xl text-primary text-center mb-4 tracking-wide">
            WHY LIVE WITHOUT LIMITS?
          </h2>
          <p className="text-muted-foreground text-center mb-12 text-lg">
            We don't train for moments. We train for decades.
          </p>
          
          <div className="max-w-4xl mx-auto mb-16">
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <h3 className="font-display text-2xl md:text-3xl text-foreground mb-4 tracking-wide">
                YOUR BODY IS YOUR VEHICLE FOR LIFE
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Not a project to fix. Not a problem to solve. It's the vessel that carries your dreams, 
                your ambitions, and everyone who depends on you. When you build it with intention — 
                when you fuel it with purpose — you become unstoppable.
              </p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Dumbbell className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display text-2xl text-foreground mb-3 tracking-wide">STRENGTH</h3>
              <p className="text-muted-foreground">
                Not just muscle. The physical resilience to show up every day, carry your family, and never feel fragile.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Flame className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display text-2xl text-foreground mb-3 tracking-wide">FUEL</h3>
              <p className="text-muted-foreground">
                Not restriction. Strategic nutrition that powers performance, recovery, and mental clarity for the long haul.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Timer className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display text-2xl text-foreground mb-3 tracking-wide">SPEED</h3>
              <p className="text-muted-foreground">
                Not just fast. Endurance that carries you through every race, every challenge, every decade of life.
              </p>
            </div>
          </div>
          
          <div className="mt-16 max-w-3xl mx-auto">
            <blockquote className="text-center">
              <p className="text-xl md:text-2xl text-muted-foreground italic leading-relaxed">
                "We don't chase quick fixes. We build bodies and minds that don't break — at 30, at 50, at 70. That's the Live Without Limits way."
              </p>
            </blockquote>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-card border border-border rounded-lg p-6">
              <Target className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-display text-xl text-foreground mb-2 tracking-wide">Age-Adjusted Standards</h3>
              <p className="text-muted-foreground text-sm">
                Your standards adjust to your age, giving you realistic and motivating targets at every stage of life.
              </p>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-6">
              <Heart className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-display text-xl text-foreground mb-2 tracking-wide">Context-Aware Calculations</h3>
              <p className="text-muted-foreground text-sm">
                No more generic formulas. Get personalized results based on your body, your goals, and your lifestyle.
              </p>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-6">
              <Zap className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-display text-xl text-foreground mb-2 tracking-wide">Build Longevity</h3>
              <p className="text-muted-foreground text-sm">
                The goal isn't to peak for a moment. It's to build a body that performs, recovers, and thrives for decades.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4 tracking-wide">
            READY TO <span className="text-primary">TRANSFORM?</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            The goal isn't to "look good" for a moment. It's to build a body that supports every dream you have.
          </p>
          <Link to="/calculators">
            <Button size="lg" className="font-display text-lg tracking-wide px-10 py-6">
              Start Calculating
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center">
        <p className="text-muted-foreground text-sm">
          © 2024 Live Without Limits. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Index;
