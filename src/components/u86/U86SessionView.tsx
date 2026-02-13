import { useState, useMemo, useCallback } from 'react';
import { FullScreenToolView } from '@/components/programming/FullScreenToolView';
import { CompactRestTimer } from '@/components/programming/CompactRestTimer';
import { ExerciseCoachingPanel } from '@/components/programming/ExerciseCoachingPanel';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  ClipboardList, Dumbbell, Check, ChevronDown, ChevronUp, BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { findCoachingDataByName } from '@/lib/exerciseCoachingData';
import { cn } from '@/lib/utils';

interface U86SessionViewProps {
  exercises: any[];
  dayNumber: number;
  onUpdateExercises: (exercises: any[]) => void;
  onClose: () => void;
}

export function U86SessionView({ exercises, dayNumber, onUpdateExercises, onClose }: U86SessionViewProps) {
  const [expandedExercise, setExpandedExercise] = useState<number>(0);
  const [showCoachingFor, setShowCoachingFor] = useState<number | null>(null);
  const [showTimer, setShowTimer] = useState(false);

  // Count completed sets
  const totalSets = exercises.reduce((acc, ex) => acc + (ex.sets?.length || 0), 0);
  const completedSets = exercises.reduce((acc, ex) => {
    return acc + (ex.logged || []).filter((s: any) => s.completed).length;
  }, 0);
  const progressPercent = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

  const handleSetUpdate = useCallback((exerciseIndex: number, setIndex: number, field: string, value: any) => {
    const updated = exercises.map((ex, ei) => {
      if (ei !== exerciseIndex) return ex;
      const newLogged = (ex.logged || []).map((s: any, si: number) => {
        if (si !== setIndex) return s;
        return { ...s, [field]: value };
      });
      return { ...ex, logged: newLogged };
    });
    onUpdateExercises(updated);
  }, [exercises, onUpdateExercises]);

  const handleSetComplete = useCallback((exerciseIndex: number, setIndex: number, completed: boolean) => {
    handleSetUpdate(exerciseIndex, setIndex, 'completed', completed);
    if (completed) {
      setShowTimer(true);
    }
  }, [handleSetUpdate]);

  return (
    <FullScreenToolView
      title={`DAY ${dayNumber} — STRENGTH`}
      subtitle={`${completedSets}/${totalSets} sets complete`}
      icon={<ClipboardList className="w-5 h-5" />}
      onClose={onClose}
    >
      <ScrollArea className={`h-[calc(100vh-180px)] ${showTimer ? 'pb-28' : ''}`}>
        <div className="space-y-4 max-w-2xl mx-auto pb-8">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Session Progress</span>
              <span className="text-foreground font-medium">{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          {/* Exercise Cards */}
          {exercises.map((ex, i) => {
            const isExpanded = expandedExercise === i;
            const sets = ex.sets || [];
            const logged = ex.logged || [];
            const setsComplete = logged.filter((s: any) => s.completed).length;
            const exerciseComplete = setsComplete === sets.length && sets.length > 0;
            const coachingData = findCoachingDataByName(ex.name);
            const showingCoaching = showCoachingFor === i;
            const equipType = ex.equipment || 'bodyweight';

            return (
              <Card
                key={i}
                className={cn(
                  'border transition-colors',
                  exerciseComplete ? 'border-green-500/30 bg-green-500/5' : 'border-border bg-card'
                )}
              >
                {/* Exercise Header */}
                <button
                  onClick={() => setExpandedExercise(isExpanded ? -1 : i)}
                  className="w-full p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'flex items-center justify-center w-8 h-8 rounded-md border',
                      equipType === 'barbell' ? 'bg-primary/20 text-primary border-primary/30' :
                      equipType === 'dumbbell' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                      'bg-green-500/20 text-green-400 border-green-500/30'
                    )}>
                      <Dumbbell className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="font-display text-foreground text-sm">{ex.name}</span>
                      <p className="text-xs text-muted-foreground">{ex.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {exerciseComplete && <Check className="w-5 h-5 text-green-500" />}
                    <span className="text-sm text-muted-foreground">
                      {setsComplete}/{sets.length}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-3">
                        {/* Coaching Toggle */}
                        {coachingData && (
                          <button
                            onClick={() => setShowCoachingFor(showingCoaching ? null : i)}
                            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
                          >
                            <BookOpen className="w-4 h-4" />
                            {showingCoaching ? 'Hide Coaching Guide' : 'View Full Coaching Guide'}
                          </button>
                        )}

                        <AnimatePresence>
                          {showingCoaching && coachingData && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="rounded-lg bg-muted/20 border border-border/50 p-4 overflow-hidden"
                            >
                              <ExerciseCoachingPanel coachingData={coachingData} exerciseName={ex.name} />
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Header Row */}
                        <div className="grid grid-cols-12 gap-2 text-xs text-muted-foreground px-1 font-display tracking-wider">
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
                              'grid grid-cols-12 gap-2 items-center',
                              logEntry.completed && 'opacity-60'
                            )}>
                              <div className="col-span-1">
                                <span className="font-display text-primary">{setInfo.set}</span>
                              </div>
                              <div className="col-span-3">
                                <div className="text-xs text-muted-foreground">
                                  <span>{setInfo.targetReps}</span>
                                  <span className="block text-[10px] text-muted-foreground/60">{setInfo.suggestedWeight}</span>
                                </div>
                              </div>
                              <div className="col-span-2">
                                <Input
                                  type="number"
                                  inputMode="numeric"
                                  placeholder="—"
                                  value={logEntry.reps ?? ''}
                                  onChange={(e) => handleSetUpdate(i, si, 'reps', e.target.value ? parseInt(e.target.value) : null)}
                                  className="h-9 text-center text-sm px-1"
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
                                  className="h-9 text-center text-sm px-1"
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
                                  className="h-9 text-center text-sm px-1"
                                />
                              </div>
                              <div className="col-span-2 flex justify-center">
                                <Checkbox
                                  checked={logEntry.completed}
                                  onCheckedChange={(checked) => handleSetComplete(i, si, !!checked)}
                                  className="h-6 w-6"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            );
          })}
        </div>
      </ScrollArea>

      {/* Rest Timer */}
      {showTimer && (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-50">
          <CompactRestTimer
            exerciseType="strength"
            onComplete={() => setShowTimer(false)}
            onDismiss={() => setShowTimer(false)}
          />
        </div>
      )}
    </FullScreenToolView>
  );
}
