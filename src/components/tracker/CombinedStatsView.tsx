import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProfile } from '@/hooks/useProfile';
import { useUserRuns } from '@/hooks/useRuns';
import { useWorkoutSessions } from '@/hooks/useWorkoutSessions';
import { useAuth } from '@/hooks/useAuth';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { 
  TrendingUp, 
  Calendar, 
  Clock, 
  Zap, 
  Target, 
  Award, 
  Activity,
  Dumbbell,
  Timer,
  CheckCircle2,
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, subWeeks, parseISO } from 'date-fns';
import { motion } from 'framer-motion';

export function CombinedStatsView() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { runs, loading: runsLoading } = useUserRuns(user?.id);
  const { sessions, isLoading: workoutsLoading } = useWorkoutSessions();

  const completedWorkouts = useMemo(() => {
    return sessions?.filter(s => s.status === 'completed') || [];
  }, [sessions]);

  const runStats = useMemo(() => {
    if (!runs.length) return null;

    const totalDistance = runs.reduce((sum, r) => sum + Number(r.distance_km), 0);
    const totalTime = runs.reduce((sum, r) => sum + r.duration_seconds, 0);
    const totalRuns = runs.length;
    const avgPace = runs.reduce((sum, r) => sum + (r.pace_per_km_seconds || 0), 0) / totalRuns;
    const longestRun = Math.max(...runs.map((r) => Number(r.distance_km)));
    const fastestPace = Math.min(...runs.filter((r) => r.pace_per_km_seconds).map((r) => r.pace_per_km_seconds!));

    // Weekly data for chart
    const last4Weeks = Array.from({ length: 4 }, (_, i) => {
      const weekStart = startOfWeek(subWeeks(new Date(), 3 - i));
      const weekEnd = endOfWeek(weekStart);
      const weekRuns = runs.filter((r) => {
        const date = parseISO(r.started_at);
        return date >= weekStart && date <= weekEnd;
      });
      return {
        week: format(weekStart, 'MMM d'),
        distance: weekRuns.reduce((sum, r) => sum + Number(r.distance_km), 0),
        runs: weekRuns.length,
      };
    });

    // Daily activity for this week
    const thisWeekStart = startOfWeek(new Date());
    const thisWeekEnd = endOfWeek(new Date());
    const daysOfWeek = eachDayOfInterval({ start: thisWeekStart, end: thisWeekEnd });
    const dailyData = daysOfWeek.map((day) => {
      const dayRuns = runs.filter((r) => {
        const runDate = parseISO(r.started_at);
        return format(runDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
      });
      return {
        day: format(day, 'EEE'),
        distance: dayRuns.reduce((sum, r) => sum + Number(r.distance_km), 0),
      };
    });

    return {
      totalDistance,
      totalTime,
      totalRuns,
      avgPace,
      longestRun,
      fastestPace,
      weeklyData: last4Weeks,
      dailyData,
    };
  }, [runs]);

  const workoutStats = useMemo(() => {
    if (!completedWorkouts.length) return null;

    const totalWorkouts = completedWorkouts.length;
    const totalTime = completedWorkouts.reduce((sum, w) => sum + (w.duration_seconds || 0), 0);
    const totalSets = completedWorkouts.reduce((sum, w) => {
      return sum + (w.exercise_logs?.filter(l => l.completed).length || 0);
    }, 0);
    const avgDuration = totalTime / totalWorkouts;

    // Weekly data for chart
    const last4Weeks = Array.from({ length: 4 }, (_, i) => {
      const weekStart = startOfWeek(subWeeks(new Date(), 3 - i));
      const weekEnd = endOfWeek(weekStart);
      const weekWorkouts = completedWorkouts.filter((w) => {
        const date = parseISO(w.started_at);
        return date >= weekStart && date <= weekEnd;
      });
      return {
        week: format(weekStart, 'MMM d'),
        workouts: weekWorkouts.length,
        sets: weekWorkouts.reduce((sum, w) => sum + (w.exercise_logs?.filter(l => l.completed).length || 0), 0),
      };
    });

    // Daily activity for this week
    const thisWeekStart = startOfWeek(new Date());
    const thisWeekEnd = endOfWeek(new Date());
    const daysOfWeek = eachDayOfInterval({ start: thisWeekStart, end: thisWeekEnd });
    const dailyData = daysOfWeek.map((day) => {
      const dayWorkouts = completedWorkouts.filter((w) => {
        const workoutDate = parseISO(w.started_at);
        return format(workoutDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
      });
      return {
        day: format(day, 'EEE'),
        sets: dayWorkouts.reduce((sum, w) => sum + (w.exercise_logs?.filter(l => l.completed).length || 0), 0),
      };
    });

    return {
      totalWorkouts,
      totalTime,
      totalSets,
      avgDuration,
      weeklyData: last4Weeks,
      dailyData,
    };
  }, [completedWorkouts]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatPace = (paceSeconds: number) => {
    if (!paceSeconds || !isFinite(paceSeconds)) return '--:--';
    const mins = Math.floor(paceSeconds / 60);
    const secs = Math.round(paceSeconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const loading = runsLoading || workoutsLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const hasNoData = !runStats && !workoutStats;

  if (hasNoData) {
    return (
      <Card className="bg-card border-border p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Activity className="w-10 h-10 text-primary" />
        </div>
        <h3 className="font-display text-2xl text-foreground mb-2 tracking-wide">
          NO ACTIVITY YET
        </h3>
        <p className="text-muted-foreground">
          Record your first run or complete a workout to see your stats here!
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="font-display text-3xl md:text-4xl text-foreground tracking-wide">
          YOUR <span className="text-primary">STATS</span>
        </h2>
        <p className="text-muted-foreground mt-2">Track your progress across all activities</p>
      </div>

      <Tabs defaultValue={runStats ? 'running' : 'strength'} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-background border border-border">
          <TabsTrigger 
            value="running" 
            className="font-display tracking-wide data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            disabled={!runStats}
          >
            <Timer className="w-4 h-4 mr-2" />
            RUNNING
          </TabsTrigger>
          <TabsTrigger 
            value="strength" 
            className="font-display tracking-wide data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            disabled={!workoutStats}
          >
            <Dumbbell className="w-4 h-4 mr-2" />
            STRENGTH
          </TabsTrigger>
        </TabsList>

        <TabsContent value="running" className="space-y-6 mt-4">
          {runStats && (
            <>
              {/* Running Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { icon: TrendingUp, label: 'Total Distance', value: `${runStats.totalDistance.toFixed(1)} km`, color: 'text-primary' },
                  { icon: Calendar, label: 'Total Runs', value: runStats.totalRuns.toString(), color: 'text-green-500' },
                  { icon: Clock, label: 'Total Time', value: formatDuration(runStats.totalTime), color: 'text-blue-500' },
                  { icon: Zap, label: 'Avg Pace', value: `${formatPace(runStats.avgPace)} /km`, color: 'text-yellow-500' },
                  { icon: Target, label: 'Longest Run', value: `${runStats.longestRun.toFixed(1)} km`, color: 'text-purple-500' },
                  { icon: Award, label: 'Fastest Pace', value: `${formatPace(runStats.fastestPace)} /km`, color: 'text-primary' },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-card border-border p-4">
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

              {/* Weekly Distance Chart */}
              <Card className="bg-card border-border p-6">
                <h3 className="font-display text-xl text-foreground mb-4 tracking-wide">
                  WEEKLY DISTANCE
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={runStats.weeklyData}>
                      <defs>
                        <linearGradient id="colorDistance" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} tickFormatter={(v) => `${v}km`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                        formatter={(value: number) => [`${value.toFixed(1)} km`, 'Distance']}
                      />
                      <Area type="monotone" dataKey="distance" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#colorDistance)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* This Week's Activity */}
              <Card className="bg-card border-border p-6">
                <h3 className="font-display text-xl text-foreground mb-4 tracking-wide">THIS WEEK</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={runStats.dailyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} tickFormatter={(v) => `${v}`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                        formatter={(value: number) => [`${value.toFixed(1)} km`, 'Distance']}
                      />
                      <Bar dataKey="distance" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="strength" className="space-y-6 mt-4">
          {workoutStats && (
            <>
              {/* Strength Stat Cards */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Dumbbell, label: 'Total Workouts', value: workoutStats.totalWorkouts.toString(), color: 'text-primary' },
                  { icon: Clock, label: 'Total Time', value: formatDuration(workoutStats.totalTime), color: 'text-blue-500' },
                  { icon: CheckCircle2, label: 'Sets Completed', value: workoutStats.totalSets.toString(), color: 'text-green-500' },
                  { icon: Target, label: 'Avg Duration', value: formatDuration(workoutStats.avgDuration), color: 'text-yellow-500' },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-card border-border p-4">
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

              {/* Weekly Workouts Chart */}
              <Card className="bg-card border-border p-6">
                <h3 className="font-display text-xl text-foreground mb-4 tracking-wide">
                  WEEKLY WORKOUTS
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={workoutStats.weeklyData}>
                      <defs>
                        <linearGradient id="colorWorkouts" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                        formatter={(value: number, name: string) => [value, name === 'workouts' ? 'Workouts' : 'Sets']}
                      />
                      <Area type="monotone" dataKey="sets" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#colorWorkouts)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* This Week's Sets */}
              <Card className="bg-card border-border p-6">
                <h3 className="font-display text-xl text-foreground mb-4 tracking-wide">THIS WEEK</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={workoutStats.dailyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                        formatter={(value: number) => [value, 'Sets']}
                      />
                      <Bar dataKey="sets" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
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
