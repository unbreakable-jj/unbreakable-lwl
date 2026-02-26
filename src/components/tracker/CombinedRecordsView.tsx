import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePersonalRecords } from '@/hooks/usePersonalRecords';
import { useMedals } from '@/hooks/useMedals';
import { useWorkoutSessions } from '@/hooks/useWorkoutSessions';
import { DeleteConfirmModal } from '@/components/tracker/DeleteConfirmModal';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import { Clock, TrendingUp, Zap, Timer, Dumbbell, Footprints, Bike, Crosshair, Waves, Droplets, Trash2 } from 'lucide-react';
import { CardioActivityType } from '@/hooks/useRuns';
import { toast } from 'sonner';

// Big 5 lifts + bodyweight exercises for records
const STRENGTH_EXERCISES = [
  { name: 'Bench Press', aliases: ['bench'] },
  { name: 'Squat', aliases: ['squat', 'back squat', 'front squat'] },
  { name: 'Deadlift', aliases: ['deadlift', 'sumo deadlift'] },
  { name: 'Overhead Press', aliases: ['ohp', 'shoulder press', 'military press'] },
  { name: 'Barbell Row', aliases: ['bent over row', 'barbell row', 'pendlay row'] },
];

const BODYWEIGHT_EXERCISES = [
  { name: 'Pull-ups', aliases: ['pull up', 'pull-up', 'pullup'] },
  { name: 'Chin-ups', aliases: ['chin up', 'chin-up', 'chinup'] },
  { name: 'Press-ups', aliases: ['push up', 'push-up', 'pushup', 'press up', 'press-up', 'pressup'] },
];

const CARDIO_ACTIVITY_CONFIG: Record<CardioActivityType, { label: string; icon: typeof Footprints }> = {
  walk: { label: 'WALK', icon: Footprints },
  run: { label: 'RUN', icon: Timer },
  cycle: { label: 'CYCLE', icon: Bike },
  row: { label: 'ROW', icon: Waves },
  swim: { label: 'SWIM', icon: Droplets },
};

interface StrengthRecord {
  exerciseName: string;
  isBodyweight: boolean;
  records: Array<{ weight: number; reps: number; date: string; rank: 1 | 2 | 3; estimated1RM: number }>;
}

