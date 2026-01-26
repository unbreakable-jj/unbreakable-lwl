import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useMealPlans } from '@/hooks/useMealPlans';
import { MealType, mealTypeLabels, dayLabels } from '@/lib/fuelTypes';
import { 
  Plus, 
  Calendar,
  Trash2,
  Check,
  MoreVertical,
  Coffee,
  UtensilsCrossed,
  Moon,
  Cookie
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';

const mealIcons: Record<MealType, React.ReactNode> = {
  breakfast: <Coffee className="w-4 h-4" />,
  lunch: <UtensilsCrossed className="w-4 h-4" />,
  dinner: <Moon className="w-4 h-4" />,
  snack: <Cookie className="w-4 h-4" />,
};

export function MealPlanning() {
  const { mealPlans, activePlan, planItems, isLoading, createMealPlan, setActivePlan, deleteMealPlan } = useMealPlans();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanDescription, setNewPlanDescription] = useState('');
  const [selectedDay, setSelectedDay] = useState(0);

  const handleCreatePlan = async () => {
    if (!newPlanName.trim()) return;
    
    await createMealPlan.mutateAsync({
      name: newPlanName,
      description: newPlanDescription,
      is_active: mealPlans?.length === 0,
    });
    
    setShowCreateModal(false);
    setNewPlanName('');
    setNewPlanDescription('');
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

  return (
    <div className="space-y-6">
      {/* Plan Selector */}
      <div className="flex flex-wrap gap-3 items-center">
        <p className="font-display tracking-wide text-muted-foreground">MY PLANS:</p>
        
        {mealPlans?.map((plan) => (
          <div key={plan.id} className="flex items-center gap-1">
            <Badge
              variant={plan.is_active ? 'default' : 'outline'}
              className="cursor-pointer px-3 py-1"
              onClick={() => setActivePlan.mutate(plan.id)}
            >
              {plan.is_active && <Check className="w-3 h-3 mr-1" />}
              {plan.name}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setActivePlan.mutate(plan.id)}>
                  Set as Active
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={() => deleteMealPlan.mutate(plan.id)}
                >
                  Delete Plan
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
        
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

      {/* No plans message */}
      {(!mealPlans || mealPlans.length === 0) && (
        <Card className="p-8 text-center">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-display text-xl tracking-wide mb-2">NO MEAL PLANS YET</h3>
          <p className="text-muted-foreground mb-4">
            Create your first meal plan to start organizing your weekly nutrition.
          </p>
          <Button onClick={() => setShowCreateModal(true)} className="font-display tracking-wide">
            <Plus className="w-4 h-4 mr-2" />
            CREATE MEAL PLAN
          </Button>
        </Card>
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
