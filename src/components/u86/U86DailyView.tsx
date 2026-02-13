import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Footprints, Dumbbell, CheckCircle2, Flame, Clock, Target,
  BookOpen, Brain, Zap, Shield, PenLine, ChevronDown, ChevronUp, Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { findCoachingDataByName } from '@/lib/exerciseCoachingData';
import { ExerciseCoachingPanel } from '@/components/programming/ExerciseCoachingPanel';
import type { U86Day, U86Program } from '@/hooks/useUnbreakable86';

interface U86DailyViewProps {
  day: U86Day;
  program: U86Program;
  streak: number;
  onUpdate: (updates: Partial<U86Day>) => void;
  onComplete: () => void;
}

const HABIT_CONFIG = [
  { key: 'habit_train', icon: Dumbbell, label: 'TRAIN', desc: 'Complete the full Unbreakable 86 session' },
  { key: 'habit_control_inputs', icon: Shield, label: 'CONTROL INPUTS', desc: 'No social media before training. No phone during session.' },
  { key: 'habit_learn_daily', icon: BookOpen, label: 'LEARN DAILY', desc: '10-20 minutes non-fiction reading' },
  { key: 'habit_journal', icon: PenLine, label: 'JOURNAL HONESTLY', desc: '"Where did I want to quit today, and what did I do instead?"' },
  { key: 'habit_hard_thing', icon: Zap, label: 'DO THE HARD THING', desc: 'One deliberately uncomfortable action completed' },
  { key: 'habit_identity', icon: Brain, label: 'IDENTITY REFLECTION', desc: '"Today I kept showing up by ______."' },
] as const;

