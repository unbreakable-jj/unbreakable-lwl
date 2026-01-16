import { useState } from 'react';
import { StrengthForm } from '@/components/StrengthForm';
import { StrengthResults } from '@/components/StrengthResults';
import { calculateOneRepMax, calculateStrengthLevel } from '@/lib/strengthCalculations';
import type { Gender, Exercise, StrengthResult } from '@/lib/strengthCalculations';
import logo from '@/assets/logo.jpg';

const Index = () => {
  const [result, setResult] = useState<{
    data: StrengthResult;
    exercise: Exercise;
    unit: 'kg' | 'lb';
  } | null>(null);

  const handleCalculate = (data: {
    gender: Gender;
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
      data.gender
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
        <div className="container mx-auto px-4 py-4 flex justify-center">
          <img
            src={logo}
            alt="Live Without Limits"
            className="h-16 object-contain"
          />
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 text-center border-b border-border">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4">
            Strength <span className="text-primary">Calculator</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Calculate your one-rep max and discover your strength level. 
            Compare yourself to lifters worldwide.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Calculator Form */}
          <div className="bg-card border border-border rounded-lg p-6 md:p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Enter Your Lift
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
                  <h3 className="text-xl font-semibold text-foreground mb-2">
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
