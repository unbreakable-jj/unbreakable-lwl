import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserRuns, CardioActivityType } from '@/hooks/useRuns';
import { useWorkoutSessions } from '@/hooks/useWorkoutSessions';
import { useAuth } from '@/hooks/useAuth';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import { 
  TrendingUp, Calendar, Clock, Zap, Target, Award, Activity,
  Dumbbell, Timer, CheckCircle2, Footprints, Bike, Flame, Waves,
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, subWeeks, parseISO } from 'date-fns';
import { motion } from 'framer-motion';

const ACTIVITY_CONFIG: Record<CardioActivityType, { label: string; icon: typeof Footprints; emoji: string }> = {
  walk: { label: 'WALK', icon: Footprints, emoji: '🚶' },
  run: { label: 'RUN', icon: Timer, emoji: '🏃' },
  cycle: { label: 'CYCLE', icon: Bike, emoji: '🚴' },
  row: { label: 'ROW', icon: Waves, emoji: '🚣' },
};

function CardioSubStats({ runs, activityType }: { runs: any[]; activityType: CardioActivityType }) {
  const filteredRuns = useMemo(() => {
    return runs.filter(r => {
      const type = r.activity_type || (r.notes && ['walk', 'run', 'cycle', 'row'].includes(r.notes) ? r.notes : 'run');
      return type === activityType;
    });
  }, [runs, activityType]);

  const stats = useMemo(() => {
    if (!filteredRuns.length) return null;
    const totalDistance = filteredRuns.reduce((sum, r) => sum + Number(r.distance_km), 0);
    const totalTime = filteredRuns.reduce((sum, r) => sum + r.duration_seconds, 0);
    const totalSessions = filteredRuns.length;
    const avgPace = filteredRuns.reduce((sum, r) => sum + (r.pace_per_km_seconds || 0), 0) / totalSessions;
    const longestSession = Math.max(...filteredRuns.map(r => Number(r.distance_km)));
    const fastestPace = Math.min(...filteredRuns.filter(r => r.pace_per_km_seconds).map(r => r.pace_per_km_seconds!));

    const last4Weeks = Array.from({ length: 4 }, (_, i) => {
      const weekStart = startOfWeek(subWeeks(new Date(), 3 - i));
      const weekEnd = endOfWeek(weekStart);
      const weekRuns = filteredRuns.filter(r => {
        const date = parseISO(r.started_at);
        return date >= weekStart && date <= weekEnd;
      });
      return {
        week: format(weekStart, 'MMM d'),
        distance: weekRuns.reduce((sum, r) => sum + Number(r.distance_km), 0),
        sessions: weekRuns.length,
      };
    });

    return { totalDistance, totalTime, totalSessions, avgPace, longestSession, fastestPace, weeklyData: last4Weeks };
  }, [filteredRuns]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatPace = (paceSeconds: number) => {
    if (!paceSeconds || !isFinite(paceSeconds)) return '--:--';
    const mins = Math.floor(paceSeconds / 60);
    const secs = Math.round(paceSeconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const config = ACTIVITY_CONFIG[activityType];

  if (!stats) {
    return (
      <Card className="bg-card border-primary/20 p-8 text-center neon-border-subtle">
        <config.icon className="w-12 h-12 text-primary/30 mx-auto mb-3" />
        <p className="font-display text-lg text-foreground tracking-wide">
          NO {config.label} SESSIONS YET
        </p>
        <p className="text-muted-foreground text-sm mt-1">
          Record your first {config.label.toLowerCase()} to see stats here
        </p>
      </Card>
    );
  }

  const statCards = [
    { icon: TrendingUp, label: 'Total Distance', value: `${stats.totalDistance.toFixed(1)} km`, color: 'text-primary' },
    { icon: Calendar, label: 'Sessions', value: stats.totalSessions.toString(), color: 'text-primary' },
    { icon: Clock, label: 'Total Time', value: formatDuration(stats.totalTime), color: 'text-primary' },
    { icon: Zap, label: 'Avg Pace', value: `${formatPace(stats.avgPace)} /km`, color: 'text-primary' },
    { icon: Target, label: 'Longest', value: `${stats.longestSession.toFixed(1)} km`, color: 'text-primary' },
    { icon: Award, label: 'Best Pace', value: `${formatPace(stats.fastestPace)} /km`, color: 'text-primary' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
          >
            <Card className="bg-card border-primary/20 p-4 neon-border-subtle hover:shadow-[0_0_20px_hsl(var(--primary)/0.2)] transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
              <p className="font-display text-2xl md:text-3xl text-foreground tracking-wide">
                {stat.value}
              </p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Weekly Chart */}
      <Card className="bg-card border-primary/20 p-6 neon-border-subtle">
        <h3 className="font-display text-xl text-foreground mb-4 tracking-wide">
          WEEKLY <span className="text-primary">{config.label}</span> DISTANCE
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.weeklyData}>
              <defs>
                <linearGradient id={`color${activityType}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} tickFormatter={(v) => `${v}km`} />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--primary) / 0.3)', borderRadius: '8px' }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number) => [`${value.toFixed(1)} km`, 'Distance']}
              />
              <Area type="monotone" dataKey="distance" stroke="hsl(var(--primary))" strokeWidth={2} fill={`url(#color${activityType})`} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

export function CombinedStatsView() {
  const { user } = useAuth();
  const { runs, loading: runsLoading } = useUserRuns(user?.id);
  const { sessions, isLoading: workoutsLoading } = useWorkoutSessions();
  const [cardioSub, setCardioSub] = useState<CardioActivityType>('run');

  const completedWorkouts = useMemo(() => {
    return sessions?.filter(s => s.status === 'completed') || [];
  }, [sessions]);

  const workoutStats = useMemo(() => {
    if (!completedWorkouts.length) return null;
    const totalWorkouts = completedWorkouts.length;
    const totalTime = completedWorkouts.reduce((sum, w) => sum + (w.duration_seconds || 0), 0);
    const totalSets = completedWorkouts.reduce((sum, w) => {
      return sum + (w.exercise_logs?.filter(l => l.completed).length || 0);
    }, 0);
    const avgDuration = totalTime / totalWorkouts;

    // Streak calculation
    const sortedDates = [...new Set(completedWorkouts.map(w => format(parseISO(w.started_at), 'yyyy-MM-dd')))].sort().reverse();
    let streak = 0;
    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');
    if (sortedDates[0] === today || sortedDates[0] === yesterday) {
      streak = 1;
      for (let i = 1; i < sortedDates.length; i++) {
        const diff = new Date(sortedDates[i - 1]).getTime() - new Date(sortedDates[i]).getTime();
        if (diff <= 86400000 * 2) streak++;
        else break;
      }
    }

    // Weekly frequency bar chart
    const last8Weeks = Array.from({ length: 8 }, (_, i) => {
      const weekStart = startOfWeek(subWeeks(new Date(), 7 - i));
      const weekEnd = endOfWeek(weekStart);
      const weekWorkouts = completedWorkouts.filter(w => {
        const date = parseISO(w.started_at);
        return date >= weekStart && date <= weekEnd;
      });
      return {
        week: format(weekStart, 'MMM d'),
        sessions: weekWorkouts.length,
      };
    });

    return { totalWorkouts, totalTime, totalSets, avgDuration, streak, weeklyData: last8Weeks };
  }, [completedWorkouts]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const loading = runsLoading || workoutsLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const hasNoData = !runs.length && !workoutStats;

  if (hasNoData) {
    return (
      <Card className="bg-card border-primary/20 p-8 text-center neon-border-subtle">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_hsl(var(--primary)/0.2)]">
          <Activity className="w-10 h-10 text-primary" />
        </div>
        <h3 className="font-display text-2xl text-foreground mb-2 tracking-wide">
          NO ACTIVITY YET
        </h3>
        <p className="text-muted-foreground">
          Record your first session to see your stats here!
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-display text-3xl md:text-4xl text-foreground tracking-wide">
          YOUR <span className="text-primary neon-glow-subtle">STATS</span>
        </h2>
        <p className="text-muted-foreground mt-2">Track your progress across all activities</p>
      </div>

      <Tabs defaultValue={runs.length ? 'cardio' : 'workouts'} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-background border-2 border-primary/30">
          <TabsTrigger 
            value="cardio" 
            className="font-display tracking-wide data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_0_15px_hsl(var(--primary)/0.4)]"
            disabled={!runs.length}
          >
            <Flame className="w-4 h-4 mr-2" />
            CARDIO
          </TabsTrigger>
          <TabsTrigger 
            value="workouts" 
            className="font-display tracking-wide data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_0_15px_hsl(var(--primary)/0.4)]"
            disabled={!workoutStats}
          >
            <Dumbbell className="w-4 h-4 mr-2" />
            WORKOUTS
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cardio" className="space-y-6 mt-4">
          {/* Cardio sub-selector */}
          <div className="flex flex-wrap gap-2">
            {(Object.keys(ACTIVITY_CONFIG) as CardioActivityType[]).map(type => {
              const config = ACTIVITY_CONFIG[type];
              const count = runs.filter(r => {
                const t = r.activity_type || (r.notes && Object.keys(ACTIVITY_CONFIG).includes(r.notes) ? r.notes : 'run');
                return t === type;
              }).length;
              return (
                <button
                  key={type}
                  onClick={() => setCardioSub(type)}
                  className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all font-display tracking-wide text-sm ${
                    cardioSub === type 
                      ? 'border-primary bg-primary/10 text-primary shadow-[0_0_15px_hsl(var(--primary)/0.3)]' 
                      : 'border-border bg-card text-muted-foreground hover:border-primary/40'
                  }`}
                >
                  <config.icon className="w-5 h-5" />
                  <span>{config.label}</span>
                  <span className="text-xs opacity-70">{count}</span>
                </button>
              );
            })}
          </div>

          <CardioSubStats runs={runs} activityType={cardioSub} />
        </TabsContent>

        <TabsContent value="workouts" className="space-y-6 mt-4">
          {workoutStats && (
            <>
              {/* Workout Stat Cards with attendance */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Dumbbell, label: 'Total Workouts', value: workoutStats.totalWorkouts.toString() },
                  { icon: Clock, label: 'Total Time', value: formatDuration(workoutStats.totalTime) },
                  { icon: CheckCircle2, label: 'Sets Completed', value: workoutStats.totalSets.toString() },
                  { icon: Target, label: 'Avg Duration', value: formatDuration(workoutStats.avgDuration) },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                  >
                    <Card className="bg-card border-primary/20 p-4 neon-border-subtle hover:shadow-[0_0_20px_hsl(var(--primary)/0.2)] transition-shadow">
                      <div className="flex items-center gap-3 mb-2">
                        <stat.icon className="w-5 h-5 text-primary" />
                        <span className="text-sm text-muted-foreground">{stat.label}</span>
                      </div>
                      <p className="font-display text-2xl md:text-3xl text-foreground tracking-wide">
                        {stat.value}
                      </p>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Streak Counter */}
              <Card className="bg-card border-primary/20 p-6 neon-border-subtle">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-display tracking-wide">CURRENT STREAK</p>
                    <p className="font-display text-4xl text-primary neon-glow-subtle mt-1">
                      {workoutStats.streak}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">consecutive days</p>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shadow-[0_0_20px_hsl(var(--primary)/0.2)]">
                    <Flame className="w-8 h-8 text-primary" />
                  </div>
                </div>
              </Card>

              {/* Weekly Sessions Bar Chart */}
              <Card className="bg-card border-primary/20 p-6 neon-border-subtle">
                <h3 className="font-display text-xl text-foreground mb-4 tracking-wide">
                  WEEKLY <span className="text-primary">ATTENDANCE</span>
                </h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={workoutStats.weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--primary) / 0.3)', borderRadius: '8px' }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                        formatter={(value: number) => [value, 'Sessions']}
                      />
                      <Bar dataKey="sessions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
