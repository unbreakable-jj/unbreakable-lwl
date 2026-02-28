import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MainNavigation } from '@/components/MainNavigation';
import { UnifiedFooter } from '@/components/UnifiedFooter';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CoachUpdatesView } from '@/components/coaching/CoachUpdatesView';
import { RequestCoachCard } from '@/components/coaching/RequestCoachCard';
import { useAuth } from '@/hooks/useAuth';
import { useCoachingAssignments } from '@/hooks/useCoachingAssignments';
import { useTrainingPrograms } from '@/hooks/useTrainingPrograms';
import { useCardioPrograms } from '@/hooks/useCardioPrograms';
import { useMealPlans } from '@/hooks/useMealPlans';
import { AuthModal } from '@/components/tracker/AuthModal';
import {
  UserCheck, MessageSquare, ClipboardList, Dumbbell, Footprints,
  Utensils, Loader2, User
} from 'lucide-react';

export default function MyCoaching() {
  const { user, loading: authLoading } = useAuth();
  const { myCoach, loading: coachLoading } = useCoachingAssignments();
  const { programs: trainingPrograms } = useTrainingPrograms();
  const { programs: cardioPrograms } = useCardioPrograms();
  const { mealPlans } = useMealPlans();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const loading = authLoading || coachLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Active plans count
  const activeTraining = trainingPrograms?.filter(p => p.is_active) || [];
  const activeCardio = cardioPrograms?.filter(p => p.is_active) || [];
  const activeMeals = mealPlans?.filter(p => p.is_active) || [];

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />

      {/* Compact Hero */}
      <section className="pt-24 pb-8 md:pt-28 md:pb-10 border-b border-border">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-3"
          >
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
              <UserCheck className="w-7 h-7 text-primary" />
            </div>
            <h1 className="font-display text-3xl sm:text-4xl tracking-wide leading-none">
              <span className="text-primary">MY </span>
              <span className="text-foreground">COACHING</span>
            </h1>
            <p className="text-muted-foreground text-sm max-w-lg mx-auto">
              Your coaching hub — view your coach, feedback, and assigned plans.
            </p>
          </motion.div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {!user ? (
          <Card className="p-8 text-center border-2 border-primary/30">
            <User className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="font-display text-xl tracking-wide mb-3">SIGN IN TO VIEW COACHING</h2>
            <p className="text-muted-foreground text-sm mb-4">Access your coaching dashboard and feedback.</p>
            <Button className="font-display tracking-wide" onClick={() => setShowAuthModal(true)}>
              GET STARTED
            </Button>
          </Card>
        ) : !myCoach ? (
          <div className="space-y-6">
            <Card className="border-border">
              <CardContent className="py-12 text-center">
                <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="font-display text-lg tracking-wide text-foreground mb-2">NO COACH ASSIGNED</h2>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  You don't have a coach yet. Request one from your profile or wait for an assignment.
                </p>
                <Link to="/profile">
                  <Button variant="outline" className="mt-4 font-display text-xs tracking-wide">
                    GO TO PROFILE
                  </Button>
                </Link>
              </CardContent>
            </Card>
            <RequestCoachCard />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Coach Card */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-primary/30">
                      <AvatarImage src={myCoach.coach_profile?.avatar_url || undefined} />
                      <AvatarFallback className="font-display bg-primary/20 text-primary">
                        {(myCoach.coach_profile?.display_name || '?')[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-[10px] font-display tracking-wider text-muted-foreground">YOUR COACH</p>
                      <p className="font-display text-sm tracking-wide text-foreground">
                        {myCoach.coach_profile?.display_name || 'Coach'}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        @{myCoach.coach_profile?.username || 'coach'}
                      </p>
                    </div>
                  </div>
                  <Link to={`/inbox?compose=1&to=${myCoach.coach_id}`}>
                    <Button size="sm" variant="outline" className="font-display text-[11px] tracking-wide">
                      <MessageSquare className="w-3.5 h-3.5 mr-1" />
                      MESSAGE
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Tabs: Updates + My Plans */}
            <Tabs defaultValue="updates" className="w-full">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="updates" className="font-display text-xs tracking-wide">
                  <ClipboardList className="w-3.5 h-3.5 mr-1" />
                  UPDATES
                </TabsTrigger>
                <TabsTrigger value="plans" className="font-display text-xs tracking-wide">
                  <Dumbbell className="w-3.5 h-3.5 mr-1" />
                  MY PLANS
                </TabsTrigger>
              </TabsList>

              <TabsContent value="updates" className="mt-4">
                <CoachUpdatesView />
              </TabsContent>

              <TabsContent value="plans" className="mt-4 space-y-3">
                {activeTraining.length === 0 && activeCardio.length === 0 && activeMeals.length === 0 ? (
                  <Card className="border-border">
                    <CardContent className="py-10 text-center">
                      <Dumbbell className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground text-sm">No active plans yet</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Your coach will assign plans that appear here
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {activeTraining.map(p => (
                      <Link key={p.id} to="/programming">
                        <Card className="border-border hover:border-primary/20 transition-colors">
                          <CardContent className="p-3 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <Dumbbell className="w-4 h-4 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-display text-sm tracking-wide text-foreground truncate">{p.name}</p>
                              <p className="text-[11px] text-muted-foreground">Power Programme</p>
                            </div>
                            <Badge variant="outline" className="text-[9px] font-display shrink-0 border-primary/20 text-primary">
                              ACTIVE
                            </Badge>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                    {activeCardio.map(p => (
                      <Link key={p.id} to="/tracker">
                        <Card className="border-border hover:border-primary/20 transition-colors">
                          <CardContent className="p-3 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <Footprints className="w-4 h-4 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-display text-sm tracking-wide text-foreground truncate">{p.name}</p>
                              <p className="text-[11px] text-muted-foreground">Movement Programme</p>
                            </div>
                            <Badge variant="outline" className="text-[9px] font-display shrink-0 border-primary/20 text-primary">
                              ACTIVE
                            </Badge>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                    {activeMeals.map(p => (
                      <Link key={p.id} to="/fuel/planning">
                        <Card className="border-border hover:border-primary/20 transition-colors">
                          <CardContent className="p-3 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <Utensils className="w-4 h-4 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-display text-sm tracking-wide text-foreground truncate">{p.name}</p>
                              <p className="text-[11px] text-muted-foreground">Meal Plan</p>
                            </div>
                            <Badge variant="outline" className="text-[9px] font-display shrink-0 border-primary/20 text-primary">
                              ACTIVE
                            </Badge>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>

      <UnifiedFooter className="mt-auto" />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
