import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkoutLogger } from './WorkoutLogger';
import { RestTimer } from './RestTimer';
import { WorkoutSession } from '@/hooks/useWorkoutSessions';
import { 
  Play, 
  Pause, 
  Square, 
  Clock,
  Zap,
  List,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';

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

export function ActiveWorkoutModal({
  session,
  onUpdateLog,
  onComplete,
  onCancel,
  open,
  onOpenChange,
}: ActiveWorkoutModalProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [mode, setMode] = useState<'quick' | 'guided'>('quick');
  const [showTimer, setShowTimer] = useState(false);
  const [timerExerciseType, setTimerExerciseType] = useState<string>('strength');
  const [showFinish, setShowFinish] = useState(false);
  const [finishNotes, setFinishNotes] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('public');

  const exerciseLogs = session.exercise_logs || [];
  const completedSets = exerciseLogs.filter((l) => l.completed).length;
  const totalSets = exerciseLogs.length;

  // Timer for session duration
  useEffect(() => {
    if (!isPaused && open) {
      const startTime = new Date(session.started_at).getTime();
      const updateTimer = () => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      };
      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [isPaused, session.started_at, open]);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRest = (exerciseType: string) => {
    setTimerExerciseType(exerciseType);
    setShowTimer(true);
  };

  const handleFinish = () => {
    onComplete(finishNotes, visibility);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="font-display text-xl">
                {session.session_type}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Week {session.week_number} • {session.day_name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Clock className="w-3 h-3" />
                {formatDuration(elapsedTime)}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsPaused(!isPaused)}
              >
                {isPaused ? (
                  <Play className="w-4 h-4" />
                ) : (
                  <Pause className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </DialogHeader>

        {showFinish ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h3 className="font-display text-lg">Finish Workout</h3>
            
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                How did it go? (optional)
              </label>
              <Textarea
                placeholder="Add notes about your workout..."
                value={finishNotes}
                onChange={(e) => setFinishNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Who can see this?
              </label>
              <Select value={visibility} onValueChange={(v) => setVisibility(v as typeof visibility)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Everyone</SelectItem>
                  <SelectItem value="friends">Friends Only</SelectItem>
                  <SelectItem value="private">Only Me</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowFinish(false)} className="flex-1">
                Back
              </Button>
              <Button onClick={handleFinish} className="flex-1 gap-2">
                <Square className="w-4 h-4" />
                Finish Workout
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {/* Mode Toggle */}
            <div className="flex items-center justify-between">
              <Tabs value={mode} onValueChange={(v) => setMode(v as 'quick' | 'guided')}>
                <TabsList>
                  <TabsTrigger value="quick" className="gap-1">
                    <List className="w-4 h-4" />
                    Quick Log
                  </TabsTrigger>
                  <TabsTrigger value="guided" className="gap-1">
                    <Zap className="w-4 h-4" />
                    Guided
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Button
                variant={showTimer ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowTimer(!showTimer)}
                className="gap-1"
              >
                <Clock className="w-4 h-4" />
                Timer
              </Button>
            </div>

            {/* Rest Timer */}
            {showTimer && (
              <RestTimer
                exerciseType={timerExerciseType as 'strength' | 'hypertrophy'}
                onComplete={() => setShowTimer(false)}
              />
            )}

            {/* Workout Logger */}
            <WorkoutLogger
              exerciseLogs={exerciseLogs}
              onUpdateLog={onUpdateLog}
              onStartRest={handleStartRest}
              mode={mode}
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
                onClick={() => setShowFinish(true)}
                className="flex-1 gap-2"
                disabled={completedSets === 0}
              >
                <Square className="w-4 h-4" />
                Finish ({completedSets}/{totalSets} sets)
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
