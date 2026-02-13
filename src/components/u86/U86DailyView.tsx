import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Footprints, Dumbbell, CheckCircle2, Play,
  BookOpen, Zap, Shield, PenLine, ChevronDown, ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { U86SessionView } from './U86SessionView';
import type { U86Day, U86Program } from '@/hooks/useUnbreakable86';

interface U86DailyViewProps {
  day: U86Day;
  program: U86Program;
  streak: number;
  onUpdate: (updates: Partial<U86Day>) => void;
  onComplete: () => void;
  readOnly?: boolean;
}

const HABIT_CONFIG = [
  { key: 'habit_train', icon: Dumbbell, label: 'TRAIN', desc: 'Complete the full Unbreakable 86 session' },
  { key: 'habit_learn_daily', icon: BookOpen, label: 'LEARN DAILY', desc: '10-20 minutes non-fiction reading' },
  { key: 'habit_journal', icon: Shield, label: 'HIT YOUR NUMBERS', desc: 'Meet your daily calorie and macro targets' },
  { key: 'habit_control_inputs', icon: PenLine, label: 'DAILY WATER TARGET', desc: 'Drink at least 3 litres of water today' },
  { key: 'habit_hard_thing', icon: Zap, label: 'DO THE HARD THING', desc: 'Do one thing that scares you. Talk to a stranger. Start something new.' },
  
] as const;

