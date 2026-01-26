import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
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
  ArrowRight,
  Calendar,
  Clock,
  Target,
  Trash2,
} from 'lucide-react';
import { GeneratedProgram, WorkoutDay } from '@/lib/programTypes';

type PlanType = 'programme' | 'meal_plan';

interface EditPrompt {
  id: string;
  question: string;
  type: 'yes_no' | 'text' | 'number' | 'select';
  field?: string;
  options?: string[];
  answered?: boolean;
  answer?: string | number | boolean;
}

interface AIPlanReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  planType: PlanType;
  planData: GeneratedProgram | any; // GeneratedProgram for workouts, meal plan structure for meals
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
  const [editedPlan, setEditedPlan] = useState(planData);
  const [expandedSection, setExpandedSection] = useState<string | null>('overview');
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [editPrompts, setEditPrompts] = useState<EditPrompt[]>([]);

  const isProgramme = planType === 'programme';
  const Icon = isProgramme ? Dumbbell : UtensilsCrossed;
  const title = isProgramme ? 'YOUR PROGRAMME' : 'YOUR MEAL PLAN';
  const hubName = isProgramme ? 'My Programmes' : 'My Meal Plans';

  // Generate guided edit prompts based on plan type
  const generateEditPrompts = (): EditPrompt[] => {
    if (isProgramme) {
      return [
        {
          id: 'adjust_days',
          question: 'Would you like to adjust the training days or schedule?',
          type: 'yes_no',
        },
        {
          id: 'swap_exercises',
          question: 'Would you like to swap any exercises in the programme?',
          type: 'yes_no',
        },
        {
          id: 'adjust_intensity',
          question: 'Would you like to adjust the intensity or volume?',
          type: 'yes_no',
        },
        {
          id: 'add_notes',
          question: 'Any additional notes or preferences to include?',
          type: 'text',
          field: 'notes',
        },
      ];
    } else {
      return [
        {
          id: 'swap_meals',
          question: 'Would you like to swap any meals or recipes?',
          type: 'yes_no',
        },
        {
          id: 'adjust_portions',
          question: 'Would you like to adjust portion sizes?',
          type: 'yes_no',
        },
        {
          id: 'dietary_changes',
          question: 'Any dietary restrictions or preferences to apply?',
          type: 'text',
          field: 'dietary_notes',
        },
        {
          id: 'add_snacks',
          question: 'Would you like to add or remove snacks?',
          type: 'yes_no',
        },
      ];
    }
  };

  const handleStartEdit = () => {
    setEditPrompts(generateEditPrompts());
    setCurrentPromptIndex(0);
    setStep('edit');
  };

  const handlePromptAnswer = (promptId: string, answer: string | number | boolean) => {
    setEditPrompts((prev) =>
      prev.map((p) => (p.id === promptId ? { ...p, answered: true, answer } : p))
    );

    // Move to next prompt or confirmation
    if (currentPromptIndex < editPrompts.length - 1) {
      setCurrentPromptIndex(currentPromptIndex + 1);
    } else {
      setStep('confirm');
    }
  };

  const handleSkipEdit = () => {
    setStep('confirm');
  };

  const handleSave = async () => {
    await onSave(editedPlan);
  };

  const handleDiscard = () => {
    onClose();
  };

  const currentPrompt = editPrompts[currentPromptIndex];
  const progress = editPrompts.length > 0 
    ? ((currentPromptIndex + 1) / editPrompts.length) * 100 
    : 0;

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
                Review, edit, and save to your {hubName}
              </p>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <AnimatePresence mode="wait">
            {/* Step 1: Review */}
            {step === 'review' && (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 py-4"
              >
                {/* Plan Header */}
                <div className="text-center pb-4 border-b border-border">
                  <h2 className="font-display text-2xl tracking-wide text-primary neon-glow-subtle">
                    {editedPlan.programName || editedPlan.planName || 'Your Plan'}
                  </h2>
                  <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                    {editedPlan.overview || editedPlan.description || 'Custom plan generated for you'}
                  </p>
                </div>

                {/* Plan Summary */}
                {isProgramme && editedPlan.weeklySchedule && (
                  <Collapsible
                    open={expandedSection === 'schedule'}
                    onOpenChange={() =>
                      setExpandedSection(expandedSection === 'schedule' ? null : 'schedule')
                    }
                  >
                    <CollapsibleTrigger asChild>
                      <Card className="border-primary/20 cursor-pointer hover:bg-primary/5 transition-colors">
                        <CardHeader className="py-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-5 h-5 text-primary" />
                              <CardTitle className="font-display text-lg tracking-wide">
                                WEEKLY SCHEDULE
                              </CardTitle>
                            </div>
                            {expandedSection === 'schedule' ? (
                              <ChevronUp className="w-5 h-5 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                        </CardHeader>
                      </Card>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <Card className="border-t-0 rounded-t-none border-primary/20">
                        <CardContent className="pt-4">
                          <div className="grid grid-cols-7 gap-2">
                            {editedPlan.weeklySchedule.map((day: any, idx: number) => (
                              <div key={idx} className="text-center p-2 rounded bg-muted/50">
                                <p className="text-xs text-muted-foreground">{day.day?.slice(0, 3)}</p>
                                <p className="text-xs font-medium mt-1 truncate" title={day.focus}>
                                  {day.focus || day.type}
                                </p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Template Week / Days Preview */}
                {isProgramme && editedPlan.templateWeek?.days && (
                  <Collapsible
                    open={expandedSection === 'workouts'}
                    onOpenChange={() =>
                      setExpandedSection(expandedSection === 'workouts' ? null : 'workouts')
                    }
                  >
                    <CollapsibleTrigger asChild>
                      <Card className="border-primary/20 cursor-pointer hover:bg-primary/5 transition-colors">
                        <CardHeader className="py-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Dumbbell className="w-5 h-5 text-primary" />
                              <CardTitle className="font-display text-lg tracking-wide">
                                WORKOUTS ({editedPlan.templateWeek.days.length} DAYS)
                              </CardTitle>
                            </div>
                            {expandedSection === 'workouts' ? (
                              <ChevronUp className="w-5 h-5 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                        </CardHeader>
                      </Card>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <Card className="border-t-0 rounded-t-none border-primary/20">
                        <CardContent className="pt-4 space-y-3">
                          {editedPlan.templateWeek.days.map((day: WorkoutDay, idx: number) => (
                            <div key={idx} className="p-3 rounded bg-muted/30 border border-border">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-display tracking-wide text-primary">
                                  {day.day} - {day.sessionType}
                                </span>
                                <Badge variant="outline">{day.duration}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {day.exercises?.length || 0} exercises
                              </p>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Meal Plan Days Preview */}
                {!isProgramme && editedPlan.days && (
                  <Collapsible
                    open={expandedSection === 'meals'}
                    onOpenChange={() =>
                      setExpandedSection(expandedSection === 'meals' ? null : 'meals')
                    }
                  >
                    <CollapsibleTrigger asChild>
                      <Card className="border-primary/20 cursor-pointer hover:bg-primary/5 transition-colors">
                        <CardHeader className="py-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <UtensilsCrossed className="w-5 h-5 text-primary" />
                              <CardTitle className="font-display text-lg tracking-wide">
                                DAILY MEALS ({editedPlan.days.length} DAYS)
                              </CardTitle>
                            </div>
                            {expandedSection === 'meals' ? (
                              <ChevronUp className="w-5 h-5 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                        </CardHeader>
                      </Card>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <Card className="border-t-0 rounded-t-none border-primary/20">
                        <CardContent className="pt-4 space-y-3">
                          {editedPlan.days.slice(0, 3).map((day: any, idx: number) => (
                            <div key={idx} className="p-3 rounded bg-muted/30 border border-border">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-display tracking-wide text-primary">
                                  {day.dayName}
                                </span>
                                <Badge variant={day.isTrainingDay ? 'default' : 'secondary'}>
                                  {day.isTrainingDay ? 'Training' : 'Rest'}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {day.totalCalories} kcal • {day.totalProtein}g protein
                              </p>
                            </div>
                          ))}
                          {editedPlan.days.length > 3 && (
                            <p className="text-sm text-muted-foreground text-center">
                              +{editedPlan.days.length - 3} more days...
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 pt-4 border-t border-border">
                  <Button
                    onClick={handleStartEdit}
                    variant="outline"
                    className="w-full gap-2 border-primary/40 hover:border-primary"
                  >
                    <Edit3 className="w-4 h-4" />
                    MAKE ADJUSTMENTS
                  </Button>
                  <Button
                    onClick={handleSkipEdit}
                    className="w-full gap-2"
                  >
                    <Check className="w-4 h-4" />
                    LOOKS GOOD - CONTINUE
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Guided Edit Prompts */}
            {step === 'edit' && currentPrompt && (
              <motion.div
                key={`edit-${currentPrompt.id}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 py-4"
              >
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Question {currentPromptIndex + 1} of {editPrompts.length}
                    </span>
                    <span className="text-primary font-display">REFINING YOUR PLAN</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                {/* Current Prompt */}
                <Card className="border-2 border-primary/30 neon-border-subtle">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-6">
                      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto neon-glow">
                        <Edit3 className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="font-display text-xl tracking-wide">
                        {currentPrompt.question}
                      </h3>

                      {currentPrompt.type === 'yes_no' && (
                        <div className="flex gap-4 justify-center">
                          <Button
                            variant="outline"
                            className="min-w-[120px] border-primary/40"
                            onClick={() => handlePromptAnswer(currentPrompt.id, false)}
                          >
                            NO, SKIP
                          </Button>
                          <Button
                            className="min-w-[120px]"
                            onClick={() => handlePromptAnswer(currentPrompt.id, true)}
                          >
                            YES
                          </Button>
                        </div>
                      )}

                      {currentPrompt.type === 'text' && (
                        <div className="space-y-4">
                          <Textarea
                            placeholder="Type your preferences here..."
                            className="min-h-[100px]"
                            onChange={(e) => {
                              // Store in local state
                            }}
                          />
                          <div className="flex gap-4 justify-center">
                            <Button
                              variant="outline"
                              onClick={() => handlePromptAnswer(currentPrompt.id, '')}
                            >
                              SKIP
                            </Button>
                            <Button
                              onClick={() => handlePromptAnswer(currentPrompt.id, 'saved')}
                            >
                              SAVE & CONTINUE
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Skip All Button */}
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground"
                  onClick={handleSkipEdit}
                >
                  Skip all adjustments →
                </Button>
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

                      {/* Features */}
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
                    variant="ghost"
                    onClick={handleDiscard}
                    className="w-full text-muted-foreground gap-2"
                  >
                    <X className="w-4 h-4" />
                    DISCARD
                  </Button>
                </div>

                {/* Branding */}
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