function NeonTarget({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dims = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-14 h-14' : 'w-12 h-12';
  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-7 h-7' : 'w-6 h-6';
  return (
    <div className={`${dims} rounded-full bg-primary/20 flex items-center justify-center shadow-[0_0_15px_hsl(var(--primary)/0.4)]`}>
      <Crosshair className={`${iconSize} text-primary`} />
    </div>
  );
}

export function CombinedRecordsView() {
  const { getAllPRsWithLabels, records, resetPR, resetAllPRsForActivity, loading: prsLoading } = usePersonalRecords();
  const { getAllMedalsWithStatus, loading: medalsLoading } = useMedals();
  const { sessions, isLoading: workoutsLoading } = useWorkoutSessions();
  const [cardioSub, setCardioSub] = useState<CardioActivityType>('run');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);
  const [deleteAllTarget, setDeleteAllTarget] = useState<CardioActivityType | null>(null);
  const [deleting, setDeleting] = useState(false);

  const prs = getAllPRsWithLabels();
  const allMedals = getAllMedalsWithStatus();

  // Filter PRs by selected cardio activity type
  const filteredPRs = useMemo(() => {
    return prs.map(pr => ({
      ...pr,
      record: pr.record && (pr.record as any).activity_type === cardioSub ? pr.record : undefined,
    }));
  }, [prs, cardioSub]);

  // Check if any PRs exist for current activity type
  const hasRecordsForActivity = useMemo(() => {
    return records.some(r => r.activity_type === cardioSub);
  }, [records, cardioSub]);

  // Calculate strength records from workout sessions
  const strengthRecords = useMemo((): StrengthRecord[] => {
    if (!sessions) return [];
    const completedSessions = sessions.filter(s => s.status === 'completed');
    const recordsByExercise: Record<string, Array<{ weight: number; reps: number; date: string }>> = {};

    completedSessions.forEach(session => {
      session.exercise_logs?.forEach(log => {
        if (!log.completed || !log.actual_reps) return;
        const normalizedName = log.exercise_name.toLowerCase();

        for (const ex of STRENGTH_EXERCISES) {
          if (normalizedName.includes(ex.name.toLowerCase()) || ex.aliases.some(a => normalizedName.includes(a))) {
            if (!log.weight_kg) continue;
            if (!recordsByExercise[ex.name]) recordsByExercise[ex.name] = [];
            recordsByExercise[ex.name].push({ weight: log.weight_kg, reps: log.actual_reps, date: session.started_at });
            break;
          }
        }

        for (const ex of BODYWEIGHT_EXERCISES) {
          if (normalizedName.includes(ex.name.toLowerCase()) || ex.aliases.some(a => normalizedName.includes(a))) {
            if (!recordsByExercise[ex.name]) recordsByExercise[ex.name] = [];
            recordsByExercise[ex.name].push({ weight: log.weight_kg || 0, reps: log.actual_reps, date: session.started_at });
            break;
          }
        }
      });
    });

    const allExercises = [
      ...STRENGTH_EXERCISES.map(e => ({ ...e, isBodyweight: false })),
      ...BODYWEIGHT_EXERCISES.map(e => ({ ...e, isBodyweight: true })),
    ];

    return allExercises.map(exercise => {
      const lifts = recordsByExercise[exercise.name] || [];
      const sortedLifts = lifts
        .map(lift => ({
          ...lift,
          estimated1RM: exercise.isBodyweight ? lift.reps : lift.weight * (1 + lift.reps / 30),
        }))
        .sort((a, b) => b.estimated1RM - a.estimated1RM)
        .slice(0, 3)
        .map((lift, index) => ({
          ...lift,
          rank: (index + 1) as 1 | 2 | 3,
        }));

      return { exerciseName: exercise.name, isBodyweight: exercise.isBodyweight, records: sortedLifts };
    });
  }, [sessions]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPace = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}/km`;
  };

  const getMedalIcon = (rank: 1 | 2 | 3) => ({ 1: '🥇', 2: '🥈', 3: '🥉' }[rank]);

  const handleDeletePR = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await resetPR(deleteTarget.id);
      toast.success(`${deleteTarget.label} PR reset`);
    } catch {
      toast.error('Failed to reset PR');
    }
    setDeleting(false);
    setDeleteTarget(null);
  };

  const handleDeleteAllPRs = async () => {
    if (!deleteAllTarget) return;
    setDeleting(true);
    try {
      await resetAllPRsForActivity(deleteAllTarget);
      toast.success(`All ${CARDIO_ACTIVITY_CONFIG[deleteAllTarget].label} PRs reset`);
    } catch {
      toast.error('Failed to reset PRs');
    }
    setDeleting(false);
    setDeleteAllTarget(null);
  };

  const earnedMedals = allMedals.filter(m => m.earned);
  const unearnedMedals = allMedals.filter(m => !m.earned);

  const categoryLabels: Record<string, string> = {
    distance: 'Distance', streak: 'Streaks', pace: 'Speed',
    milestone: 'Milestones', special: 'Special', strength: 'Strength', cardio: 'Cardio',
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    distance: <TrendingUp className="w-4 h-4" />,
    streak: <Clock className="w-4 h-4" />,
    pace: <Zap className="w-4 h-4" />,
    milestone: <Crosshair className="w-4 h-4 text-primary" />,
    special: <Crosshair className="w-4 h-4 text-primary" />,
    strength: <Dumbbell className="w-4 h-4" />,
    cardio: <Timer className="w-4 h-4" />,
  };

  const loading = prsLoading || medalsLoading || workoutsLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="cardio" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-background border-2 border-primary/30">
          <TabsTrigger value="cardio" className="font-display tracking-wide text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_0_15px_hsl(var(--primary)/0.4)]">
            <Timer className="w-4 h-4 mr-1" />
            CARDIO
          </TabsTrigger>
          <TabsTrigger value="strength" className="font-display tracking-wide text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_0_15px_hsl(var(--primary)/0.4)]">
            <Dumbbell className="w-4 h-4 mr-1" />
            STRENGTH
          </TabsTrigger>
          <TabsTrigger value="medals" className="font-display tracking-wide text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_0_15px_hsl(var(--primary)/0.4)]">
            <Crosshair className="w-4 h-4 mr-1 text-primary" />
            TROPHIES
          </TabsTrigger>
        </TabsList>

        {/* Cardio PRs */}
        <TabsContent value="cardio" className="space-y-4 mt-4">
          {/* Activity sub-selector - all 5 types */}
          <div className="flex flex-wrap gap-2">
            {(Object.keys(CARDIO_ACTIVITY_CONFIG) as CardioActivityType[]).map(type => {
              const config = CARDIO_ACTIVITY_CONFIG[type];
              return (
                <button
                  key={type}
                  onClick={() => setCardioSub(type)}
                  className={`flex-1 min-w-[60px] flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all font-display tracking-wide text-xs ${
                    cardioSub === type
                      ? 'border-primary bg-primary/10 text-primary shadow-[0_0_15px_hsl(var(--primary)/0.3)]'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/40'
                  }`}
                >
                  <config.icon className="w-5 h-5" />
                  <span>{config.label}</span>
                </button>
              );
            })}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={cardioSub}>
            <h3 className="font-display text-lg text-foreground mb-3 tracking-wide">
              {CARDIO_ACTIVITY_CONFIG[cardioSub].label} <span className="text-primary">RECORDS</span>
            </h3>
            <div className="grid gap-3">
              {filteredPRs.map((pr, index) => (
                <motion.div
                  key={pr.type}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className={`p-4 border-l-4 ${
                      pr.record
                        ? 'bg-card border-primary/20 border-l-primary neon-border-subtle'
                        : 'bg-background border-border border-l-muted opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {pr.record ? (
                          <NeonTarget />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                            <Crosshair className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-display text-lg text-foreground tracking-wide">{pr.label}</p>
                          {pr.record ? (
                            <p className="text-sm text-muted-foreground">
                              {format(parseISO(pr.record.achieved_at), 'MMM d, yyyy')}
                            </p>
                          ) : (
                            <p className="text-sm text-muted-foreground">Not set yet</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {pr.record && pr.record.time_seconds && (
                          <div className="text-right">
                            <p className="font-display text-xl text-primary neon-glow-subtle">{formatTime(pr.record.time_seconds)}</p>
                            {pr.record.pace_per_km_seconds && (
                              <p className="text-sm text-muted-foreground">{formatPace(pr.record.pace_per_km_seconds)}</p>
                            )}
                          </div>
                        )}
                        {pr.record && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteTarget({ id: pr.record!.id, label: pr.label })}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Reset All button */}
            {hasRecordsForActivity && (
              <div className="mt-4 flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive border-destructive/30 hover:bg-destructive/10 font-display tracking-wide"
                  onClick={() => setDeleteAllTarget(cardioSub)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  RESET ALL {CARDIO_ACTIVITY_CONFIG[cardioSub].label} PRS
                </Button>
              </div>
            )}
          </motion.div>
        </TabsContent>

        {/* Strength Records */}
        <TabsContent value="strength" className="space-y-4 mt-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h3 className="font-display text-lg text-foreground mb-3 tracking-wide">
              BIG 5 <span className="text-primary">1RM</span>
            </h3>
            <div className="space-y-4">
              {strengthRecords.filter(e => !e.isBodyweight).map((exercise, exerciseIndex) => (
                <ExerciseRecordCard key={exercise.exerciseName} exercise={exercise} index={exerciseIndex} getMedalIcon={getMedalIcon} />
              ))}
            </div>

            <h3 className="font-display text-lg text-foreground mb-3 mt-6 tracking-wide">
              BODYWEIGHT <span className="text-primary">MAX</span>
            </h3>
            <div className="space-y-4">
              {strengthRecords.filter(e => e.isBodyweight).map((exercise, exerciseIndex) => (
                <ExerciseRecordCard key={exercise.exerciseName} exercise={exercise} index={exerciseIndex} getMedalIcon={getMedalIcon} isBodyweight />
              ))}
            </div>
          </motion.div>
        </TabsContent>

        {/* Trophies/Medals */}
        <TabsContent value="medals" className="space-y-6 mt-4">
          {earnedMedals.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h3 className="font-display text-lg text-foreground mb-3 tracking-wide">
                EARNED <span className="text-primary">({earnedMedals.length}/{allMedals.length})</span>
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {earnedMedals.map((medal, index) => (
                  <motion.div
                    key={medal.code}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Card className="p-3 bg-card border-2 border-primary/30 text-center group relative neon-border-subtle">
                      <div className="text-3xl mb-1 medal-unlocked">{medal.icon}</div>
                      <p className="font-display text-xs text-foreground tracking-wide line-clamp-2">{medal.name}</p>
                      {medal.earned && (
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {format(parseISO(medal.earned.earned_at), 'MMM d')}
                        </p>
                      )}
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {Object.keys(categoryLabels).map((category) => {
            const categoryMedals = unearnedMedals.filter(m => m.category === category);
            if (categoryMedals.length === 0) return null;
            return (
              <motion.div key={category} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="text-muted-foreground">{categoryIcons[category]}</div>
                  <h3 className="font-display text-sm text-muted-foreground tracking-wide">
                    {categoryLabels[category].toUpperCase()}
                  </h3>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {categoryMedals.map((medal, index) => (
                    <motion.div
                      key={medal.code}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.02 }}
                    >
                      <Card className="p-3 bg-background border border-border text-center">
                        <div className="text-3xl mb-1 medal-locked grayscale">{medal.icon}</div>
                        <p className="font-display text-xs text-muted-foreground tracking-wide line-clamp-2">{medal.name}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Locked</p>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}

          {earnedMedals.length === 0 && (
            <div className="text-center py-12">
              <NeonTarget size="lg" />
              <p className="text-muted-foreground mt-4">
                No trophies earned yet. Start training to unlock achievements!
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete single PR confirmation */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeletePR}
        title="Reset Personal Record"
        description={`Reset your ${deleteTarget?.label} PR? This cannot be undone.`}
        confirmText="Reset PR"
        loading={deleting}
      />

      {/* Delete all PRs for activity confirmation */}
      <DeleteConfirmModal
        isOpen={!!deleteAllTarget}
        onClose={() => setDeleteAllTarget(null)}
        onConfirm={handleDeleteAllPRs}
        title={`Reset All ${deleteAllTarget ? CARDIO_ACTIVITY_CONFIG[deleteAllTarget].label : ''} PRs`}
        description={`This will reset all your ${deleteAllTarget ? CARDIO_ACTIVITY_CONFIG[deleteAllTarget].label.toLowerCase() : ''} personal records. This cannot be undone.`}
        confirmText="Reset All"
        loading={deleting}
      />
    </div>
  );
}

function ExerciseRecordCard({ 
  exercise, index, getMedalIcon, isBodyweight 
}: { 
  exercise: StrengthRecord; index: number; getMedalIcon: (r: 1|2|3) => string; isBodyweight?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="p-4 bg-card border-primary/20 border-l-4 border-l-primary neon-border-subtle">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shadow-[0_0_10px_hsl(var(--primary)/0.3)]">
            <Crosshair className="w-5 h-5 text-primary" />
          </div>
          <h4 className="font-display text-lg text-foreground tracking-wide">
            {exercise.exerciseName.toUpperCase()}
          </h4>
        </div>
        
        {exercise.records.length > 0 ? (
          <div className="space-y-2">
            {exercise.records.map((record, recordIndex) => (
              <div key={recordIndex} className="flex items-center justify-between py-2 px-3 bg-background rounded-lg border border-border">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getMedalIcon(record.rank)}</span>
                  <span className="text-sm text-muted-foreground">
                    {format(parseISO(record.date), 'MMM d, yyyy')}
                  </span>
                </div>
                <div className="text-right">
                  {isBodyweight ? (
                    <span className="font-display text-lg text-primary neon-glow-subtle">
                      {record.reps} reps
                    </span>
                  ) : (
                    <>
                      <span className="font-display text-lg text-primary neon-glow-subtle">{record.weight}kg</span>
                      <span className="text-sm text-muted-foreground ml-2">× {record.reps}</span>
                      <span className="text-xs text-primary/60 ml-2">
                        ({Math.round(record.estimated1RM)}kg e1RM)
                      </span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No records yet. Log a {isBodyweight ? 'set' : 'lift'} to track!
          </p>
        )}
      </Card>
    </motion.div>
  );
}
