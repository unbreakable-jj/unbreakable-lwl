import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNutritionGoals } from '@/hooks/useNutritionGoals';
import { useFoodLogs } from '@/hooks/useFoodLogs';
import { useMealPlans } from '@/hooks/useMealPlans';
import { 
  Target, 
  TrendingUp,
  Calendar,
  Flame,
  Award,
  Settings,
  ChevronRight
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { format, subDays, eachDayOfInterval } from 'date-fns';

export function MyFuel() {
  const { goals, saveGoals, isLoading: goalsLoading } = useNutritionGoals();
  const { mealPlans, activePlan } = useMealPlans();
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [editedGoals, setEditedGoals] = useState({
    daily_calories: goals?.daily_calories || 2000,
    daily_protein_g: goals?.daily_protein_g || 150,
    daily_carbs_g: goals?.daily_carbs_g || 200,
    daily_fat_g: goals?.daily_fat_g || 70,
  });

  const handleSaveGoals = async () => {
    await saveGoals.mutateAsync(editedGoals);
    setShowGoalsModal(false);
  };

  // Calculate streak (simplified - would need more data)
  const streak = 0; // Would calculate from food_logs

  return (
    <div className="space-y-6">
      {/* Nutrition Goals Card */}
      <Card className="border-2 border-primary/30 neon-border-subtle">
        <CardHeader>
          <CardTitle className="font-display tracking-wide flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              DAILY GOALS
            </div>
            <Dialog open={showGoalsModal} onOpenChange={setShowGoalsModal}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="w-5 h-5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-display tracking-wide">SET NUTRITION GOALS</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Daily Calories</Label>
                    <Input
                      type="number"
                      min={1000}
                      max={10000}
                      value={editedGoals.daily_calories}
                      onChange={(e) => setEditedGoals({ ...editedGoals, daily_calories: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Protein (g)</Label>
                      <Input
                        type="number"
                        min={0}
                        value={editedGoals.daily_protein_g}
                        onChange={(e) => setEditedGoals({ ...editedGoals, daily_protein_g: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label>Carbs (g)</Label>
                      <Input
                        type="number"
                        min={0}
                        value={editedGoals.daily_carbs_g}
                        onChange={(e) => setEditedGoals({ ...editedGoals, daily_carbs_g: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label>Fat (g)</Label>
                      <Input
                        type="number"
                        min={0}
                        value={editedGoals.daily_fat_g}
                        onChange={(e) => setEditedGoals({ ...editedGoals, daily_fat_g: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full font-display tracking-wide"
                    onClick={handleSaveGoals}
                    disabled={saveGoals.isPending}
                  >
                    SAVE GOALS
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {goals ? (
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="font-display text-2xl text-primary">{goals.daily_calories}</p>
                <p className="text-xs text-muted-foreground">Calories</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="font-display text-2xl text-primary">{goals.daily_protein_g}g</p>
                <p className="text-xs text-muted-foreground">Protein</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="font-display text-2xl text-primary">{goals.daily_carbs_g}g</p>
                <p className="text-xs text-muted-foreground">Carbs</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="font-display text-2xl text-primary">{goals.daily_fat_g}g</p>
                <p className="text-xs text-muted-foreground">Fat</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">No goals set yet</p>
              <Button 
                variant="outline" 
                className="font-display tracking-wide"
                onClick={() => setShowGoalsModal(true)}
              >
                SET YOUR GOALS
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Flame className="w-10 h-10 text-primary mx-auto mb-3" />
            <p className="font-display text-3xl text-primary mb-1">{streak}</p>
            <p className="text-sm text-muted-foreground">Day Streak</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Calendar className="w-10 h-10 text-primary mx-auto mb-3" />
            <p className="font-display text-3xl text-primary mb-1">{mealPlans?.length || 0}</p>
            <p className="text-sm text-muted-foreground">Meal Plans</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Award className="w-10 h-10 text-primary mx-auto mb-3" />
            <p className="font-display text-3xl text-primary mb-1">0</p>
            <p className="text-sm text-muted-foreground">Goals Hit This Week</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Meal Plan */}
      {activePlan && (
        <Card>
          <CardHeader>
            <CardTitle className="font-display tracking-wide flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              ACTIVE MEAL PLAN
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{activePlan.name}</p>
                {activePlan.description && (
                  <p className="text-sm text-muted-foreground">{activePlan.description}</p>
                )}
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display tracking-wide flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            WEEKLY PROGRESS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {eachDayOfInterval({
              start: subDays(new Date(), 6),
              end: new Date(),
            }).map((day) => (
              <div key={day.toISOString()} className="text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  {format(day, 'EEE')}
                </p>
                <div className="w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center mx-auto">
                  <span className="text-xs text-muted-foreground">
                    {format(day, 'd')}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Log food daily to track your progress
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
