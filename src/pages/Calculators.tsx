import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import logo from '@/assets/logo.webp';
import { Button } from '@/components/ui/button';
import { Dumbbell, Flame, Timer } from 'lucide-react';

import { StrengthForm } from '@/components/StrengthForm';
import { StrengthResults } from '@/components/StrengthResults';
import { calculateOneRepMax, calculateStrengthLevel } from '@/lib/strengthCalculations';
import type { Gender as StrengthGender, Exercise, StrengthResult } from '@/lib/strengthCalculations';

import { FuelForm } from '@/components/FuelForm';
import { FuelResults } from '@/components/FuelResults';
import { calculateFuel } from '@/lib/fuelCalculations';
import type { Gender as FuelGender, ActivityLevel, Goal, MacroSplit, Unit, FuelResult } from '@/lib/fuelCalculations';

import { SpeedForm } from '@/components/SpeedForm';
import { SpeedResults } from '@/components/SpeedResults';
import { calculateSpeedLevel, timeToSeconds } from '@/lib/speedCalculations';
import type { Gender as SpeedGender, Distance, SpeedResult } from '@/lib/speedCalculations';

type Tab = 'strength' | 'fuel' | 'speed';

const heroContent = {
  strength: {
    title: 'STRENGTH',
    titleAccent: 'CALCULATOR',
    intro: 'Building strength that supports your life — not just your lifts.',
    description: 'This calculator puts your lifting performance into context, accounting for age so you can train with',
    emphasis: 'REAL',
    emphasisContinue: 'purpose.',
    goal: "The goal isn't to \"look good\" for a moment",
    goalResult: "It's to build a",
    goalEmphasis: 'STRONG, MOBILE',
    goalEnd: 'body that carries you confidently through every stage of life.',
    hashtag: '#Unbreakable',
  },
  fuel: {
    title: 'FUEL YOUR',
    titleAccent: 'RESULTS',
    intro: 'Fueling results that support your life — not short-term diets.',
    description: 'This calorie calculator puts your nutrition into context, accounting for your body, your goals, and your lifestyle so you can fuel with',
    emphasis: 'REAL',
    emphasisContinue: 'intent.',
    goal: "The goal isn't to eat less for a moment",
    goalResult: "It's to build a",
    goalEmphasis: 'STRONG, ENERGIZED, RESILIENT',
    goalEnd: 'body that performs, recovers, and thrives through every stage of life.',
    extra: 'Fuel to train. Fuel to recover. Fuel to live.',
    hashtag: '#FuelYourResults',
  },
  speed: {
    title: 'SPEED',
    titleAccent: 'CALCULATOR',
    intro: 'Running performance that builds for life — not just race day.',
    description: 'This calculator puts your race times into context, accounting for age so you can train with',
    emphasis: 'REAL',
    emphasisContinue: 'purpose.',
    goal: "The goal isn't to chase PRs for a moment",
    goalResult: "It's to build a",
    goalEmphasis: 'FAST, RESILIENT, ENDURING',
    goalEnd: 'body that carries you confidently through every stage of life.',
    extra: 'Run to build. Run to recover. Run to live.',
    hashtag: '#RunForLife',
  },
};