export function U86DailyView({ day, program, streak, onUpdate, onComplete }: U86DailyViewProps) {
  const [journalText, setJournalText] = useState(day.journal_entry || '');
  const [identityText, setIdentityText] = useState(day.identity_reflection || '');
  const [expandedExercise, setExpandedExercise] = useState<number | null>(null);

  const allHabitsComplete = HABIT_CONFIG.every(h => (day as any)[h.key]);
  const sessionComplete = day.run_completed && day.strength_completed;
  const canComplete = allHabitsComplete && sessionComplete && journalText.trim() && identityText.trim();

  const exercises: any[] = Array.isArray(day.exercises) ? day.exercises : [];

  // Update a specific set's logged data within the exercises JSONB
  const handleSetUpdate = useCallback((exerciseIndex: number, setIndex: number, field: string, value: any) => {
    const updated = exercises.map((ex, ei) => {
      if (ei !== exerciseIndex) return ex;
      const newLogged = (ex.logged || []).map((s: any, si: number) => {
        if (si !== setIndex) return s;
        return { ...s, [field]: value };
      });
      return { ...ex, logged: newLogged };
    });
    onUpdate({ exercises: updated } as any);
  }, [exercises, onUpdate]);

  const handleHabitToggle = (key: string) => {
    onUpdate({ [key]: !(day as any)[key] } as any);
  };

  const handleComplete = () => {
    onUpdate({
      journal_entry: journalText,
      identity_reflection: identityText,
      habit_train: true,
    });
    onComplete();
  };

  // Count total completed sets
  const totalSets = exercises.reduce((acc, ex) => acc + (ex.sets?.length || 0), 0);
  const completedSets = exercises.reduce((acc, ex) => {
    return acc + (ex.logged || []).filter((s: any) => s.completed).length;
  }, 0);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Day Header */}
      <div className="text-center space-y-2">
        <Badge variant="outline" className="border-primary text-primary font-display tracking-wider text-sm px-4 py-1">
          DAY {day.day_number} OF 86
        </Badge>
        <h2 className="font-display text-3xl md:text-4xl text-foreground tracking-wider">
          <span className="text-primary neon-glow-subtle">KEEP</span> SHOWING UP
        </h2>
        {streak > 0 && (
          <p className="text-sm text-muted-foreground">
            🔥 {streak} day streak
          </p>
        )}
        <p className="text-xs text-muted-foreground italic">
          "Leave enough to keep showing up."
        </p>
      </div>

      {/* Strength Section — FIRST */}
      <Card className={cn(
        'border-2 p-5 transition-all',
        day.strength_completed ? 'border-green-500/50 bg-green-500/5' : 'border-primary/30'
      )}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              day.strength_completed ? 'bg-green-500/20' : 'bg-primary/20'
            )}>
              <Dumbbell className={cn('w-6 h-6', day.strength_completed ? 'text-green-500' : 'text-primary')} />
            </div>
            <div>
              <p className="font-display text-lg tracking-wider text-foreground">STRENGTH</p>
              <p className="text-xs text-muted-foreground">
                Big 5 + Pull-ups + Push-ups · {completedSets}/{totalSets} sets
              </p>
            </div>
          </div>
          <Checkbox
            checked={day.strength_completed}
            onCheckedChange={() => onUpdate({ strength_completed: !day.strength_completed })}
            className="w-7 h-7 border-primary data-[state=checked]:bg-green-500"
          />
        </div>

        <div className="space-y-2">
          {exercises.map((ex: any, i: number) => {
            const coachingData = findCoachingDataByName(ex.name);
            const isExpanded = expandedExercise === i;
            const sets = ex.sets || [];
            const logged = ex.logged || [];
            const exerciseSetsComplete = logged.filter((s: any) => s.completed).length;

            return (
              <div key={i} className="rounded-lg bg-background/50 border border-border overflow-hidden">
                {/* Exercise Header */}
                <button
                  onClick={() => setExpandedExercise(isExpanded ? null : i)}
                  className="w-full flex items-center justify-between py-3 px-3 hover:bg-muted/30 transition-colors text-left"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{ex.name}</p>
                    <p className="text-xs text-muted-foreground">{ex.category}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {exerciseSetsComplete}/{sets.length}
                    </span>
                    {exerciseSetsComplete === sets.length && sets.length > 0 && (
                      <Check className="w-4 h-4 text-green-500" />
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-primary" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-primary" />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 pb-3 border-t border-border pt-3 space-y-3">
                        {/* Coaching toggle */}
                        {coachingData && (
                          <ExerciseCoachingPanel coachingData={coachingData} exerciseName={ex.name} />
                        )}

                        {/* Set Headers */}
                        <div className="grid grid-cols-12 gap-1.5 text-[10px] text-muted-foreground px-1 font-display tracking-wider">
                          <div className="col-span-1">SET</div>
                          <div className="col-span-3">TARGET</div>
                          <div className="col-span-2">REPS</div>
                          <div className="col-span-2">KG</div>
                          <div className="col-span-2">RPE</div>
                          <div className="col-span-2 text-center">DONE</div>
                        </div>

                        {/* Set Rows */}
                        {sets.map((setInfo: any, si: number) => {
                          const logEntry = logged[si] || { reps: null, weight: null, rpe: null, completed: false };
                          return (
                            <div key={si} className={cn(
                              'grid grid-cols-12 gap-1.5 items-center py-1',
                              logEntry.completed && 'opacity-60'
                            )}>
                              <div className="col-span-1">
                                <span className="font-display text-primary text-sm">{setInfo.set}</span>
                              </div>
                              <div className="col-span-3">
                                <div className="text-xs text-muted-foreground">
                                  {setInfo.targetReps}
                                  {setInfo.suggestedWeight !== 'BW' && setInfo.suggestedWeight !== 'BW+' && (
                                    <span className="block text-[10px] text-muted-foreground/60">{setInfo.suggestedWeight}</span>
                                  )}
                                  {(setInfo.suggestedWeight === 'BW' || setInfo.suggestedWeight === 'BW+') && (
                                    <span className="block text-[10px] text-muted-foreground/60">{setInfo.suggestedWeight}</span>
                                  )}
                                </div>
                              </div>
                              <div className="col-span-2">
                                <Input
                                  type="number"
                                  inputMode="numeric"
                                  placeholder="—"
                                  value={logEntry.reps ?? ''}
                                  onChange={(e) => handleSetUpdate(i, si, 'reps', e.target.value ? parseInt(e.target.value) : null)}
                                  className="h-8 text-center text-sm px-1"
                                />
                              </div>
                              <div className="col-span-2">
                                <Input
                                  type="number"
                                  inputMode="decimal"
                                  placeholder="—"
                                  step="0.5"
                                  value={logEntry.weight ?? ''}
                                  onChange={(e) => handleSetUpdate(i, si, 'weight', e.target.value ? parseFloat(e.target.value) : null)}
                                  className="h-8 text-center text-sm px-1"
                                />
                              </div>
                              <div className="col-span-2">
                                <Input
                                  type="number"
                                  inputMode="decimal"
                                  placeholder="—"
                                  step="0.5"
                                  min="1"
                                  max="10"
                                  value={logEntry.rpe ?? ''}
                                  onChange={(e) => handleSetUpdate(i, si, 'rpe', e.target.value ? parseFloat(e.target.value) : null)}
                                  className="h-8 text-center text-sm px-1"
                                />
                              </div>
                              <div className="col-span-2 flex justify-center">
                                <Checkbox
                                  checked={logEntry.completed}
                                  onCheckedChange={(checked) => handleSetUpdate(i, si, 'completed', !!checked)}
                                  className="h-6 w-6 border-primary data-[state=checked]:bg-green-500"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Run Section — AFTER strength */}
      <Card className={cn(
        'border-2 p-5 transition-all',
        day.run_completed ? 'border-green-500/50 bg-green-500/5' : 'border-primary/30 bg-primary/5'
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              day.run_completed ? 'bg-green-500/20' : 'bg-primary/20'
            )}>
              <Footprints className={cn('w-6 h-6', day.run_completed ? 'text-green-500' : 'text-primary')} />
            </div>
            <div>
              <p className="font-display text-lg tracking-wider text-foreground">RUN — {day.run_distance_km} KM</p>
              <p className="text-xs text-muted-foreground">
                {program.running_ability === 'walk_only' ? 'Walk' :
                 program.running_ability === 'run_walk' ? 'Run/Walk' : 'Run'} · Complete after strength
              </p>
            </div>
          </div>
          <Checkbox
            checked={day.run_completed}
            onCheckedChange={() => onUpdate({ run_completed: !day.run_completed })}
            className="w-7 h-7 border-primary data-[state=checked]:bg-green-500"
          />
        </div>
      </Card>

      {/* Habits Section */}
      <div className="space-y-3">
        <h3 className="font-display text-xl tracking-wider text-foreground">
          DAILY <span className="text-primary">HABITS</span>
        </h3>
        {HABIT_CONFIG.map(({ key, icon: Icon, label, desc }) => (
          <Card
            key={key}
            onClick={() => handleHabitToggle(key)}
            className={cn(
              'p-4 cursor-pointer border-2 transition-all',
              (day as any)[key] ? 'border-green-500/50 bg-green-500/5' : 'border-border hover:border-primary/40'
            )}
          >
            <div className="flex items-center gap-3">
              <Checkbox
                checked={(day as any)[key]}
                onCheckedChange={() => handleHabitToggle(key)}
                className="w-6 h-6 border-primary data-[state=checked]:bg-green-500"
              />
              <Icon className={cn('w-5 h-5', (day as any)[key] ? 'text-green-500' : 'text-primary')} />
              <div className="flex-1">
                <p className="font-display text-sm tracking-wider text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Journal */}
      <div className="space-y-3">
        <h3 className="font-display text-lg tracking-wider text-foreground">
          <span className="text-primary">JOURNAL</span> ENTRY
        </h3>
        <p className="text-xs text-muted-foreground italic">"Where did I want to quit today, and what did I do instead?"</p>
        <Textarea
          value={journalText}
          onChange={e => setJournalText(e.target.value)}
          placeholder="Write honestly..."
          rows={4}
          className="bg-background border-border"
        />
      </div>

      {/* Identity */}
      <div className="space-y-3">
        <h3 className="font-display text-lg tracking-wider text-foreground">
          <span className="text-primary">IDENTITY</span> REFLECTION
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">"Today I kept showing up by</span>
          <Textarea
            value={identityText}
            onChange={e => setIdentityText(e.target.value)}
            placeholder="..."
            rows={1}
            className="bg-background border-border flex-1"
          />
          <span className="text-sm text-muted-foreground">"</span>
        </div>
      </div>

      {/* Complete Day */}
      <Button
        size="lg"
        onClick={handleComplete}
        disabled={!canComplete}
        className="w-full gap-3 font-display tracking-wider text-lg py-6 shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
      >
        <CheckCircle2 className="w-5 h-5" />
        COMPLETE DAY {day.day_number}
      </Button>

      {!canComplete && (
        <p className="text-xs text-center text-muted-foreground">
          Complete strength, run, all 6 habits, journal and identity reflection to mark day complete
        </p>
      )}
    </div>
  );
}
