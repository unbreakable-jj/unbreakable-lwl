import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ArrowLeft, Dumbbell, Utensils, Brain, Activity,
  Target, MessageSquare, Loader2, Calendar, TrendingUp,
  Flame, Droplets, BookOpen, PenLine, Check, Footprints, ClipboardList, Star, Edit,
  ChevronDown, ChevronRight, Trash2, Eye, Search, Filter, BarChart3, Weight, Repeat
} from 'lucide-react';
import { CoachFeedbackPanel } from './CoachFeedbackPanel';
import { useCoachingFeedback, CoachingFeedback } from '@/hooks/useCoachingFeedback';
import { formatDistanceToNow, format, subDays } from 'date-fns';
import { InlineProgramEditor } from '@/components/programming/InlineProgramEditor';
import { useNavigate } from 'react-router-dom';

interface AthleteDataViewerProps {
  athleteId: string;
  onBack: () => void;
}

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function AthleteDataViewer({ athleteId, onBack }: AthleteDataViewerProps) {
  const navigate = useNavigate();
  const { getFeedbackForAthlete, deleteFeedback } = useCoachingFeedback();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [coachingProfile, setCoachingProfile] = useState<any>(null);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [recentHabits, setRecentHabits] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [cardioPrograms, setCardioPrograms] = useState<any[]>([]);
  const [mealPlans, setMealPlans] = useState<any[]>([]);
  const [mindsetProgrammes, setMindsetProgrammes] = useState<any[]>([]);
  const [personalRecords, setPersonalRecords] = useState<any[]>([]);
  const [recentFoodLogs, setRecentFoodLogs] = useState<any[]>([]);
  const [feedbackHistory, setFeedbackHistory] = useState<CoachingFeedback[]>([]);
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const [fullPrograms, setFullPrograms] = useState<any[]>([]);
  const [sessionPlanners, setSessionPlanners] = useState<any[]>([]);
  const [exerciseLogs, setExerciseLogs] = useState<any[]>([]);
  const [expandedFeedbackIds, setExpandedFeedbackIds] = useState<Set<string>>(new Set());
  const [expandedSessionIds, setExpandedSessionIds] = useState<Set<string>>(new Set());

  // New state for enhancements
  const [mealPlanItems, setMealPlanItems] = useState<any[]>([]);
  const [nutritionGoals, setNutritionGoals] = useState<any>(null);
  const [progressionHistory, setProgressionHistory] = useState<any[]>([]);
  const [cardioSessionPlanners, setCardioSessionPlanners] = useState<any[]>([]);

  // Filters & search
  const [sessionFilter, setSessionFilter] = useState<string>('all');
  const [plannerSearch, setPlannerSearch] = useState('');
  const [feedbackSearch, setFeedbackSearch] = useState('');
  const [expandedPlanners, setExpandedPlanners] = useState(false);
  const [expandedMealPlanIds, setExpandedMealPlanIds] = useState<Set<string>>(new Set());
  const [expandedProgressionExercises, setExpandedProgressionExercises] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadAthleteData();
  }, [athleteId]);

  const loadAthleteData = async () => {
    setLoading(true);

    const [
      { data: profileData },
      { data: coachData },
      { data: sessions },
      { data: habits },
      { data: progs },
      { data: cardioProgs },
      { data: meals },
      { data: mindset },
      { data: prs },
      { data: foods },
      { data: planners },
      { data: progHistory },
      { data: nutGoals },
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', athleteId).maybeSingle(),
      supabase.from('coaching_profiles').select('*').eq('user_id', athleteId).maybeSingle(),
      supabase.from('workout_sessions').select('*').eq('user_id', athleteId).order('started_at', { ascending: false }).limit(20),
      supabase.from('daily_habits').select('*').eq('user_id', athleteId).order('habit_date', { ascending: false }).limit(7),
      supabase.from('training_programs').select('*').eq('user_id', athleteId).order('created_at', { ascending: false }).limit(5),
      supabase.from('cardio_programs').select('*').eq('user_id', athleteId).order('created_at', { ascending: false }).limit(5),
      supabase.from('meal_plans').select('*').eq('user_id', athleteId).order('created_at', { ascending: false }).limit(5),
      supabase.from('mindset_programmes').select('*').eq('user_id', athleteId).order('created_at', { ascending: false }).limit(5),
      supabase.from('personal_records').select('*').eq('user_id', athleteId).order('achieved_at', { ascending: false }).limit(10),
      supabase.from('food_logs').select('*').eq('user_id', athleteId).order('logged_at', { ascending: false }).limit(50),
      supabase.from('session_planners').select('*').eq('user_id', athleteId).order('scheduled_date', { ascending: false }).limit(30),
      supabase.from('progression_history').select('*').eq('user_id', athleteId).gte('recorded_at', subDays(new Date(), 90).toISOString()).order('recorded_at', { ascending: false }),
      supabase.from('nutrition_goals').select('*').eq('user_id', athleteId).maybeSingle(),
    ]);

    setProfile(profileData);
    setCoachingProfile(coachData);
    setRecentSessions(sessions || []);
    setRecentHabits(habits || []);
    setPrograms(progs || []);
    setFullPrograms(progs || []);
    setCardioPrograms(cardioProgs || []);
    setMealPlans(meals || []);
    setMindsetProgrammes(mindset || []);
    setPersonalRecords(prs || []);
    setRecentFoodLogs(foods || []);
    setSessionPlanners(planners || []);
    setProgressionHistory(progHistory || []);
    setNutritionGoals(nutGoals);

    // Load exercise logs for recent sessions
    if (sessions && sessions.length > 0) {
      const sessionIds = sessions.slice(0, 10).map((s: any) => s.id);
      const { data: logs } = await supabase
        .from('exercise_logs')
        .select('*')
        .in('session_id', sessionIds)
        .order('set_number', { ascending: true });
      setExerciseLogs(logs || []);
    }

    // Load meal plan items
    const mealPlanIds = (meals || []).map((m: any) => m.id);
    if (mealPlanIds.length > 0) {
      const { data: items } = await supabase
        .from('meal_plan_items')
        .select('*')
        .in('meal_plan_id', mealPlanIds)
        .order('day_of_week', { ascending: true })
        .order('sort_order', { ascending: true });
      setMealPlanItems(items || []);
    }

    // Load cardio session planners
    const cardioIds = (cardioProgs || []).map((c: any) => c.id);
    if (cardioIds.length > 0) {
      const { data: csp } = await supabase
        .from('cardio_session_planners')
        .select('*')
        .in('program_id', cardioIds)
        .order('week_number', { ascending: true })
        .order('day_number', { ascending: true });
      setCardioSessionPlanners(csp || []);
    }

    // Load feedback history
    const { data: fbData } = await getFeedbackForAthlete(athleteId);
    setFeedbackHistory(fbData);

    setLoading(false);
  };

  const handleDeleteFeedback = async (id: string) => {
    const { error } = await deleteFeedback(id);
    if (!error) {
      setFeedbackHistory(prev => prev.filter(f => f.id !== id));
    }
  };

  const toggleFeedback = (id: string) => {
    setExpandedFeedbackIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSession = (id: string) => {
    setExpandedSessionIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleMealPlan = (id: string) => {
    setExpandedMealPlanIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleProgressionExercise = (name: string) => {
    setExpandedProgressionExercises(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  };

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    if (sessionFilter === 'all') return recentSessions;
    return recentSessions.filter(s => s.status === sessionFilter);
  }, [recentSessions, sessionFilter]);

  // Filtered planners
  const filteredPlanners = useMemo(() => {
    if (!plannerSearch.trim()) return sessionPlanners;
    const q = plannerSearch.toLowerCase();
    return sessionPlanners.filter(sp =>
      `w${sp.week_number}d${sp.day_number}`.includes(q) ||
      sp.session_type?.toLowerCase().includes(q) ||
      sp.status?.toLowerCase().includes(q)
    );
  }, [sessionPlanners, plannerSearch]);

  // Filtered feedback
  const filteredFeedback = useMemo(() => {
    if (!feedbackSearch.trim()) return feedbackHistory;
    const q = feedbackSearch.toLowerCase();
    return feedbackHistory.filter(fb =>
      fb.title.toLowerCase().includes(q) ||
      fb.feedback_type.toLowerCase().includes(q) ||
      fb.general_comments?.toLowerCase().includes(q)
    );
  }, [feedbackHistory, feedbackSearch]);

  // Fuel daily macro summaries
  const dailyFuelSummaries = useMemo(() => {
    const grouped: Record<string, { date: string; calories: number; protein: number; carbs: number; fat: number; items: any[] }> = {};
    recentFoodLogs.forEach(f => {
      const date = format(new Date(f.logged_at), 'yyyy-MM-dd');
      if (!grouped[date]) {
        grouped[date] = { date, calories: 0, protein: 0, carbs: 0, fat: 0, items: [] };
      }
      const servings = f.servings || 1;
      grouped[date].calories += (f.calories || 0) * servings;
      grouped[date].protein += (f.protein_g || 0) * servings;
      grouped[date].carbs += (f.carbs_g || 0) * servings;
      grouped[date].fat += (f.fat_g || 0) * servings;
      grouped[date].items.push(f);
    });
    return Object.values(grouped).sort((a, b) => b.date.localeCompare(a.date));
  }, [recentFoodLogs]);

  // Progression history grouped by exercise
  const progressionByExercise = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    progressionHistory.forEach(p => {
      if (!grouped[p.exercise_name]) grouped[p.exercise_name] = [];
      grouped[p.exercise_name].push(p);
    });
    return grouped;
  }, [progressionHistory]);

  // Workout volume stats (30 days)
  const volumeStats = useMemo(() => {
    const thirtyDaysAgo = subDays(new Date(), 30);
    const recentLogs = exerciseLogs.filter(l => new Date(l.created_at) >= thirtyDaysAgo);
    const recentSessionsFiltered = recentSessions.filter(s => new Date(s.started_at) >= thirtyDaysAgo && s.status === 'completed');
    const totalVolume = recentLogs.reduce((sum, l) => sum + ((l.weight_kg || 0) * (l.actual_reps || 0)), 0);
    const avgRpe = recentLogs.filter(l => l.rpe).length > 0
      ? (recentLogs.filter(l => l.rpe).reduce((sum, l) => sum + l.rpe, 0) / recentLogs.filter(l => l.rpe).length).toFixed(1)
      : '-';
    return {
      completedSessions: recentSessionsFiltered.length,
      totalVolume: Math.round(totalVolume),
      avgRpe,
      totalSets: recentLogs.length,
    };
  }, [recentSessions, exerciseLogs]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const habitCompletionRate = recentHabits.length > 0
    ? Math.round(
        recentHabits.reduce((sum, h) => {
          const count = [h.train, h.learn_daily, h.water, h.hit_your_numbers].filter(Boolean).length;
          const journalDone = (h.journal || '').trim().split(/\s+/).filter(Boolean).length >= 150 ? 1 : 0;
          return sum + count + journalDone;
        }, 0) / (recentHabits.length * 6) * 100
      )
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <PageHeader sectionLabel="ATHLETE VIEW" />
      <main className="container mx-auto px-4 py-6 max-w-3xl space-y-6">
        {/* Back + Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Avatar className="h-14 w-14">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="font-display text-lg">
              {(profile?.display_name || '?')[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="font-display text-lg tracking-wide text-foreground">
              {profile?.display_name || 'Unknown'}
            </h1>
            <p className="text-sm text-muted-foreground">@{profile?.username || 'unknown'}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/inbox?compose=1&to=${athleteId}`)}
            className="font-display text-xs"
          >
            <MessageSquare className="w-4 h-4 mr-1" />
            MESSAGE
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-border">
            <CardContent className="p-3 text-center">
              <Dumbbell className="w-5 h-5 mx-auto text-primary mb-1" />
              <p className="font-display text-lg text-foreground">{recentSessions.length}</p>
              <p className="text-[10px] text-muted-foreground">RECENT SESSIONS</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-3 text-center">
              <Target className="w-5 h-5 mx-auto text-primary mb-1" />
              <p className="font-display text-lg text-foreground">{habitCompletionRate}%</p>
              <p className="text-[10px] text-muted-foreground">HABIT RATE (7D)</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-3 text-center">
              <Activity className="w-5 h-5 mx-auto text-primary mb-1" />
              <p className="font-display text-lg text-foreground">{programs.filter(p => p.is_active).length + cardioPrograms.filter(p => p.is_active).length + mealPlans.filter(p => p.is_active).length + mindsetProgrammes.filter(p => p.is_active).length}</p>
              <p className="text-[10px] text-muted-foreground">ACTIVE PROGRAMS</p>
            </CardContent>
          </Card>
        </div>

        {/* Coaching Profile Summary */}
        {coachingProfile && (
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-sm tracking-wide">ATHLETE PROFILE</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                {coachingProfile.age_years && (
                  <div><span className="text-muted-foreground">Age:</span> {coachingProfile.age_years}</div>
                )}
                {coachingProfile.weight_kg && (
                  <div><span className="text-muted-foreground">Weight:</span> {coachingProfile.weight_kg}kg</div>
                )}
                {coachingProfile.experience_level && (
                  <div><span className="text-muted-foreground">Level:</span> {coachingProfile.experience_level}</div>
                )}
                {coachingProfile.training_goal && (
                  <div><span className="text-muted-foreground">Goal:</span> {coachingProfile.training_goal}</div>
                )}
                {coachingProfile.injuries && (
                  <div className="col-span-2"><span className="text-muted-foreground">Injuries:</span> {coachingProfile.injuries}</div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="training" className="w-full">
          <TabsList className="w-full grid grid-cols-5">
            <TabsTrigger value="training" className="text-xs"><Dumbbell className="w-3 h-3 mr-1" />Training</TabsTrigger>
            <TabsTrigger value="habits" className="text-xs"><Check className="w-3 h-3 mr-1" />Habits</TabsTrigger>
            <TabsTrigger value="nutrition" className="text-xs"><Utensils className="w-3 h-3 mr-1" />Fuel</TabsTrigger>
            <TabsTrigger value="records" className="text-xs"><TrendingUp className="w-3 h-3 mr-1" />Records</TabsTrigger>
            <TabsTrigger value="feedback" className="text-xs"><ClipboardList className="w-3 h-3 mr-1" />Feedback</TabsTrigger>
          </TabsList>

          {/* ===== TRAINING TAB ===== */}
          <TabsContent value="training" className="space-y-3 mt-4">
            {editingProgramId && (() => {
              const prog = fullPrograms.find(p => p.id === editingProgramId);
              if (!prog) return null;
              return (
                <InlineProgramEditor
                  programId={editingProgramId}
                  programData={prog.program_data}
                  onClose={() => setEditingProgramId(null)}
                  onSaved={loadAthleteData}
                />
              );
            })()}
            {!editingProgramId && (
              <>
                {/* Power Programmes */}
                {programs.length > 0 && (
                  <Collapsible defaultOpen>
                    <CollapsibleTrigger className="w-full flex items-center justify-between py-1 group">
                      <p className="font-display text-xs tracking-wide text-muted-foreground flex items-center gap-1">
                        <Dumbbell className="w-3 h-3" /> POWER PROGRAMMES ({programs.length})
                      </p>
                      <ChevronDown className="w-4 h-4 text-muted-foreground group-data-[state=closed]:rotate-[-90deg] transition-transform" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 mt-1">
                      {programs.map(p => (
                        <Card key={p.id} className="border-border">
                          <CardContent className="p-3 flex items-center justify-between">
                            <div>
                              <p className="font-display text-sm text-foreground">{p.name}</p>
                              <p className="text-xs text-muted-foreground">Week {p.current_week} • Day {p.current_day}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {p.is_active && <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">ACTIVE</Badge>}
                              <Button variant="ghost" size="sm" onClick={() => setEditingProgramId(p.id)} className="h-7 px-2 text-xs">
                                <Edit className="w-3 h-3 mr-1" />EDIT
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Movement (Cardio) Programmes */}
                {cardioPrograms.length > 0 && (
                  <Collapsible defaultOpen>
                    <CollapsibleTrigger className="w-full flex items-center justify-between py-1 group">
                      <p className="font-display text-xs tracking-wide text-muted-foreground flex items-center gap-1">
                        <Footprints className="w-3 h-3" /> MOVEMENT PROGRAMMES ({cardioPrograms.length})
                      </p>
                      <ChevronDown className="w-4 h-4 text-muted-foreground group-data-[state=closed]:rotate-[-90deg] transition-transform" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 mt-1">
                      {cardioPrograms.map(p => {
                        const cspForProg = cardioSessionPlanners.filter(c => c.program_id === p.id);
                        return (
                          <Card key={p.id} className="border-border">
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-display text-sm text-foreground">{p.name}</p>
                                  <p className="text-xs text-muted-foreground">Week {p.current_week} • Day {p.current_day}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {p.is_active && <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">ACTIVE</Badge>}
                                  <Button variant="ghost" size="sm" onClick={() => navigate(`/tracker/my-programmes`)} className="h-7 px-2 text-xs">
                                    <Eye className="w-3 h-3 mr-1" />VIEW
                                  </Button>
                                </div>
                              </div>
                              {cspForProg.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  <p className="text-[10px] text-muted-foreground">Scheduled Sessions:</p>
                                  {cspForProg.slice(0, 5).map(cs => (
                                    <div key={cs.id} className="text-xs flex items-center justify-between border border-border/50 rounded px-2 py-1">
                                      <span className="text-foreground">W{cs.week_number}D{cs.day_number} – {cs.session_type}</span>
                                      <Badge variant="outline" className="text-[10px]">{cs.status || 'pending'}</Badge>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Meal Plans (in training for overview) */}
                {mealPlans.length > 0 && (
                  <Collapsible defaultOpen>
                    <CollapsibleTrigger className="w-full flex items-center justify-between py-1 group">
                      <p className="font-display text-xs tracking-wide text-muted-foreground flex items-center gap-1">
                        <Utensils className="w-3 h-3" /> MEAL PLANS ({mealPlans.length})
                      </p>
                      <ChevronDown className="w-4 h-4 text-muted-foreground group-data-[state=closed]:rotate-[-90deg] transition-transform" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 mt-1">
                      {mealPlans.map(p => (
                        <Card key={p.id} className="border-border">
                          <CardContent className="p-3 flex items-center justify-between">
                            <div>
                              <p className="font-display text-sm text-foreground">{p.name}</p>
                              <p className="text-xs text-muted-foreground">{p.description || 'No description'}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {p.is_active && <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">ACTIVE</Badge>}
                              <Button variant="ghost" size="sm" onClick={() => navigate('/fuel/planning')} className="h-7 px-2 text-xs">
                                <Eye className="w-3 h-3 mr-1" />VIEW
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Mindset Programmes */}
                {mindsetProgrammes.length > 0 && (
                  <Collapsible defaultOpen>
                    <CollapsibleTrigger className="w-full flex items-center justify-between py-1 group">
                      <p className="font-display text-xs tracking-wide text-muted-foreground flex items-center gap-1">
                        <Brain className="w-3 h-3" /> MINDSET PROGRAMMES ({mindsetProgrammes.length})
                      </p>
                      <ChevronDown className="w-4 h-4 text-muted-foreground group-data-[state=closed]:rotate-[-90deg] transition-transform" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 mt-1">
                      {mindsetProgrammes.map(p => (
                        <Card key={p.id} className="border-border">
                          <CardContent className="p-3 flex items-center justify-between">
                            <div>
                              <p className="font-display text-sm text-foreground">{p.name}</p>
                              <p className="text-xs text-muted-foreground">{p.goal || p.description || 'No description'}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {p.is_active && <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">ACTIVE</Badge>}
                              <Button variant="ghost" size="sm" onClick={() => navigate('/mindset')} className="h-7 px-2 text-xs">
                                <Eye className="w-3 h-3 mr-1" />VIEW
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {programs.length === 0 && cardioPrograms.length === 0 && mealPlans.length === 0 && mindsetProgrammes.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No programmes found</p>
                )}
              </>
            )}

            {/* Session Planners — Collapsible with Search */}
            {sessionPlanners.length > 0 && !editingProgramId && (
              <Collapsible open={expandedPlanners} onOpenChange={setExpandedPlanners}>
                <CollapsibleTrigger className="w-full flex items-center justify-between py-1 group">
                  <p className="font-display text-xs tracking-wide text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> SESSION PLANNERS ({sessionPlanners.length})
                  </p>
                  <ChevronDown className="w-4 h-4 text-muted-foreground group-data-[state=closed]:rotate-[-90deg] transition-transform" />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 space-y-2">
                  <div className="relative">
                    <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search week, type, status..."
                      value={plannerSearch}
                      onChange={e => setPlannerSearch(e.target.value)}
                      className="h-7 text-xs pl-7"
                    />
                  </div>
                  <ScrollArea className="max-h-[300px]">
                    <div className="space-y-1">
                      {filteredPlanners.slice(0, 20).map(sp => (
                        <Collapsible key={sp.id}>
                          <CollapsibleTrigger className="w-full p-2 border border-border rounded text-xs flex items-center justify-between hover:bg-muted/30 transition-colors">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">W{sp.week_number}D{sp.day_number}</span>
                              <span className="text-muted-foreground">{sp.session_type}</span>
                              {sp.scheduled_date && <span className="text-muted-foreground">{format(new Date(sp.scheduled_date), 'MMM d')}</span>}
                            </div>
                            <div className="flex items-center gap-1">
                              <Badge variant="outline" className="text-[10px]">{sp.status}</Badge>
                              <ChevronRight className="w-3 h-3 text-muted-foreground" />
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="p-2 ml-4 border-l border-border text-xs space-y-1">
                              {sp.exercises && Array.isArray(sp.exercises) ? (
                                sp.exercises.map((ex: any, i: number) => (
                                  <div key={i} className="text-foreground">
                                    {ex.name || ex.exercise_name} — {ex.sets}×{ex.reps}
                                    {ex.weight_kg ? ` @ ${ex.weight_kg}kg` : ''}
                                  </div>
                                ))
                              ) : sp.notes ? (
                                <p className="text-muted-foreground">{sp.notes}</p>
                              ) : (
                                <p className="text-muted-foreground">No exercise details</p>
                              )}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </div>
                  </ScrollArea>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Recent Sessions — Filterable */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-display text-xs tracking-wide text-muted-foreground">RECENT SESSIONS</p>
                <Select value={sessionFilter} onValueChange={setSessionFilter}>
                  <SelectTrigger className="h-7 w-[110px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {filteredSessions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No sessions found</p>
              ) : (
                filteredSessions.map(s => {
                  const sessionLogs = exerciseLogs.filter(l => l.session_id === s.id);
                  const isExpanded = expandedSessionIds.has(s.id);
                  return (
                    <Collapsible key={s.id} open={isExpanded} onOpenChange={() => toggleSession(s.id)}>
                      <Card className="border-border">
                        <CardContent className="p-0">
                          <CollapsibleTrigger className="w-full p-3 flex items-center justify-between text-left hover:bg-muted/30 transition-colors">
                            <div>
                              <p className="font-display text-sm text-foreground">{s.day_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(s.started_at), 'MMM d, yyyy')} • {s.session_type}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">{s.status}</Badge>
                              {sessionLogs.length > 0 && (
                                <Badge variant="secondary" className="text-[10px]">{sessionLogs.length} sets</Badge>
                              )}
                              {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="px-3 pb-3 border-t border-border pt-2 space-y-1">
                              {s.notes && <p className="text-xs text-muted-foreground mb-2">{s.notes}</p>}
                              {sessionLogs.length === 0 ? (
                                <p className="text-xs text-muted-foreground">No exercise logs</p>
                              ) : (
                                <div className="space-y-1">
                                  {Object.entries(
                                    sessionLogs.reduce((acc: Record<string, any[]>, log: any) => {
                                      const key = log.exercise_name;
                                      if (!acc[key]) acc[key] = [];
                                      acc[key].push(log);
                                      return acc;
                                    }, {})
                                  ).map(([name, logs]: [string, any[]]) => (
                                    <div key={name} className="border border-border/50 rounded p-2">
                                      <p className="text-xs font-medium text-foreground mb-1">{name}</p>
                                      <div className="grid grid-cols-4 gap-1 text-[10px] text-muted-foreground mb-1">
                                        <span>Set</span><span>Weight</span><span>Reps</span><span>RPE</span>
                                      </div>
                                      {logs.map((log: any) => (
                                        <div key={log.id} className="grid grid-cols-4 gap-1 text-xs">
                                          <span>{log.set_number}</span>
                                          <span>{log.weight_kg ? `${log.weight_kg}kg` : '-'}</span>
                                          <span>{log.actual_reps ?? log.target_reps ?? '-'}</span>
                                          <span className="flex items-center gap-1">
                                            {log.rpe ?? '-'}
                                            {log.pain_flag && <span className="text-destructive">⚠</span>}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </CollapsibleContent>
                        </CardContent>
                      </Card>
                    </Collapsible>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* ===== HABITS TAB ===== */}
          <TabsContent value="habits" className="space-y-3 mt-4">
            {recentHabits.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No habit data</p>
            ) : (
              recentHabits.map(h => {
                const completed = [h.train, h.learn_daily, h.water, h.hit_your_numbers].filter(Boolean).length;
                const journalWords = (h.journal || '').trim().split(/\s+/).filter(Boolean).length;
                const journalDone = journalWords >= 150;
                const total = completed + (journalDone ? 1 : 0);
                return (
                  <Card key={h.id} className="border-border">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-display text-sm text-foreground">
                          {format(new Date(h.habit_date), 'EEE, d MMM')}
                        </p>
                        <Badge variant="outline" className={`text-xs ${total === 5 ? 'border-primary/40 text-primary' : ''}`}>
                          {total}/5
                        </Badge>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {h.train && <Badge variant="secondary" className="text-[10px]"><Dumbbell className="w-3 h-3 mr-1" />Train</Badge>}
                        {h.learn_daily && <Badge variant="secondary" className="text-[10px]"><BookOpen className="w-3 h-3 mr-1" />Learn</Badge>}
                        {h.water && <Badge variant="secondary" className="text-[10px]"><Droplets className="w-3 h-3 mr-1" />Water</Badge>}
                        {h.hit_your_numbers && <Badge variant="secondary" className="text-[10px]"><Target className="w-3 h-3 mr-1" />Numbers</Badge>}
                        {journalDone && <Badge variant="secondary" className="text-[10px]"><PenLine className="w-3 h-3 mr-1" />Journal</Badge>}
                      </div>
                      {h.journal && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-3">{h.journal}</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          {/* ===== FUEL TAB ===== */}
          <TabsContent value="nutrition" className="space-y-3 mt-4">
            {/* Nutrition Goals */}
            {nutritionGoals && (
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="font-display text-xs tracking-wide">NUTRITION GOALS</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div>
                      <p className="font-display text-sm text-foreground">{nutritionGoals.daily_calories || '-'}</p>
                      <p className="text-[10px] text-muted-foreground">KCAL</p>
                    </div>
                    <div>
                      <p className="font-display text-sm text-orange-400">{nutritionGoals.daily_protein_g || '-'}g</p>
                      <p className="text-[10px] text-muted-foreground">PROTEIN</p>
                    </div>
                    <div>
                      <p className="font-display text-sm text-muted-foreground">{nutritionGoals.daily_carbs_g || '-'}g</p>
                      <p className="text-[10px] text-muted-foreground">CARBS</p>
                    </div>
                    <div>
                      <p className="font-display text-sm text-foreground">{nutritionGoals.daily_fat_g || '-'}g</p>
                      <p className="text-[10px] text-muted-foreground">FAT</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Active Meal Plans with Items */}
            {mealPlans.filter(p => p.is_active).length > 0 && (
              <Collapsible defaultOpen>
                <CollapsibleTrigger className="w-full flex items-center justify-between py-1 group">
                  <p className="font-display text-xs tracking-wide text-muted-foreground flex items-center gap-1">
                    <Utensils className="w-3 h-3" /> ACTIVE MEAL PLANS
                  </p>
                  <ChevronDown className="w-4 h-4 text-muted-foreground group-data-[state=closed]:rotate-[-90deg] transition-transform" />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 mt-1">
                  {mealPlans.filter(p => p.is_active).map(mp => {
                    const items = mealPlanItems.filter(i => i.meal_plan_id === mp.id);
                    const isOpen = expandedMealPlanIds.has(mp.id);
                    // Group by day
                    const byDay: Record<number, any[]> = {};
                    items.forEach(i => {
                      if (!byDay[i.day_of_week]) byDay[i.day_of_week] = [];
                      byDay[i.day_of_week].push(i);
                    });
                    return (
                      <Collapsible key={mp.id} open={isOpen} onOpenChange={() => toggleMealPlan(mp.id)}>
                        <Card className="border-border">
                          <CardContent className="p-0">
                            <CollapsibleTrigger className="w-full p-3 flex items-center justify-between text-left hover:bg-muted/30 transition-colors">
                              <div>
                                <p className="font-display text-sm text-foreground">{mp.name}</p>
                                <p className="text-xs text-muted-foreground">{items.length} items across {Object.keys(byDay).length} days</p>
                              </div>
                              {isOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="px-3 pb-3 border-t border-border pt-2 space-y-2">
                                {Object.entries(byDay).sort(([a], [b]) => Number(a) - Number(b)).map(([day, dayItems]) => (
                                  <div key={day}>
                                    <p className="text-[10px] font-display text-muted-foreground mb-1">{dayLabels[Number(day)] || `Day ${day}`}</p>
                                    {dayItems.map(item => (
                                      <div key={item.id} className="flex items-center justify-between text-xs py-0.5">
                                        <div>
                                          <span className="text-foreground">{item.food_name || 'Unnamed'}</span>
                                          <span className="text-muted-foreground ml-1">({item.meal_type})</span>
                                        </div>
                                        <span className="text-muted-foreground">
                                          {item.calories || 0}kcal
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            </CollapsibleContent>
                          </CardContent>
                        </Card>
                      </Collapsible>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Daily Macro Summaries */}
            <Collapsible defaultOpen>
              <CollapsibleTrigger className="w-full flex items-center justify-between py-1 group">
                <p className="font-display text-xs tracking-wide text-muted-foreground flex items-center gap-1">
                  <BarChart3 className="w-3 h-3" /> DAILY INTAKE ({dailyFuelSummaries.length} days)
                </p>
                <ChevronDown className="w-4 h-4 text-muted-foreground group-data-[state=closed]:rotate-[-90deg] transition-transform" />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-1">
                {dailyFuelSummaries.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No food logs</p>
                ) : (
                  <ScrollArea className="max-h-[400px]">
                    <div className="space-y-2">
                      {dailyFuelSummaries.map(day => (
                        <Collapsible key={day.date}>
                          <Card className="border-border">
                            <CardContent className="p-0">
                              <CollapsibleTrigger className="w-full p-3 flex items-center justify-between text-left hover:bg-muted/30 transition-colors">
                                <div>
                                  <p className="font-display text-sm text-foreground">{format(new Date(day.date), 'EEE, d MMM')}</p>
                                  <p className="text-xs text-muted-foreground">{day.items.length} items logged</p>
                                </div>
                                <div className="text-right text-xs space-y-0.5">
                                  <p className="text-foreground font-medium">{Math.round(day.calories)} kcal</p>
                                  <p className="text-muted-foreground">
                                    <span className="text-orange-400">P:{Math.round(day.protein)}g</span>{' '}
                                    C:{Math.round(day.carbs)}g{' '}
                                    F:{Math.round(day.fat)}g
                                  </p>
                                </div>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <div className="px-3 pb-3 border-t border-border pt-2 space-y-1">
                                  {day.items.map((f: any) => (
                                    <div key={f.id} className="flex items-center justify-between text-xs py-0.5">
                                      <div>
                                        <span className="text-foreground">{f.food_name}</span>
                                        <span className="text-muted-foreground ml-1">({f.meal_type})</span>
                                      </div>
                                      <span className="text-muted-foreground">{f.calories}kcal</span>
                                    </div>
                                  ))}
                                </div>
                              </CollapsibleContent>
                            </CardContent>
                          </Card>
                        </Collapsible>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CollapsibleContent>
            </Collapsible>
          </TabsContent>

          {/* ===== RECORDS TAB ===== */}
          <TabsContent value="records" className="space-y-3 mt-4">
            {/* Workout Volume Stats (30 day) */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-xs tracking-wide">30-DAY VOLUME</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div>
                    <p className="font-display text-sm text-foreground">{volumeStats.completedSessions}</p>
                    <p className="text-[10px] text-muted-foreground">SESSIONS</p>
                  </div>
                  <div>
                    <p className="font-display text-sm text-foreground">{volumeStats.totalSets}</p>
                    <p className="text-[10px] text-muted-foreground">SETS</p>
                  </div>
                  <div>
                    <p className="font-display text-sm text-foreground">{volumeStats.totalVolume > 1000 ? `${(volumeStats.totalVolume / 1000).toFixed(1)}t` : `${volumeStats.totalVolume}kg`}</p>
                    <p className="text-[10px] text-muted-foreground">VOLUME</p>
                  </div>
                  <div>
                    <p className="font-display text-sm text-foreground">{volumeStats.avgRpe}</p>
                    <p className="text-[10px] text-muted-foreground">AVG RPE</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progression History */}
            {Object.keys(progressionByExercise).length > 0 && (
              <Collapsible defaultOpen>
                <CollapsibleTrigger className="w-full flex items-center justify-between py-1 group">
                  <p className="font-display text-xs tracking-wide text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> PROGRESSION HISTORY ({progressionHistory.length})
                  </p>
                  <ChevronDown className="w-4 h-4 text-muted-foreground group-data-[state=closed]:rotate-[-90deg] transition-transform" />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 mt-1">
                  <ScrollArea className="max-h-[400px]">
                    <div className="space-y-2">
                      {Object.entries(progressionByExercise).map(([exercise, entries]) => {
                        const isOpen = expandedProgressionExercises.has(exercise);
                        const latest = entries[0];
                        return (
                          <Collapsible key={exercise} open={isOpen} onOpenChange={() => toggleProgressionExercise(exercise)}>
                            <Card className="border-border">
                              <CardContent className="p-0">
                                <CollapsibleTrigger className="w-full p-3 flex items-center justify-between text-left hover:bg-muted/30 transition-colors">
                                  <div>
                                    <p className="font-display text-sm text-foreground">{exercise}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {entries.length} adjustments • Latest: {latest.new_weight_kg ? `${latest.new_weight_kg}kg` : '-'} × {latest.new_reps ?? '-'}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {latest.adjustment_type && (
                                      <Badge variant="outline" className={`text-[10px] ${
                                        latest.adjustment_type === 'increase' ? 'border-green-500/40 text-green-500' :
                                        latest.adjustment_type === 'decrease' ? 'border-destructive/40 text-destructive' :
                                        latest.adjustment_type === 'deload' ? 'border-orange-400/40 text-orange-400' :
                                        ''
                                      }`}>
                                        {latest.adjustment_type}
                                      </Badge>
                                    )}
                                    {isOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                                  </div>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <div className="px-3 pb-3 border-t border-border pt-2 space-y-1">
                                    <div className="grid grid-cols-5 gap-1 text-[10px] text-muted-foreground mb-1">
                                      <span>Date</span><span>Prev</span><span>New</span><span>Type</span><span>Reason</span>
                                    </div>
                                    {entries.map((e: any) => (
                                      <div key={e.id} className="grid grid-cols-5 gap-1 text-xs">
                                        <span className="text-muted-foreground">{format(new Date(e.recorded_at), 'MMM d')}</span>
                                        <span>{e.previous_weight_kg ? `${e.previous_weight_kg}kg×${e.previous_reps || '-'}` : '-'}</span>
                                        <span className="text-foreground">{e.new_weight_kg ? `${e.new_weight_kg}kg×${e.new_reps || '-'}` : '-'}</span>
                                        <span>{e.adjustment_type || '-'}</span>
                                        <span className="text-muted-foreground truncate">{e.adjustment_reason || '-'}</span>
                                      </div>
                                    ))}
                                  </div>
                                </CollapsibleContent>
                              </CardContent>
                            </Card>
                          </Collapsible>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Personal Records */}
            <Collapsible defaultOpen>
              <CollapsibleTrigger className="w-full flex items-center justify-between py-1 group">
                <p className="font-display text-xs tracking-wide text-muted-foreground flex items-center gap-1">
                  <Star className="w-3 h-3" /> PERSONAL RECORDS ({personalRecords.length})
                </p>
                <ChevronDown className="w-4 h-4 text-muted-foreground group-data-[state=closed]:rotate-[-90deg] transition-transform" />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-1">
                {personalRecords.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No personal records</p>
                ) : (
                  personalRecords.map(pr => (
                    <Card key={pr.id} className="border-border">
                      <CardContent className="p-3 flex items-center justify-between">
                        <div>
                          <p className="font-display text-sm text-foreground">{pr.distance_type}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(pr.achieved_at), 'MMM d, yyyy')}</p>
                        </div>
                        {pr.time_seconds && (
                          <p className="font-display text-sm text-primary">
                            {Math.floor(pr.time_seconds / 60)}:{(pr.time_seconds % 60).toString().padStart(2, '0')}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </CollapsibleContent>
            </Collapsible>
          </TabsContent>

          {/* ===== FEEDBACK TAB ===== */}
          <TabsContent value="feedback" className="space-y-4 mt-4">
            <CoachFeedbackPanel
              athleteId={athleteId}
              sessions={recentSessions.map(s => ({ id: s.id, day_name: s.day_name, started_at: s.started_at }))}
              programs={programs.map(p => ({ id: p.id, name: p.name }))}
              onSaved={loadAthleteData}
            />

            {feedbackHistory.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-display text-xs tracking-wide text-muted-foreground">FEEDBACK HISTORY ({filteredFeedback.length})</p>
                </div>
                <div className="relative">
                  <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search feedback by title, type..."
                    value={feedbackSearch}
                    onChange={e => setFeedbackSearch(e.target.value)}
                    className="h-7 text-xs pl-7"
                  />
                </div>
                <ScrollArea className="max-h-[400px]">
                  <div className="space-y-2">
                    {filteredFeedback.map(fb => {
                      const isExpanded = expandedFeedbackIds.has(fb.id);
                      return (
                        <Collapsible key={fb.id} open={isExpanded} onOpenChange={() => toggleFeedback(fb.id)}>
                          <Card className="border-border">
                            <CardContent className="p-0">
                              <CollapsibleTrigger className="w-full p-3 flex items-center justify-between text-left hover:bg-muted/30 transition-colors">
                                <div className="flex-1 min-w-0">
                                  <p className="font-display text-sm text-foreground">{fb.title}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(fb.created_at), { addSuffix: true })}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <Badge variant="outline" className="text-[10px]">{fb.feedback_type.replace('_', ' ')}</Badge>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                    onClick={(e) => { e.stopPropagation(); handleDeleteFeedback(fb.id); }}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                </div>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <div className="px-3 pb-3 border-t border-border pt-2 space-y-2">
                                  {fb.performance_rating && (
                                    <div className="flex gap-0.5">
                                      {[1, 2, 3, 4, 5].map(n => (
                                        <Star key={n} className={`w-3 h-3 ${n <= fb.performance_rating! ? 'fill-primary text-primary' : 'text-muted-foreground/20'}`} />
                                      ))}
                                    </div>
                                  )}
                                  {fb.technique_notes && <p className="text-xs text-muted-foreground">{fb.technique_notes}</p>}
                                  {fb.next_session_goals && (
                                    <p className="text-xs text-foreground"><span className="text-muted-foreground">Goals:</span> {fb.next_session_goals}</p>
                                  )}
                                  {fb.general_comments && <p className="text-xs text-muted-foreground">{fb.general_comments}</p>}
                                </div>
                              </CollapsibleContent>
                            </CardContent>
                          </Card>
                        </Collapsible>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
