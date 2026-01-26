import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dumbbell,
  UtensilsCrossed,
  Clock,
  Flame,
  ChevronDown,
  ChevronUp,
  Target,
  Repeat,
  Timer,
  Coffee,
  Salad,
  Sandwich,
  Moon,
  Utensils,
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { GeneratedProgram, WorkoutDay, Exercise } from '@/lib/programTypes';

interface PlanContentRendererProps {
  planType: 'programme' | 'meal_plan';
  planData: GeneratedProgram | any;
}

// Workout Exercise Card
function ExerciseCard({ exercise, index }: { exercise: Exercise; index: number }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-background/50 rounded-lg border border-border/50">
      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
        <span className="text-xs font-bold text-primary">{index + 1}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-foreground truncate">{exercise.name}</p>
        <div className="flex flex-wrap gap-2 mt-1.5">
          <Badge variant="secondary" className="text-xs gap-1">
            <Repeat className="w-3 h-3" />
            {exercise.sets} × {exercise.reps}
          </Badge>
          {exercise.intensity && (
            <Badge variant="outline" className="text-xs gap-1 border-primary/30 text-primary">
              <Target className="w-3 h-3" />
              {exercise.intensity}
            </Badge>
          )}
          {exercise.rest && (
            <Badge variant="outline" className="text-xs gap-1">
              <Timer className="w-3 h-3" />
              {exercise.rest}
            </Badge>
          )}
        </div>
        {exercise.notes && (
          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{exercise.notes}</p>
        )}
      </div>
    </div>
  );
}

