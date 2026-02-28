import { useState, useMemo } from 'react';
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
  Check,
  Brain,
  Utensils,
  Heart,
  Calendar,
  Shield,
  Sparkles,
  Star,
  Sun,
  Moon,
  Zap,
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
  readOnly?: boolean;
  /** Date string (yyyy-MM-dd) used to seed which prompts appear */
  dateKey?: string;
}

const HABITS = [
  { key: 'train' as const, label: 'TRAIN', description: 'Complete your session', icon: Dumbbell },
  { key: 'learnDaily' as const, label: 'LEARN DAILY', description: 'Read, watch, or study something new', icon: BookOpen },
  { key: 'water' as const, label: 'WATER (3L)', description: 'Drink at least 3 litres of water', icon: Droplets },
  { key: 'doTheHardThing' as const, label: 'DO THE HARD THING', description: 'Face one uncomfortable task today', icon: Flame },
  { key: 'hitYourNumbers' as const, label: 'HIT YOUR NUMBERS', description: 'Meet your nutrition targets', icon: Target },
];

interface JournalPrompt {
  category: string;
  icon: typeof Brain;
  prompt: string;
}

const JOURNAL_PROMPTS: JournalPrompt[] = [
  // Mindset
  { category: 'Mindset', icon: Brain, prompt: 'What negative thought pattern did you notice today? How could you reframe it?' },
  { category: 'Mindset', icon: Brain, prompt: 'When did you feel most focused today? What conditions created that focus?' },
  { category: 'Mindset', icon: Brain, prompt: 'What are you avoiding right now? What would it take to face it?' },
  { category: 'Mindset', icon: Brain, prompt: 'What belief about yourself held you back this week?' },
  { category: 'Mindset', icon: Brain, prompt: 'Describe a moment today where you chose discipline over comfort.' },
  { category: 'Mindset', icon: Brain, prompt: 'What is one thing you need to let go of to move forward?' },

  // Training
  { category: 'Training', icon: Dumbbell, prompt: 'What felt strongest in your last session? What felt weakest?' },
  { category: 'Training', icon: Dumbbell, prompt: 'Are you training with intent or just going through the motions? Be honest.' },
  { category: 'Training', icon: Dumbbell, prompt: 'What movement or lift are you most proud of improving recently?' },
  { category: 'Training', icon: Dumbbell, prompt: 'If you could change one thing about your training approach, what would it be?' },
  { category: 'Training', icon: Dumbbell, prompt: 'How does your body feel right now — recovered, sore, energised, flat?' },

  // Fuel / Nutrition
  { category: 'Fuel', icon: Utensils, prompt: 'Did your food choices today support your goals? Where did you slip?' },
  { category: 'Fuel', icon: Utensils, prompt: 'What meal this week made you feel genuinely good after eating it?' },
  { category: 'Fuel', icon: Utensils, prompt: 'Are you eating enough to fuel your training? What does your energy tell you?' },
  { category: 'Fuel', icon: Utensils, prompt: 'What is one small nutrition habit you could lock in this week?' },

  // Relationships
  { category: 'Relationships', icon: Heart, prompt: 'Who lifted you up this week? Have you told them?' },
  { category: 'Relationships', icon: Heart, prompt: 'Is there a conversation you need to have that you have been putting off?' },
  { category: 'Relationships', icon: Heart, prompt: 'How do the people around you influence your habits - positively or negatively?' },
  { category: 'Relationships', icon: Heart, prompt: 'Who do you want to show up better for? What does that look like?' },

  // Planning & Goals
  { category: 'Planning', icon: Calendar, prompt: 'What are your top 3 priorities for tomorrow? Write them now.' },
  { category: 'Planning', icon: Calendar, prompt: 'Where do you want to be in 90 days? What needs to happen this week to get closer?' },
  { category: 'Planning', icon: Calendar, prompt: 'What did you plan to do this week that you have not done yet? Why?' },
  { category: 'Planning', icon: Calendar, prompt: 'If this week was your only chance to make progress, what would you focus on?' },

  // Injuries & Recovery
  { category: 'Recovery', icon: Shield, prompt: 'How is your body recovering? Any niggles you are ignoring that need attention?' },
  { category: 'Recovery', icon: Shield, prompt: 'What are you doing for recovery outside the gym - sleep, mobility, downtime?' },
  { category: 'Recovery', icon: Shield, prompt: 'Are you pushing through pain or training around it? There is a difference.' },
  { category: 'Recovery', icon: Shield, prompt: 'Rate your sleep quality this week 1-10. What could improve it by one point?' },

  // Gratitude & Wins
  { category: 'Gratitude', icon: Star, prompt: 'Name three things that went well today - no matter how small.' },
  { category: 'Gratitude', icon: Star, prompt: 'What is one win from this week you have not given yourself credit for?' },
  { category: 'Gratitude', icon: Star, prompt: 'What part of your life are you taking for granted right now?' },

  // Energy & Self-awareness
  { category: 'Energy', icon: Zap, prompt: 'What time of day do you feel sharpest? Are you using that window well?' },
  { category: 'Energy', icon: Zap, prompt: 'What drained your energy today? What recharged it?' },
  { category: 'Energy', icon: Zap, prompt: 'On a scale of 1-10, where is your motivation right now? What would move it up one?' },

  // Future
  { category: 'Future', icon: Sparkles, prompt: 'What does your best self look like one year from now? Be specific.' },
  { category: 'Future', icon: Sparkles, prompt: 'What habit, if you nailed it every day for 6 months, would change your life?' },
  { category: 'Future', icon: Sparkles, prompt: 'What are you building toward that excites you most right now?' },
];

