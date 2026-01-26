import { useState } from 'react';
import { FullScreenToolView } from './FullScreenToolView';
import { ExerciseLog } from '@/hooks/useWorkoutSessions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
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

function groupByExercise(logs: ExerciseLog[]) {
  const groups: Record<string, ExerciseLog[]> = {};
  logs.forEach((log) => {
    if (!groups[log.exercise_name]) {
      groups[log.exercise_name] = [];
    }
    groups[log.exercise_name].push(log);
  });
  return Object.entries(groups);
}

export function SessionLoggingView({
  exerciseLogs,
  onUpdateLog,
  onStartRest,
  onClose,
}: SessionLoggingViewProps) {
  const [expandedExercise, setExpandedExercise] = useState<string | null>(
    groupByExercise(exerciseLogs)[0]?.[0] || null
  );
  
  const groupedExercises = groupByExercise(exerciseLogs);
  const completedCount = exerciseLogs.filter((l) => l.completed).length;
  const totalCount = exerciseLogs.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleSetComplete = (log: ExerciseLog, completed: boolean) => {
    onUpdateLog(log.id, { completed });
    if (completed) {
      onStartRest(log.equipment);
    }
  };

  return (
    <FullScreenToolView
      title="LOG SESSION"
      subtitle={`${completedCount}/${totalCount} sets complete`}
      icon={<ClipboardList className="w-5 h-5" />}
      onClose={onClose}
    >
      <div className="space-y-4 max-w-2xl mx-auto">
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
                  <Badge variant="outline" className={`${equipmentColors[logs[0].equipment] || ''} gap-1`}>
                    {equipmentIcons[logs[0].equipment]}
                  </Badge>
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
                        <div className="col-span-2 text-center">✓</div>
                      </div>

                      {logs.map((log) => (
                        <div key={log.id} className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-1">
                            <span className="font-display text-primary">{log.set_number}</span>
                          </div>
                          <div className="col-span-3">
                            <span className="text-sm text-muted-foreground">{log.target_reps}</span>
                          </div>
                          <div className="col-span-3">
                            <Input
                              type="number"
                              placeholder="Reps"
                              value={log.actual_reps || ''}
                              onChange={(e) => onUpdateLog(log.id, { actualReps: parseInt(e.target.value) || undefined })}
                              className="h-10 text-center"
                            />
                          </div>
                          <div className="col-span-3">
                            <Input
                              type="number"
                              placeholder="kg"
                              step="2.5"
                              value={log.weight_kg || ''}
                              onChange={(e) => onUpdateLog(log.id, { weightKg: parseFloat(e.target.value) || undefined })}
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
    </FullScreenToolView>
  );
}
