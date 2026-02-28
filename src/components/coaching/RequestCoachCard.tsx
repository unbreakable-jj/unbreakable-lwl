import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserCheck, Clock, MessageSquare, X, Loader2 } from 'lucide-react';
import { useCoachingAssignments } from '@/hooks/useCoachingAssignments';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface CoachInfo {
  user_id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
}

export function RequestCoachCard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { myCoach, myPendingRequest, requestCoach, updateStatus } = useCoachingAssignments();
  const [availableCoaches, setAvailableCoaches] = useState<CoachInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCoaches();
  }, []);

  const loadCoaches = async () => {
    // Fetch users with coach or dev roles
    const { data: roles } = await supabase
      .from('user_roles')
      .select('user_id, role')
      .in('role', ['coach', 'dev']);

    if (!roles || roles.length === 0) {
      setLoading(false);
      return;
    }

    const coachIds = roles.map(r => r.user_id).filter(id => id !== user?.id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, display_name, username, avatar_url')
      .in('user_id', coachIds);

    setAvailableCoaches(profiles || []);
    setLoading(false);
  };

  // Already have an active coach
  if (myCoach) {
    return (
      <Card className="border-primary/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={myCoach.coach_profile?.avatar_url || undefined} />
              <AvatarFallback className="font-display">
                {(myCoach.coach_profile?.display_name || '?')[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">YOUR COACH</p>
              <p className="font-display text-sm tracking-wide text-foreground">
                {myCoach.coach_profile?.display_name || 'Unknown'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/inbox?compose=1&to=${myCoach.coach_id}`)}
              className="font-display text-xs"
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              MESSAGE
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Pending request
  if (myPendingRequest) {
    return (
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted/30 flex items-center justify-center">
              <Clock className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-display text-sm tracking-wide text-foreground">REQUEST PENDING</p>
              <p className="text-xs text-muted-foreground">
                Waiting for {myPendingRequest.coach_profile?.display_name || 'coach'} to accept
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateStatus(myPendingRequest.id, 'ended')}
              className="text-xs"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show available coaches
  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  if (availableCoaches.length === 0) return null;

  return (
    <Card className="border-border">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-primary" />
          <span className="font-display text-sm tracking-wide text-foreground">GET A COACH</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Request a real coach for personalised feedback, form checks, and programme adjustments.
        </p>
        <div className="space-y-2">
          {availableCoaches.map(coach => (
            <div key={coach.user_id} className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/10">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={coach.avatar_url || undefined} />
                  <AvatarFallback className="font-display text-sm">
                    {(coach.display_name || '?')[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-display text-sm text-foreground">{coach.display_name || 'Coach'}</p>
                  <p className="text-xs text-muted-foreground">@{coach.username || 'unknown'}</p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => requestCoach(coach.user_id)}
                className="font-display text-xs"
              >
                REQUEST
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