const Calculators = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as Tab | null;
  const [activeTab, setActiveTab] = useState<Tab>(tabParam || 'strength');

  // Strength state
  const [strengthResult, setStrengthResult] = useState<{
    data: StrengthResult;
    exercise: Exercise;
    unit: 'kg' | 'lb';
  } | null>(null);

  // Fuel state
  const [fuelResult, setFuelResult] = useState<FuelResult | null>(null);

  // Speed state
  const [speedResult, setSpeedResult] = useState<SpeedResult | null>(null);

  useEffect(() => {
    if (tabParam && ['strength', 'fuel', 'speed'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleStrengthCalculate = (data: {
    gender: StrengthGender;
    age: number;
    bodyweight: number;
    exercise: Exercise;
    weight: number;
    reps: number;
    unit: 'kg' | 'lb';
  }) => {
    const oneRepMax = calculateOneRepMax(data.weight, data.reps);
    const result = calculateStrengthLevel(
      oneRepMax,
      data.bodyweight,
      data.exercise,
      data.gender,
      data.age
    );
    setStrengthResult({ data: result, exercise: data.exercise, unit: data.unit });
  };

  const handleFuelCalculate = (data: {
    gender: FuelGender;
    age: number;
    heightFt: number;
    heightIn: number;
    weight: number;
    activityLevel: ActivityLevel;
    goal: Goal;
    macroSplit: MacroSplit;
    unit: Unit;
  }) => {
    const result = calculateFuel(
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
    setFuelResult(result);
  };

  const handleSpeedCalculate = (data: {
    gender: SpeedGender;
    age: number;
    distance: Distance;
    hours: number;
    minutes: number;
    seconds: number;
  }) => {
    const totalSeconds = timeToSeconds(data.hours, data.minutes, data.seconds);
    const result = calculateSpeedLevel(totalSeconds, data.distance, data.gender, data.age);
    setSpeedResult(result);
  };

  const hero = heroContent[activeTab];

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'strength', label: 'Strength', icon: <Dumbbell className="w-4 h-4" /> },
    { key: 'fuel', label: 'Fuel', icon: <Flame className="w-4 h-4" /> },
    { key: 'speed', label: 'Speed', icon: <Timer className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img src={logo} alt="Live Without Limits" className="h-10 object-contain" />
              <span className="font-display text-lg tracking-wide text-foreground hidden sm:block">
                LIVE WITHOUT LIMITS
              </span>
            </Link>
            <span className="font-display text-muted-foreground tracking-wide">
              Calculators
            </span>
          </div>
        </div>
      </header>

      {/* Page Title */}
      <section className="py-8 text-center border-b border-border">
        <h1 className="font-display text-4xl md:text-5xl text-primary tracking-wide mb-2">
          CALCULATORS
        </h1>
        <p className="text-muted-foreground">
          Choose your calculator below to get started
        </p>
      </section>

      {/* Tab Navigation */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center">
          <div className="inline-flex bg-card border border-border rounded-lg p-1 gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`flex items-center gap-2 px-6 py-3 rounded-md font-display tracking-wide transition-all ${
                  activeTab === tab.key
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Hero Content */}
          <div className="bg-card border border-border rounded-lg p-6 md:p-8 mb-8">
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4 tracking-wide">
              {hero.title} <span className="text-primary">{hero.titleAccent}</span>
            </h2>
            
            <p className="text-muted-foreground leading-relaxed mb-3">
              {hero.intro}
            </p>
            
            <p className="text-muted-foreground leading-relaxed mb-3">
              {hero.description}{' '}
              <span className="text-primary font-semibold">{hero.emphasis}</span>{' '}
              {hero.emphasisContinue}
            </p>
            
            <p className="text-muted-foreground leading-relaxed mb-1">
              {hero.goal}
            </p>
            
            <p className="text-muted-foreground leading-relaxed mb-3">
              {hero.goalResult}{' '}
              <span className="text-primary font-semibold">{hero.goalEmphasis}</span>{' '}
              {hero.goalEnd}
            </p>
            
            {'extra' in hero && hero.extra && (
              <p className="text-muted-foreground leading-relaxed mb-3">
                {hero.extra}
              </p>
            )}
            
            <p className="text-primary font-display text-xl tracking-wide mt-4">
              {hero.hashtag}
            </p>
          </div>

          {/* Calculator Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Form */}
            <div className="bg-card border border-border rounded-lg p-6 md:p-8">
              <h3 className="font-display text-2xl text-foreground mb-6 tracking-wide">
                {activeTab === 'strength' && 'ENTER YOUR LIFT'}
                {activeTab === 'fuel' && 'ENTER YOUR DETAILS'}
                {activeTab === 'speed' && 'ENTER YOUR RACE'}
              </h3>
              
              {activeTab === 'strength' && <StrengthForm onCalculate={handleStrengthCalculate} />}
              {activeTab === 'fuel' && <FuelForm onCalculate={handleFuelCalculate} />}
              {activeTab === 'speed' && <SpeedForm onCalculate={handleSpeedCalculate} />}
            </div>

            {/* Results */}
            <div>
              {activeTab === 'strength' && (
                strengthResult ? (
                  <StrengthResults
                    result={strengthResult.data}
                    exercise={strengthResult.exercise}
                    unit={strengthResult.unit}
                  />
                ) : (
                  <EmptyState emoji="🏋️" title="Ready to Calculate" description="Enter your lift details to see your estimated 1RM and strength level." />
                )
              )}
              
              {activeTab === 'fuel' && (
                fuelResult ? (
                  <FuelResults result={fuelResult} />
                ) : (
                  <EmptyState emoji="🔥" title="Ready to Transform?" description="Enter your details to get your personalized calorie and macro targets." />
                )
              )}
              
              {activeTab === 'speed' && (
                speedResult ? (
                  <SpeedResults result={speedResult} />
                ) : (
                  <EmptyState emoji="🏃" title="Ready to Analyze" description="Enter your race time to see your speed stats and performance level." />
                )
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-12 text-center">
        <p className="text-muted-foreground text-sm">
          © 2024 Live Without Limits. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

function EmptyState({ emoji, title, description }: { emoji: string; title: string; description: string }) {
  return (
    <div className="bg-card border border-border rounded-lg p-8 h-full flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">{emoji}</span>
        </div>
        <h3 className="font-display text-2xl text-foreground mb-2 tracking-wide">
          {title}
        </h3>
        <p className="text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

export default Calculators;
