import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWorkoutSessions } from '@/hooks/useWorkoutSessions';
import { MyProgramsSection } from '@/components/programming/MyProgramsSection';
import { Dumbbell, Clock, Globe, Lock, Users } from 'lucide-react';
import { format, parseISO } from 'date-fns';

function formatDuration(seconds: number | null) {
  if (!seconds || seconds <= 0) return '—';
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

function VisibilityBadge({ visibility }: { visibility: 'public' | 'friends' | 'private' }) {
  const icon =
    visibility === 'friends' ? (
      <Users className="w-3 h-3" />
    ) : visibility === 'private' ? (
      <Lock className="w-3 h-3" />
    ) : (
      <Globe className="w-3 h-3" />
    );

  const label = visibility === 'friends' ? 'Friends' : visibility === 'private' ? 'Private' : 'Public';

  return (
    <Badge variant="outline" className="gap-1 border-border text-muted-foreground">
      {icon}
      {label}
    </Badge>
  );
}

export function MyTrainingSection() {
  const { sessions, isLoading, activeSession } = useWorkoutSessions();
  const completed = (sessions || []).filter((s) => s.status === 'completed').slice(0, 5);

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border p-6">
        <h3 className="font-display text-xl text-foreground mb-4 tracking-wide flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-primary" />
          MY PROGRAMS
        </h3>
        <MyProgramsSection />
      </Card>

      <Card className="bg-card border-border p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h3 className="font-display text-xl text-foreground tracking-wide flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            WORKOUT HISTORY
          </h3>
          {activeSession && (
            <Badge variant="default" className="bg-primary shrink-0">Active session</Badge>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : completed.length > 0 ? (
          <div className="space-y-3">
            {completed.map((s) => (
              <div
                key={s.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-muted/30 rounded-lg"
              >
                <div className="min-w-0">
                  <p className="font-medium text-foreground truncate">{s.session_type}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(parseISO(s.started_at), 'MMM d, yyyy')} • Week {s.week_number} • {s.day_name}
                  </p>
                </div>

                <div className="flex items-center gap-2 sm:justify-end">
                  <VisibilityBadge visibility={s.visibility} />
                  <Badge variant="secondary" className="bg-muted text-foreground">
                    {formatDuration(s.duration_seconds)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No completed workouts yet. Start a session from a saved program to build your history.
          </p>
        )}
      </Card>
    </div>
  );
}
