import { Goal, goalLabels, goalDescriptions } from '@/lib/programTypes';
import { Target, Dumbbell, Heart, Flame, Zap, Trophy } from 'lucide-react';

interface ProgramFormStep1Props {
  selectedGoal: Goal | null;
  onSelect: (goal: Goal) => void;
}

const goalIcons: Record<Goal, React.ReactNode> = {
  strength: <Dumbbell className="w-8 h-8" />,
  muscle: <Target className="w-8 h-8" />,
  endurance: <Heart className="w-8 h-8" />,
  fat_loss: <Flame className="w-8 h-8" />,
  hybrid: <Zap className="w-8 h-8" />,
  athletic: <Trophy className="w-8 h-8" />,
};

export function ProgramFormStep1({ selectedGoal, onSelect }: ProgramFormStep1Props) {
  const goals: Goal[] = ['strength', 'muscle', 'endurance', 'fat_loss', 'hybrid', 'athletic'];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-display text-2xl text-foreground tracking-wide mb-2">
          WHAT'S YOUR GOAL?
        </h2>
        <p className="text-muted-foreground">
          Select your primary training objective
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {goals.map((goal) => (
          <button
            key={goal}
            onClick={() => onSelect(goal)}
            className={`relative p-6 rounded-lg border-2 transition-all duration-300 text-left group ${
              selectedGoal === goal
                ? 'border-primary bg-primary/10'
                : 'border-border bg-card hover:border-primary/50'
            }`}
          >
            <div className={`mb-3 ${selectedGoal === goal ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`}>
              {goalIcons[goal]}
            </div>
            <h3 className="font-display text-lg text-foreground tracking-wide mb-1">
              {goalLabels[goal]}
            </h3>
            <p className="text-sm text-muted-foreground">
              {goalDescriptions[goal]}
            </p>
            {selectedGoal === goal && (
              <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
