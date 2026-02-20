import { PageHeader } from '@/components/PageHeader';
import { DailyHabitDiary } from '@/components/programming/DailyHabitDiary';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { format, isToday as checkIsToday } from 'date-fns';
import { useDailyHabits } from '@/hooks/useDailyHabits';

const Habits = () => {
  const {
    habits,
    saveHabits,
    selectedDate,
    isToday,
    loading,
    saving,
    goToPreviousDay,
    goToNextDay,
    goToToday,
  } = useDailyHabits();

  const completedCount = [
    habits.train,
    habits.learnDaily,
    habits.water,
    habits.doTheHardThing,
    habits.hitYourNumbers,
    habits.journal.trim().length > 0,
  ].filter(Boolean).length;

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

        {/* Date Navigation */}
        <div className="flex items-center justify-center gap-3">
          <Button variant="ghost" size="icon" onClick={goToPreviousDay}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <button
            onClick={goToToday}
            className="font-display text-sm tracking-wide text-foreground min-w-[140px] text-center"
          >
            {isToday ? 'TODAY' : format(selectedDate, 'EEE, d MMM yyyy')}
          </button>
          <Button variant="ghost" size="icon" onClick={goToNextDay} disabled={isToday}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {saving && (
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="w-3 h-3 animate-spin" /> Saving...
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <DailyHabitDiary
            habits={habits}
            onChange={saveHabits}
            compact={false}
            readOnly={!isToday}
          />
        )}

        {!isToday && !loading && (
          <p className="text-center text-xs text-muted-foreground">
            Viewing past entry — tap TODAY to return
          </p>
        )}
      </main>
    </div>
  );
};

export default Habits;
