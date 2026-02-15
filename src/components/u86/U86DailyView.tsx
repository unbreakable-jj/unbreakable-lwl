import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Footprints, Dumbbell, CheckCircle2, Play,
  BookOpen, Zap, Shield, PenLine, ChevronDown, ChevronUp,
  Video, Sparkles, Droplets, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ActiveWorkoutModal } from '@/components/programming/ActiveWorkoutModal';
import { VideoToolView } from '@/components/programming/VideoToolView';
import { useWorkoutSessions } from '@/hooks/useWorkoutSessions';
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
  { key: 'habit_control_inputs', icon: Droplets, label: 'DAILY WATER TARGET', desc: 'Drink at least 3 litres of water today' },
  { key: 'habit_hard_thing', icon: Zap, label: 'DO THE HARD THING', desc: 'Do one thing that scares you. Talk to a stranger. Start something new.' },
  { key: 'habit_hit_numbers', icon: Shield, label: 'HIT YOUR NUMBERS', desc: 'Meet your daily calorie and macro targets' },
  { key: 'habit_journal', icon: PenLine, label: 'DAILY JOURNAL', desc: 'Reflect on your day — what went well, what was hard, what to improve' },
] as const;

export function U86DailyView({ day, program, streak, onUpdate, onComplete, readOnly = false }: U86DailyViewProps) {
  const [journalWentWell, setJournalWentWell] = useState('');
  const [journalHardest, setJournalHardest] = useState('');
  const [journalTomorrow, setJournalTomorrow] = useState('');
  const [planExpanded, setPlanExpanded] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [journalExpanded, setJournalExpanded] = useState(false);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [isStartingSession, setIsStartingSession] = useState(false);

  const {
    activeSession,
    startSession,
    updateExerciseLog,
    completeSession,
    cancelSession,
  } = useWorkoutSessions();

  // Parse existing journal entry if structured
  useState(() => {
    if (day.journal_entry) {
      try {
        const parsed = JSON.parse(day.journal_entry);
        if (parsed.wentWell) setJournalWentWell(parsed.wentWell);
        if (parsed.hardest) setJournalHardest(parsed.hardest);
        if (parsed.tomorrow) setJournalTomorrow(parsed.tomorrow);
      } catch {
        setJournalWentWell(day.journal_entry);
      }
    }
  });

  const journalComplete = journalWentWell.trim() !== '' && journalHardest.trim() !== '' && journalTomorrow.trim() !== '';
  const allHabitsComplete = HABIT_CONFIG.every(h => {
    if (h.key === 'habit_journal') return journalComplete;
    return (day as any)[h.key];
  });
  const sessionComplete = day.run_completed && day.strength_completed;
  const canComplete = allHabitsComplete && sessionComplete;

  const exercises: any[] = Array.isArray(day.exercises) ? day.exercises : [];
  const totalSets = exercises.reduce((acc, ex) => acc + (ex.sets?.length || 0), 0);
  const completedSets = exercises.reduce((acc, ex) => {
    return acc + (ex.logged || []).filter((s: any) => s.completed).length;
  }, 0);
  const strengthProgress = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

  // Check if there's an active U86 session
  const hasActiveU86Session = !!activeSession && activeSession.session_type?.startsWith('U86 Day');

  const handleHabitToggle = (key: string) => {
    if (readOnly) return;
    onUpdate({ [key]: !(day as any)[key] } as any);
  };

  const handleStartSession = async () => {
    if (isStartingSession || readOnly) return;
    setIsStartingSession(true);

    try {
      // If there's already an active U86 session, just open the modal
      if (hasActiveU86Session) {
        setShowWorkoutModal(true);
        setIsStartingSession(false);
        return;
      }

      // Create a proper workout session from U86 exercises
      const exercisesForSession = exercises.map(ex => ({
        name: ex.name,
        equipment: ex.equipment || 'bodyweight',
        sets: ex.sets?.length || 3,
        reps: ex.sets?.[0]?.targetReps || '8-12',
      }));

      await startSession.mutateAsync({
        programId: null as any,
        weekNumber: Math.ceil(day.day_number / 7),
        dayName: `Day ${day.day_number}`,
        sessionType: `U86 Day ${day.day_number} - Strength`,
        exercises: exercisesForSession,
      });

      setShowWorkoutModal(true);
    } catch (error) {
      console.error('Failed to start U86 session:', error);
    } finally {
      setIsStartingSession(false);
    }
  };

  const handleCompleteWorkout = (notes?: string, visibility?: 'public' | 'friends' | 'private') => {
    if (!activeSession) return;

    // Complete the workout session in the workout system
    completeSession.mutate({
      sessionId: activeSession.id,
      notes,
      visibility,
    });

    // Sync exercise log data back to U86 day exercises
    if (activeSession.exercise_logs) {
      const updatedExercises = exercises.map(ex => {
        const matchingLogs = activeSession.exercise_logs?.filter(
          log => log.exercise_name === ex.name
        ) || [];

        if (matchingLogs.length > 0) {
          const logged = matchingLogs.map(log => ({
            reps: log.actual_reps,
            weight: log.weight_kg,
            rpe: log.rpe,
            completed: log.completed,
          }));
          return { ...ex, logged };
        }
        return ex;
      });

      onUpdate({
        exercises: updatedExercises,
        strength_completed: true,
      } as any);
    } else {
      onUpdate({ strength_completed: true });
    }

    setShowWorkoutModal(false);
  };

  const handleCancelWorkout = () => {
    if (!activeSession) return;
    cancelSession.mutate(activeSession.id);
    setShowWorkoutModal(false);
  };

  const buildJournalJson = () => JSON.stringify({
    wentWell: journalWentWell,
    hardest: journalHardest,
    tomorrow: journalTomorrow,
  });

  const handleComplete = () => {
    if (readOnly) return;
    onUpdate({
      journal_entry: buildJournalJson(),
      habit_train: true,
    });
    onComplete();
  };

  return (
    <>
      {/* Video tool */}
      <AnimatePresence>
        {showVideo && (
          <VideoToolView
            exerciseName={`U86 Day ${day.day_number}`}
            onClose={() => setShowVideo(false)}
          />
        )}
      </AnimatePresence>

      {/* Active Workout Modal - Full coaching experience */}
      {activeSession && (
        <ActiveWorkoutModal
          session={activeSession}
          onUpdateLog={(logId, data) => updateExerciseLog.mutate({ logId, ...data })}
          onComplete={handleCompleteWorkout}
          onCancel={handleCancelWorkout}
          open={showWorkoutModal}
          onOpenChange={setShowWorkoutModal}
        />
      )}

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Day Header */}
        <div className="text-center space-y-3">
          <Badge variant="outline" className="border-primary/50 text-primary font-display tracking-[0.2em] text-xs px-5 py-1.5">
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
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5">
              <span className="text-primary text-sm">🔥</span>
              <span className="text-sm font-display tracking-wider text-primary">{streak} DAY STREAK</span>
            </div>
          )}
        </div>

        {/* Overall Day Progress */}
        {!readOnly && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-display tracking-wider">
              <span className="text-muted-foreground">DAY PROGRESS</span>
              <span className="text-primary">
                {[sessionComplete, allHabitsComplete].filter(Boolean).length}/2 SECTIONS
              </span>
            </div>
            <Progress 
              value={([sessionComplete, allHabitsComplete].filter(Boolean).length / 2) * 100} 
              className="h-1.5" 
            />
          </div>
        )}

        {/* Strength Session Card */}
        <Card className={cn(
          'border p-5 transition-all',
          day.strength_completed 
            ? 'border-green-500/40 bg-green-500/5' 
            : 'border-primary/20 hover:border-primary/40'
        )}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-11 h-11 rounded-lg flex items-center justify-center',
                day.strength_completed ? 'bg-green-500/15' : 'bg-primary/15'
              )}>
                <Dumbbell className={cn('w-5 h-5', day.strength_completed ? 'text-green-500' : 'text-primary')} />
              </div>
              <div>
                <p className="font-display text-base tracking-wider text-foreground">STRENGTH SESSION</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {exercises.length} exercises · {completedSets}/{totalSets} sets
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-display text-sm text-primary">{strengthProgress}%</span>
              {!readOnly && (
                <Checkbox
                  checked={day.strength_completed}
                  onCheckedChange={() => onUpdate({ strength_completed: !day.strength_completed })}
                  className="w-6 h-6 border-primary data-[state=checked]:bg-green-500"
                />
              )}
            </div>
          </div>

          {/* Mini progress bar */}
          <Progress value={strengthProgress} className="h-1 mb-4" />

          {/* Expandable exercise preview */}
          <button
            onClick={() => setPlanExpanded(!planExpanded)}
            className="w-full flex items-center justify-between text-muted-foreground hover:text-foreground transition-colors mb-3 py-1"
          >
            <span className="font-display tracking-[0.15em] text-[11px]">
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
                <div className="space-y-2 mb-4 border-t border-border/30 pt-3">
                  {exercises.map((ex: any, i: number) => {
                    const logged = ex.logged || [];
                    const setsComplete = logged.filter((s: any) => s.completed).length;
                    const total = ex.sets?.length || 0;
                    const sets = ex.sets || [];
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center justify-between text-sm py-1">
                          <div className="flex items-center gap-2 flex-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                            <span className="text-foreground text-sm truncate">{ex.name}</span>
                          </div>
                          <span className={cn(
                            'text-xs font-display ml-2',
                            setsComplete === total && total > 0 ? 'text-green-500' : 'text-muted-foreground/60'
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
                                wasLogged ? 'text-green-500/60' : 'text-muted-foreground/50'
                              )}>
                                <span className="w-10">Set {s.set}</span>
                                <span className="flex-1">{s.targetReps} reps · {s.suggestedWeight}</span>
                                {wasLogged && (
                                  <span className="text-green-500/70 text-[11px]">
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

          <div className="flex gap-2">
            <Button
              onClick={readOnly ? () => {} : handleStartSession}
              className="flex-1 gap-2 font-display tracking-wider"
              size="lg"
              disabled={isStartingSession || readOnly}
            >
              {isStartingSession ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Play className="w-5 h-5" />
              )}
              {readOnly ? 'VIEW SESSION LOG' : hasActiveU86Session ? 'CONTINUE SESSION' : completedSets > 0 ? 'CONTINUE SESSION' : 'START SESSION'}
            </Button>
            {!readOnly && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowVideo(true)}
                className="gap-2 border-primary/20 hover:border-primary/40"
              >
                <Video className="w-5 h-5" />
              </Button>
            )}
          </div>
        </Card>

        {/* Run Section */}
        <Card className={cn(
          'border p-5 transition-all',
          day.run_completed 
            ? 'border-green-500/40 bg-green-500/5' 
            : 'border-primary/20 hover:border-primary/40'
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-11 h-11 rounded-lg flex items-center justify-center',
                day.run_completed ? 'bg-green-500/15' : 'bg-primary/15'
              )}>
                <Footprints className={cn('w-5 h-5', day.run_completed ? 'text-green-500' : 'text-primary')} />
              </div>
              <div>
                <p className="font-display text-base tracking-wider text-foreground">RUN {day.run_distance_km} KM</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {program.running_ability === 'walk_only' ? 'Walk' :
                   program.running_ability === 'run_walk' ? 'Run/Walk' : 'Run'} · Complete after strength
                </p>
              </div>
            </div>
            {!readOnly && (
              <Checkbox
                checked={day.run_completed}
                onCheckedChange={() => onUpdate({ run_completed: !day.run_completed })}
                className="w-6 h-6 border-primary data-[state=checked]:bg-green-500"
              />
            )}
          </div>
        </Card>

        {/* Habits Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg tracking-wider text-foreground">
              DAILY <span className="text-primary">HABITS</span>
            </h3>
            <span className="text-xs font-display tracking-wider text-muted-foreground">
              {HABIT_CONFIG.filter(h => h.key === 'habit_journal' ? journalComplete : (day as any)[h.key]).length}/{HABIT_CONFIG.length}
            </span>
          </div>
          {HABIT_CONFIG.map(({ key, icon: Icon, label, desc }) => {
            const isJournal = key === 'habit_journal';
            const isChecked = isJournal ? journalComplete : (day as any)[key];

            return (
              <div key={key}>
                <Card
                  onClick={() => {
                    if (isJournal) {
                      if (!readOnly) setJournalExpanded(!journalExpanded);
                    } else {
                      handleHabitToggle(key);
                    }
                  }}
                  className={cn(
                    'p-4 border transition-all',
                    readOnly && !isJournal ? '' : 'cursor-pointer',
                    isChecked
                      ? 'border-green-500/40 bg-green-500/5' 
                      : 'border-border/50 hover:border-primary/30',
                    isJournal && journalExpanded && !isChecked ? 'border-primary/40' : ''
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => {
                        if (!isJournal) handleHabitToggle(key);
                        else if (!readOnly) setJournalExpanded(!journalExpanded);
                      }}
                      disabled={isJournal ? true : readOnly}
                      className="w-5 h-5 border-primary data-[state=checked]:bg-green-500"
                    />
                    <Icon className={cn('w-4 h-4', isChecked ? 'text-green-500' : 'text-primary/70')} />
                    <div className="flex-1">
                      <p className="font-display text-xs tracking-[0.15em] text-foreground">{label}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{desc}</p>
                    </div>
                    {isJournal && (
                      journalExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </Card>

                {/* Journal dropdown */}
                <AnimatePresence>
                  {isJournal && journalExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-2 pb-1 px-1 space-y-3">
                        {readOnly ? (
                          <Card className="p-4 border border-border/50 space-y-3">
                            {(() => {
                              let parsed = { wentWell: '', hardest: '', tomorrow: '' };
                              try { parsed = JSON.parse(day.journal_entry || '{}'); } catch { parsed.wentWell = day.journal_entry || ''; }
                              return (
                                <>
                                  {parsed.wentWell && (
                                    <div>
                                      <p className="text-[11px] font-display tracking-wider text-primary mb-1">WHAT WENT WELL</p>
                                      <p className="text-sm text-foreground">{parsed.wentWell}</p>
                                    </div>
                                  )}
                                  {parsed.hardest && (
                                    <div>
                                      <p className="text-[11px] font-display tracking-wider text-primary mb-1">WHAT WAS HARDEST</p>
                                      <p className="text-sm text-foreground">{parsed.hardest}</p>
                                    </div>
                                  )}
                                  {parsed.tomorrow && (
                                    <div>
                                      <p className="text-[11px] font-display tracking-wider text-primary mb-1">WHAT I WILL DO BETTER TOMORROW</p>
                                      <p className="text-sm text-foreground">{parsed.tomorrow}</p>
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </Card>
                        ) : (
                          <>
                            <div>
                              <label className="text-[11px] font-display tracking-[0.15em] text-primary mb-1.5 block">
                                WHAT WENT WELL?
                              </label>
                              <Textarea
                                value={journalWentWell}
                                onChange={e => setJournalWentWell(e.target.value)}
                                placeholder="Today I..."
                                rows={2}
                                className="bg-background border-border/50 text-sm resize-none"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-display tracking-[0.15em] text-primary mb-1.5 block">
                                WHAT WAS HARDEST?
                              </label>
                              <Textarea
                                value={journalHardest}
                                onChange={e => setJournalHardest(e.target.value)}
                                placeholder="I wanted to quit when..."
                                rows={2}
                                className="bg-background border-border/50 text-sm resize-none"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-display tracking-[0.15em] text-primary mb-1.5 block">
                                WHAT WILL I DO BETTER TOMORROW?
                              </label>
                              <Textarea
                                value={journalTomorrow}
                                onChange={e => setJournalTomorrow(e.target.value)}
                                placeholder="Tomorrow I will..."
                                rows={2}
                                className="bg-background border-border/50 text-sm resize-none"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>


        {/* Complete Day */}
        {!readOnly && (
          <div className="space-y-3 pt-2">
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
              <p className="text-[11px] text-center text-muted-foreground font-display tracking-wider">
                COMPLETE SESSION · RUN · ALL 6 HABITS TO FINISH
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