/**
 * Simple deterministic hash from a date string to pick 3 prompts from
 * different categories each day.
 */
function getPromptsForDate(dateKey: string): JournalPrompt[] {
  let hash = 0;
  for (let i = 0; i < dateKey.length; i++) {
    hash = (hash * 31 + dateKey.charCodeAt(i)) | 0;
  }
  hash = Math.abs(hash);

  // Shuffle categories deterministically
  const categories = [...new Set(JOURNAL_PROMPTS.map(p => p.category))];
  const shuffled = categories
    .map((c, i) => ({ c, sort: (hash * (i + 1) * 7919) % 10000 }))
    .sort((a, b) => a.sort - b.sort)
    .map(x => x.c);

  const picked: JournalPrompt[] = [];
  for (let i = 0; i < 3 && i < shuffled.length; i++) {
    const catPrompts = JOURNAL_PROMPTS.filter(p => p.category === shuffled[i]);
    const idx = (hash * (i + 3)) % catPrompts.length;
    picked.push(catPrompts[Math.abs(idx) % catPrompts.length]);
  }
  return picked;
}

export function DailyHabitDiary({ habits, onChange, compact = false, readOnly = false, dateKey }: DailyHabitDiaryProps) {
  const [isOpen, setIsOpen] = useState(!compact);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  
  const completedCount = HABITS.filter(h => habits[h.key]).length + (habits.journal.trim().length > 0 ? 1 : 0);
  const totalCount = 6;
  const allComplete = completedCount === totalCount;

  const todaysPrompts = useMemo(
    () => getPromptsForDate(dateKey || new Date().toISOString().slice(0, 10)),
    [dateKey]
  );

  const toggleHabit = (key: keyof Omit<HabitState, 'journal'>) => {
    if (readOnly) return;
    onChange({ ...habits, [key]: !habits[key] });
  };

  const handlePromptClick = (prompt: string) => {
    if (readOnly) return;
    setSelectedPrompt(prompt);
    // If journal is empty, pre-fill with the prompt as a header
    if (!habits.journal.trim()) {
      onChange({ ...habits, journal: '' });
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className={`border ${allComplete ? 'border-primary/50 bg-primary/5' : 'border-primary/30 bg-card'}`}>
        <CollapsibleTrigger className="w-full p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${allComplete ? 'bg-primary/20 neon-glow' : 'bg-primary/20 neon-glow'}`}>
              {allComplete ? (
                <Check className="w-6 h-6 text-primary" />
              ) : (
                <PenLine className="w-6 h-6 text-primary" />
              )}
            </div>
            <div className="text-left">
              <span className="font-display text-foreground tracking-wide text-base">DAILY 6 HABITS</span>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {completedCount}/{totalCount}
                </Badge>
                {allComplete && (
                  <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                    COMPLETE
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-5 pb-5 space-y-3">
            {HABITS.map((habit) => (
              <button
                key={habit.key}
                onClick={() => toggleHabit(habit.key)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  habits[habit.key]
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-border bg-muted/20 hover:bg-muted/40'
                }`}
              >
                <Checkbox
                  checked={habits[habit.key]}
                  className="pointer-events-none h-5 w-5"
                />
                <habit.icon className={`w-5 h-5 flex-shrink-0 ${habits[habit.key] ? 'text-primary' : 'text-primary'}`} />
                <div className="text-left flex-1">
                  <span className={`font-display text-sm tracking-wide ${habits[habit.key] ? 'text-primary' : 'text-foreground'}`}>
                    {habit.label}
                  </span>
                  <p className="text-xs text-muted-foreground mt-0.5">{habit.description}</p>
                </div>
              </button>
            ))}

            {/* Journal Entry */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <PenLine className={`w-5 h-5 ${habits.journal.trim() ? 'text-primary' : 'text-primary'}`} />
                <span className={`font-display text-sm tracking-wide ${habits.journal.trim() ? 'text-primary' : 'text-foreground'}`}>
                  DAILY JOURNAL
                </span>
              </div>

              {/* Prompt Chips */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Pick a prompt to write about:</p>
                <div className="flex flex-col gap-2">
                  {todaysPrompts.map((p, i) => {
                    const Icon = p.icon;
                    const isSelected = selectedPrompt === p.prompt;
                    return (
                      <button
                        key={i}
                        onClick={() => handlePromptClick(p.prompt)}
                        disabled={readOnly}
                        className={`w-full text-left flex items-start gap-3 p-3 rounded-xl border transition-all ${
                          isSelected
                            ? 'border-primary/50 bg-primary/10'
                            : 'border-border bg-muted/10 hover:bg-muted/30'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'bg-primary/20' : 'bg-muted/30'
                        }`}>
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Badge variant="outline" className={`text-[10px] mb-1 ${isSelected ? 'border-primary/40 text-primary' : ''}`}>
                            {p.category}
                          </Badge>
                          <p className={`text-sm leading-relaxed ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {p.prompt}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <Textarea
                placeholder={selectedPrompt || "Reflect on your day... pick a prompt above or write freely."}
                value={habits.journal}
                onChange={(e) => !readOnly && onChange({ ...habits, journal: e.target.value })}
                className="min-h-[120px] text-sm bg-muted/20 border-border resize-none"
                readOnly={readOnly}
              />
            </div>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
