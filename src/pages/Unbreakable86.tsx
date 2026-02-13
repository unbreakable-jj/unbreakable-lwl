import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MainNavigation } from '@/components/MainNavigation';
import { UnifiedFooter } from '@/components/UnifiedFooter';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { useUnbreakable86 } from '@/hooks/useUnbreakable86';
import { U86Setup } from '@/components/u86/U86Setup';
import { U86Agreement } from '@/components/u86/U86Agreement';
import { U86DailyView } from '@/components/u86/U86DailyView';
import { U86Progress } from '@/components/u86/U86Progress';
import { U86Completion } from '@/components/u86/U86Completion';

export default function Unbreakable86() {
  const {
    program, completedProgram, days, currentDay, completedDays, streak, isLoading,
    createProgram, activateProgram, generateWeek, updateDay, completeDay,
    restartProgram, abandonProgram,
  } = useUnbreakable86();

  const [activeTab, setActiveTab] = useState<'today' | 'progress'>('today');
  const [generating, setGenerating] = useState(false);

  // Auto-generate week when needed OR auto-reset old format data
  useEffect(() => {
    if (!program || program.status !== 'active' || generating) return;
    
    const currentWeek = Math.ceil((program.current_day || 1) / 7);

    // Check if existing days use old time-based format (no sets array)
    const hasOldFormat = days && days.length > 0 && days.some(d => {
      const exercises = Array.isArray(d.exercises) ? d.exercises : [];
      return exercises.length > 0 && !exercises[0]?.sets;
    });

    if (hasOldFormat) {
      // Auto-reset: delete old days and regenerate from week 1
      setGenerating(true);
      (async () => {
        try {
          // Delete all old days
          const { supabase } = await import('@/integrations/supabase/client');
          await (supabase as any)
            .from('unbreakable_86_days')
            .delete()
            .eq('program_id', program.id);
          
          // Reset last_generated_week to 0
          await (supabase as any)
            .from('unbreakable_86_programs')
            .update({ last_generated_week: 0, current_day: 1 })
            .eq('id', program.id);

          // Generate week 1 with new format
          await generateWeek.mutateAsync({
            programId: program.id,
            weekNumber: 1,
            fitnessLevel: program.fitness_level,
            equipment: program.equipment,
            injuries: program.injuries || '',
          });
        } catch (e) {
          console.error('Auto-reset failed:', e);
        } finally {
          setGenerating(false);
        }
      })();
      return;
    }
    
    if (currentWeek > program.last_generated_week) {
      setGenerating(true);
      generateWeek.mutateAsync({
        programId: program.id,
        weekNumber: currentWeek,
        fitnessLevel: program.fitness_level,
        equipment: program.equipment,
        injuries: program.injuries || '',
      }).finally(() => setGenerating(false));
    }
  }, [program?.id, program?.current_day, program?.last_generated_week, program?.status, days]);

  const handleSetupComplete = async (config: any) => {
    await createProgram.mutateAsync(config);
  };

  const handleAgreementAccept = async () => {
    if (!program) return;
    await activateProgram.mutateAsync(program.id);
  };

  const handleDayUpdate = (updates: any) => {
    if (!currentDay) return;
    updateDay.mutate({ dayId: currentDay.id, updates });
  };

  const handleDayComplete = () => {
    if (!currentDay || !program) return;
    completeDay.mutate({
      dayId: currentDay.id,
      programId: program.id,
      dayNumber: currentDay.day_number,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Determine view
  const showSetup = !program && !completedProgram;
  const showAgreement = program?.status === 'setup';
  const showActive = program?.status === 'active';
  const showCompleted = !program && !!completedProgram;

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />

      {/* Hero */}
      <section className="pt-24 pb-12 md:pt-28 md:pb-16 border-b border-primary/20">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
           <h1 className="font-display text-5xl sm:text-6xl md:text-7xl tracking-wide leading-none">
              <span className="text-primary neon-glow-subtle">UNBREAKABLE </span>
              <span className="text-foreground">86</span>
            </h1>

            <div className="max-w-2xl mx-auto space-y-4 text-left sm:text-center">
              <p className="text-muted-foreground text-sm leading-relaxed">
                86 consecutive days. No rest days. No excuses. A progressive overload system
                built around the <span className="text-primary font-semibold">Big 5 lifts</span> — Squat, Bench,
                Deadlift, Overhead Press and Row — plus Pull-ups and Push-ups. Strength first, then
                run from <span className="text-primary font-semibold">1 km up to 5 km daily</span>,
                increasing distance every 7 days.
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Your plan is delivered <span className="text-foreground font-semibold">7 days at a time</span>,
                remapped each week based on your performance, equipment, and level. Beginner to advanced —
                every programme is bespoke. 8 compound exercises daily. 6 non-negotiable habits.
                Lift before you run. Discipline before motivation.
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                This isn't a workout plan. It's a system designed to prove what you're capable of
                when you refuse to stop. All levels. All goals. One standard:{' '}
                <span className="text-primary font-semibold">keep showing up</span>.
              </p>
            </div>

            <div className="space-y-1 pt-2">
              <p className="font-display text-xs tracking-[0.3em] text-muted-foreground">UNBREAKABLE · LIVE WITHOUT LIMITS</p>
              <p className="text-primary font-display text-lg tracking-wider neon-glow-subtle">KEEP SHOWING UP</p>
              <p className="font-display text-[10px] tracking-[0.25em] text-muted-foreground/60 pt-1">#UNBREAKABLE86</p>
            </div>
          </motion.div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8 md:py-12">
        <AnimatePresence mode="wait">
          {/* Setup */}
          {showSetup && (
            <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <U86Setup onComplete={handleSetupComplete} />
            </motion.div>
          )}

          {/* Agreement */}
          {showAgreement && (
            <motion.div key="agreement" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <U86Agreement onAccept={handleAgreementAccept} />
            </motion.div>
          )}

          {/* Active Programme */}
          {showActive && (
            <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {generating ? (
                <div className="text-center py-16 space-y-4">
                  <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
                  <p className="text-muted-foreground font-display tracking-wider">GENERATING YOUR WEEK...</p>
                </div>
              ) : (
                <>
                  <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="max-w-2xl mx-auto">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="today" className="font-display tracking-wider">TODAY</TabsTrigger>
                      <TabsTrigger value="progress" className="font-display tracking-wider">PROGRESS</TabsTrigger>
                    </TabsList>
                    <TabsContent value="today">
                      {currentDay ? (
                        <U86DailyView
                          day={currentDay}
                          program={program!}
                          streak={streak}
                          onUpdate={handleDayUpdate}
                          onComplete={handleDayComplete}
                        />
                      ) : (
                        <div className="text-center py-16">
                          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
                          <p className="text-muted-foreground">Loading today's session...</p>
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="progress">
                      {program && days && (
                        <U86Progress
                          program={program}
                          days={days}
                          completedDays={completedDays}
                          streak={streak}
                          onRestart={() => restartProgram.mutate(program.id)}
                          onAbandon={() => abandonProgram.mutate(program.id)}
                        />
                      )}
                    </TabsContent>
                  </Tabs>
                </>
              )}
            </motion.div>
          )}

          {/* Completed */}
          {showCompleted && (
            <motion.div key="completed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <U86Completion />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <UnifiedFooter className="mt-auto" />
    </div>
  );
}
