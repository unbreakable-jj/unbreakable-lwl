import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePersonalRecords } from '@/hooks/usePersonalRecords';
import { useMedals } from '@/hooks/useMedals';
import { useWorkoutSessions } from '@/hooks/useWorkoutSessions';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import { Trophy, Medal, Clock, TrendingUp, Zap, Timer, Dumbbell } from 'lucide-react';

// Big 5 lifts + bodyweight exercises for records
const STRENGTH_EXERCISES = [
  { name: 'Bench Press', icon: '🏋️', aliases: ['bench'] },
  { name: 'Squat', icon: '🦵', aliases: ['squat', 'back squat', 'front squat'] },
  { name: 'Deadlift', icon: '💪', aliases: ['deadlift', 'sumo deadlift'] },
  { name: 'Overhead Press', icon: '🙆', aliases: ['ohp', 'shoulder press', 'military press'] },
  { name: 'Barbell Row', icon: '🚣', aliases: ['bent over row', 'barbell row', 'pendlay row'] },
];

const BODYWEIGHT_EXERCISES = [
  { name: 'Pull-ups', icon: '🔝', aliases: ['pull up', 'pull-up', 'pullup'] },
  { name: 'Chin-ups', icon: '💪', aliases: ['chin up', 'chin-up', 'chinup'] },
  { name: 'Press-ups', icon: '🫸', aliases: ['push up', 'push-up', 'pushup', 'press up', 'press-up', 'pressup'] },
];

interface StrengthRecord {
  exerciseName: string;
  icon: string;
  isBodyweight: boolean;
  records: Array<{ weight: number; reps: number; date: string; rank: 1 | 2 | 3; estimated1RM: number }>;
}

export function CombinedRecordsView() {
  const { getAllPRsWithLabels, loading: prsLoading } = usePersonalRecords();
  const { getAllMedalsWithStatus, loading: medalsLoading } = useMedals();
  const { sessions, isLoading: workoutsLoading } = useWorkoutSessions();

  const prs = getAllPRsWithLabels();
  const allMedals = getAllMedalsWithStatus();

  // Calculate strength records from workout sessions
  const strengthRecords = useMemo((): StrengthRecord[] => {
    if (!sessions) return [];
    const completedSessions = sessions.filter(s => s.status === 'completed');
    const recordsByExercise: Record<string, Array<{ weight: number; reps: number; date: string }>> = {};

    completedSessions.forEach(session => {
      session.exercise_logs?.forEach(log => {
        if (!log.completed || !log.actual_reps) return;
        const normalizedName = log.exercise_name.toLowerCase();

        // Check Big 5
        for (const ex of STRENGTH_EXERCISES) {
          if (normalizedName.includes(ex.name.toLowerCase()) || ex.aliases.some(a => normalizedName.includes(a))) {
            if (!log.weight_kg) continue;
            if (!recordsByExercise[ex.name]) recordsByExercise[ex.name] = [];
            recordsByExercise[ex.name].push({ weight: log.weight_kg, reps: log.actual_reps, date: session.started_at });
            break;
          }
        }

        // Check bodyweight
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

      return { exerciseName: exercise.name, icon: exercise.icon, isBodyweight: exercise.isBodyweight, records: sortedLifts };
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

  const earnedMedals = allMedals.filter(m => m.earned);
  const unearnedMedals = allMedals.filter(m => !m.earned);

  const categoryLabels: Record<string, string> = {
    distance: 'Distance',
    streak: 'Streaks',
    pace: 'Speed',
    milestone: 'Milestones',
    special: 'Special',
    strength: 'Strength',
    cardio: 'Cardio',
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    distance: <TrendingUp className="w-4 h-4" />,
    streak: <Clock className="w-4 h-4" />,
    pace: <Zap className="w-4 h-4" />,
    milestone: <Trophy className="w-4 h-4" />,
    special: <Medal className="w-4 h-4" />,
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
            <Medal className="w-4 h-4 mr-1" />
            TROPHIES
          </TabsTrigger>
        </TabsList>

        {/* Cardio PRs */}
        <TabsContent value="cardio" className="space-y-4 mt-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h3 className="font-display text-lg text-foreground mb-3 tracking-wide">
              PERSONAL <span className="text-primary">RECORDS</span>
            </h3>
            <div className="grid gap-3">
              {prs.map((pr, index) => (
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
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            pr.record ? 'bg-primary/20 text-primary shadow-[0_0_10px_hsl(var(--primary)/0.3)]' : 'bg-secondary text-muted-foreground'
                          }`}
                        >
                          {pr.record ? <span className="text-2xl">🥇</span> : <Trophy className="w-6 h-6" />}
                        </div>
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
                      {pr.record && pr.record.time_seconds && (
                        <div className="text-right">
                          <p className="font-display text-xl text-primary neon-glow-subtle">{formatTime(pr.record.time_seconds)}</p>
                          {pr.record.pace_per_km_seconds && (
                            <p className="text-sm text-muted-foreground">{formatPace(pr.record.pace_per_km_seconds)}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
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
              <Medal className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">
                No trophies earned yet. Start training to unlock achievements!
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
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
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shadow-[0_0_10px_hsl(var(--primary)/0.2)]">
            <span className="text-xl">{exercise.icon}</span>
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
