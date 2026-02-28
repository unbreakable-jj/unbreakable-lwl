import { useState } from 'react';
import { GeneratedProgram, Exercise, WorkoutDay } from '@/lib/programTypes';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useTrainingPrograms } from '@/hooks/useTrainingPrograms';
import { useWorkoutSessions } from '@/hooks/useWorkoutSessions';
import { useAuth } from '@/hooks/useAuth';
import { ActiveWorkoutModal } from './ActiveWorkoutModal';
import { AskCoachCTA } from '@/components/coaching/AskCoachCTA';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Dumbbell,
  RefreshCw,
  Save,
  Play,
  Loader2,
  ChevronDown,
  TrendingUp,
  Utensils,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ProgramDisplayProps {
  program: GeneratedProgram;
  onReset: () => void;
  savedProgramId?: string;
  forUserId?: string;
}

const equipmentColors: Record<string, string> = {
  barbell: 'bg-primary/20 text-primary border-primary/30',
  dumbbell: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  bodyweight: 'bg-green-500/20 text-green-400 border-green-500/30',
  running: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

export function ProgramDisplay({ program, onReset, savedProgramId, forUserId }: ProgramDisplayProps) {
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<WorkoutDay | null>(null);
  
  const { user } = useAuth();
  const { saveProgram } = useTrainingPrograms();
  const { activeSession, startSession, updateExerciseLog, completeSession, cancelSession } = useWorkoutSessions();
  const sessionForModal = activeSession ?? (startSession.data ?? null);

  // Support both template-based and full weeks structure
  const templateDays = program?.templateWeek?.days || program?.weeks?.[0]?.days || [];
  const phases = program?.phases || [];
  const currentPhase = phases.find(p => {
    const weeksMatch = p.weeks?.match(/(\d+)-(\d+)/);
    if (weeksMatch) {
      const [, start, end] = weeksMatch;
      return selectedWeek >= parseInt(start) && selectedWeek <= parseInt(end);
    }
    return false;
  });

  const handlePrevWeek = () => setSelectedWeek(Math.max(1, selectedWeek - 1));
  const handleNextWeek = () => setSelectedWeek(Math.min(12, selectedWeek + 1));

  const handleSaveProgram = () => {
    if (!user) return;
    saveProgram.mutate({ program, forUserId });
  };

  const handleStartWorkout = (day: WorkoutDay) => {
    if (!user) return;
    
    const exercises = day.exercises.map((ex) => ({
      name: ex.name,
      equipment: ex.equipment,
      sets: typeof ex.sets === 'number' ? ex.sets : parseInt(String(ex.sets)) || 3,
      reps: ex.reps,
    }));

    startSession.mutate(
      {
        programId: savedProgramId,
        weekNumber: selectedWeek,
        dayName: day.day,
        sessionType: day.sessionType,
        exercises,
      },
      {
        onSuccess: () => {
          setSelectedDay(day);
          setShowWorkoutModal(true);
        },
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header - Matches Cardio Style */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">💪</div>
        <h1 className="font-display text-3xl md:text-4xl text-foreground tracking-wide mb-2">
          {program.programName}
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {program.overview}
        </p>
        <Badge className="mt-4 font-display tracking-wide">
          STRENGTH • 12 WEEKS
        </Badge>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-2">
        {user && !savedProgramId && (
          <Button 
            onClick={handleSaveProgram} 
            className="gap-2 font-display tracking-wide"
            disabled={saveProgram.isPending}
          >
            {saveProgram.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            SAVE PROGRAMME
          </Button>
        )}
        <Button variant="outline" onClick={onReset} className="gap-2 font-display tracking-wide">
          <RefreshCw className="w-4 h-4" />
          NEW PROGRAMME
        </Button>
        <AskCoachCTA 
          context={{
            type: 'programme',
            name: program.programName,
          }}
          label="Ask Coach"
        />
      </div>

      {/* Phases Overview - Cardio Style */}
      {phases.length > 0 && (
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <h3 className="font-display text-lg text-muted-foreground mb-4 tracking-wide">
              PROGRAMME PHASES
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {phases.map((phase, idx) => (
                <div
                  key={idx}
                  className={`bg-muted/30 rounded-lg p-4 border-l-4 ${
                    phase === currentPhase ? 'border-l-primary' : 'border-l-border'
                  }`}
                >
                  <p className="font-display text-primary tracking-wide text-sm">
                    {phase.weeks}
                  </p>
                  <p className="font-display text-foreground tracking-wide">
                    {phase.name}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {phase.focus}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Week Navigation - Cardio Style */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevWeek}
          disabled={selectedWeek === 1}
          className="font-display tracking-wide"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          PREV
        </Button>
        
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <span className="font-display text-xl tracking-wide">
            WEEK {selectedWeek}
          </span>
          {currentPhase && (
            <Badge variant="outline" className="ml-2">
              {currentPhase.name}
            </Badge>
          )}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextWeek}
          disabled={selectedWeek === 12}
          className="font-display tracking-wide"
        >
          NEXT
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* Daily Workouts - Cardio Style with Collapsed Sessions */}
      <motion.div
        key={selectedWeek}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="space-y-4"
      >
        {templateDays.map((day, idx) => (
          <DayCard
            key={idx}
            day={day}
            onStart={() => handleStartWorkout(day)}
            isStarting={startSession.isPending}
            isLoggedIn={!!user}
          />
        ))}
      </motion.div>

      {/* Tips - Cardio Style */}
      <div className="grid md:grid-cols-2 gap-6">
        {program.progressionRules && program.progressionRules.length > 0 && (
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <h4 className="font-display text-lg text-primary tracking-wide mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                PROGRESSION
              </h4>
              <ul className="space-y-2">
                {program.progressionRules.map((rule, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary">•</span>
                    {rule}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {program.nutritionTips && program.nutritionTips.length > 0 && (
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <h4 className="font-display text-lg text-primary tracking-wide mb-4 flex items-center gap-2">
                <Utensils className="w-5 h-5" />
                NUTRITION
              </h4>
              <ul className="space-y-2">
                {program.nutritionTips.map((tip, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Active Workout Modal */}
      {sessionForModal && (
        <ActiveWorkoutModal
          session={sessionForModal}
          open={showWorkoutModal}
          onOpenChange={setShowWorkoutModal}
          onUpdateLog={(logId, data) => updateExerciseLog.mutate({ logId, ...data })}
          onComplete={(notes, visibility) => {
            completeSession.mutate({ sessionId: sessionForModal.id, notes, visibility });
            setShowWorkoutModal(false);
          }}
          onCancel={() => {
            cancelSession.mutate(sessionForModal.id);
            setShowWorkoutModal(false);
          }}
        />
      )}
    </div>
  );
}

// Collapsed Day Card Component - Matches Cardio Session Cards
function DayCard({ 
  day, 
  onStart, 
  isStarting,
  isLoggedIn 
}: { 
  day: WorkoutDay; 
  onStart: () => void;
  isStarting: boolean;
  isLoggedIn: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="bg-card border-border border-l-4 border-l-primary">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-display text-primary tracking-wide text-sm text-left">
                  {day.day}
                </p>
                <h4 className="font-display text-xl text-foreground tracking-wide text-left">
                  {day.sessionType}
                </h4>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Dumbbell className="w-3 h-3" />
                  {day.exercises.length} exercises
                </Badge>
                <Badge variant="outline">
                  {day.duration}
                </Badge>
                <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </CardContent>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 pb-6 px-6 space-y-4">
            {/* Warmup */}
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="text-xs text-muted-foreground font-display tracking-wide mb-1">WARMUP</p>
              <p className="text-sm text-foreground">{day.warmup}</p>
            </div>

            {/* Exercises */}
            <div className="space-y-2">
              {day.exercises.map((exercise, idx) => (
                <ExerciseRow key={idx} exercise={exercise} index={idx + 1} />
              ))}
            </div>

            {/* Cooldown */}
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="text-xs text-muted-foreground font-display tracking-wide mb-1">COOLDOWN</p>
              <p className="text-sm text-foreground">{day.cooldown}</p>
            </div>

            {/* Start Button */}
            {isLoggedIn && (
              <Button 
                onClick={(e) => { e.stopPropagation(); onStart(); }}
                className="w-full gap-2 font-display tracking-wide"
                disabled={isStarting}
              >
                {isStarting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                START WORKOUT
              </Button>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

// Compact Exercise Row
function ExerciseRow({ exercise, index }: { exercise: Exercise; index: number }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary font-display">
        {index}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-foreground font-medium truncate">{exercise.name}</p>
        <p className="text-sm text-muted-foreground">
          {exercise.sets} × {exercise.reps} @ {exercise.intensity}
        </p>
      </div>
      <Badge variant="outline" className={`text-xs ${equipmentColors[exercise.equipment] || ''}`}>
        {exercise.equipment}
      </Badge>
    </div>
  );
}
