import { useState, useMemo, useCallback, useEffect } from 'react';
import { FullScreenToolView } from './FullScreenToolView';
import { RestTimer } from './RestTimer';
import { ExerciseLog } from '@/hooks/useWorkoutSessions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Target,
  Dumbbell,
  ChevronRight,
  ChevronLeft,
  Check,
  SkipForward,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GuidedSessionViewProps {
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

interface LocalInputState {
  reps: string;
  weight: string;
  rpe: string;
}

export function GuidedSessionView({
  exerciseLogs,
  onUpdateLog,
  onStartRest,
  onClose,
}: GuidedSessionViewProps) {
  // Create ordered list of all sets
  const orderedSets = useMemo(() => {
    // Group by exercise first, then flatten maintaining exercise order
    const groups = new Map<string, ExerciseLog[]>();
    exerciseLogs.forEach(log => {
      const existing = groups.get(log.exercise_name) || [];
      groups.set(log.exercise_name, [...existing, log].sort((a, b) => a.set_number - b.set_number));
    });
    return Array.from(groups.values()).flat();
  }, [exerciseLogs]);

  // Find first incomplete set index
  const firstIncompleteIndex = useMemo(() => {
    const idx = orderedSets.findIndex(s => !s.completed);
    return idx >= 0 ? idx : orderedSets.length - 1;
  }, [orderedSets]);

  const [currentIndex, setCurrentIndex] = useState(firstIncompleteIndex);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [localInput, setLocalInput] = useState<LocalInputState>({ reps: '', weight: '', rpe: '' });

  const currentSet = orderedSets[currentIndex];
  const completedCount = orderedSets.filter(s => s.completed).length;
  const progressPercent = (completedCount / orderedSets.length) * 100;

  // Get current exercise info
  const currentExerciseSets = useMemo(() => {
    if (!currentSet) return [];
    return orderedSets.filter(s => s.exercise_name === currentSet.exercise_name);
  }, [currentSet, orderedSets]);

  const currentSetInExercise = currentExerciseSets.findIndex(s => s.id === currentSet?.id) + 1;

  // Initialize local input when set changes
  useEffect(() => {
    if (currentSet) {
      setLocalInput({
        reps: currentSet.actual_reps?.toString() || '',
        weight: currentSet.weight_kg?.toString() || '',
        rpe: currentSet.rpe?.toString() || '',
      });
    }
  }, [currentSet?.id]);

  const handleInputChange = useCallback((field: keyof LocalInputState, value: string) => {
    setLocalInput(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleCompleteSet = useCallback(() => {
    if (!currentSet) return;

    // Save current values
    onUpdateLog(currentSet.id, {
      actualReps: localInput.reps ? parseInt(localInput.reps) : undefined,
      weightKg: localInput.weight ? parseFloat(localInput.weight) : undefined,
      rpe: localInput.rpe ? parseFloat(localInput.rpe) : undefined,
      completed: true,
    });

    // Show rest timer
    const exerciseType = ['barbell', 'dumbbell'].includes(currentSet.equipment) ? 'strength' : 'bodyweight';
    onStartRest(exerciseType);
    setShowRestTimer(true);
  }, [currentSet, localInput, onUpdateLog, onStartRest]);

  const handleRestComplete = useCallback(() => {
    setShowRestTimer(false);
    // Auto-advance to next incomplete set
    const nextIncomplete = orderedSets.findIndex((s, i) => i > currentIndex && !s.completed);
    if (nextIncomplete >= 0) {
      setCurrentIndex(nextIncomplete);
    } else if (currentIndex < orderedSets.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, orderedSets]);

  const handleSkip = useCallback(() => {
    if (currentIndex < orderedSets.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, orderedSets.length]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  if (!currentSet) {
    return (
      <FullScreenToolView
        title="GUIDED SESSION"
        subtitle="All sets completed!"
        icon={<Target className="w-5 h-5" />}
        onClose={onClose}
      >
        <Card className="p-8 text-center border-primary/30 bg-primary/5 max-w-md mx-auto">
          <Check className="w-16 h-16 text-primary mx-auto mb-4" />
          <h3 className="font-display text-2xl text-foreground mb-2">SESSION COMPLETE!</h3>
          <p className="text-muted-foreground mb-6">You've completed all {orderedSets.length} sets.</p>
          <Button onClick={onClose} className="gap-2">
            <Check className="w-4 h-4" />
            Finish Session
          </Button>
        </Card>
      </FullScreenToolView>
    );
  }

  return (
    <FullScreenToolView
      title="GUIDED SESSION"
      subtitle={`${completedCount}/${orderedSets.length} sets complete`}
      icon={<Target className="w-5 h-5" />}
      onClose={onClose}
    >
      <div className="space-y-6 max-w-md mx-auto">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Session Progress</span>
            <span className="text-foreground font-medium">{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Rest Timer Overlay */}
        <AnimatePresence>
          {showRestTimer && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm"
            >
              <div className="w-full max-w-sm mx-4">
                <RestTimer
                  exerciseType={['barbell', 'dumbbell'].includes(currentSet.equipment) ? 'strength' : 'hypertrophy'}
                  onComplete={handleRestComplete}
                />
                <Button
                  variant="outline"
                  onClick={handleRestComplete}
                  className="w-full mt-4"
                >
                  Skip Rest
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Current Set Card */}
        <Card className="p-6 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5">
          {/* Exercise Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center neon-border-subtle">
              <Dumbbell className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="font-display text-xl text-foreground">{currentSet.exercise_name}</h2>
              <p className="text-sm text-muted-foreground">
                Set {currentSetInExercise} of {currentExerciseSets.length}
              </p>
            </div>
            {currentSet.completed && (
              <Badge className="bg-green-500">Complete</Badge>
            )}
          </div>

          {/* Target */}
          <div className="p-3 rounded-lg bg-muted/50 mb-6">
            <p className="text-sm text-muted-foreground">Target</p>
            <p className="font-display text-lg text-foreground">
              {currentSet.target_reps || '8-12'} reps
            </p>
          </div>

          {/* Input Fields */}
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Weight (kg)</label>
                <Input
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  value={localInput.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  className="h-12 text-center text-lg font-display"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Reps</label>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={localInput.reps}
                  onChange={(e) => handleInputChange('reps', e.target.value)}
                  className="h-12 text-center text-lg font-display"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">RPE</label>
                <Input
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  min="1"
                  max="10"
                  value={localInput.rpe}
                  onChange={(e) => handleInputChange('rpe', e.target.value)}
                  className="h-12 text-center text-lg font-display"
                  placeholder="7"
                />
              </div>
            </div>

            {/* Complete Button */}
            <Button
              onClick={handleCompleteSet}
              disabled={currentSet.completed}
              className="w-full h-14 text-lg font-display gap-2"
              size="lg"
            >
              <Check className="w-5 h-5" />
              {currentSet.completed ? 'COMPLETED' : 'COMPLETE SET'}
            </Button>
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="flex-1 gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={currentIndex >= orderedSets.length - 1}
            className="flex-1 gap-2"
          >
            Skip
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>

        {/* Set Navigator */}
        <div className="flex flex-wrap gap-2 justify-center">
          {orderedSets.map((set, idx) => {
            const isCurrent = idx === currentIndex;
            const isNewExercise = idx === 0 || orderedSets[idx - 1].exercise_name !== set.exercise_name;
            
            return (
              <button
                key={set.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-8 h-8 rounded-full text-xs font-medium transition-all ${
                  isCurrent
                    ? 'bg-primary text-primary-foreground scale-110'
                    : set.completed
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                } ${isNewExercise && idx > 0 ? 'ml-3' : ''}`}
              >
                {set.set_number}
              </button>
            );
          })}
        </div>
      </div>
    </FullScreenToolView>
  );
}
