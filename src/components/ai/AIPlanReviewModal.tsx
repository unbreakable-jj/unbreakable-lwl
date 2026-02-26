import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Edit3,
  Save,
  X,
  Sparkles,
  Dumbbell,
  UtensilsCrossed,
  Flame,
  Calendar,
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { GeneratedProgram, WorkoutDay, Exercise } from '@/lib/programTypes';
import { ScrollableExerciseLibrary } from '@/components/programming/ScrollableExerciseLibrary';
import { LibraryExercise } from '@/lib/exerciseLibrary';

type PlanType = 'programme' | 'meal_plan';

interface AIPlanReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  planType: PlanType;
  planData: GeneratedProgram | any;
  onSave: (editedPlan: any) => Promise<void>;
  isSaving?: boolean;
}

export function AIPlanReviewModal({
  isOpen,
  onClose,
  planType,
  planData,
  onSave,
  isSaving = false,
}: AIPlanReviewModalProps) {
  const [step, setStep] = useState<'review' | 'edit' | 'confirm'>('review');
  const [editedPlan, setEditedPlan] = useState<any>(() => JSON.parse(JSON.stringify(planData)));
  const [expandedDay, setExpandedDay] = useState<number | null>(0);
  const [swappingExercise, setSwappingExercise] = useState<{ dayIndex: number; exerciseIndex: number } | null>(null);
  const [addingToDay, setAddingToDay] = useState<number | null>(null);

  const isProgramme = planType === 'programme';
  const Icon = isProgramme ? Dumbbell : UtensilsCrossed;
  const title = isProgramme ? 'YOUR PROGRAMME' : 'YOUR MEAL PLAN';
  const hubName = isProgramme ? 'My Programmes' : 'My Meal Plans';

  const isEditing = step === 'edit';

  const days: WorkoutDay[] = editedPlan.templateWeek?.days || [];

  const updatePlanField = useCallback((field: string, value: string) => {
    setEditedPlan((prev: any) => ({ ...prev, [field]: value }));
  }, []);

  const removeExercise = useCallback((dayIndex: number, exerciseIndex: number) => {
    setEditedPlan((prev: any) => {
      const updated = JSON.parse(JSON.stringify(prev));
      if (updated.templateWeek?.days?.[dayIndex]?.exercises) {
        updated.templateWeek.days[dayIndex].exercises.splice(exerciseIndex, 1);
      }
      return updated;
    });
  }, []);

  const swapExercise = useCallback((dayIndex: number, exerciseIndex: number, newExercise: LibraryExercise) => {
    setEditedPlan((prev: any) => {
      const updated = JSON.parse(JSON.stringify(prev));
      if (updated.templateWeek?.days?.[dayIndex]?.exercises) {
        const existing = updated.templateWeek.days[dayIndex].exercises[exerciseIndex];
        updated.templateWeek.days[dayIndex].exercises[exerciseIndex] = {
          id: newExercise.id,
          name: newExercise.name,
          bodyPart: newExercise.bodyPart,
          equipment: newExercise.equipment[0] || 'bodyweight',
          sets: newExercise.defaultSets,
          reps: newExercise.defaultReps,
          intensity: existing?.intensity || 'RPE 7',
          rest: existing?.rest || '2 min',
          notes: '',
        };
      }
      return updated;
    });
    setSwappingExercise(null);
  }, []);

  const addExercise = useCallback((dayIndex: number, exercise: LibraryExercise) => {
    setEditedPlan((prev: any) => {
      const updated = JSON.parse(JSON.stringify(prev));
      if (updated.templateWeek?.days?.[dayIndex]?.exercises) {
        updated.templateWeek.days[dayIndex].exercises.push({
          id: exercise.id,
          name: exercise.name,
          bodyPart: exercise.bodyPart,
          equipment: exercise.equipment[0] || 'bodyweight',
          sets: exercise.defaultSets,
          reps: exercise.defaultReps,
          intensity: 'RPE 7',
          rest: '2 min',
          notes: '',
        });
      }
      return updated;
    });
    setAddingToDay(null);
  }, []);

  const updateExerciseField = useCallback((dayIndex: number, exerciseIndex: number, field: string, value: string | number) => {
    setEditedPlan((prev: any) => {
      const updated = JSON.parse(JSON.stringify(prev));
      if (updated.templateWeek?.days?.[dayIndex]?.exercises?.[exerciseIndex]) {
        updated.templateWeek.days[dayIndex].exercises[exerciseIndex][field] = value;
      }
      return updated;
    });
  }, []);

  const handleStartEdit = () => setStep('edit');
  const handleSkipEdit = () => setStep('confirm');
  const handleBackToReview = () => {
    setStep('review');
    setSwappingExercise(null);
    setAddingToDay(null);
  };

  const handleSave = async () => {
    await onSave(editedPlan);
  };

  // Show the exercise library picker inline
  const showingLibrary = swappingExercise !== null || addingToDay !== null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center neon-glow">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="font-display text-xl tracking-wide flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                {title}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {isEditing ? 'Edit exercises, swap, or add new ones' : `Review, edit, and save to your ${hubName}`}
              </p>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <AnimatePresence mode="wait">
            {/* Steps: review & edit share the same layout */}
            {(step === 'review' || step === 'edit') && !showingLibrary && (
              <motion.div
                key="review-edit"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5 py-4"
              >
                {/* Programme Name */}
                <div>
                  {isEditing ? (
                    <Input
                      value={editedPlan.programName || editedPlan.planName || ''}
                      onChange={(e) => updatePlanField(isProgramme ? 'programName' : 'planName', e.target.value)}
                      className="font-display text-xl tracking-wide border-primary/40"
                      placeholder="Programme name..."
                    />
                  ) : (
                    <h2 className="font-display text-2xl tracking-wide text-primary neon-glow-subtle text-center">
                      {editedPlan.programName || editedPlan.planName || 'Your Plan'}
                    </h2>
                  )}
                </div>

                {/* Overview */}
                <div>
                  {isEditing ? (
                    <Textarea
                      value={editedPlan.overview || editedPlan.description || ''}
                      onChange={(e) => updatePlanField(isProgramme ? 'overview' : 'description', e.target.value)}
                      className="min-h-[80px] text-sm border-primary/40"
                      placeholder="Programme overview..."
                    />
                  ) : (
                    <p className="text-muted-foreground text-center max-w-md mx-auto text-sm leading-relaxed">
                      {editedPlan.overview || editedPlan.description || 'Custom plan generated for you'}
                    </p>
                  )}
                </div>

                {/* Weekly Schedule */}
                {isProgramme && editedPlan.weeklySchedule && (
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {editedPlan.weeklySchedule.map((day: any, idx: number) => (
                      <div key={idx} className="text-center px-2 py-1.5 rounded bg-muted/50 min-w-[52px]">
                        <p className="text-[10px] text-muted-foreground">{day.day?.slice(0, 3)}</p>
                        <p className="text-[10px] font-medium mt-0.5 truncate" title={day.focus}>
                          {day.focus || day.type}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Workout Days with Exercises */}
                {isProgramme && days.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Dumbbell className="w-4 h-4 text-primary" />
                      <span className="font-display text-sm tracking-wide text-primary">WORKOUTS</span>
                    </div>
                    {days.map((day, dayIndex) => (
                      <Collapsible
                        key={dayIndex}
                        open={expandedDay === dayIndex}
                        onOpenChange={() => setExpandedDay(expandedDay === dayIndex ? null : dayIndex)}
                      >
                        <CollapsibleTrigger asChild>
                          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border cursor-pointer hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-2">
                              <span className="font-display text-sm tracking-wide text-primary">
                                {day.day}
                              </span>
                              <span className="text-xs text-muted-foreground">— {day.sessionType}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[10px]">{day.duration}</Badge>
                              <Badge variant="secondary" className="text-[10px]">{day.exercises?.length || 0} exercises</Badge>
                              {expandedDay === dayIndex ? (
                                <ChevronUp className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="mt-1 p-3 rounded-b-lg border border-t-0 border-border space-y-2">
                            {/* Warmup */}
                            {day.warmup && (
                              <p className="text-xs text-muted-foreground">
                                <span className="text-primary font-medium">Warmup:</span> {day.warmup}
                              </p>
                            )}

                            {/* Exercises */}
                            {(day.exercises || []).map((exercise: Exercise, exIndex: number) => (
                              <div key={exIndex} className="flex items-center gap-2 p-2 rounded bg-background border border-border/50">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-sm font-medium truncate">{exercise.name}</span>
                                    {exercise.bodyPart && (
                                      <Badge variant="outline" className="text-[9px] h-4 capitalize shrink-0">
                                        {exercise.bodyPart}
                                      </Badge>
                                    )}
                                  </div>
                                  {isEditing ? (
                                    <div className="flex gap-1.5 mt-1">
                                      <Input
                                        value={exercise.sets}
                                        onChange={(e) => updateExerciseField(dayIndex, exIndex, 'sets', e.target.value)}
                                        className="h-6 text-[10px] w-14 px-1"
                                        placeholder="Sets"
                                      />
                                      <Input
                                        value={exercise.reps}
                                        onChange={(e) => updateExerciseField(dayIndex, exIndex, 'reps', e.target.value)}
                                        className="h-6 text-[10px] w-16 px-1"
                                        placeholder="Reps"
                                      />
                                      <Input
                                        value={exercise.intensity}
                                        onChange={(e) => updateExerciseField(dayIndex, exIndex, 'intensity', e.target.value)}
                                        className="h-6 text-[10px] w-16 px-1"
                                        placeholder="RPE"
                                      />
                                      <Input
                                        value={exercise.rest}
                                        onChange={(e) => updateExerciseField(dayIndex, exIndex, 'rest', e.target.value)}
                                        className="h-6 text-[10px] w-16 px-1"
                                        placeholder="Rest"
                                      />
                                    </div>
                                  ) : (
                                    <p className="text-[11px] text-muted-foreground mt-0.5">
                                      {exercise.sets} × {exercise.reps} · {exercise.intensity} · Rest: {exercise.rest}
                                    </p>
                                  )}
                                  {exercise.notes && !isEditing && (
                                    <p className="text-[10px] text-muted-foreground/70 italic mt-0.5">{exercise.notes}</p>
                                  )}
                                </div>

                                {isEditing && (
                                  <div className="flex flex-col gap-1 shrink-0">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={() => setSwappingExercise({ dayIndex, exerciseIndex: exIndex })}
                                      title="Swap exercise"
                                    >
                                      <RefreshCw className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                      onClick={() => removeExercise(dayIndex, exIndex)}
                                      title="Remove exercise"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            ))}

                            {/* Add Exercise Button (edit mode) */}
                            {isEditing && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full gap-1.5 h-8 text-xs border-dashed border-primary/40"
                                onClick={() => setAddingToDay(dayIndex)}
                              >
                                <Plus className="w-3 h-3" />
                                ADD EXERCISE
                              </Button>
                            )}

                            {/* Cooldown */}
                            {day.cooldown && (
                              <p className="text-xs text-muted-foreground">
                                <span className="text-primary font-medium">Cooldown:</span> {day.cooldown}
                              </p>
                            )}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                )}

                {/* Meal Plan Days Preview */}
                {!isProgramme && editedPlan.days && (
                  <div className="space-y-2">
                    {editedPlan.days.slice(0, 3).map((day: any, idx: number) => (
                      <div key={idx} className="p-3 rounded bg-muted/30 border border-border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-display tracking-wide text-primary text-sm">
                            {day.dayName}
                          </span>
                          <Badge variant={day.isTrainingDay ? 'default' : 'secondary'} className="text-xs">
                            {day.isTrainingDay ? 'Training' : 'Rest'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {day.totalCalories} kcal • {day.totalProtein}g protein
                        </p>
                      </div>
                    ))}
                    {editedPlan.days.length > 3 && (
                      <p className="text-xs text-muted-foreground text-center">
                        +{editedPlan.days.length - 3} more days...
                      </p>
                    )}
                  </div>
                )}

                {/* Phases (review only) */}
                {isProgramme && editedPlan.phases && !isEditing && (
                  <div className="space-y-1.5">
                    <span className="font-display text-xs tracking-wide text-muted-foreground">PHASES</span>
                    {editedPlan.phases.map((phase: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        <Badge variant="outline" className="text-[10px]">{phase.weeks}</Badge>
                        <span className="font-medium">{phase.name}</span>
                        <span className="text-muted-foreground">— {phase.focus}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 pt-4 border-t border-border">
                  {isEditing ? (
                    <>
                      <Button onClick={handleSkipEdit} className="w-full gap-2">
                        <Check className="w-4 h-4" />
                        DONE EDITING
                      </Button>
                      <Button variant="ghost" onClick={handleBackToReview} className="w-full text-muted-foreground">
                        ← Back to review
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={handleStartEdit}
                        variant="outline"
                        className="w-full gap-2 border-primary/40 hover:border-primary"
                      >
                        <Edit3 className="w-4 h-4" />
                        MAKE ADJUSTMENTS
                      </Button>
                      <Button onClick={handleSkipEdit} className="w-full gap-2">
                        <Check className="w-4 h-4" />
                        LOOKS GOOD - CONTINUE
                      </Button>
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {/* Exercise Library Picker (inline) */}
            {showingLibrary && (
              <motion.div
                key="library"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="py-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display text-sm tracking-wide text-primary">
                    {swappingExercise ? 'SWAP EXERCISE' : 'ADD EXERCISE'}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setSwappingExercise(null); setAddingToDay(null); }}
                    className="h-7 text-xs"
                  >
                    <X className="w-3 h-3 mr-1" /> Cancel
                  </Button>
                </div>
                <ScrollableExerciseLibrary
                  onSelectExercise={(exercise) => {
                    if (swappingExercise) {
                      swapExercise(swappingExercise.dayIndex, swappingExercise.exerciseIndex, exercise);
                    } else if (addingToDay !== null) {
                      addExercise(addingToDay, exercise);
                    }
                  }}
                  className="max-h-[50vh]"
                />
              </motion.div>
            )}

            {/* Step 3: Confirmation */}
            {step === 'confirm' && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 py-4"
              >
                <div className="text-center space-y-4 pb-6 border-b border-border">
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto neon-glow">
                    <Save className="w-10 h-10 text-primary" />
                  </div>
                  <h2 className="font-display text-2xl tracking-wide">
                    READY TO SAVE?
                  </h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Your {isProgramme ? 'programme' : 'meal plan'} will be saved to{' '}
                    <span className="text-primary">{hubName}</span> with status{' '}
                    <Badge variant="secondary">Not Started</Badge>
                  </p>
                </div>

                {/* Summary Card */}
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Icon className="w-6 h-6 text-primary" />
                        <div>
                          <p className="font-display tracking-wide">
                            {editedPlan.programName || editedPlan.planName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {isProgramme
                              ? `${editedPlan.templateWeek?.days?.length || 0} training days per week`
                              : `${editedPlan.days?.length || 7} day meal plan`}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-4 border-t border-border">
                        <div className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-primary" />
                          <span>Fully editable</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-primary" />
                          <span>Progress tracking</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-primary" />
                          <span>AI feedback</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-primary" />
                          <span>Start anytime</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full gap-2 h-12"
                    size="lg"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                        SAVING...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        SAVE TO {hubName.toUpperCase()}
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setStep('edit')}
                    className="w-full text-muted-foreground gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    GO BACK AND EDIT
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={onClose}
                    className="w-full text-muted-foreground gap-2"
                  >
                    <X className="w-4 h-4" />
                    DISCARD
                  </Button>
                </div>

                <div className="text-center pt-4 border-t border-border">
                  <p className="text-primary font-display text-sm tracking-wide neon-glow-subtle">
                    KEEP SHOWING UP.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
