import { useUnifiedFeed } from '@/hooks/useUnifiedFeed';
import { useAuth } from '@/hooks/useAuth';
import { ActivityCard } from '@/components/tracker/ActivityCard';
import { StatusCard } from '@/components/tracker/StatusCard';
import { WorkoutCard } from './WorkoutCard';
import { MilestoneCard } from './MilestoneCard';
import { StoriesSection } from './StoriesSection';
import { CreatePostBox } from '@/components/tracker/CreatePostBox';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, RefreshCw, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface UnifiedFeedProps {
  onSignIn?: () => void;
}

export function UnifiedFeed({ onSignIn }: UnifiedFeedProps) {
  const { user } = useAuth();
  const {
    feedItems,
    loading,
    loadingMore,
    hasMore,
    lastItemRef,
    refetch,
    toggleRunKudos,
    togglePostKudos,
    toggleWorkoutKudos,
    deleteRun,
    deletePost,
    deleteWorkout,
    deleteMilestone,
    toggleRunComments,
    togglePostComments,
    toggleWorkoutComments,
    shareMilestone,
    unshareMilestone,
  } = useUnifiedFeed();

  const handleDeleteRun = async (runId: string) => {
    const { error } = await deleteRun(runId);
    if (error) {
      toast.error('Failed to delete run');
    } else {
      toast.success('Run deleted');
    }
  };

  const handleDeletePost = async (postId: string) => {
    const { error } = await deletePost(postId);
    if (error) {
      toast.error('Failed to delete post');
    } else {
      toast.success('Post deleted');
    }
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    const { error } = await deleteWorkout(workoutId);
    if (error) {
      toast.error('Failed to delete workout');
    } else {
      toast.success('Workout deleted');
    }
  };

  const handleToggleRunComments = async (runId: string) => {
    const { error } = await toggleRunComments(runId);
    if (error) toast.error('Failed to update comments setting');
  };

  const handleTogglePostComments = async (postId: string) => {
    const { error } = await togglePostComments(postId);
    if (error) toast.error('Failed to update comments setting');
  };

  const handleToggleWorkoutComments = async (workoutId: string) => {
    const { error } = await toggleWorkoutComments(workoutId);
    if (error) toast.error('Failed to update comments setting');
  };

  const handleShareMilestone = async (milestoneId: string) => {
    const { error } = await shareMilestone(milestoneId);
    if (error) {
      toast.error('Failed to share achievement');
    } else {
      toast.success('Achievement shared to feed');
    }
  };

  const handleUnshareMilestone = async (milestoneId: string) => {
    const { error } = await unshareMilestone(milestoneId);
    if (error) {
      toast.error('Failed to unshare achievement');
    } else {
      toast.success('Achievement removed from feed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stories Section */}
      {user && <StoriesSection />}

      {/* Create Post Box */}
      {user && <CreatePostBox />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-foreground tracking-wide">ACTIVITY FEED</h2>
        <Button variant="ghost" size="sm" onClick={refetch} className="text-muted-foreground">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Empty State */}
      {feedItems.length === 0 && (
        <Card className="bg-card border-border p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Activity className="w-10 h-10 text-primary" />
          </div>
          <h3 className="font-display text-2xl text-foreground mb-2 tracking-wide">NO ACTIVITY YET</h3>
          <p className="text-muted-foreground mb-4">
            {user
              ? 'Be the first to share something! Post an update, record a run, or complete a workout.'
              : 'Sign in to see the activity feed and share your own updates.'}
          </p>
          {!user && (
            <Button className="font-display tracking-wide" onClick={onSignIn}>
              Sign In to Start
            </Button>
          )}
        </Card>
      )}

      {/* Feed with Infinite Scroll */}
      <div className="space-y-4">
        {feedItems.map((item, index) => {
          const isLast = index === feedItems.length - 1;
          
          return (
            <motion.div
              key={`${item.type}-${item.data.id}`}
              ref={isLast ? lastItemRef : undefined}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.03, 0.3) }}
            >
              {item.type === 'run' && (
                <ActivityCard
                  run={{
                    ...item.data,
                    title: item.data.title,
                    description: item.data.description,
                    notes: null,
                    weather_conditions: null,
                    map_snapshot_url: null,
                    ended_at: null,
                    temperature_celsius: null,
                    is_public: true,
                    created_at: item.data.started_at,
                    updated_at: item.data.started_at,
                  }}
                  onKudos={toggleRunKudos}
                  onDelete={handleDeleteRun}
                  onToggleComments={handleToggleRunComments}
                />
              )}
              {item.type === 'post' && (
                <StatusCard
                  post={{
                    ...item.data,
                    updated_at: item.data.created_at,
                  }}
                  onKudos={togglePostKudos}
                  onDelete={handleDeletePost}
                  onToggleComments={handleTogglePostComments}
                />
              )}
              {item.type === 'workout' && (
                <WorkoutCard
                  workout={item.data}
                  onKudos={toggleWorkoutKudos}
                  onDelete={handleDeleteWorkout}
                  onToggleComments={handleToggleWorkoutComments}
                />
              )}
              {item.type === 'milestone' && (
                <MilestoneCard
                  milestone={{
                    ...item.data,
                    milestone_type: item.data.milestone_type as any,
                    created_at: item.data.achieved_at,
                    profiles: item.data.profiles,
                  }}
                  onShare={handleShareMilestone}
                  onUnshare={handleUnshareMilestone}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Loading More Indicator */}
      {loadingMore && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
          <span className="ml-2 text-muted-foreground">Loading more...</span>
        </div>
      )}

      {/* End of Feed */}
      {!hasMore && feedItems.length > 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground text-sm">You've reached the end of your feed</p>
        </div>
      )}
    </div>
  );
}
