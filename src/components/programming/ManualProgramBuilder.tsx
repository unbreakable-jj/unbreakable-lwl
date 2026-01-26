import { useState, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Plus,
  Trash2,
  GripVertical,
  Save,
  Dumbbell,
  Calendar,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Loader2,
  Link as LinkIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTrainingPrograms } from '@/hooks/useTrainingPrograms';
import { useToast } from '@/hooks/use-toast';
import { InlineExerciseLibrary } from './InlineExerciseLibrary';
import { LibraryExercise } from '@/lib/exerciseLibrary';
import { cn } from '@/lib/utils';

interface ProgramExercise {
  id: string;
  name: string;
  equipment: string;
  sets: number;
  reps: string;
  notes?: string;
  supersetGroupId?: string;
}

interface ProgramDay {
  id: string;
  name: string;
  exercises: ProgramExercise[];
}

interface ManualProgramBuilderProps {
  onBack: () => void;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function ManualProgramBuilder({ onBack }: ManualProgramBuilderProps) {
  const { user } = useAuth();
  const { saveProgram } = useTrainingPrograms();
  const { toast } = useToast();

  const [programName, setProgramName] = useState('My Custom Programme');
  const [selectedDays, setSelectedDays] = useState<string[]>(['Monday', 'Wednesday', 'Friday']);
  const [days, setDays] = useState<ProgramDay[]>([]);
  const [activeDay, setActiveDay] = useState<string | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedExercises, setExpandedExercises] = useState<Set<string>>(new Set());

