import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { FuelForm } from '@/components/FuelForm';
import { FuelResults } from '@/components/FuelResults';
import { calculateFuel } from '@/lib/fuelCalculations';
import type { Gender, ActivityLevel, Goal, MacroSplit, Unit, FuelResult } from '@/lib/fuelCalculations';

const Fuel = () => {
  const [result, setResult] = useState<FuelResult | null>(null);

  const handleCalculate = (data: {
    gender: Gender;
    age: number;
    heightFt: number;
    heightIn: number;
    weight: number;
    activityLevel: ActivityLevel;
    goal: Goal;
    macroSplit: MacroSplit;
    unit: Unit;
  }) => {
    const fuelResult = calculateFuel(
      data.gender,
      data.age,
      data.heightFt,
      data.heightIn,
      data.weight,
      data.activityLevel,
      data.goal,
      data.macroSplit,
      data.unit
    );
    
    setResult(fuelResult);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="py-12 text-center border-b border-border">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-5xl md:text-7xl text-foreground mb-4 tracking-wide">
            FUEL YOUR <span className="text-primary">RESULTS</span>
          </h1>
          <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed text-lg">
            Fueling results that support your life — not short-term diets.
          </p>
          <p className="text-muted-foreground max-w-3xl mx-auto mt-4 leading-relaxed">
            This calorie calculator puts your nutrition into context, accounting for your body, your goals, and your lifestyle so you can fuel with <span className="text-primary font-semibold">REAL</span> intent.
          </p>
          <p className="text-muted-foreground max-w-3xl mx-auto mt-4 leading-relaxed">
            The goal isn't to eat less for a moment
          </p>
          <p className="text-muted-foreground max-w-3xl mx-auto mt-2 leading-relaxed">
            It's to build a <span className="text-primary font-semibold">STRONG, ENERGIZED, RESILIENT</span> body that performs, recovers, and thrives through every stage of life.
          </p>
          <p className="text-muted-foreground max-w-3xl mx-auto mt-4 leading-relaxed">
            Fuel to train. Fuel to recover. Fuel to live.
          </p>
          <p className="text-primary font-display text-2xl md:text-3xl mt-6 tracking-wide">
            #FuelYourResults
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 flex-1">
        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Calculator Form */}
          <div className="bg-card border border-border rounded-lg p-6 md:p-8">
            <h2 className="font-display text-3xl text-foreground mb-2 tracking-wide">
              ENTER YOUR DETAILS
            </h2>
            <p className="text-muted-foreground mb-6 text-sm">
              Fill in your information to get your personalized nutrition targets
            </p>
            <FuelForm onCalculate={handleCalculate} />
          </div>

          {/* Results */}
          <div>
            {result ? (
              <FuelResults result={result} />
            ) : (
              <div className="bg-card border border-border rounded-lg p-8 h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">🔥</span>
                  </div>
                  <h3 className="font-display text-2xl text-foreground mb-2 tracking-wide">
                    Ready to Transform?
                  </h3>
                  <p className="text-muted-foreground">
                    Enter your details on the left to get your personalized calorie and macro targets
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

export default Fuel;
