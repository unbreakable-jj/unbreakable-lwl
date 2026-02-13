import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ArrowRight, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface U86SetupProps {
  onComplete: (config: {
    fitness_level: string;
    equipment: string[];
    injuries: string;
    training_environment: string;
    running_ability: string;
    goal_emphasis: string | null;
  }) => void;
}

const FITNESS_LEVELS = [
  { value: 'beginner', label: 'BEGINNER', desc: 'New to structured training or returning after a long break' },
  { value: 'intermediate', label: 'INTERMEDIATE', desc: '1-3 years consistent training experience' },
  { value: 'advanced', label: 'ADVANCED', desc: '3+ years, confident with complex movements' },
];

const EQUIPMENT_OPTIONS = [
  { value: 'bodyweight', label: 'Bodyweight' },
  { value: 'dumbbells', label: 'Dumbbells' },
  { value: 'barbells', label: 'Barbells' },
  { value: 'bands', label: 'Resistance Bands' },
  { value: 'machines', label: 'Machines / Cables' },
];

const ENVIRONMENTS = [
  { value: 'gym', label: 'GYM', desc: 'Full gym access' },
  { value: 'home', label: 'HOME', desc: 'Home setup' },
  { value: 'outdoor', label: 'OUTDOOR', desc: 'Parks & outdoor spaces' },
];

const RUNNING_LEVELS = [
  { value: 'continuous', label: 'Can Run Continuously', desc: 'Comfortable running without walk breaks' },
  { value: 'run_walk', label: 'Run-Walk', desc: 'Need walk intervals during runs' },
  { value: 'walk_only', label: 'Walk Only', desc: 'Currently unable to run, will walk distances' },
];

const GOALS = [
  { value: 'fat_loss', label: 'Fat Loss' },
  { value: 'general_fitness', label: 'General Fitness' },
  { value: 'mental_discipline', label: 'Mental Discipline' },
  { value: 'strength_maintenance', label: 'Strength Maintenance' },
  { value: 'endurance_improvement', label: 'Endurance Improvement' },
];

export function U86Setup({ onComplete }: U86SetupProps) {
  const [step, setStep] = useState(1);
  const [fitnessLevel, setFitnessLevel] = useState('');
  const [equipment, setEquipment] = useState<string[]>(['bodyweight']);
  const [injuries, setInjuries] = useState('');
  const [environment, setEnvironment] = useState('');
  const [runningAbility, setRunningAbility] = useState('');
  const [goalEmphasis, setGoalEmphasis] = useState<string | null>(null);

  const totalSteps = 4;

  const canProceed = () => {
    switch (step) {
      case 1: return fitnessLevel !== '';
      case 2: return equipment.length > 0 && environment !== '';
      case 3: return runningAbility !== '';
      case 4: return true;
      default: return false;
    }
  };

  const handleEquipToggle = (val: string) => {
    setEquipment(prev =>
      prev.includes(val) ? prev.filter(e => e !== val) : [...prev, val]
    );
  };

  const handleSubmit = () => {
    onComplete({
      fitness_level: fitnessLevel,
      equipment,
      injuries,
      training_environment: environment,
      running_ability: runningAbility,
      goal_emphasis: goalEmphasis,
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Progress */}
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Step {step} of {totalSteps}</span>
          <span className="text-primary font-display tracking-wider">
            {step === 1 && 'FITNESS LEVEL'}
            {step === 2 && 'EQUIPMENT & ENVIRONMENT'}
            {step === 3 && 'RUNNING ABILITY'}
            {step === 4 && 'GOAL EMPHASIS'}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            animate={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-4"
        >
          {/* Step 1: Fitness Level */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-display text-xl text-foreground tracking-wider">SELECT YOUR <span className="text-primary">LEVEL</span></h3>
              {FITNESS_LEVELS.map(l => (
                <Card
                  key={l.value}
                  onClick={() => setFitnessLevel(l.value)}
                  className={cn(
                    'p-5 cursor-pointer border-2 transition-all',
                    fitnessLevel === l.value
                      ? 'border-primary bg-primary/10 neon-border-subtle'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <p className="font-display text-lg tracking-wider text-foreground">{l.label}</p>
                  <p className="text-sm text-muted-foreground mt-1">{l.desc}</p>
                </Card>
              ))}
            </div>
          )}

          {/* Step 2: Equipment & Environment */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="font-display text-xl text-foreground tracking-wider">AVAILABLE <span className="text-primary">EQUIPMENT</span></h3>
                <div className="grid grid-cols-2 gap-3">
                  {EQUIPMENT_OPTIONS.map(e => (
                    <Card
                      key={e.value}
                      onClick={() => handleEquipToggle(e.value)}
                      className={cn(
                        'p-4 cursor-pointer border-2 transition-all text-center',
                        equipment.includes(e.value)
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <p className="font-display text-sm tracking-wider">{e.label}</p>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-display text-xl text-foreground tracking-wider">TRAINING <span className="text-primary">ENVIRONMENT</span></h3>
                {ENVIRONMENTS.map(e => (
                  <Card
                    key={e.value}
                    onClick={() => setEnvironment(e.value)}
                    className={cn(
                      'p-4 cursor-pointer border-2 transition-all',
                      environment === e.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <p className="font-display tracking-wider">{e.label}</p>
                    <p className="text-sm text-muted-foreground">{e.desc}</p>
                  </Card>
                ))}
              </div>

              <div className="space-y-2">
                <h3 className="font-display text-lg text-foreground tracking-wider">INJURIES / <span className="text-primary">RESTRICTIONS</span></h3>
                <Textarea
                  value={injuries}
                  onChange={(e) => setInjuries(e.target.value)}
                  placeholder="List any injuries or movement restrictions (optional)"
                  className="bg-background border-border"
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 3: Running */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-display text-xl text-foreground tracking-wider">RUNNING <span className="text-primary">ABILITY</span></h3>
              <p className="text-sm text-muted-foreground">Every day starts with a run. Distance increases progressively from 1km to 5km over 86 days.</p>
              {RUNNING_LEVELS.map(r => (
                <Card
                  key={r.value}
                  onClick={() => setRunningAbility(r.value)}
                  className={cn(
                    'p-5 cursor-pointer border-2 transition-all',
                    runningAbility === r.value
                      ? 'border-primary bg-primary/10 neon-border-subtle'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <p className="font-display text-lg tracking-wider text-foreground">{r.label}</p>
                  <p className="text-sm text-muted-foreground mt-1">{r.desc}</p>
                </Card>
              ))}
            </div>
          )}

          {/* Step 4: Goal */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="font-display text-xl text-foreground tracking-wider">GOAL <span className="text-primary">EMPHASIS</span> <span className="text-sm text-muted-foreground font-sans">(Optional)</span></h3>
              <div className="grid grid-cols-2 gap-3">
                {GOALS.map(g => (
                  <Card
                    key={g.value}
                    onClick={() => setGoalEmphasis(goalEmphasis === g.value ? null : g.value)}
                    className={cn(
                      'p-4 cursor-pointer border-2 transition-all text-center',
                      goalEmphasis === g.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <p className="font-display text-sm tracking-wider">{g.label}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Nav */}
      <div className="flex justify-between pt-6 border-t border-border">
        <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 1} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        {step < totalSteps ? (
          <Button onClick={() => setStep(s => s + 1)} disabled={!canProceed()} className="gap-2">
            Next <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} className="gap-2">
            <Flame className="w-4 h-4" /> CONFIRM SETUP
          </Button>
        )}
      </div>
    </div>
  );
}