  // Initialize days when selection changes
  const handleDayToggle = (day: string) => {
    setSelectedDays(prev => {
      const newSelection = prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day].sort((a, b) => DAYS_OF_WEEK.indexOf(a) - DAYS_OF_WEEK.indexOf(b));
      
      // Update days array
      setDays(currentDays => {
        const existingDayMap = new Map(currentDays.map(d => [d.name, d]));
        return newSelection.map(dayName => 
          existingDayMap.get(dayName) || {
            id: `day-${dayName.toLowerCase()}`,
            name: dayName,
            exercises: [],
          }
        );
      });

      return newSelection;
    });
  };

  const handleAddExercise = useCallback((exercise: LibraryExercise) => {
    if (!activeDay) return;

    const newExercise: ProgramExercise = {
      id: `ex-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: exercise.name,
      equipment: exercise.equipment[0],
      sets: exercise.defaultSets,
      reps: exercise.defaultReps,
    };

    setDays(prev => prev.map(day => 
      day.name === activeDay
        ? { ...day, exercises: [...day.exercises, newExercise] }
        : day
    ));

    toast({
      title: 'Exercise Added',
      description: `${exercise.name} added to ${activeDay}`,
    });
  }, [activeDay, toast]);

  const handleRemoveExercise = (dayName: string, exerciseId: string) => {
    setDays(prev => prev.map(day =>
      day.name === dayName
        ? { ...day, exercises: day.exercises.filter(e => e.id !== exerciseId) }
        : day
    ));
  };

  const handleUpdateExercise = (dayName: string, exerciseId: string, updates: Partial<ProgramExercise>) => {
    setDays(prev => prev.map(day =>
      day.name === dayName
        ? {
            ...day,
            exercises: day.exercises.map(e =>
              e.id === exerciseId ? { ...e, ...updates } : e
            ),
          }
        : day
    ));
  };

  const handleReorderExercises = (dayName: string, newOrder: ProgramExercise[]) => {
    setDays(prev => prev.map(day =>
      day.name === dayName ? { ...day, exercises: newOrder } : day
    ));
  };

  const handleSaveProgram = async () => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please sign in to save your programme.',
        variant: 'destructive',
      });
      return;
    }

    if (days.length === 0 || days.every(d => d.exercises.length === 0)) {
      toast({
        title: 'Empty Programme',
        description: 'Add at least one exercise to save your programme.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      // Format for the training_programs table
      const programData = {
        programName,
        overview: `Custom ${selectedDays.length}-day programme`,
        weeklySchedule: days.map(d => ({
          day: d.name,
          focus: d.name,
          type: 'strength' as const,
        })),
        phases: [{
          name: 'Custom Phase',
          weeks: '1-12',
          focus: 'Progressive Overload',
          notes: 'User-created programme',
        }],
        templateWeek: {
          days: days.map(d => ({
            day: d.name,
            sessionType: d.name,
            duration: '60 mins',
            warmup: '5-10 min dynamic stretching',
            exercises: d.exercises.map(e => ({
              name: e.name,
              equipment: e.equipment as 'barbell' | 'dumbbell' | 'bodyweight' | 'running',
              sets: e.sets,
              reps: e.reps,
              intensity: 'RPE 7-8',
              rest: '90-120s',
              notes: e.notes,
            })),
            cooldown: '5 min stretch',
          })),
        },
        progressionRules: ['Add weight when you complete all reps', 'Deload every 4th week'],
        nutritionTips: ['Prioritize protein intake', 'Stay hydrated'],
      };

      await saveProgram.mutateAsync(programData);
      toast({
        title: 'Programme Saved!',
        description: 'Your custom programme is now in My Programmes.',
      });
      onBack();
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: 'Save Failed',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleExerciseExpand = (exerciseId: string) => {
    setExpandedExercises(prev => {
      const next = new Set(prev);
      if (next.has(exerciseId)) {
        next.delete(exerciseId);
      } else {
        next.add(exerciseId);
      }
      return next;
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button
          onClick={handleSaveProgram}
          disabled={isSaving || days.every(d => d.exercises.length === 0)}
          className="gap-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Programme
            </>
          )}
        </Button>
      </div>

      {/* Programme Name */}
      <Card className="border-primary/20">
        <CardContent className="pt-6">
          <label className="text-sm text-muted-foreground mb-2 block font-display">
            PROGRAMME NAME
          </label>
          <Input
            value={programName}
            onChange={(e) => setProgramName(e.target.value)}
            placeholder="My Custom Programme"
            className="text-lg font-display"
          />
        </CardContent>
      </Card>

      {/* Day Selection */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            SELECT TRAINING DAYS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {DAYS_OF_WEEK.map((day) => (
              <Button
                key={day}
                variant={selectedDays.includes(day) ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleDayToggle(day)}
                className={cn(
                  'font-display',
                  selectedDays.includes(day) && 'neon-border-subtle'
                )}
              >
                {day.slice(0, 3)}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Selected: {selectedDays.length} day{selectedDays.length !== 1 ? 's' : ''} per week
          </p>
        </CardContent>
      </Card>

      {/* Day Tabs with Exercise Builder */}
      {days.length > 0 && (
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <Tabs
              value={activeDay || days[0]?.name}
              onValueChange={(v) => setActiveDay(v)}
            >
              <TabsList className="w-full flex-wrap h-auto justify-start gap-1 bg-transparent p-0 mb-4">
                {days.map((day) => (
                  <TabsTrigger
                    key={day.name}
                    value={day.name}
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1"
                  >
                    <Dumbbell className="w-4 h-4" />
                    {day.name}
                    {day.exercises.length > 0 && (
                      <Badge variant="secondary" className="ml-1 h-5 text-xs">
                        {day.exercises.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>

              {days.map((day) => (
                <TabsContent key={day.name} value={day.name} className="mt-0">
                  <div className="grid lg:grid-cols-2 gap-4">
                    {/* Exercise List */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-display text-sm text-muted-foreground">
                          {day.name.toUpperCase()} EXERCISES
                        </h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setActiveDay(day.name);
                            setShowLibrary(!showLibrary);
                          }}
                          className="gap-1"
                        >
                          <Plus className="w-4 h-4" />
                          Add Exercise
                        </Button>
                      </div>

                      {day.exercises.length === 0 ? (
                        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                          <Dumbbell className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">
                            No exercises yet. Add from the library.
                          </p>
                        </div>
                      ) : (
                        <ScrollArea className="h-[400px] pr-2">
                          <Reorder.Group
                            axis="y"
                            values={day.exercises}
                            onReorder={(newOrder) => handleReorderExercises(day.name, newOrder)}
                            className="space-y-2"
                          >
                            {day.exercises.map((exercise) => (
                              <Reorder.Item
                                key={exercise.id}
                                value={exercise}
                                className="bg-card border border-border rounded-lg overflow-hidden cursor-grab active:cursor-grabbing"
                              >
                                <div className="p-3">
                                  <div className="flex items-center gap-2">
                                    <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm truncate">
                                          {exercise.name}
                                        </span>
                                        <Badge variant="outline" className="text-xs capitalize shrink-0">
                                          {exercise.equipment}
                                        </Badge>
                                      </div>
                                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                        <span>{exercise.sets} sets</span>
                                        <span>×</span>
                                        <span>{exercise.reps} reps</span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => toggleExerciseExpand(exercise.id)}
                                      >
                                        {expandedExercises.has(exercise.id) ? (
                                          <ChevronUp className="w-4 h-4" />
                                        ) : (
                                          <ChevronDown className="w-4 h-4" />
                                        )}
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-destructive hover:text-destructive"
                                        onClick={() => handleRemoveExercise(day.name, exercise.id)}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>

                                  <AnimatePresence>
                                    {expandedExercises.has(exercise.id) && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                      >
                                        <div className="pt-3 mt-3 border-t border-border space-y-3">
                                          <div className="grid grid-cols-2 gap-2">
                                            <div>
                                              <label className="text-xs text-muted-foreground">Sets</label>
                                              <Input
                                                type="number"
                                                min={1}
                                                max={10}
                                                value={exercise.sets}
                                                onChange={(e) => handleUpdateExercise(day.name, exercise.id, {
                                                  sets: parseInt(e.target.value) || 1,
                                                })}
                                                className="h-8"
                                              />
                                            </div>
                                            <div>
                                              <label className="text-xs text-muted-foreground">Reps</label>
                                              <Input
                                                value={exercise.reps}
                                                onChange={(e) => handleUpdateExercise(day.name, exercise.id, {
                                                  reps: e.target.value,
                                                })}
                                                className="h-8"
                                                placeholder="8-10"
                                              />
                                            </div>
                                          </div>
                                          <div>
                                            <label className="text-xs text-muted-foreground">Notes</label>
                                            <Input
                                              value={exercise.notes || ''}
                                              onChange={(e) => handleUpdateExercise(day.name, exercise.id, {
                                                notes: e.target.value,
                                              })}
                                              className="h-8"
                                              placeholder="Optional notes..."
                                            />
                                          </div>
                                          <Link
                                            to={`/help?q=${encodeURIComponent(exercise.name + ' form tips')}`}
                                            className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                                          >
                                            <MessageCircle className="w-3 h-3" />
                                            Get AI coaching tips
                                          </Link>
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              </Reorder.Item>
                            ))}
                          </Reorder.Group>
                        </ScrollArea>
                      )}
                    </div>

                    {/* Exercise Library */}
                    <AnimatePresence>
                      {showLibrary && activeDay === day.name && (
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                        >
                          <InlineExerciseLibrary
                            onSelectExercise={handleAddExercise}
                            onClose={() => setShowLibrary(false)}
                            className="h-[450px]"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-5 h-5 text-primary shrink-0" />
            <div>
              <p className="text-sm font-medium">Need help designing your programme?</p>
              <p className="text-xs text-muted-foreground">
                Ask our AI coach for exercise recommendations, form tips, and progression advice.
              </p>
            </div>
            <Link to="/help" className="shrink-0">
              <Button variant="outline" size="sm" className="gap-1">
                <LinkIcon className="w-3 h-3" />
                AI Coach
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
