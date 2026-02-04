import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { WorkoutSession } from '@/hooks/useWorkoutSessions';
import { SessionActionTiles } from './SessionActionTiles';
import { SessionLoggingView } from './SessionLoggingView';
import { SessionNotesView } from './SessionNotesView';
import { SessionResultsView } from './SessionResultsView';
import { AIFeedbackView } from './AIFeedbackView';
import { ProgressMetricsView } from './ProgressMetricsView';
import { CompactRestTimer } from './CompactRestTimer';
import { 
  Square, 
  X,
  Dumbbell,
  ChevronDown,
  ChevronUp,
  Check,
  Info,
  Lightbulb
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getExerciseDetails } from '@/lib/exerciseLibrary';

interface ActiveWorkoutModalProps {
  session: WorkoutSession;
  onUpdateLog: (logId: string, data: {
    actualReps?: number;
    weightKg?: number;
    rpe?: number;
    completed?: boolean;
    notes?: string;
  }) => void;
  onComplete: (notes?: string, visibility?: 'public' | 'friends' | 'private') => void;
  onCancel: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ActiveTool = 'none' | 'logging' | 'notes' | 'feedback' | 'progress' | 'results';

export function ActiveWorkoutModal({
  session,
  onUpdateLog,
  onComplete,
  onCancel,
  open,
  onOpenChange,
}: ActiveWorkoutModalProps) {
  const [activeTool, setActiveTool] = useState<ActiveTool>('none');
  const [timerExerciseType, setTimerExerciseType] = useState<string>('strength');
  const [sessionNotes, setSessionNotes] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('public');
  const [showExercises, setShowExercises] = useState(false);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

  const exerciseLogs = session.exercise_logs || [];
  const completedSets = exerciseLogs.filter((l) => l.completed).length;
  const totalSets = exerciseLogs.length;
  const progressPercent = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;
  const isCompleted = session.status === 'completed';

  // Group exercises for display
  const exerciseGroups = exerciseLogs.reduce((acc, log) => {
    if (!acc[log.exercise_name]) {
      acc[log.exercise_name] = { name: log.exercise_name, equipment: log.equipment, sets: 0, completed: 0 };
    }
    acc[log.exercise_name].sets++;
    if (log.completed) acc[log.exercise_name].completed++;
    return acc;
  }, {} as Record<string, { name: string; equipment: string; sets: number; completed: number }>);

  const handleStartRest = (exerciseType: string) => {
    setTimerExerciseType(exerciseType);
  };

  const handleSaveNotes = (notes: string, vis: 'public' | 'friends' | 'private') => {
    setSessionNotes(notes);
    setVisibility(vis);
  };

  const handleFinish = () => {
    onComplete(sessionNotes, visibility);
  };

  const toggleExerciseDetails = (exerciseName: string) => {
    setExpandedExercise(expandedExercise === exerciseName ? null : exerciseName);
  };

  // Render full-screen tool views
  if (activeTool !== 'none') {
    return (
      <AnimatePresence mode="wait">
        {activeTool === 'logging' && (
          <SessionLoggingView
            exerciseLogs={exerciseLogs}
            onUpdateLog={onUpdateLog}
            onStartRest={handleStartRest}
            onClose={() => setActiveTool('none')}
          />
        )}
        {activeTool === 'notes' && (
          <SessionNotesView
            initialNotes={sessionNotes}
            initialVisibility={visibility}
            onSave={handleSaveNotes}
            onClose={() => setActiveTool('none')}
          />
        )}
        {activeTool === 'results' && (
          <SessionResultsView
            session={session}
            onClose={() => setActiveTool('none')}
            onViewFeedback={() => setActiveTool('feedback')}
          />
        )}
        {activeTool === 'feedback' && (
          <AIFeedbackView
            sessionId={session.id}
            onClose={() => setActiveTool('none')}
          />
        )}
        {activeTool === 'progress' && (
          <ProgressMetricsView
            onClose={() => setActiveTool('none')}
          />
        )}
      </AnimatePresence>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <DialogHeader className="p-4 pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="font-display text-lg">
                  {session.session_type}
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Week {session.week_number} • {session.day_name}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-4 space-y-4">
          {/* Progress Card */}
          <Card className="p-4 border-primary/30 bg-primary/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Session Progress</span>
              <span className="font-display text-lg text-foreground">
                {completedSets}/{totalSets} sets
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </Card>

          {/* Exercise List with Tips/Alternatives Dropdown */}
          <Card className="border-border bg-card">
            <button
              onClick={() => setShowExercises(!showExercises)}
              className="w-full p-4 flex items-center justify-between"
            >
              <span className="font-display text-foreground tracking-wide">
                EXERCISES ({Object.keys(exerciseGroups).length})
              </span>
              {showExercises ? (
                <ChevronUp className="w-5 h-5 text-primary" />
              ) : (
                <ChevronDown className="w-5 h-5 text-primary" />
              )}
            </button>
            
            <AnimatePresence>
              {showExercises && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-2">
                    {Object.values(exerciseGroups).map((exercise) => {
                      const details = getExerciseDetails(exercise.name);
                      const isExpanded = expandedExercise === exercise.name;

                      return (
                        <div key={exercise.name} className="rounded-lg border border-border bg-surface overflow-hidden">
                          {/* Exercise Header - Clickable */}
                          <button
                            onClick={() => toggleExerciseDetails(exercise.name)}
                            className="w-full p-3 flex items-center justify-between hover:bg-muted/30 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              {exercise.completed === exercise.sets && (
                                <Check className="w-4 h-4 text-primary" />
                              )}
                              <span className="text-sm text-foreground">{exercise.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {exercise.completed}/{exercise.sets}
                              </Badge>
                              {details.exercise && (
                                <Info className="w-4 h-4 text-muted-foreground" />
                              )}
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                              )}
                            </div>
                          </button>

                          {/* Tips & Alternatives Dropdown */}
                          <AnimatePresence>
                            {isExpanded && details.exercise && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden border-t border-border"
                              >
                                <div className="p-3 space-y-3 bg-muted/20">
                                  {/* Description */}
                                  {details.exercise?.description && (
                                    <p className="text-xs text-muted-foreground">
                                      {details.exercise.description}
                                    </p>
                                  )}

                                  {/* How-to steps (generated) */}
                                  {details.steps.length > 0 && (
                                    <div>
                                      <span className="text-xs font-display text-muted-foreground tracking-wide">
                                        HOW TO
                                      </span>
                                      <ol className="mt-1 space-y-1 list-decimal list-inside text-xs text-muted-foreground">
                                        {details.steps.slice(0, 6).map((step, idx) => (
                                          <li key={idx}>{step}</li>
                                        ))}
                                      </ol>
                                    </div>
                                  )}

                                  {/* Tips */}
                                  {details.exercise?.tips && details.exercise.tips.length > 0 && (
                                    <div>
                                      <div className="flex items-center gap-1 mb-2">
                                        <Lightbulb className="w-3 h-3 text-primary" />
                                        <span className="text-xs font-display text-primary tracking-wide">TIPS</span>
                                      </div>
                                      <ul className="space-y-1">
                                        {details.exercise.tips.map((tip, idx) => (
                                          <li key={idx} className="text-xs text-muted-foreground flex gap-2">
                                            <span className="text-primary">•</span>
                                            {tip}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* Alternatives */}
                                  {details.exercise?.alternatives && details.exercise.alternatives.length > 0 && (
                                    <div>
                                      <span className="text-xs font-display text-muted-foreground tracking-wide">
                                        ALTERNATIVES:
                                      </span>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {details.exercise.alternatives.map((alt, idx) => (
                                          <Badge key={idx} variant="outline" className="text-xs">
                                            {alt}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* No details available message */}
                          {isExpanded && !details.exercise && (
                            <div className="p-3 text-xs text-muted-foreground border-t border-border bg-muted/20">
                              No additional details available for this exercise.
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Always-visible Rest Timer */}
          <CompactRestTimer
            exerciseType={timerExerciseType as 'strength' | 'hypertrophy'}
            onComplete={() => {}}
            onDismiss={() => {}}
          />

          {/* Action Tiles */}
          <SessionActionTiles
            onOpenLogging={() => setActiveTool('logging')}
            onOpenNotes={() => setActiveTool('notes')}
            onOpenFeedback={() => setActiveTool('feedback')}
            onOpenProgress={() => setActiveTool('progress')}
            onOpenResults={isCompleted ? () => setActiveTool('results') : undefined}
            completedSets={completedSets}
            totalSets={totalSets}
            hasNotes={!!sessionNotes}
            isCompleted={isCompleted}
          />

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={onCancel}
              className="gap-1 text-destructive hover:text-destructive"
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
            <Button
              onClick={handleFinish}
              className="flex-1 gap-2"
              disabled={completedSets === 0}
            >
              <Square className="w-4 h-4" />
              Complete Session
            </Button>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}
