import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users, UserCheck, Clock, Eye, MessageSquare,
  Check, X, Loader2, UserPlus, Shield,
  Dumbbell, Footprints, Utensils, Brain, ChevronRight
} from 'lucide-react';
import { useCoachingAssignments } from '@/hooks/useCoachingAssignments';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useNavigate } from 'react-router-dom';
import { AthleteDataViewer } from '@/components/coaching/AthleteDataViewer';
import { ClientSearchPanel } from '@/components/coaching/ClientSearchPanel';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const CoachDashboard = ({ embedded = false }: { embedded?: boolean }) => {
  const { user } = useAuth();
  const { role } = useUserRole();
  const navigate = useNavigate();
  const { myAthletes, pendingRequests, loading, updateStatus } = useCoachingAssignments();
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('athletes');

  const dashboardLabel = role === 'dev' ? 'DEV' : 'COACH';

  if (selectedAthleteId) {
    return (
      <AthleteDataViewer
        athleteId={selectedAthleteId}
        onBack={() => setSelectedAthleteId(null)}
      />
    );
  }

  const buildPlanOptions = [
    { label: 'Power Programme', icon: Dumbbell, path: '/programming/create' },
    { label: 'Movement Programme', icon: Footprints, path: '/tracker/create' },
    { label: 'Meal Plan', icon: Utensils, path: '/fuel/planning' },
    { label: 'Mindset Programme', icon: Brain, path: '/mindset' },
  ];

  const content = (
    <div className={embedded ? 'space-y-6' : 'container mx-auto px-4 py-6 max-w-3xl space-y-6'}>
      {!embedded && (
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl tracking-wide text-foreground">
              {dashboardLabel} DASHBOARD
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your athletes and review their progress
            </p>
          </div>
        </div>
      )}

      {/* Quick Actions: Build My Own + Build For Athlete */}
      <div className="grid grid-cols-2 gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Card className="border-border hover:border-primary/30 transition-colors cursor-pointer">
              <CardContent className="p-4 text-center">
                <Dumbbell className="w-6 h-6 mx-auto text-primary mb-2" />
                <p className="font-display text-xs tracking-wide text-foreground">BUILD MY OWN</p>
                <p className="text-[10px] text-muted-foreground mt-1">Create a plan for yourself</p>
              </CardContent>
            </Card>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            {buildPlanOptions.map(opt => (
              <DropdownMenuItem key={opt.path} onClick={() => navigate(opt.path)}>
                <opt.icon className="w-4 h-4 mr-2" />
                {opt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Card className="border-border hover:border-primary/30 transition-colors cursor-pointer">
              <CardContent className="p-4 text-center">
                <UserCheck className="w-6 h-6 mx-auto text-primary mb-2" />
                <p className="font-display text-xs tracking-wide text-foreground">BUILD FOR ATHLETE</p>
                <p className="text-[10px] text-muted-foreground mt-1">Select an athlete below</p>
              </CardContent>
            </Card>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-64 max-h-72 overflow-y-auto">
            {myAthletes.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                No athletes assigned yet
              </div>
            ) : (
              myAthletes.map(assignment => (
                <DropdownMenu key={assignment.id}>
                  <DropdownMenuTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={assignment.athlete_profile?.avatar_url || undefined} />
                        <AvatarFallback className="text-[10px] font-display">
                          {(assignment.athlete_profile?.display_name || '?')[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="flex-1 text-sm truncate">{assignment.athlete_profile?.display_name || 'Unknown'}</span>
                      <ChevronRight className="w-3 h-3 text-muted-foreground" />
                    </DropdownMenuItem>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="right" align="start">
                    {buildPlanOptions.map(opt => (
                      <DropdownMenuItem key={opt.path} onClick={() => navigate(`${opt.path}?for=${assignment.athlete_id}`)}>
                        <opt.icon className="w-4 h-4 mr-2" />
                        {opt.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="athletes" className="font-display text-xs tracking-wide">
            <UserCheck className="w-4 h-4 mr-1" />
            ATHLETES ({myAthletes.length})
          </TabsTrigger>
          <TabsTrigger value="clients" className="font-display text-xs tracking-wide">
            <UserPlus className="w-4 h-4 mr-1" />
            CLIENTS
          </TabsTrigger>
          <TabsTrigger value="requests" className="font-display text-xs tracking-wide">
            <Clock className="w-4 h-4 mr-1" />
            REQUESTS ({pendingRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="athletes" className="space-y-3 mt-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : myAthletes.length === 0 ? (
            <Card className="border-border">
              <CardContent className="py-12 text-center">
                <Users className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No athletes assigned yet</p>
                <p className="text-xs text-muted-foreground mt-1">Use the CLIENTS tab to search and add athletes</p>
              </CardContent>
            </Card>
          ) : (
            myAthletes.map(assignment => (
              <Card key={assignment.id} className="border-border hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={assignment.athlete_profile?.avatar_url || undefined} />
                        <AvatarFallback className="font-display">
                          {(assignment.athlete_profile?.display_name || '?')[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-display text-sm tracking-wide text-foreground">
                          {assignment.athlete_profile?.display_name || 'Unknown'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          @{assignment.athlete_profile?.username || 'unknown'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/inbox?compose=1&to=${assignment.athlete_id}`)}
                        title="Message athlete"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedAthleteId(assignment.athlete_id)}
                        className="font-display text-xs"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        VIEW
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="clients" className="mt-4">
          <ClientSearchPanel />
        </TabsContent>

        <TabsContent value="requests" className="space-y-3 mt-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : pendingRequests.length === 0 ? (
            <Card className="border-border">
              <CardContent className="py-12 text-center">
                <Clock className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No pending requests</p>
              </CardContent>
            </Card>
          ) : (
            pendingRequests.map(request => (
              <Card key={request.id} className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={request.athlete_profile?.avatar_url || undefined} />
                        <AvatarFallback className="font-display">
                          {(request.athlete_profile?.display_name || '?')[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-display text-sm tracking-wide text-foreground">
                          {request.athlete_profile?.display_name || 'Unknown'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Wants to be coached by you
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => updateStatus(request.id, 'active')}
                        className="font-display text-xs"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        ACCEPT
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateStatus(request.id, 'declined')}
                        className="font-display text-xs"
                      >
                        <X className="w-4 h-4 mr-1" />
                        DECLINE
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );

  if (embedded) return content;

  return (
    <div className="min-h-screen bg-background">
      <PageHeader sectionLabel="COACHING" />
      <main>{content}</main>
    </div>
  );
};

export default CoachDashboard;
