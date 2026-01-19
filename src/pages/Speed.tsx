import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SpeedForm } from '@/components/SpeedForm';
import { SpeedResults } from '@/components/SpeedResults';
import { calculateSpeedLevel, timeToSeconds } from '@/lib/speedCalculations';
import type { Gender, Distance, SpeedResult } from '@/lib/speedCalculations';

const Speed = () => {
  const [result, setResult] = useState<SpeedResult | null>(null);

  const handleCalculate = (data: {
    gender: Gender;
    age: number;
    distance: Distance;
    hours: number;
    minutes: number;
    seconds: number;
  }) => {
    const totalSeconds = timeToSeconds(data.hours, data.minutes, data.seconds);
    const speedResult = calculateSpeedLevel(
      totalSeconds,
      data.distance,
      data.gender,
      data.age
    );
    
    setResult(speedResult);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="py-12 text-center border-b border-border">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-5xl md:text-7xl text-foreground mb-4 tracking-wide">
            SPEED <span className="text-primary">CALCULATOR</span>
          </h1>
          <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed text-lg">
            Running performance that builds for life — not just race day.
          </p>
          <p className="text-muted-foreground max-w-3xl mx-auto mt-4 leading-relaxed">
            This calculator puts your race times into context, accounting for age so you can train with <span className="text-primary font-semibold">REAL</span> purpose.
          </p>
          <p className="text-muted-foreground max-w-3xl mx-auto mt-4 leading-relaxed">
            The goal isn't to chase PRs for a moment
          </p>
          <p className="text-muted-foreground max-w-3xl mx-auto mt-2 leading-relaxed">
            It's to build a <span className="text-primary font-semibold">FAST, RESILIENT, ENDURING</span> body that carries you confidently through every stage of life.
          </p>
          <p className="text-muted-foreground max-w-3xl mx-auto mt-4 leading-relaxed">
            Run to build. Run to recover. Run to live.
          </p>
          <p className="text-primary font-display text-2xl md:text-3xl mt-6 tracking-wide">
            #RunForLife
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 flex-1">
        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Calculator Form */}
          <div className="bg-card border border-border rounded-lg p-6 md:p-8">
            <h2 className="font-display text-3xl text-foreground mb-2 tracking-wide">
              ENTER YOUR RACE
            </h2>
            <p className="text-muted-foreground mb-6 text-sm">
              Enter your race distance and finish time to see how you compare
            </p>
            <SpeedForm onCalculate={handleCalculate} />
          </div>

          {/* Results */}
          <div>
            {result ? (
              <SpeedResults result={result} />
            ) : (
              <div className="bg-card border border-border rounded-lg p-8 h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">🏃</span>
                  </div>
                  <h3 className="font-display text-2xl text-foreground mb-2 tracking-wide">
                    Ready to Analyze
                  </h3>
                  <p className="text-muted-foreground">
                    Enter your race time to see your speed stats and performance level.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Speed;
