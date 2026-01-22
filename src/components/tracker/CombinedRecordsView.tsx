import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePersonalRecords } from '@/hooks/usePersonalRecords';
import { useMedals } from '@/hooks/useMedals';
import { useWorkoutSessions } from '@/hooks/useWorkoutSessions';
import { MEDAL_DEFINITIONS } from '@/lib/medalDefinitions';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import { Trophy, Medal, Clock, TrendingUp, Zap, Timer, Dumbbell } from 'lucide-react';

// Strength exercise types for records
const STRENGTH_EXERCISES = [
  { name: 'Bench Press', icon: '🏋️' },
  { name: 'Squat', icon: '🦵' },
  { name: 'Deadlift', icon: '💪' },
  { name: 'Overhead Press', icon: '🙆' },
];

interface StrengthRecord {
  exerciseName: string;
  records: Array<{
    weight: number;
    reps: number;
    date: string;
    rank: 1 | 2 | 3;
  }>;
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

    // Gather all logged lifts
    completedSessions.forEach(session => {
      session.exercise_logs?.forEach(log => {
        if (!log.completed || !log.weight_kg || !log.actual_reps) return;
        
        // Normalize exercise name for matching
        const normalizedName = log.exercise_name.toLowerCase();
        const matchedExercise = STRENGTH_EXERCISES.find(e => 
          normalizedName.includes(e.name.toLowerCase()) ||
          (e.name === 'Overhead Press' && (normalizedName.includes('ohp') || normalizedName.includes('shoulder press')))
        );
        
        if (matchedExercise) {
          if (!recordsByExercise[matchedExercise.name]) {
            recordsByExercise[matchedExercise.name] = [];
          }
          recordsByExercise[matchedExercise.name].push({
            weight: log.weight_kg,
            reps: log.actual_reps,
            date: session.started_at,
          });
        }
      });
    });

