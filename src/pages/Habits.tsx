import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { DailyHabitDiary, HabitState } from '@/components/programming/DailyHabitDiary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';

const Habits = () => {
  const [habits, setHabits] = useState<HabitState>({
    train: false,
    learnDaily: false,
    water: false,
    doTheHardThing: false,
    hitYourNumbers: false,
    journal: '',
  });

  const completedCount = [habits.train, habits.learnDaily, habits.water, habits.doTheHardThing, habits.hitYourNumbers, habits.journal.trim().length > 0].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background">
      <PageHeader sectionLabel="DAILY 6" />
      <main className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="font-display text-2xl tracking-wide text-foreground">DAILY HABIT TRACKER</h1>
          <p className="text-muted-foreground text-sm">Complete your Daily 6 to stay on track</p>
          <Badge variant="outline" className="text-sm">
            <CheckCircle2 className="w-4 h-4 mr-1" />
            {completedCount}/6 Complete
          </Badge>
        </div>

        <DailyHabitDiary habits={habits} onChange={setHabits} compact={false} />
      </main>
    </div>
  );
};

export default Habits;