// Workout Day Card
function WorkoutDayCard({ day, dayIndex }: { day: WorkoutDay; dayIndex: number }) {
  const [isOpen, setIsOpen] = useState(dayIndex === 0);
  
  return (
    <Card className="border-border/50 bg-card/50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-display text-sm tracking-wide text-primary">{day.day}</p>
                <p className="text-xs text-muted-foreground">{day.sessionType}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs gap-1">
                <Clock className="w-3 h-3" />
                {day.duration}
              </Badge>
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-3 pb-3 space-y-2">
            {/* Warmup */}
            {day.warmup && (
              <div className="p-2 bg-muted/30 rounded-lg text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Warmup:</span> {day.warmup}
              </div>
            )}
            
            {/* Exercises */}
            <div className="space-y-2">
              {day.exercises?.map((exercise, idx) => (
                <ExerciseCard key={idx} exercise={exercise} index={idx} />
              ))}
            </div>
            
            {/* Cooldown */}
            {day.cooldown && (
              <div className="p-2 bg-muted/30 rounded-lg text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Cooldown:</span> {day.cooldown}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

// Meal Item Card
function MealItemCard({ meal, mealType }: { meal: any; mealType: string }) {
  const getMealIcon = () => {
    switch (mealType.toLowerCase()) {
      case 'breakfast': return <Coffee className="w-4 h-4" />;
      case 'lunch': return <Sandwich className="w-4 h-4" />;
      case 'dinner': return <Moon className="w-4 h-4" />;
      case 'snack': return <Salad className="w-4 h-4" />;
      default: return <Utensils className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex items-start gap-3 p-3 bg-background/50 rounded-lg border border-border/50">
      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-primary">
        {getMealIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-foreground">{meal.name || meal.food_name}</p>
        {meal.description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{meal.description}</p>
        )}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {meal.calories && (
            <Badge variant="secondary" className="text-xs gap-1">
              <Flame className="w-3 h-3" />
              {meal.calories} kcal
            </Badge>
          )}
          {meal.protein && (
            <Badge variant="outline" className="text-xs border-primary/30 text-primary">
              {meal.protein}g protein
            </Badge>
          )}
          {meal.carbs && (
            <Badge variant="outline" className="text-xs">
              {meal.carbs}g carbs
            </Badge>
          )}
          {meal.fat && (
            <Badge variant="outline" className="text-xs">
              {meal.fat}g fat
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

// Meal Plan Day Card
function MealDayCard({ day, dayIndex }: { day: any; dayIndex: number }) {
  const [isOpen, setIsOpen] = useState(dayIndex === 0);
  
  const meals = day.meals || [
    day.breakfast && { ...day.breakfast, type: 'breakfast' },
    day.lunch && { ...day.lunch, type: 'lunch' },
    day.dinner && { ...day.dinner, type: 'dinner' },
    day.snacks && { ...day.snacks, type: 'snack' },
  ].filter(Boolean);

  return (
    <Card className="border-border/50 bg-card/50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-display text-sm tracking-wide text-primary">
                  {day.dayName || day.day || `Day ${dayIndex + 1}`}
                </p>
                <p className="text-xs text-muted-foreground">{meals.length} meals planned</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs gap-1">
                <Flame className="w-3 h-3" />
                {day.totalCalories || 0} kcal
              </Badge>
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-3 pb-3 space-y-2">
            {meals.map((meal: any, idx: number) => (
              <MealItemCard 
                key={idx} 
                meal={meal} 
                mealType={meal.type || meal.mealType || 'meal'} 
              />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export function PlanContentRenderer({ planType, planData }: PlanContentRendererProps) {
  const isProgramme = planType === 'programme';
  
  // Programme rendering
  if (isProgramme) {
    const days = planData.templateWeek?.days || planData.weeks?.[0]?.days || [];
    const phases = planData.phases || [];
    
    return (
      <div className="space-y-4 max-w-full">
        {/* Weekly Schedule Tab Navigation */}
        {days.length > 0 && (
          <Tabs defaultValue="schedule" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50">
              <TabsTrigger value="schedule" className="text-xs">Weekly Schedule</TabsTrigger>
              <TabsTrigger value="phases" className="text-xs">Phases & Progression</TabsTrigger>
            </TabsList>
            
            <TabsContent value="schedule" className="mt-3">
              <ScrollArea className="h-[280px] pr-2">
                <div className="space-y-2">
                  {days.map((day: WorkoutDay, idx: number) => (
                    <WorkoutDayCard key={idx} day={day} dayIndex={idx} />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="phases" className="mt-3">
              <ScrollArea className="h-[280px] pr-2">
                <div className="space-y-3">
                  {phases.map((phase: any, idx: number) => (
                    <Card key={idx} className="border-border/50 bg-card/50">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="text-xs">Phase {idx + 1}</Badge>
                          <span className="font-display text-sm text-primary">{phase.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{phase.weeks} • {phase.focus}</p>
                        {phase.notes && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{phase.notes}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  
                  {/* Progression Rules */}
                  {planData.progressionRules?.length > 0 && (
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="font-medium text-sm text-foreground mb-2">Progression Rules</p>
                      <ul className="space-y-1">
                        {planData.progressionRules.map((rule: string, idx: number) => (
                          <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                            <span className="text-primary">•</span>
                            {rule}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}
        
        {/* If no structured days, show raw data notice */}
        {days.length === 0 && (
          <div className="p-4 bg-muted/30 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">Programme structure loading...</p>
          </div>
        )}
      </div>
    );
  }
  
  // Meal Plan rendering
  const days = planData.days || [];
  
  return (
    <div className="space-y-4 max-w-full">
      {days.length > 0 ? (
        <ScrollArea className="h-[280px] pr-2">
          <div className="space-y-2">
            {days.map((day: any, idx: number) => (
              <MealDayCard key={idx} day={day} dayIndex={idx} />
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="p-4 bg-muted/30 rounded-lg text-center">
          <p className="text-sm text-muted-foreground">Meal plan structure loading...</p>
        </div>
      )}
      
      {/* Nutrition Tips */}
      {planData.nutritionTips?.length > 0 && (
        <div className="p-3 bg-muted/30 rounded-lg">
          <p className="font-medium text-sm text-foreground mb-2">Nutrition Tips</p>
          <ul className="space-y-1">
            {planData.nutritionTips.slice(0, 3).map((tip: string, idx: number) => (
              <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-primary">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
