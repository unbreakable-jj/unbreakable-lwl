import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Dumbbell, 
  BookOpen, 
  Droplets, 
  Flame, 
  Target, 
  PenLine,
  ChevronDown,
  Check
} from 'lucide-react';

export interface HabitState {
  train: boolean;
  learnDaily: boolean;
  water: boolean;
  doTheHardThing: boolean;
  hitYourNumbers: boolean;
  journal: string;
}

interface DailyHabitDiaryProps {
  habits: HabitState;
  onChange: (habits: HabitState) => void;
  compact?: boolean;
}

const HABITS = [
  { key: 'train' as const, label: 'TRAIN', description: 'Complete your session', icon: Dumbbell },
  { key: 'learnDaily' as const, label: 'LEARN DAILY', description: 'Read, watch, or study something new', icon: BookOpen },
  { key: 'water' as const, label: 'WATER (3L)', description: 'Drink at least 3 litres of water', icon: Droplets },
  { key: 'doTheHardThing' as const, label: 'DO THE HARD THING', description: 'Face one uncomfortable task today', icon: Flame },
  { key: 'hitYourNumbers' as const, label: 'HIT YOUR NUMBERS', description: 'Meet your nutrition targets', icon: Target },
];

export function DailyHabitDiary({ habits, onChange, compact = false }: DailyHabitDiaryProps) {
  const [isOpen, setIsOpen] = useState(!compact);
  
  const completedCount = HABITS.filter(h => habits[h.key]).length + (habits.journal.trim().length > 0 ? 1 : 0);
  const totalCount = 6;
  const allComplete = completedCount === totalCount;

  const toggleHabit = (key: keyof Omit<HabitState, 'journal'>) => {
    onChange({ ...habits, [key]: !habits[key] });
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className={`border ${allComplete ? 'border-green-500/50 bg-green-500/5' : 'border-primary/30 bg-card'}`}>
        <CollapsibleTrigger className="w-full p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${allComplete ? 'bg-green-500/20' : 'bg-primary/20'}`}>
              {allComplete ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <PenLine className="w-5 h-5 text-primary" />
              )}
            </div>
            <div className="text-left">
              <span className="font-display text-foreground tracking-wide text-sm">DAILY 6 HABITS</span>
              <Badge variant="outline" className="ml-2 text-xs">
                {completedCount}/{totalCount}
              </Badge>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-3">
            {HABITS.map((habit) => (
              <button
                key={habit.key}
                onClick={() => toggleHabit(habit.key)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  habits[habit.key]
                    ? 'border-green-500/30 bg-green-500/5'
                    : 'border-border bg-muted/20 hover:bg-muted/40'
                }`}
              >
                <Checkbox
                  checked={habits[habit.key]}
                  className="pointer-events-none"
                />
                <habit.icon className={`w-4 h-4 ${habits[habit.key] ? 'text-green-500' : 'text-muted-foreground'}`} />
                <div className="text-left flex-1">
                  <span className={`font-display text-xs tracking-wide ${habits[habit.key] ? 'text-green-500' : 'text-foreground'}`}>
                    {habit.label}
                  </span>
                  <p className="text-[10px] text-muted-foreground">{habit.description}</p>
                </div>
              </button>
            ))}

            {/* Journal Entry */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <PenLine className={`w-4 h-4 ${habits.journal.trim() ? 'text-green-500' : 'text-muted-foreground'}`} />
                <span className={`font-display text-xs tracking-wide ${habits.journal.trim() ? 'text-green-500' : 'text-foreground'}`}>
                  DAILY JOURNAL
                </span>
              </div>
              <Textarea
                placeholder="Reflect on your day... What went well? What can improve?"
                value={habits.journal}
                onChange={(e) => onChange({ ...habits, journal: e.target.value })}
                className="min-h-[80px] text-sm bg-muted/20 border-border"
              />
            </div>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
