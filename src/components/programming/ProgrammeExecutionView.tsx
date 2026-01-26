import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useSessionPlanners, SessionPlanner } from '@/hooks/useSessionPlanners';
import { useWorkoutSessions } from '@/hooks/useWorkoutSessions';
import { TrainingProgram } from '@/hooks/useTrainingPrograms';
import { ActiveWorkoutModal } from './ActiveWorkoutModal';
import { format, parseISO, isToday, isPast, addDays, startOfWeek } from 'date-fns';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Play,
  Check,
  X,
  Dumbbell,
  Loader2,
  Target,
  ChevronDown,
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
  
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

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

      {/* Week Calendar - Collapsible */}
      <Collapsible open={showCalendar} onOpenChange={setShowCalendar}>
        <Card className="border border-border bg-card">
          <CollapsibleTrigger className="w-full p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="font-display text-foreground tracking-wide">
                WEEK SCHEDULE
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {weekPlanners.filter(p => p.status === 'completed').length}/{weekPlanners.length} done
              </Badge>
              <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${showCalendar ? 'rotate-180' : ''}`} />
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="pt-0 pb-4">
              {/* Week Navigation */}
              <div className="flex items-center justify-between mb-4">
                <Button variant="ghost" size="icon" onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))}>
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
                </span>
                <Button variant="ghost" size="icon" onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}>
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>

              {/* Day Grid */}
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
                        <Card className="p-2 border border-dashed border-border bg-card/50 min-h-[60px] flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">Rest</span>
                        </Card>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

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
    <Card className={`p-2 border ${statusColors[planner.status]} min-h-[60px]`}>
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
        
        {planner.status === 'pending' && (isToday || isPast) && (
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
