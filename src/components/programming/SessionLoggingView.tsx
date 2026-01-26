import { useState, useMemo, useCallback } from 'react';
import { FullScreenToolView } from './FullScreenToolView';
import { ExerciseLog } from '@/hooks/useWorkoutSessions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ClipboardList, 
  Dumbbell, 
  Battery, 
  Footprints,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SessionLoggingViewProps {
  exerciseLogs: ExerciseLog[];
  onUpdateLog: (logId: string, data: {
    actualReps?: number;
    weightKg?: number;
    rpe?: number;
    completed?: boolean;
    notes?: string;
  }) => void;
  onStartRest: (exerciseType: string) => void;
  onClose: () => void;
}

const equipmentIcons: Record<string, React.ReactNode> = {
  barbell: <Dumbbell className="w-4 h-4" />,
  dumbbell: <Dumbbell className="w-4 h-4" />,
  bodyweight: <Battery className="w-4 h-4" />,
  running: <Footprints className="w-4 h-4" />,
};

const equipmentColors: Record<string, string> = {
  barbell: 'bg-primary/20 text-primary border-primary/30',
  dumbbell: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  bodyweight: 'bg-green-500/20 text-green-400 border-green-500/30',
  running: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

// Stable grouping function that preserves order based on first occurrence
function groupByExercise(logs: ExerciseLog[]): Array<[string, ExerciseLog[]]> {
  const groups: Map<string, ExerciseLog[]> = new Map();
  
  // Sort logs by set_number first to ensure consistent order
  const sortedLogs = [...logs].sort((a, b) => {
    // First by exercise name order (preserved by Map insertion order)
    // Then by set number
    return a.set_number - b.set_number;
  });
  
  sortedLogs.forEach((log) => {
    const existing = groups.get(log.exercise_name);
    if (existing) {
      existing.push(log);
    } else {
      groups.set(log.exercise_name, [log]);
    }
  });
  
  // Sort sets within each exercise group by set_number
  groups.forEach((logs) => {
    logs.sort((a, b) => a.set_number - b.set_number);
  });
  
  return Array.from(groups.entries());
}

// Local state manager for input values to prevent re-renders during typing
interface LocalInputState {
  [logId: string]: {
    reps: string;
    weight: string;
  };
}

export function SessionLoggingView({
  exerciseLogs,
  onUpdateLog,
  onStartRest,
  onClose,
}: SessionLoggingViewProps) {
  // Memoize the grouped exercises to prevent recalculation on every render
  const groupedExercises = useMemo(() => groupByExercise(exerciseLogs), [exerciseLogs]);
  
  const [expandedExercise, setExpandedExercise] = useState<string | null>(
    groupedExercises[0]?.[0] || null
  );
  
  // Local input state to prevent re-renders during typing
  const [localInputs, setLocalInputs] = useState<LocalInputState>(() => {
    const initial: LocalInputState = {};
    exerciseLogs.forEach((log) => {
      initial[log.id] = {
        reps: log.actual_reps?.toString() || '',
        weight: log.weight_kg?.toString() || '',
      };
    });
    return initial;
  });
  
  const completedCount = exerciseLogs.filter((l) => l.completed).length;
  const totalCount = exerciseLogs.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Handle local input change without triggering mutation
  const handleLocalInputChange = useCallback((logId: string, field: 'reps' | 'weight', value: string) => {
    setLocalInputs((prev) => ({
      ...prev,
      [logId]: {
        ...prev[logId],
        [field]: value,
      },
    }));
  }, []);

  // Persist to backend on blur
  const handleInputBlur = useCallback((logId: string, field: 'reps' | 'weight') => {
    const localValue = localInputs[logId]?.[field];
    if (localValue === undefined) return;
    
    const numValue = field === 'reps' 
      ? parseInt(localValue) || undefined
      : parseFloat(localValue) || undefined;
    
    if (field === 'reps') {
      onUpdateLog(logId, { actualReps: numValue });
    } else {
      onUpdateLog(logId, { weightKg: numValue });
    }
  }, [localInputs, onUpdateLog]);

  const handleSetComplete = useCallback((log: ExerciseLog, completed: boolean) => {
    // Also persist current input values when completing
    const localValue = localInputs[log.id];
    const updates: Parameters<typeof onUpdateLog>[1] = { completed };
    
    if (localValue?.reps) {
      updates.actualReps = parseInt(localValue.reps) || undefined;
    }
    if (localValue?.weight) {
      updates.weightKg = parseFloat(localValue.weight) || undefined;
    }
    
    onUpdateLog(log.id, updates);
    
    if (completed) {
      // Pass exercise type based on equipment for rest timer presets
      const exerciseType = ['barbell', 'dumbbell'].includes(log.equipment) ? 'strength' : 'bodyweight';
      onStartRest(exerciseType);
    }
  }, [localInputs, onUpdateLog, onStartRest]);

  // Get local input value or fall back to log value
  const getInputValue = useCallback((logId: string, field: 'reps' | 'weight', logValue: number | null) => {
    if (localInputs[logId]?.[field] !== undefined) {
      return localInputs[logId][field];
    }
    return logValue?.toString() || '';
  }, [localInputs]);

  return (
    <FullScreenToolView
      title="LOG SESSION"
      subtitle={`${completedCount}/${totalCount} sets complete`}
      icon={<ClipboardList className="w-5 h-5" />}
      onClose={onClose}
    >
      <ScrollArea className="h-[calc(100vh-180px)]">
        <div className="space-y-4 max-w-2xl mx-auto pb-8">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-foreground font-medium">{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          {/* Exercise Cards */}
          {groupedExercises.map(([exerciseName, logs]) => {
            const isExpanded = expandedExercise === exerciseName;
            const exerciseComplete = logs.every((l) => l.completed);
            const setsComplete = logs.filter((l) => l.completed).length;
            const firstLog = logs[0];

            return (
              <Card
                key={exerciseName}
                className={`border transition-colors ${
                  exerciseComplete ? 'border-green-500/30 bg-green-500/5' : 'border-border bg-card'
                }`}
              >
                <button
                  onClick={() => setExpandedExercise(isExpanded ? null : exerciseName)}
                  className="w-full p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-md border ${equipmentColors[firstLog?.equipment] || 'bg-muted'}`}>
                      {equipmentIcons[firstLog?.equipment] || <Dumbbell className="w-4 h-4" />}
                    </div>
                    <span className="font-display text-foreground">{exerciseName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {exerciseComplete && <Check className="w-5 h-5 text-green-500" />}
                    <span className="text-sm text-muted-foreground">
                      {setsComplete}/{logs.length}
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
                        {/* Header Row */}
                        <div className="grid grid-cols-12 gap-2 text-xs text-muted-foreground px-1">
                          <div className="col-span-1">Set</div>
                          <div className="col-span-3">Target</div>
                          <div className="col-span-3">Reps</div>
                          <div className="col-span-3">Weight</div>
                          <div className="col-span-2 text-center">Done</div>
                        </div>

                        {/* Use stable log.id as key - logs are pre-sorted */}
                        {logs.map((log) => (
                          <div key={log.id} className="grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-1">
                              <span className="font-display text-primary">{log.set_number}</span>
                            </div>
                            <div className="col-span-3">
                              <span className="text-sm text-muted-foreground">{log.target_reps || '-'}</span>
                            </div>
                            <div className="col-span-3">
                              <Input
                                type="number"
                                inputMode="numeric"
                                placeholder="Reps"
                                value={getInputValue(log.id, 'reps', log.actual_reps)}
                                onChange={(e) => handleLocalInputChange(log.id, 'reps', e.target.value)}
                                onBlur={() => handleInputBlur(log.id, 'reps')}
                                className="h-10 text-center"
                              />
                            </div>
                            <div className="col-span-3">
                              <Input
                                type="number"
                                inputMode="decimal"
                                placeholder="kg"
                                step="0.5"
                                value={getInputValue(log.id, 'weight', log.weight_kg)}
                                onChange={(e) => handleLocalInputChange(log.id, 'weight', e.target.value)}
                                onBlur={() => handleInputBlur(log.id, 'weight')}
                                className="h-10 text-center"
                              />
                            </div>
                            <div className="col-span-2 flex justify-center">
                              <Checkbox
                                checked={log.completed}
                                onCheckedChange={(checked) => handleSetComplete(log, !!checked)}
                                className="h-6 w-6"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </FullScreenToolView>
  );
}
