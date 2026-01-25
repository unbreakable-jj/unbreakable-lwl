import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import logo from '@/assets/logo.png';
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
    tagline: 'YOUR BODY IS YOUR ARMOUR. BUILD IT TO LAST.',
    intro: "Strength isn't about lifting heavy once — it's about building a foundation that",
    emphasis: 'CARRIES YOU THROUGH LIFE',
    description: 'This calculator puts your lifts into context. Age-adjusted standards mean you\'re measured against what\'s',
    descEmphasis: 'REALISTIC AND ACHIEVABLE',
    descEnd: 'for you — regardless of age.',
    goal: 'Build a body that\'s',
    goalEmphasis: 'STRONG, MOBILE, AND RESILIENT',
    goalEnd: 'enough to protect everything you love. Keep showing up.',
    hashtag: '#UNBREAKABLESTRENGTH',
  },
  fuel: {
    title: 'FUEL',
    titleAccent: 'CALCULATOR',
    tagline: 'FOOD IS NOT THE ENEMY. IT\'S THE WEAPON.',
    intro: 'Forget restrictive diets and quick fixes. Your body needs',
    emphasis: 'STRATEGIC FUEL',
    description: 'This calculator gives you precise targets based on your body, your activity, and your goals — so you can stop guessing and start',
    descEmphasis: 'EATING WITH PURPOSE',
    descEnd: '.',
    goal: 'Fuel a body built to last — not just look good.',
    goalEmphasis: 'ENERGISED, POWERFUL, AND RESILIENT',
    goalEnd: 'for decades. Live without limits.',
    hashtag: '#UNBREAKABLEFUEL',
  },
  speed: {
    title: 'SPEED',
    titleAccent: 'CALCULATOR',
    tagline: 'EVERY FINISH LINE IS A NEW STARTING POINT.',
    intro: "This isn't about chasing personal bests for ego — it's about understanding where you stand and",
    emphasis: 'BUILDING SPEED THAT LASTS',
    description: 'Enter your race times and discover your true level. Age-adjusted ratings mean you\'re competing against the',
    descEmphasis: 'BEST VERSION OF YOU',
    descEnd: ' — not someone else\'s genetics.',
    goal: 'Every step forward is a step toward',
    goalEmphasis: 'UNBREAKABLE ENDURANCE',
    goalEnd: '. Keep showing up.',
    hashtag: '#UNBREAKABLESPEED',
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
    <div className="min-h-screen bg-background brick-texture">
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

      {/* Hero Section - Calculator Title */}
      <section className="pt-32 pb-12 text-center px-6">
        <div className="max-w-4xl mx-auto">
          <img
            src={logo}
            alt="Unbreakable - Live Without Limits"
            className="h-32 md:h-40 object-contain mx-auto mb-6"
          />
          <h1 className="font-display text-5xl md:text-7xl text-foreground tracking-wide leading-none">
            {hero.title}
          </h1>
          <h1 className="font-display text-5xl md:text-7xl text-primary tracking-wide leading-none mb-6">
            {hero.titleAccent}
          </h1>
          <p className="text-foreground text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed uppercase tracking-wide font-medium">
            {hero.tagline}
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
              {hero.intro}{' '}
              <span className="text-primary font-semibold">{hero.emphasis}</span>.
            </p>
            
            <p className="text-muted-foreground leading-relaxed mb-4">
              {hero.description}{' '}
              <span className="text-primary font-semibold">{hero.descEmphasis}</span>
              {hero.descEnd}
            </p>
            
            <p className="text-muted-foreground leading-relaxed">
              {hero.goal}{' '}
              <span className="text-primary font-semibold">{hero.goalEmphasis}</span>{' '}
              {hero.goalEnd}
            </p>
            
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
          © 2024 Unbreakable - Live Without Limits. All rights reserved.
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
