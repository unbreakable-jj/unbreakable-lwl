import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSessionPlanners, SessionPlanner } from '@/hooks/useSessionPlanners';
import { useWorkoutSessions } from '@/hooks/useWorkoutSessions';
import { TrainingProgram } from '@/hooks/useTrainingPrograms';
import { ActiveWorkoutModal } from './ActiveWorkoutModal';
import { format, parseISO } from 'date-fns';
import {
  Play,
  Check,
  Dumbbell,
  Loader2,
  Target,
  ArrowLeft,
} from 'lucide-react';

interface ProgrammeExecutionViewProps {
  program: TrainingProgram;
  onClose: () => void;
}

export function ProgrammeExecutionView({ program, onClose }: ProgrammeExecutionViewProps) {
  const { planners, isLoading: plannersLoading, markComplete, markSkipped } = useSessionPlanners(program.id);
  const { 
    activeSession, 
    startSession, 
    updateExerciseLog, 
    completeSession, 
    cancelSession 
  } = useWorkoutSessions();
  
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [isStartingSession, setIsStartingSession] = useState(false);

  // Find next pending session
  const nextSession = useMemo(() => {
    if (!planners) return null;
    return planners
      .filter(p => p.status === 'pending')
      .sort((a, b) => {
        if (!a.scheduled_date || !b.scheduled_date) return 0;
        return new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime();
      })[0] || null;
  }, [planners]);

  // Calculate progress
  const progress = useMemo(() => {
    if (!planners || planners.length === 0) return { completed: 0, total: 0, percentage: 0 };
    const completed = planners.filter(p => p.status === 'completed').length;
    const total = planners.length;
    return { completed, total, percentage: Math.round((completed / total) * 100) };
  }, [planners]);

  const handleStartSession = async (planner: SessionPlanner) => {
    if (isStartingSession) return;
    setIsStartingSession(true);
    
    try {
      await startSession.mutateAsync({
        programId: program.id,
        weekNumber: planner.week_number,
        dayName: `Day ${planner.day_number}`,
        sessionType: planner.session_type,
        exercises: planner.planned_exercises.map(ex => ({
          name: ex.name,
          equipment: ex.equipment,
          sets: typeof ex.sets === 'number' ? ex.sets : parseInt(String(ex.sets)) || 3,
          reps: ex.reps,
        })),
      });
      setShowWorkoutModal(true);
    } catch (error) {
      console.error('Failed to start session:', error);
    } finally {
      setIsStartingSession(false);
    }
  };

  // Find the planner that corresponds to the current active session
  const currentPlanner = useMemo(() => {
    if (!activeSession || !planners) return null;
    return planners.find(p => 
      p.week_number === activeSession.week_number && 
      p.day_number === parseInt(activeSession.day_name.replace('Day ', '')) &&
      p.status === 'pending'
    );
  }, [activeSession, planners]);

  const handleCompleteWorkout = (notes?: string, visibility?: 'public' | 'friends' | 'private') => {
    if (!activeSession) return;
    
    // Complete the workout session
    completeSession.mutate({
      sessionId: activeSession.id,
      notes,
      visibility,
    });
    
    // Mark the CURRENT planner (not next) as complete
    // This ensures we mark the session we just finished, not the next one
    if (currentPlanner) {
      markComplete.mutate(currentPlanner.id);
    }
    
    setShowWorkoutModal(false);
  };

  const handleCancelWorkout = () => {
    if (!activeSession) return;
    cancelSession.mutate(activeSession.id);
    setShowWorkoutModal(false);
  };

  const hasActiveSession = !!activeSession && activeSession.program_id === program.id;

  if (plannersLoading) {
    return (
      <Card className="p-8 border border-border bg-card flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </Card>
    );
  }

  if (!planners || planners.length === 0) {
    return (
      <Card className="p-8 border border-border bg-card text-center">
        <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-display text-lg text-foreground mb-2">No Sessions Scheduled</h3>
        <p className="text-sm text-muted-foreground">
          Session planners are being generated for this programme...
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onClose} className="gap-2 font-display tracking-wide">
          <ArrowLeft className="w-4 h-4" />
          BACK
        </Button>
        <Badge variant="outline" className="font-display">
          Week {program.current_week} • Day {program.current_day}
        </Badge>
      </div>

      {/* Programme Title */}
      <div className="text-center">
        <h2 className="font-display text-2xl md:text-3xl text-foreground tracking-wide mb-2">
          {program.name}
        </h2>
        <p className="text-muted-foreground">{program.overview}</p>
      </div>

      {/* Progress Card */}
      <Card className="p-5 border border-primary/50 bg-gradient-to-br from-primary/10 to-transparent">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground">Programme Progress</span>
          <span className="font-display text-lg text-foreground">
            {progress.completed}/{progress.total} sessions
          </span>
        </div>
        <Progress value={progress.percentage} className="h-2" />
        <p className="text-xs text-muted-foreground mt-2 text-right">
          {progress.percentage}% complete
        </p>
      </Card>

      {/* Next Session CTA - Clean & Focused */}
      {nextSession && (
        <Card className="p-6 border-2 border-primary bg-card">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Dumbbell className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {hasActiveSession ? 'Continue Your Workout' : 'Next Session'}
                </p>
                <h3 className="font-display text-xl text-foreground">
                  {nextSession.session_type}
                </h3>
                <p className="text-sm text-primary">
                  Week {nextSession.week_number}, Day {nextSession.day_number} • {nextSession.planned_exercises.length} exercises
                </p>
              </div>
            </div>
            
            <Button 
              size="lg" 
              onClick={() => hasActiveSession ? setShowWorkoutModal(true) : handleStartSession(nextSession)}
              disabled={isStartingSession || startSession.isPending}
              className="gap-2 w-full sm:w-auto font-display tracking-wide"
            >
              {isStartingSession || startSession.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Play className="w-5 h-5" />
              )}
              {hasActiveSession ? 'CONTINUE' : 'START WORKOUT'}
            </Button>
          </div>
        </Card>
      )}

      {/* Session History */}
      {planners && planners.filter(p => p.status === 'completed').length > 0 && (
        <Card className="border border-border bg-card p-5">
          <h3 className="font-display text-foreground tracking-wide mb-4 flex items-center gap-2">
            <Check className="w-5 h-5 text-primary" />
            COMPLETED SESSIONS
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {planners
              .filter(p => p.status === 'completed')
              .sort((a, b) => {
                if (!a.scheduled_date || !b.scheduled_date) return 0;
                return new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime();
              })
              .map(p => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                      <p className="font-display text-sm text-foreground">{p.session_type}</p>
                      <p className="text-xs text-muted-foreground">
                        Week {p.week_number}, Day {p.day_number}
                        {p.scheduled_date && ` • ${format(parseISO(p.scheduled_date), 'MMM d')}`}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs text-green-500 border-green-500/50">
                    Done
                  </Badge>
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* Active Workout Modal */}
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
    </div>
  );
}
