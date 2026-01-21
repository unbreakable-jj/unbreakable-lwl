import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, MessageCircle, MapPin, Clock, Zap, TrendingUp } from 'lucide-react';
import { RunWithProfile } from '@/hooks/useRuns';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { RunMap, geoJSONToPositions } from './RunMap';
import { CommentSection } from './CommentSection';
import { PostMenu } from './PostMenu';
import { ShareMenu } from './ShareMenu';

interface ActivityCardProps {
  run: RunWithProfile;
  onKudos: (runId: string) => void;
  onDelete: (runId: string) => void;
  onToggleComments: (runId: string) => void;
}

export function ActivityCard({ run, onKudos, onDelete, onToggleComments }: ActivityCardProps) {
  const { user } = useAuth();
  const [isLiking, setIsLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const isOwner = user?.id === run.user_id;

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPace = (paceSeconds: number | null) => {
    if (!paceSeconds) return '--:--';
    const mins = Math.floor(paceSeconds / 60);
    const secs = paceSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleKudos = async () => {
    if (!user) return;
    setIsLiking(true);
    await onKudos(run.id);
    setIsLiking(false);
  };

  const getInitials = () => {
    if (run.profiles?.display_name) {
      return run.profiles.display_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return 'R';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-card border-border overflow-hidden">
        {/* Header */}
        <div className="p-4 flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={run.profiles?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground font-display">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate">
              {run.profiles?.display_name || 'Runner'}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(run.started_at), { addSuffix: true })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {run.is_gps_tracked && (
              <div className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                <MapPin className="w-3 h-3" />
                GPS
              </div>
            )}
            <PostMenu
              isOwner={isOwner}
              commentsEnabled={run.comments_enabled}
              onDelete={() => onDelete(run.id)}
              onToggleComments={() => onToggleComments(run.id)}
            />
          </div>
        </div>

        {/* Title & Description */}
        <div className="px-4 pb-3">
          <h3 className="font-display text-xl tracking-wide text-foreground">
            {run.title || 'Morning Run'}
          </h3>
          {run.description && (
            <p className="text-muted-foreground text-sm mt-1">{run.description}</p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 px-4 py-4 bg-muted/30">
          <div className="text-center">
            <p className="text-2xl font-display text-primary tracking-wide">
              {run.distance_km.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">km</p>
          </div>
          <div className="text-center border-x border-border">
            <p className="text-2xl font-display text-foreground tracking-wide">
              {formatDuration(run.duration_seconds)}
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">time</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-display text-foreground tracking-wide">
              {formatPace(run.pace_per_km_seconds)}
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">/km</p>
          </div>
        </div>

        {/* Map for GPS tracked runs */}
        {run.is_gps_tracked && run.route_polyline && (
          <div className="px-4 py-3">
            <RunMap 
              positions={geoJSONToPositions(run.route_polyline)}
              showReplay={true}
              showExport={true}
            />
          </div>
        )}

        {/* Additional Stats */}
        {(run.elevation_gain_m || run.calories_burned || run.average_speed_kph) && (
          <div className="flex items-center gap-4 px-4 py-3 text-sm text-muted-foreground border-t border-border">
            {run.elevation_gain_m && (
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                <span>{run.elevation_gain_m}m</span>
              </div>
            )}
            {run.calories_burned && (
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4" />
                <span>{run.calories_burned} cal</span>
              </div>
            )}
            {run.average_speed_kph && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{run.average_speed_kph} km/h</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 px-4 py-3 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            className={`flex-1 ${run.has_kudos ? 'text-primary' : 'text-muted-foreground'}`}
            onClick={handleKudos}
            disabled={!user || isLiking}
          >
            <motion.div
              animate={isLiking ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Heart className={`w-5 h-5 mr-2 ${run.has_kudos ? 'fill-primary' : ''}`} />
            </motion.div>
            <span className="font-display tracking-wide">
              {run.kudos_count || 0} Kudos
            </span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`flex-1 ${showComments ? 'text-primary' : 'text-muted-foreground'}`}
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className={`w-5 h-5 mr-2 ${showComments ? 'fill-primary/20' : ''}`} />
            <span className="font-display tracking-wide">
              {run.comments_count || 0}
            </span>
          </Button>
          <ShareMenu run={run} />
        </div>

        {/* Comments Section */}
        <CommentSection
          runId={run.id}
          commentsEnabled={run.comments_enabled}
          isExpanded={showComments}
          onToggle={() => setShowComments(!showComments)}
        />
      </Card>
    </motion.div>
  );
}
