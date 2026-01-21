import { useState } from 'react';
import { GeneratedProgram, Exercise, WorkoutDay } from '@/lib/programTypes';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTrainingPrograms } from '@/hooks/useTrainingPrograms';
import { useWorkoutSessions } from '@/hooks/useWorkoutSessions';
import { useAuth } from '@/hooks/useAuth';
import { ActiveWorkoutModal } from './ActiveWorkoutModal';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Dumbbell, 
  Footprints, 
  Battery,
  RefreshCw,
  Save,
  Utensils,
  Play,
  Loader2
} from 'lucide-react';

interface ProgramDisplayProps {
  program: GeneratedProgram;
  onReset: () => void;
  savedProgramId?: string;
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

export function ProgramDisplay({ program, onReset, savedProgramId }: ProgramDisplayProps) {
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<WorkoutDay | null>(null);
  
  const { user } = useAuth();
  const { saveProgram } = useTrainingPrograms();
  const { activeSession, startSession, updateExerciseLog, completeSession, cancelSession } = useWorkoutSessions();

  // Support both template-based and full weeks structure with defensive checks
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

  const isDeloadWeek = selectedWeek === 4 || selectedWeek === 8 || selectedWeek === 12;

  const handlePrevWeek = () => setSelectedWeek(Math.max(1, selectedWeek - 1));
  const handleNextWeek = () => setSelectedWeek(Math.min(12, selectedWeek + 1));

  const handleSaveProgram = () => {
    if (!user) return;
    saveProgram.mutate(program);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl md:text-3xl text-foreground tracking-wide">
            {program.programName}
          </h2>
          <p className="text-muted-foreground mt-1">{program.overview}</p>
        </div>
        <div className="flex gap-2">
          {user && !savedProgramId && (
            <Button 
              variant="default" 
              onClick={handleSaveProgram} 
              className="gap-2"
              disabled={saveProgram.isPending}
            >
              {saveProgram.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Program
            </Button>
          )}
          <Button variant="outline" onClick={onReset} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            New Program
          </Button>
        </div>
      </div>

      {/* Phase Overview */}
      {phases.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {phases.map((phase, idx) => (
            <Card 
              key={idx} 
              className={`p-4 border ${
                phase === currentPhase 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border bg-card'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-display text-sm text-primary">Weeks {phase.weeks}</span>
                {phase === currentPhase && (
                  <Badge variant="default" className="bg-primary">Current</Badge>
                )}
              </div>
              <h3 className="font-display text-lg text-foreground mb-1">{phase.name}</h3>
              <p className="text-sm text-muted-foreground">{phase.focus}</p>
              {phase.notes && (
                <p className="text-xs text-muted-foreground/70 mt-2 italic">{phase.notes}</p>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Phase Progressions */}
      {program.phaseProgressions && program.phaseProgressions.length > 0 && (
        <Card className="p-4 border border-border bg-card">
          <h3 className="font-display text-lg text-foreground mb-3">PHASE ADJUSTMENTS</h3>
          <div className="space-y-2">
            {program.phaseProgressions.map((prog, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-start gap-2">
                <Badge variant="outline" className="shrink-0 border-primary text-primary">
                  {prog.phase}
                </Badge>
                <p className="text-sm text-muted-foreground">{prog.adjustments}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Week Navigator */}
      <div className="flex items-center justify-between bg-card border border-border rounded-lg p-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handlePrevWeek}
          disabled={selectedWeek === 1}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-primary" />
          <span className="font-display text-xl text-foreground">
            WEEK {selectedWeek}
          </span>
          {isDeloadWeek && (
            <Badge variant="secondary" className="bg-accent/20 text-accent-foreground">
              Deload
            </Badge>
          )}
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleNextWeek}
          disabled={selectedWeek === 12}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Week Progress Bar */}
      <div className="flex gap-1">
        {Array.from({ length: 12 }, (_, i) => (
          <button
            key={i}
            onClick={() => setSelectedWeek(i + 1)}
            className={`flex-1 h-2 rounded-full transition-all ${
              i + 1 === selectedWeek 
                ? 'bg-primary' 
                : i + 1 < selectedWeek 
                  ? 'bg-primary/40' 
                  : 'bg-border'
            }`}
          />
        ))}
      </div>

      {/* Daily Workouts */}
      {templateDays.length > 0 && (
        <Tabs defaultValue={templateDays[0]?.day} className="space-y-4">
          <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-card p-1">
            {templateDays.map((day) => (
              <TabsTrigger 
                key={day.day} 
                value={day.day}
                className="flex-1 min-w-[80px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <span className="hidden md:inline">{day.day}</span>
                <span className="md:hidden">{day.day.slice(0, 3)}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {templateDays.map((day) => (
            <TabsContent key={day.day} value={day.day} className="space-y-4">
              <Card className="p-4 border border-border bg-card">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <h3 className="font-display text-xl text-foreground">{day.sessionType}</h3>
                  <Badge variant="outline" className="border-primary text-primary">
                    {day.duration}
                  </Badge>
                  {isDeloadWeek && (
                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">
                      Reduce volume 40%
                    </Badge>
                  )}
                </div>
                
                {/* Warmup */}
                <div className="mb-4 p-3 rounded-lg bg-surface border border-border">
                  <span className="text-sm text-muted-foreground">Warmup:</span>
                  <p className="text-foreground">{day.warmup}</p>
                </div>

                {/* Exercises */}
                <div className="space-y-3">
                  {day.exercises.map((exercise, idx) => (
                    <ExerciseCard key={idx} exercise={exercise} index={idx + 1} />
                  ))}
                </div>

                {/* Cooldown */}
                <div className="mt-4 p-3 rounded-lg bg-surface border border-border">
                  <span className="text-sm text-muted-foreground">Cooldown:</span>
                  <p className="text-foreground">{day.cooldown}</p>
                </div>

                {/* Start Workout Button */}
                {user && (
                  <Button 
                    onClick={() => handleStartWorkout(day)} 
                    className="w-full mt-4 gap-2"
                    disabled={startSession.isPending}
                  >
                    {startSession.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    Start Workout
                  </Button>
                )}
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Active Workout Modal */}
      {activeSession && (
        <ActiveWorkoutModal
          session={activeSession}
          open={showWorkoutModal}
          onOpenChange={setShowWorkoutModal}
          onUpdateLog={(logId, data) => updateExerciseLog.mutate({ logId, ...data })}
          onComplete={(notes, visibility) => {
            completeSession.mutate({ sessionId: activeSession.id, notes, visibility });
            setShowWorkoutModal(false);
          }}
          onCancel={() => {
            cancelSession.mutate(activeSession.id);
            setShowWorkoutModal(false);
          }}
        />
      )}

      {/* Progression & Nutrition */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4 border border-border bg-card">
          <h3 className="font-display text-lg text-foreground mb-3 flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-primary" />
            PROGRESSION RULES
          </h3>
          <ul className="space-y-2">
            {program.progressionRules.map((rule, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-primary">•</span>
                {rule}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-4 border border-border bg-card">
          <h3 className="font-display text-lg text-foreground mb-3 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-primary" />
            NUTRITION TIPS
          </h3>
          <ul className="space-y-2">
            {program.nutritionTips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-primary">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function ExerciseCard({ exercise, index }: { exercise: Exercise; index: number }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-lg bg-surface border border-border">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
        <span className="font-display text-primary">{index}</span>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <h4 className="font-display text-foreground">{exercise.name}</h4>
          <Badge 
            variant="outline" 
            className={`${equipmentColors[exercise.equipment] || ''} gap-1`}
          >
            {equipmentIcons[exercise.equipment]}
            {exercise.equipment}
          </Badge>
        </div>
        
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="text-muted-foreground">
            <span className="text-foreground font-medium">{exercise.sets}</span> sets
          </span>
          <span className="text-muted-foreground">
            <span className="text-foreground font-medium">{exercise.reps}</span> reps
          </span>
          <span className="text-muted-foreground">
            @ <span className="text-primary font-medium">{exercise.intensity}</span>
          </span>
          <span className="text-muted-foreground">
            Rest: <span className="text-foreground">{exercise.rest}</span>
          </span>
        </div>
        
        {exercise.notes && (
          <p className="mt-2 text-xs text-muted-foreground italic">{exercise.notes}</p>
        )}
      </div>
    </div>
  );
}
