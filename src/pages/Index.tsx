import { useState } from 'react';
import { StrengthForm } from '@/components/StrengthForm';
import { StrengthResults } from '@/components/StrengthResults';
import { calculateOneRepMax, calculateStrengthLevel } from '@/lib/strengthCalculations';
import type { Gender, Exercise, StrengthResult, AgeGroup } from '@/lib/strengthCalculations';
import logo from '@/assets/logo.webp';

const Index = () => {
  const [result, setResult] = useState<{
    data: StrengthResult;
    exercise: Exercise;
    unit: 'kg' | 'lb';
  } | null>(null);

  const handleCalculate = (data: {
    gender: Gender;
    age: number;
    bodyweight: number;
    exercise: Exercise;
    weight: number;
    reps: number;
    unit: 'kg' | 'lb';
  }) => {
    const oneRepMax = calculateOneRepMax(data.weight, data.reps);
    const strengthResult = calculateStrengthLevel(
      oneRepMax,
      data.bodyweight,
      data.exercise,
      data.gender,
      data.age
    );
    
    setResult({
      data: strengthResult,
      exercise: data.exercise,
      unit: data.unit,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6 flex justify-center">
          <img
            src={logo}
            alt="Live Without Limits"
            className="h-24 md:h-28 object-contain"
          />
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 text-center border-b border-border">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-5xl md:text-7xl text-foreground mb-4 tracking-wide">
            Strength <span className="text-primary">Calculator</span>
          </h1>
          <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed text-lg">
            Building strength that supports your life — not just your lifts.
          </p>
          <p className="text-muted-foreground max-w-3xl mx-auto mt-4 leading-relaxed">
            This calculator puts your lifting performance into context, accounting for age so you can train with <span className="text-primary font-semibold">REAL</span> purpose.
          </p>
          <p className="text-muted-foreground max-w-3xl mx-auto mt-4 leading-relaxed">
            The goal isn't to "look good" for a moment
          </p>
          <p className="text-muted-foreground max-w-3xl mx-auto mt-2 leading-relaxed">
            It's to build a <span className="text-primary font-semibold">STRONG, MOBILE,</span> body that carries you confidently through every stage of life.
          </p>
          <p className="text-primary font-display text-2xl md:text-3xl mt-6 tracking-wide">
            #Unbreakable
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Calculator Form */}
          <div className="bg-card border border-border rounded-lg p-6 md:p-8">
            <h2 className="font-display text-3xl text-foreground mb-6 tracking-wide">
              ENTER YOUR LIFT
            </h2>
            <StrengthForm onCalculate={handleCalculate} />
          </div>

          {/* Results */}
          <div>
            {result ? (
              <StrengthResults
                result={result.data}
                exercise={result.exercise}
                unit={result.unit}
              />
            ) : (
              <div className="bg-card border border-border rounded-lg p-8 h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">🏋️</span>
                  </div>
                  <h3 className="font-display text-2xl text-foreground mb-2 tracking-wide">
                    Ready to Calculate
                  </h3>
                  <p className="text-muted-foreground">
                    Enter your lift details to see your estimated 1RM and strength level.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-muted-foreground text-sm">
        <p>© 2024 Live Without Limits. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
