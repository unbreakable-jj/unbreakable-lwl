import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useMealPlans } from '@/hooks/useMealPlans';
import { MealType, mealTypeLabels, dayLabels } from '@/lib/fuelTypes';
import { MealPlanCTA } from './NutritionCoachCTA';
import { MealPlanExecutionView } from './MealPlanExecutionView';
import { 
  Plus, 
  Calendar,
  Check,
  MoreVertical,
  Coffee,
  UtensilsCrossed,
  Moon,
  Cookie,
  Play,
  Pause,
  AlertCircle,
  Flame
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const mealIcons: Record<MealType, React.ReactNode> = {
  breakfast: <Coffee className="w-4 h-4" />,
  lunch: <UtensilsCrossed className="w-4 h-4" />,
  dinner: <Moon className="w-4 h-4" />,
  snack: <Cookie className="w-4 h-4" />,
};

export function MealPlanning() {
  const { 
    mealPlans, 
    activePlan, 
    activePlans,
    activePlansCount,
    canActivateMore,
    planItems, 
    isLoading, 
    createMealPlan, 
    setActivePlan,
    deactivatePlan,
    deleteMealPlan 
  } = useMealPlans();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanDescription, setNewPlanDescription] = useState('');
  const [selectedDay, setSelectedDay] = useState(0);
  const [executingPlanId, setExecutingPlanId] = useState<string | null>(null);

  const handleCreatePlan = async () => {
    if (!newPlanName.trim()) return;
    
    await createMealPlan.mutateAsync({
      name: newPlanName,
      description: newPlanDescription,
      is_active: false,
    });
    
    setShowCreateModal(false);
    setNewPlanName('');
    setNewPlanDescription('');
  };

  const handleActivatePlan = async (planId: string) => {
    if (!canActivateMore) {
      toast.error('Maximum 3 active meal plans allowed. Deactivate one first.');
      return;
    }
    await setActivePlan.mutateAsync(planId);
  };

  const getDayItems = (dayIndex: number) => {
    return planItems?.filter((item) => item.day_of_week === dayIndex) || [];
  };

  const getMealItems = (dayIndex: number, mealType: MealType) => {
    return getDayItems(dayIndex).filter((item) => item.meal_type === mealType);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If executing a plan, show execution view
  if (executingPlanId) {
    return (
      <MealPlanExecutionView
        planId={executingPlanId}
        onBack={() => setExecutingPlanId(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Active Plans Limit Indicator */}
      <Card className="border border-border">
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-primary" />
              <span className="font-display tracking-wide">ACTIVE PLANS</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {activePlansCount} / 3 slots used
            </span>
          </div>
          <Progress value={(activePlansCount / 3) * 100} className="h-2" />
          {!canActivateMore && (
            <p className="text-xs text-muted-foreground mt-2">
              Deactivate a plan to activate another
            </p>
          )}
        </CardContent>
      </Card>

      {/* Plan Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="font-display tracking-wide text-lg">MY MEAL PLANS</p>
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="font-display tracking-wide">
                <Plus className="w-4 h-4 mr-1" />
                NEW PLAN
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display tracking-wide">CREATE MEAL PLAN</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Plan Name *</Label>
                  <Input
                    placeholder="e.g., High Protein Week"
                    value={newPlanName}
                    onChange={(e) => setNewPlanName(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Description (optional)</Label>
                  <Input
                    placeholder="Brief description..."
                    value={newPlanDescription}
                    onChange={(e) => setNewPlanDescription(e.target.value)}
                  />
                </div>
                <Button 
                  className="w-full font-display tracking-wide"
                  onClick={handleCreatePlan}
                  disabled={!newPlanName.trim() || createMealPlan.isPending}
                >
                  CREATE PLAN
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {mealPlans?.map((plan) => {
          const itemCount = planItems?.filter(i => i.meal_plan_id === plan.id).length || 0;
          
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className={`border ${plan.is_active ? 'border-primary/50 bg-primary/5' : 'border-border'}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {plan.is_active && (
                          <Badge variant="default" className="bg-primary/20 text-primary text-xs">
                            <Flame className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        )}
                        <span className="font-display tracking-wide">{plan.name}</span>
                      </div>
                      {plan.description && (
                        <p className="text-sm text-muted-foreground">{plan.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {itemCount} meals planned
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {plan.is_active && (
                        <Button
                          variant="default"
                          size="sm"
                          className="font-display tracking-wide"
                          onClick={() => setExecutingPlanId(plan.id)}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Track
                        </Button>
                      )}
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {plan.is_active ? (
                            <DropdownMenuItem onClick={() => deactivatePlan.mutate(plan.id)}>
                              <Pause className="w-4 h-4 mr-2" />
                              Deactivate
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              onClick={() => handleActivatePlan(plan.id)}
                              disabled={!canActivateMore}
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Activate
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => deleteMealPlan.mutate(plan.id)}
                          >
                            Delete Plan
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* No plans message */}
      {(!mealPlans || mealPlans.length === 0) && (
        <div className="space-y-4">
          <MealPlanCTA variant="banner" />
          
          <Card className="p-8 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-xl tracking-wide mb-2">NO MEAL PLANS YET</h3>
            <p className="text-muted-foreground mb-4">
              Create your first meal plan manually or ask your coach to build one for you.
            </p>
            <Button onClick={() => setShowCreateModal(true)} className="font-display tracking-wide">
              <Plus className="w-4 h-4 mr-2" />
              CREATE MANUALLY
            </Button>
          </Card>
        </div>
      )}

      {/* Active Plan View */}
      {activePlan && (
        <div className="space-y-6">
          <Card className="border-2 border-primary/30 neon-border-subtle">
            <CardHeader>
              <CardTitle className="font-display tracking-wide flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                {activePlan.name}
              </CardTitle>
              {activePlan.description && (
                <p className="text-sm text-muted-foreground">{activePlan.description}</p>
              )}
            </CardHeader>
          </Card>

          {/* Day Selector */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {dayLabels.map((day, index) => (
              <Button
                key={day}
                variant={selectedDay === index ? 'default' : 'outline'}
                className="font-display tracking-wide min-w-[100px]"
                onClick={() => setSelectedDay(index)}
              >
                {day.slice(0, 3).toUpperCase()}
              </Button>
            ))}
          </div>

          {/* Selected Day Meals */}
          <div className="space-y-4">
            <h3 className="font-display text-lg tracking-wide">
              {dayLabels[selectedDay].toUpperCase()}
            </h3>
            
            {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((mealType) => {
              const items = getMealItems(selectedDay, mealType);
              
              return (
                <Card key={mealType} className="border border-border">
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          {mealIcons[mealType]}
                        </div>
                        <span className="font-display tracking-wide">
                          {mealTypeLabels[mealType].toUpperCase()}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {items.length > 0 ? (
                      <div className="space-y-2">
                        {items.map((item) => (
                          <div key={item.id} className="flex justify-between items-center py-2 border-t border-border">
                            <span>{item.food_name}</span>
                            <span className="text-sm text-muted-foreground">{item.calories} kcal</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No items planned. Tap + to add.
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
