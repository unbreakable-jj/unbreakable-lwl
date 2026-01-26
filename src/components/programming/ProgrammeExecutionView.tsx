import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSessionPlanners, SessionPlanner } from '@/hooks/useSessionPlanners';
import { useWorkoutSessions, WorkoutSession } from '@/hooks/useWorkoutSessions';
import { TrainingProgram } from '@/hooks/useTrainingPrograms';
import { ActiveWorkoutModal } from './ActiveWorkoutModal';
import { format, parseISO, isToday, isPast, isFuture, addDays, startOfWeek } from 'date-fns';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Play,
  Check,
  X,
  Clock,
  Dumbbell,
  Loader2,
  Target,
  Flame,
  CheckCircle2,
  Circle,
  ArrowRight,
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
  
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
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

  // Get week days for calendar view
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  }, [currentWeekStart]);

  // Get planners for current week view
  const weekPlanners = useMemo(() => {
    return (planners || []).filter(p => {
      if (!p.scheduled_date) return false;
      const date = parseISO(p.scheduled_date);
      return weekDays.some(d => 
        d.getFullYear() === date.getFullYear() && 
        d.getMonth() === date.getMonth() && 
        d.getDate() === date.getDate()
      );
    });
  }, [planners, weekDays]);

  const getPlannerForDay = (date: Date): SessionPlanner | undefined => {
    return weekPlanners.find(p => {
      if (!p.scheduled_date) return false;
      const pDate = parseISO(p.scheduled_date);
      return date.getFullYear() === pDate.getFullYear() && 
             date.getMonth() === pDate.getMonth() && 
             date.getDate() === pDate.getDate();
    });
  };

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

  const handleCompleteWorkout = (notes?: string, visibility?: 'public' | 'friends' | 'private') => {
    if (!activeSession) return;
    
    // Complete the workout session
    completeSession.mutate({
      sessionId: activeSession.id,
      notes,
      visibility,
    });
    
    // Also mark the planner session as completed
    if (nextSession) {
      markComplete.mutate(nextSession.id);
    }
    
    setShowWorkoutModal(false);
  };

  const handleCancelWorkout = () => {
    if (!activeSession) return;
    cancelSession.mutate(activeSession.id);
    setShowWorkoutModal(false);
  };

  // Open modal if there's an active session on mount
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
    <div className="space-y-6 md:space-y-8">
      {/* Header with Progress */}
      <Card className="p-5 md:p-6 border border-primary/50 bg-gradient-to-br from-primary/10 to-transparent">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
          <div>
            <h2 className="font-display text-xl md:text-2xl text-foreground mb-1">{program.name}</h2>
            <p className="text-sm text-muted-foreground">
              Week {program.current_week} • Day {program.current_day}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onClose} className="self-start shrink-0">
            <X className="w-4 h-4 mr-1" />
            Close
          </Button>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm gap-4">
            <span className="text-muted-foreground">Programme Progress</span>
            <span className="text-foreground font-medium whitespace-nowrap">
              {progress.completed} / {progress.total} sessions ({progress.percentage}%)
            </span>
          </div>
          <Progress value={progress.percentage} className="h-2.5" />
        </div>
      </Card>

      {/* Next Session CTA */}
      {nextSession && (
        <Card className="p-5 md:p-6 border border-primary bg-card">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Dumbbell className="w-6 h-6 md:w-7 md:h-7 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-lg md:text-xl text-foreground">
                  {hasActiveSession ? 'Continue Workout' : 'Next Session'}
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {nextSession.session_type} • Week {nextSession.week_number}, Day {nextSession.day_number}
                </p>
                <p className="text-xs text-primary mt-1">
                  {nextSession.planned_exercises.length} exercises
                </p>
              </div>
            </div>
            
            <Button 
              size="lg" 
              onClick={() => hasActiveSession ? setShowWorkoutModal(true) : handleStartSession(nextSession)}
              disabled={isStartingSession || startSession.isPending}
              className="gap-2 w-full sm:w-auto shrink-0"
            >
              {isStartingSession || startSession.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Play className="w-5 h-5" />
              )}
              {hasActiveSession ? 'Continue' : 'Start Workout'}
            </Button>
          </div>
        </Card>
      )}

      {/* Week Calendar View */}
      <Card className="border border-border bg-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="font-display text-lg text-foreground">
                {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
              </span>
            </div>
            
            <Button variant="ghost" size="icon" onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day) => {
              const planner = getPlannerForDay(day);
              const isCurrentDay = isToday(day);
              const isPastDay = isPast(day) && !isCurrentDay;

              return (
                <div key={day.toISOString()} className="space-y-1">
                  <div className={`text-center text-xs font-medium py-1 rounded ${
                    isCurrentDay ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                  }`}>
                    {format(day, 'EEE')}
                    <div className="text-sm font-bold">{format(day, 'd')}</div>
                  </div>
                  
                  {planner ? (
                    <SessionDayCard
                      planner={planner}
                      isToday={isCurrentDay}
                      isPast={isPastDay}
                      onStart={() => handleStartSession(planner)}
                      onComplete={() => markComplete.mutate(planner.id)}
                      onSkip={() => markSkipped.mutate(planner.id)}
                      isStarting={isStartingSession}
                    />
                  ) : (
                    <Card className="p-2 border border-dashed border-border bg-card/50 min-h-[80px] flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">Rest</span>
                    </Card>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Sessions List */}
      <Card className="border border-border bg-card">
        <CardHeader>
          <CardTitle className="font-display text-lg tracking-wide flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            UPCOMING SESSIONS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[250px]">
            <div className="space-y-2">
              {planners
                .filter(p => p.status === 'pending')
                .slice(0, 10)
                .map((planner, index) => (
                  <div 
                    key={planner.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      index === 0 ? 'border-primary bg-primary/5' : 'border-border bg-card'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {index === 0 ? (
                        <Flame className="w-5 h-5 text-primary" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground" />
                      )}
                      <div>
                        <p className="font-medium text-foreground text-sm">{planner.session_type}</p>
                        <p className="text-xs text-muted-foreground">
                          Week {planner.week_number}, Day {planner.day_number}
                          {planner.scheduled_date && ` • ${format(parseISO(planner.scheduled_date), 'MMM d')}`}
                        </p>
                      </div>
                    </div>
                    
                    {index === 0 && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleStartSession(planner)}
                        disabled={isStartingSession}
                        className="gap-1"
                      >
                        {isStartingSession ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <ArrowRight className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </div>
                ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

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

function SessionDayCard({
  planner,
  isToday,
  isPast,
  onStart,
  onComplete,
  onSkip,
  isStarting,
}: {
  planner: SessionPlanner;
  isToday: boolean;
  isPast: boolean;
  onStart: () => void;
  onComplete: () => void;
  onSkip: () => void;
  isStarting: boolean;
}) {
  const statusColors = {
    pending: isToday ? 'border-primary bg-primary/10' : 'border-border bg-card',
    completed: 'border-green-500 bg-green-500/10',
    skipped: 'border-muted bg-muted/10',
  };

  return (
    <Card className={`p-2 border ${statusColors[planner.status]} min-h-[80px]`}>
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Badge 
            variant="outline" 
            className={`text-[9px] px-1 py-0 ${
              planner.status === 'completed' ? 'border-green-500 text-green-500' :
              planner.status === 'skipped' ? 'border-muted text-muted-foreground' :
              'border-primary text-primary'
            }`}
          >
            {planner.status === 'completed' && <Check className="w-2 h-2 mr-0.5" />}
            {planner.status === 'skipped' && <X className="w-2 h-2 mr-0.5" />}
            {planner.status}
          </Badge>
        </div>
        
        <p className="text-[10px] font-medium text-foreground line-clamp-1">
          {planner.session_type}
        </p>
        
        <p className="text-[9px] text-muted-foreground">
          {planner.planned_exercises.length} exercises
        </p>
        
        {planner.status === 'pending' && (
          <div className="flex gap-0.5 pt-0.5">
            <Button
              variant="default"
              size="sm"
              className="h-5 text-[9px] flex-1 px-1"
              onClick={onStart}
              disabled={isStarting}
            >
              {isStarting ? <Loader2 className="w-2 h-2 animate-spin" /> : <Play className="w-2 h-2" />}
            </Button>
            {isPast && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-5 text-[9px] px-1"
                  onClick={onComplete}
                >
                  <Check className="w-2 h-2" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 text-[9px] px-1"
                  onClick={onSkip}
                >
                  <X className="w-2 h-2" />
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