    // Sort and get top 3 for each exercise (by estimated 1RM: weight * (1 + reps/30))
    return STRENGTH_EXERCISES.map(exercise => {
      const lifts = recordsByExercise[exercise.name] || [];
      const sortedLifts = lifts
        .map(lift => ({
          ...lift,
          estimated1RM: lift.weight * (1 + lift.reps / 30),
        }))
        .sort((a, b) => b.estimated1RM - a.estimated1RM)
        .slice(0, 3)
        .map((lift, index) => ({
          weight: lift.weight,
          reps: lift.reps,
          date: lift.date,
          rank: (index + 1) as 1 | 2 | 3,
        }));

      return {
        exerciseName: exercise.name,
        records: sortedLifts,
      };
    });
  }, [sessions]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPace = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}/km`;
  };

  const getMedalIcon = (rank: 1 | 2 | 3) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
    }
  };

  const earnedMedals = allMedals.filter(m => m.earned);
  const unearnedMedals = allMedals.filter(m => !m.earned);

  const categoryLabels: Record<string, string> = {
    distance: 'Distance',
    streak: 'Streaks',
    pace: 'Speed',
    milestone: 'Milestones',
    special: 'Special',
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    distance: <TrendingUp className="w-4 h-4" />,
    streak: <Clock className="w-4 h-4" />,
    pace: <Zap className="w-4 h-4" />,
    milestone: <Trophy className="w-4 h-4" />,
    special: <Medal className="w-4 h-4" />,
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
      <Tabs defaultValue="running" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-background border border-border">
          <TabsTrigger value="running" className="font-display tracking-wide text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Timer className="w-4 h-4 mr-1" />
            RUNNING
          </TabsTrigger>
          <TabsTrigger value="strength" className="font-display tracking-wide text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Dumbbell className="w-4 h-4 mr-1" />
            STRENGTH
          </TabsTrigger>
          <TabsTrigger value="medals" className="font-display tracking-wide text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Medal className="w-4 h-4 mr-1" />
            MEDALS
          </TabsTrigger>
        </TabsList>

        {/* Running Records Tab */}
        <TabsContent value="running" className="space-y-4 mt-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h3 className="font-display text-lg text-foreground mb-3 tracking-wide">
              PERSONAL RECORDS
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
                        ? 'bg-card border-border border-l-primary'
                        : 'bg-background border-border border-l-muted opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            pr.record ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'
                          }`}
                        >
                          {pr.record ? (
                            <span className="text-2xl">🥇</span>
                          ) : (
                            <Trophy className="w-6 h-6" />
                          )}
                        </div>
                        <div>
                          <p className="font-display text-lg text-foreground tracking-wide">
                            {pr.label}
                          </p>
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
                          <p className="font-display text-xl text-primary">
                            {formatTime(pr.record.time_seconds)}
                          </p>
                          {pr.record.pace_per_km_seconds && (
                            <p className="text-sm text-muted-foreground">
                              {formatPace(pr.record.pace_per_km_seconds)}
                            </p>
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

        {/* Strength Records Tab */}
        <TabsContent value="strength" className="space-y-4 mt-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h3 className="font-display text-lg text-foreground mb-3 tracking-wide">
              STRENGTH RECORDS
            </h3>
            <div className="space-y-4">
              {strengthRecords.map((exercise, exerciseIndex) => (
                <motion.div
                  key={exercise.exerciseName}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: exerciseIndex * 0.1 }}
                >
                  <Card className="p-4 bg-card border-border border-l-4 border-l-primary">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-xl">
                          {STRENGTH_EXERCISES.find(e => e.name === exercise.exerciseName)?.icon}
                        </span>
                      </div>
                      <h4 className="font-display text-lg text-foreground tracking-wide">
                        {exercise.exerciseName.toUpperCase()}
                      </h4>
                    </div>
                    
                    {exercise.records.length > 0 ? (
                      <div className="space-y-2">
                        {exercise.records.map((record, recordIndex) => (
                          <div 
                            key={recordIndex}
                            className="flex items-center justify-between py-2 px-3 bg-background rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{getMedalIcon(record.rank)}</span>
                              <span className="text-sm text-muted-foreground">
                                {format(parseISO(record.date), 'MMM d, yyyy')}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="font-display text-lg text-primary">
                                {record.weight}kg
                              </span>
                              <span className="text-sm text-muted-foreground ml-2">
                                × {record.reps}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No records yet. Log a workout to track your progress!
                      </p>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </TabsContent>

        {/* Medals Tab */}
        <TabsContent value="medals" className="space-y-6 mt-4">
          {/* Earned Medals */}
          {earnedMedals.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h3 className="font-display text-lg text-foreground mb-3 tracking-wide">
                EARNED ({earnedMedals.length}/{allMedals.length})
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {earnedMedals.map((medal, index) => (
                  <motion.div
                    key={medal.code}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Card className="p-3 bg-card border border-border border-l-4 border-l-primary text-center group relative">
                      <div className="text-3xl mb-1 medal-unlocked">{medal.icon}</div>
                      <p className="font-display text-xs text-foreground tracking-wide line-clamp-2">
                        {medal.name}
                      </p>
                      {medal.earned && (
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {format(parseISO(medal.earned.earned_at), 'MMM d')}
                        </p>
                      )}
                      {/* Tooltip */}
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-background border border-border px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        Earned {medal.earned && format(parseISO(medal.earned.earned_at), 'MMM d, yyyy')}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Locked Medals by Category */}
          {Object.keys(categoryLabels).map((category) => {
            const categoryMedals = unearnedMedals.filter(m => m.category === category);
            if (categoryMedals.length === 0) return null;

            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="text-muted-foreground">
                    {categoryIcons[category]}
                  </div>
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
                      <Card className="p-3 bg-background border border-border text-center group relative">
                        <div className="text-3xl mb-1 medal-locked grayscale">{medal.icon}</div>
                        <p className="font-display text-xs text-muted-foreground tracking-wide line-clamp-2">
                          {medal.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">Locked</p>
                        {/* Tooltip */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-background border border-border px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 text-muted-foreground">
                          Unlock: {medal.description || medal.name}
                        </div>
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
                No medals earned yet. Start running or training to unlock achievements!
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
