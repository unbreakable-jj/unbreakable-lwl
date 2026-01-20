import { useRuns } from '@/hooks/useRuns';
import { useAuth } from '@/hooks/useAuth';
import { ActivityCard } from './ActivityCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface ActivityFeedProps {
  onSignIn?: () => void;
}

export function ActivityFeed({ onSignIn }: ActivityFeedProps) {
  const { user } = useAuth();
  const { runs, loading, refetch, toggleKudos } = useRuns();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (runs.length === 0) {
    return (
      <Card className="bg-card border-border p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Activity className="w-10 h-10 text-primary" />
        </div>
        <h3 className="font-display text-2xl text-foreground mb-2 tracking-wide">
          NO RUNS YET
        </h3>
        <p className="text-muted-foreground mb-4">
          {user
            ? 'Be the first to record a run and start your journey!'
            : 'Sign in to record your runs and see the activity feed.'}
        </p>
        {!user && (
          <Button className="font-display tracking-wide" onClick={onSignIn}>
            Sign In to Start
          </Button>
        )}
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-foreground tracking-wide">
          ACTIVITY FEED
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={refetch}
          className="text-muted-foreground"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {runs.map((run, index) => (
          <motion.div
            key={run.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <ActivityCard
              run={run}
              onKudos={toggleKudos}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
