import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  ArrowLeft, Dumbbell, Utensils, Brain, Activity,
  Target, MessageSquare, Loader2, Calendar, TrendingUp,
  Flame, Droplets, BookOpen, PenLine, Check, Footprints, ClipboardList, Star, Edit, Brain as BrainIcon,
  ChevronDown, ChevronRight, Trash2, Eye
} from 'lucide-react';
import { CoachFeedbackPanel } from './CoachFeedbackPanel';
import { useCoachingFeedback, CoachingFeedback } from '@/hooks/useCoachingFeedback';
import { formatDistanceToNow } from 'date-fns';
import { InlineProgramEditor } from '@/components/programming/InlineProgramEditor';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface AthleteDataViewerProps {
  athleteId: string;
  onBack: () => void;
}

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
      supabase.from('food_logs').select('*').eq('user_id', athleteId).order('logged_at', { ascending: false }).limit(20),
      supabase.from('session_planners').select('*').eq('user_id', athleteId).order('scheduled_date', { ascending: false }).limit(30),
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

        {/* Tabs for detailed data */}
        <Tabs defaultValue="training" className="w-full">
          <TabsList className="w-full grid grid-cols-5">
            <TabsTrigger value="training" className="text-xs"><Dumbbell className="w-3 h-3 mr-1" />Training</TabsTrigger>
            <TabsTrigger value="habits" className="text-xs"><Check className="w-3 h-3 mr-1" />Habits</TabsTrigger>
            <TabsTrigger value="nutrition" className="text-xs"><Utensils className="w-3 h-3 mr-1" />Fuel</TabsTrigger>
            <TabsTrigger value="records" className="text-xs"><TrendingUp className="w-3 h-3 mr-1" />Records</TabsTrigger>
            <TabsTrigger value="feedback" className="text-xs"><ClipboardList className="w-3 h-3 mr-1" />Feedback</TabsTrigger>
          </TabsList>

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
                  <div className="space-y-2">
                    <p className="font-display text-xs tracking-wide text-muted-foreground flex items-center gap-1"><Dumbbell className="w-3 h-3" /> POWER PROGRAMMES</p>
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
                  </div>
                )}

                {/* Movement (Cardio) Programmes */}
                {cardioPrograms.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-display text-xs tracking-wide text-muted-foreground flex items-center gap-1"><Footprints className="w-3 h-3" /> MOVEMENT PROGRAMMES</p>
                    {cardioPrograms.map(p => (
                      <Card key={p.id} className="border-border">
                        <CardContent className="p-3 flex items-center justify-between">
                          <div>
                            <p className="font-display text-sm text-foreground">{p.name}</p>
                            <p className="text-xs text-muted-foreground">Week {p.current_week} • Day {p.current_day}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {p.is_active && <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">ACTIVE</Badge>}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Meal Plans */}
                {mealPlans.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-display text-xs tracking-wide text-muted-foreground flex items-center gap-1"><Utensils className="w-3 h-3" /> MEAL PLANS</p>
                    {mealPlans.map(p => (
                      <Card key={p.id} className="border-border">
                        <CardContent className="p-3 flex items-center justify-between">
                          <div>
                            <p className="font-display text-sm text-foreground">{p.name}</p>
                            <p className="text-xs text-muted-foreground">{p.description || 'No description'}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {p.is_active && <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">ACTIVE</Badge>}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Mindset Programmes */}
                {mindsetProgrammes.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-display text-xs tracking-wide text-muted-foreground flex items-center gap-1"><BrainIcon className="w-3 h-3" /> MINDSET PROGRAMMES</p>
                    {mindsetProgrammes.map(p => (
                      <Card key={p.id} className="border-border">
                        <CardContent className="p-3 flex items-center justify-between">
                          <div>
                            <p className="font-display text-sm text-foreground">{p.name}</p>
                            <p className="text-xs text-muted-foreground">{p.goal || p.description || 'No description'}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {p.is_active && <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">ACTIVE</Badge>}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {programs.length === 0 && cardioPrograms.length === 0 && mealPlans.length === 0 && mindsetProgrammes.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No programmes found</p>
                )}
              </>
            )}

            {/* Session Planners */}
            {sessionPlanners.length > 0 && !editingProgramId && (
              <div className="space-y-2">
                <p className="font-display text-xs tracking-wide text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> SESSION PLANNERS
                </p>
                <ScrollArea className="max-h-[300px]">
                  <div className="space-y-1">
                    {sessionPlanners.slice(0, 20).map(sp => (
                      <div key={sp.id} className="p-2 border border-border rounded text-xs flex items-center justify-between">
                        <div>
                          <span className="font-medium text-foreground">W{sp.week_number}D{sp.day_number}</span>
                          <span className="text-muted-foreground ml-2">{sp.session_type}</span>
                          {sp.scheduled_date && <span className="text-muted-foreground ml-2">{format(new Date(sp.scheduled_date), 'MMM d')}</span>}
                        </div>
                        <Badge variant="outline" className="text-[10px]">{sp.status}</Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Recent Sessions with Exercise Logs */}
            <div className="space-y-2">
              <p className="font-display text-xs tracking-wide text-muted-foreground">RECENT SESSIONS</p>
              {recentSessions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No sessions logged</p>
              ) : (
                recentSessions.map(s => {
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
                                  {/* Group by exercise name */}
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

          <TabsContent value="nutrition" className="space-y-3 mt-4">
            {recentFoodLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No food logs</p>
            ) : (
              recentFoodLogs.slice(0, 10).map(f => (
                <Card key={f.id} className="border-border">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">{f.food_name}</p>
                        <p className="text-xs text-muted-foreground">{f.meal_type} • {format(new Date(f.logged_at), 'MMM d')}</p>
                      </div>
                      <div className="text-right text-xs">
                        <p className="text-foreground font-medium">{f.calories} kcal</p>
                        <p className="text-muted-foreground">
                          P:{f.protein_g || 0}g C:{f.carbs_g || 0}g F:{f.fat_g || 0}g
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="records" className="space-y-3 mt-4">
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
          </TabsContent>

          <TabsContent value="feedback" className="space-y-4 mt-4">
            <CoachFeedbackPanel
              athleteId={athleteId}
              sessions={recentSessions.map(s => ({ id: s.id, day_name: s.day_name, started_at: s.started_at }))}
              programs={programs.map(p => ({ id: p.id, name: p.name }))}
              onSaved={loadAthleteData}
            />

            {feedbackHistory.length > 0 && (
              <div className="space-y-2">
                <p className="font-display text-xs tracking-wide text-muted-foreground">FEEDBACK HISTORY ({feedbackHistory.length})</p>
                <ScrollArea className="max-h-[400px]">
                  <div className="space-y-2">
                    {feedbackHistory.map(fb => {
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
