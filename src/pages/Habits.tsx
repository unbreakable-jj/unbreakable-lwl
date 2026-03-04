import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { DailyHabitDiary } from '@/components/programming/DailyHabitDiary';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2, Save } from 'lucide-react';
import { format } from 'date-fns';
import { useDailyHabits } from '@/hooks/useDailyHabits';
import { MotivationalPopup } from '@/components/MotivationalPopup';
import { toast } from 'sonner';

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

  const [localHabits, setLocalHabits] = useState(habits);
  const [dirty, setDirty] = useState(false);
  const [showMotivation, setShowMotivation] = useState(false);

  // Sync local state when habits load from DB or date changes
  const [prevHabits, setPrevHabits] = useState(habits);
  if (habits !== prevHabits) {
    setPrevHabits(habits);
    setLocalHabits(habits);
    setDirty(false);
  }

  const wordCount = localHabits.journal.trim().split(/\s+/).filter(Boolean).length;
  const completedCount = [
    localHabits.train,
    localHabits.learnDaily,
    localHabits.water,
    localHabits.hitYourNumbers,
    wordCount >= 150,
  ].filter(Boolean).length;

  const handleChange = (newHabits: typeof habits) => {
    setLocalHabits(newHabits);
    setDirty(true);
  };

  const handleSave = async () => {
    await saveHabits(localHabits);
    setDirty(false);
    toast.success('Habits saved!');
    // Show motivational popup if all 5 complete
    if (completedCount === 5) {
      setShowMotivation(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader sectionLabel="DAILY 5" />
      <main className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="font-display text-2xl tracking-wide text-foreground">DAILY HABIT TRACKER</h1>
          <p className="text-muted-foreground text-sm">Complete your Daily 5 to stay on track</p>
          <Badge variant="outline" className="text-sm">
            <CheckCircle2 className="w-4 h-4 mr-1" />
            {completedCount}/5 Complete
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

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <DailyHabitDiary
              habits={localHabits}
              onChange={handleChange}
              compact={false}
              readOnly={!isToday}
              dateKey={format(selectedDate, 'yyyy-MM-dd')}
            />

            {/* Save Button */}
            {isToday && (
              <Button
                onClick={handleSave}
                disabled={!dirty || saving}
                className="w-full font-display tracking-wider gap-2"
                size="lg"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? 'SAVING...' : 'SAVE HABITS'}
              </Button>
            )}
          </>
        )}

        {!isToday && !loading && (
          <p className="text-center text-xs text-muted-foreground">
            Viewing past entry — tap TODAY to return
          </p>
        )}
      </main>

      <MotivationalPopup
        trigger="habits_logged"
        open={showMotivation}
        onClose={() => setShowMotivation(false)}
      />
    </div>
  );
};

export default Habits;