export function U86DailyView({ day, program, streak, onUpdate, onComplete, readOnly = false }: U86DailyViewProps) {
  const [journalText, setJournalText] = useState(day.journal_entry || '');
  
  const [sessionOpen, setSessionOpen] = useState(false);
  const [planExpanded, setPlanExpanded] = useState(false);

  const allHabitsComplete = HABIT_CONFIG.every(h => (day as any)[h.key]);
  const sessionComplete = day.run_completed && day.strength_completed;
  const canComplete = allHabitsComplete && sessionComplete && journalText.trim();

  const exercises: any[] = Array.isArray(day.exercises) ? day.exercises : [];
  const totalSets = exercises.reduce((acc, ex) => acc + (ex.sets?.length || 0), 0);
  const completedSets = exercises.reduce((acc, ex) => {
    return acc + (ex.logged || []).filter((s: any) => s.completed).length;
  }, 0);
  const strengthProgress = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

  const handleHabitToggle = (key: string) => {
    if (readOnly) return;
    onUpdate({ [key]: !(day as any)[key] } as any);
  };

  const handleExercisesUpdate = (updatedExercises: any[]) => {
    if (readOnly) return;
    onUpdate({ exercises: updatedExercises } as any);
  };

  const handleComplete = () => {
    if (readOnly) return;
    onUpdate({
      journal_entry: journalText,
      habit_train: true,
    });
    onComplete();
  };

  return (
    <>
      {/* Full-screen session view */}
      <AnimatePresence>
        {sessionOpen && (
          <U86SessionView
            exercises={exercises}
            dayNumber={day.day_number}
            onUpdateExercises={handleExercisesUpdate}
            onClose={() => setSessionOpen(false)}
            readOnly={readOnly}
          />
        )}
      </AnimatePresence>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Day Header */}
        <div className="text-center space-y-2">
          <Badge variant="outline" className="border-primary text-primary font-display tracking-wider text-sm px-4 py-1">
            DAY {day.day_number} OF 86
          </Badge>
          {readOnly ? (
            <h2 className="font-display text-3xl md:text-4xl text-foreground tracking-wider">
              <span className="text-primary neon-glow-subtle">SESSION</span> LOG
            </h2>
          ) : (
            <h2 className="font-display text-3xl md:text-4xl text-foreground tracking-wider">
              <span className="text-primary neon-glow-subtle">KEEP</span> SHOWING UP
            </h2>
          )}
          {!readOnly && streak > 0 && (
            <p className="text-sm text-muted-foreground">
              🔥 {streak} day streak
            </p>
          )}
        </div>

        {/* Strength Session Card */}
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
                  {exercises.length} exercises · {completedSets}/{totalSets} sets · {strengthProgress}%
                </p>
              </div>
            </div>
            {!readOnly && (
              <Checkbox
                checked={day.strength_completed}
                onCheckedChange={() => onUpdate({ strength_completed: !day.strength_completed })}
                className="w-7 h-7 border-primary data-[state=checked]:bg-green-500"
              />
            )}
          </div>

          {/* Expandable exercise preview */}
          <button
            onClick={() => setPlanExpanded(!planExpanded)}
            className="w-full flex items-center justify-between text-sm text-muted-foreground hover:text-foreground transition-colors mb-3 py-1"
          >
            <span className="font-display tracking-wider text-xs">
              {planExpanded ? 'HIDE SESSION PLAN' : 'VIEW SESSION PLAN'}
            </span>
            {planExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <AnimatePresence>
            {planExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="space-y-2 mb-4 border-t border-border/50 pt-3">
                  {exercises.map((ex: any, i: number) => {
                    const logged = ex.logged || [];
                    const setsComplete = logged.filter((s: any) => s.completed).length;
                    const total = ex.sets?.length || 0;
                    const sets = ex.sets || [];
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center justify-between text-sm py-1">
                          <div className="flex items-center gap-2 flex-1">
                            <Dumbbell className="w-3 h-3 text-primary/60" />
                            <span className="text-foreground font-medium truncate">{ex.name}</span>
                          </div>
                          <span className={cn(
                            'text-xs font-display ml-2',
                            setsComplete === total && total > 0 ? 'text-green-500' : 'text-muted-foreground'
                          )}>
                            {setsComplete}/{total}
                          </span>
                        </div>
                        <div className="pl-5 space-y-0.5">
                          {sets.map((s: any, si: number) => {
                            const log = logged[si];
                            const wasLogged = log?.completed;
                            return (
                              <div key={si} className={cn(
                                'flex items-center gap-3 text-xs',
                                wasLogged ? 'text-green-500/70' : 'text-muted-foreground/70'
                              )}>
                                <span className="w-12">Set {s.set}</span>
                                <span className="flex-1">{s.targetReps} reps · {s.suggestedWeight}</span>
                                {wasLogged && (
                                  <span className="text-green-500/80">
                                    {log.reps}r {log.weight && `${log.weight}kg`} {log.rpe && `RPE ${log.rpe}`}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            onClick={() => setSessionOpen(true)}
            className="w-full gap-2 font-display tracking-wider"
            size="lg"
          >
            <Play className="w-5 h-5" />
            {readOnly ? 'VIEW SESSION LOG' : completedSets > 0 ? 'CONTINUE SESSION' : 'START SESSION'}
          </Button>
        </Card>

        {/* Run Section */}
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
                <p className="font-display text-lg tracking-wider text-foreground">RUN {day.run_distance_km} KM</p>
                <p className="text-xs text-muted-foreground">
                  {program.running_ability === 'walk_only' ? 'Walk' :
                   program.running_ability === 'run_walk' ? 'Run/Walk' : 'Run'} · Complete after strength
                </p>
              </div>
            </div>
            {!readOnly && (
              <Checkbox
                checked={day.run_completed}
                onCheckedChange={() => onUpdate({ run_completed: !day.run_completed })}
                className="w-7 h-7 border-primary data-[state=checked]:bg-green-500"
              />
            )}
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
                'p-4 border-2 transition-all',
                readOnly ? '' : 'cursor-pointer',
                (day as any)[key] ? 'border-green-500/50 bg-green-500/5' : 'border-border hover:border-primary/40'
              )}
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={(day as any)[key]}
                  onCheckedChange={() => handleHabitToggle(key)}
                  disabled={readOnly}
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
          {readOnly ? (
            <p className="text-sm text-foreground bg-muted/20 rounded-lg p-3">{day.journal_entry || 'No entry'}</p>
          ) : (
            <Textarea
              value={journalText}
              onChange={e => setJournalText(e.target.value)}
              placeholder="Write honestly..."
              rows={4}
              className="bg-background border-border"
            />
          )}
        </div>


        {/* Complete Day */}
        {!readOnly && (
          <>
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
                Complete strength session, run, all 6 habits, journal and identity reflection to mark day complete
              </p>
            )}
          </>
        )}
      </div>
    </>
  );
}
