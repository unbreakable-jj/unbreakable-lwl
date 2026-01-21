import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import logo from '@/assets/logo.webp';
import { Button } from '@/components/ui/button';
import { NavigationDrawer } from '@/components/NavigationDrawer';
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
    hashtag: '#UNBREAKABLE',
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
    hashtag: '#FUELYOURRESULTS',
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
    hashtag: '#RUNFORLIFE',
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
    { key: 'strength', label: 'STRENGTH', icon: <Dumbbell className="w-5 h-5" /> },
    { key: 'fuel', label: 'FUEL', icon: <Flame className="w-5 h-5" /> },
    { key: 'speed', label: 'SPEED', icon: <Timer className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img src={logo} alt="Live Without Limits" className="h-10 object-contain" />
              <span className="font-display text-lg tracking-wide text-foreground hidden sm:block">
                LIVE WITHOUT LIMITS
              </span>
            </Link>
            <NavigationDrawer />
          </div>
        </div>
      </header>

      {/* Hero Section - Calculator Title */}
      <section className="pt-32 pb-12 text-center px-6">
        <div className="max-w-4xl mx-auto">
          <img
            src={logo}
            alt="Live Without Limits"
            className="h-32 md:h-40 object-contain mx-auto mb-6"
          />
          <h1 className="font-display text-5xl md:text-7xl text-foreground tracking-wide leading-none">
            {hero.title}
          </h1>
          <h1 className="font-display text-5xl md:text-7xl text-primary tracking-wide leading-none mb-6">
            {hero.titleAccent}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed uppercase tracking-wide">
            {hero.intro}
          </p>
        </div>
      </section>

      {/* Tab Navigation - Centered Pills */}
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-center">
          <div className="inline-flex bg-card border border-border rounded-lg p-1.5 gap-1">
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
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Description Card */}
          <div className="bg-card border border-border rounded-lg p-8 md:p-10 mb-10 text-center max-w-4xl mx-auto">
            <p className="text-muted-foreground leading-relaxed mb-4">
              {hero.description}{' '}
              <span className="text-primary font-semibold">{hero.emphasis}</span>{' '}
              {hero.emphasisContinue}
            </p>
            
            <p className="text-muted-foreground leading-relaxed mb-1">
              {hero.goal}
            </p>
            
            <p className="text-muted-foreground leading-relaxed">
              {hero.goalResult}{' '}
              <span className="text-primary font-semibold">{hero.goalEmphasis}</span>{' '}
              {hero.goalEnd}
            </p>
            
            {'extra' in hero && hero.extra && (
              <p className="text-muted-foreground leading-relaxed mt-4">
                {hero.extra}
              </p>
            )}
            
            <p className="text-primary font-display text-2xl tracking-wide mt-6">
              {hero.hashtag}
            </p>
          </div>

          {/* Calculator Grid */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Form */}
            <div className="bg-card border border-border rounded-lg p-8">
              <h3 className="font-display text-2xl text-foreground mb-8 tracking-wide text-center">
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
                  <EmptyState emoji="🏋️" title="READY TO CALCULATE" description="Enter your lift details to see your estimated 1RM and strength level." />
                )
              )}
              
              {activeTab === 'fuel' && (
                fuelResult ? (
                  <FuelResults result={fuelResult} />
                ) : (
                  <EmptyState emoji="🔥" title="READY TO TRANSFORM?" description="Enter your details to get your personalized calorie and macro targets." />
                )
              )}
              
              {activeTab === 'speed' && (
                speedResult ? (
                  <SpeedResults result={speedResult} />
                ) : (
                  <EmptyState emoji="🏃" title="READY TO ANALYZE" description="Enter your race time to see your speed stats and performance level." />
                )
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-10 mt-16 text-center">
        <p className="text-muted-foreground text-sm">
          © 2024 Live Without Limits. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

function EmptyState({ emoji, title, description }: { emoji: string; title: string; description: string }) {
  return (
    <div className="bg-card border border-border rounded-lg p-10 h-full flex items-center justify-center min-h-[450px]">
      <div className="text-center">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <span className="text-5xl">{emoji}</span>
        </div>
        <h3 className="font-display text-2xl text-foreground mb-3 tracking-wide">
          {title}
        </h3>
        <p className="text-muted-foreground max-w-sm mx-auto">
          {description}
        </p>
      </div>
    </div>
  );
}

export default Calculators;
