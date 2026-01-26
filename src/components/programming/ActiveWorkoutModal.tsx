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
import { AIFeedbackView } from './AIFeedbackView';
import { VideoToolView } from './VideoToolView';
import { ProgressMetricsView } from './ProgressMetricsView';
import { RestTimer } from './RestTimer';
import { 
  Square, 
  X,
  Dumbbell,
  ChevronDown,
  ChevronUp,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

type ActiveTool = 'none' | 'logging' | 'notes' | 'feedback' | 'video' | 'progress';

export function ActiveWorkoutModal({
  session,
  onUpdateLog,
  onComplete,
  onCancel,
  open,
  onOpenChange,
}: ActiveWorkoutModalProps) {
  const [activeTool, setActiveTool] = useState<ActiveTool>('none');
  const [showTimer, setShowTimer] = useState(false);
  const [timerExerciseType, setTimerExerciseType] = useState<string>('strength');
  const [sessionNotes, setSessionNotes] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('public');
  const [showExercises, setShowExercises] = useState(false);

  const exerciseLogs = session.exercise_logs || [];
  const completedSets = exerciseLogs.filter((l) => l.completed).length;
  const totalSets = exerciseLogs.length;
  const progressPercent = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

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
    setShowTimer(true);
  };

  const handleSaveNotes = (notes: string, vis: 'public' | 'friends' | 'private') => {
    setSessionNotes(notes);
    setVisibility(vis);
  };

  const handleFinish = () => {
    onComplete(sessionNotes, visibility);
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
        {activeTool === 'feedback' && (
          <AIFeedbackView
            sessionId={session.id}
            onClose={() => setActiveTool('none')}
          />
        )}
        {activeTool === 'video' && (
          <VideoToolView
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

          {/* Exercise List (Collapsed by default) */}
          <Card className="border-border bg-card">
            <button
              onClick={() => setShowExercises(!showExercises)}
              className="w-full p-4 flex items-center justify-between"
            >
              <span className="font-display text-foreground tracking-wide">
                EXERCISES ({Object.keys(exerciseGroups).length})
              </span>
              {showExercises ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
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
                    {Object.values(exerciseGroups).map((exercise) => (
                      <div
                        key={exercise.name}
                        className="flex items-center justify-between p-3 rounded-lg bg-surface border border-border"
                      >
                        <div className="flex items-center gap-2">
                          {exercise.completed === exercise.sets && (
                            <Check className="w-4 h-4 text-green-500" />
                          )}
                          <span className="text-sm text-foreground">{exercise.name}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {exercise.completed}/{exercise.sets}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Rest Timer */}
          {showTimer && (
            <RestTimer
              exerciseType={timerExerciseType as 'strength' | 'hypertrophy'}
              onComplete={() => setShowTimer(false)}
            />
          )}

          {/* Action Tiles */}
          <SessionActionTiles
            onOpenLogging={() => setActiveTool('logging')}
            onOpenNotes={() => setActiveTool('notes')}
            onOpenFeedback={() => setActiveTool('feedback')}
            onOpenVideo={() => setActiveTool('video')}
            onOpenProgress={() => setActiveTool('progress')}
            completedSets={completedSets}
            totalSets={totalSets}
            hasNotes={!!sessionNotes}
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
