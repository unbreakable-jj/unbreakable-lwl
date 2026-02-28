import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCoachingFeedback, CoachingFeedback } from '@/hooks/useCoachingFeedback';
import { formatDistanceToNow } from 'date-fns';
import { Star, ClipboardList, Target, RefreshCw, MessageSquare, Loader2 } from 'lucide-react';

const TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  session_review: { label: 'Session Review', icon: <ClipboardList className="w-3 h-3" />, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  appraisal: { label: 'Appraisal', icon: <Star className="w-3 h-3" />, color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  goal_setting: { label: 'Goal Setting', icon: <Target className="w-3 h-3" />, color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  plan_update: { label: 'Plan Update', icon: <RefreshCw className="w-3 h-3" />, color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  general: { label: 'General', icon: <MessageSquare className="w-3 h-3" />, color: 'bg-muted text-muted-foreground border-border' },
};

export function CoachUpdatesView() {
  const { getMyCoachFeedback } = useCoachingFeedback();
  const [feedback, setFeedback] = useState<CoachingFeedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeedback();
  }, []);

  const loadFeedback = async () => {
    setLoading(true);
    const { data } = await getMyCoachFeedback();
    setFeedback(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (feedback.length === 0) {
    return (
      <div className="text-center py-12">
        <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No coach updates yet</p>
        <p className="text-sm text-muted-foreground mt-1">Your coach's feedback will appear here</p>
      </div>
    );
  }

  return (
    <ScrollArea className="max-h-[600px]">
      <div className="space-y-4">
        {feedback.map((fb) => {
          const typeConf = TYPE_CONFIG[fb.feedback_type] || TYPE_CONFIG.general;
          return (
            <Card key={fb.id} className="border-border">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display text-sm tracking-wide text-foreground">{fb.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(fb.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <Badge className={`text-[10px] ${typeConf.color}`}>
                    {typeConf.icon}
                    <span className="ml-1">{typeConf.label}</span>
                  </Badge>
                </div>

                {fb.performance_rating && (
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(n => (
                      <Star
                        key={n}
                        className={`w-4 h-4 ${n <= fb.performance_rating! ? 'fill-primary text-primary' : 'text-muted-foreground/20'}`}
                      />
                    ))}
                  </div>
                )}

                {fb.technique_notes && (
                  <div>
                    <p className="text-[10px] font-display tracking-wide text-muted-foreground mb-1">TECHNIQUE NOTES</p>
                    <p className="text-sm text-foreground">{fb.technique_notes}</p>
                  </div>
                )}

                {fb.next_session_goals && (
                  <div>
                    <p className="text-[10px] font-display tracking-wide text-muted-foreground mb-1">NEXT SESSION GOALS</p>
                    <p className="text-sm text-foreground">{fb.next_session_goals}</p>
                  </div>
                )}

                {fb.general_comments && (
                  <div>
                    <p className="text-[10px] font-display tracking-wide text-muted-foreground mb-1">COMMENTS</p>
                    <p className="text-sm text-foreground">{fb.general_comments}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </ScrollArea>
  );
}
