import { Card } from '@/components/ui/card';
import { 
  ClipboardList, 
  StickyNote, 
  Sparkles, 
  Video, 
  BarChart3,
  ChevronRight,
  Trophy
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SessionActionTilesProps {
  onOpenLogging: () => void;
  onOpenNotes: () => void;
  onOpenFeedback: () => void;
  onOpenVideo: () => void;
  onOpenProgress: () => void;
  onOpenResults?: () => void;
  completedSets: number;
  totalSets: number;
  hasNotes?: boolean;
  hasFeedback?: boolean;
  hasVideo?: boolean;
  isCompleted?: boolean;
}

export function SessionActionTiles({
  onOpenLogging,
  onOpenNotes,
  onOpenFeedback,
  onOpenVideo,
  onOpenProgress,
  onOpenResults,
  completedSets,
  totalSets,
  hasNotes,
  hasFeedback,
  hasVideo,
  isCompleted,
}: SessionActionTilesProps) {
  const tiles = [
    // Show Results tile first if session is completed
    ...(isCompleted && onOpenResults ? [{
      id: 'results',
      title: 'View Results',
      description: 'Session summary & stats',
      icon: Trophy,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      onClick: onOpenResults,
    }] : []),
    {
      id: 'logging',
      title: 'Log Session',
      description: 'Record sets, reps & weight',
      icon: ClipboardList,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      onClick: onOpenLogging,
    },
    {
      id: 'notes',
      title: 'Session Notes',
      description: 'Add workout notes',
      icon: StickyNote,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      onClick: onOpenNotes,
    },
    {
      id: 'feedback',
      title: 'AI Feedback',
      description: 'Get coaching insights',
      icon: Sparkles,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      onClick: onOpenFeedback,
    },
    {
      id: 'video',
      title: 'Record Video',
      description: 'Capture your form',
      icon: Video,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      onClick: onOpenVideo,
    },
    {
      id: 'progress',
      title: 'View Progress',
      description: 'Track your gains',
      icon: BarChart3,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      onClick: onOpenProgress,
    },
  ];

  const getIndicator = (id: string) => {
    if (id === 'logging') {
      return `${completedSets}/${totalSets}`;
    }
    if (id === 'results' && isCompleted) return '✓';
    if (id === 'notes' && hasNotes) return '✓';
    if (id === 'feedback' && hasFeedback) return '✓';
    if (id === 'video' && hasVideo) return '✓';
    return null;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {tiles.map((tile, index) => {
        const Icon = tile.icon;
        const indicator = getIndicator(tile.id);

        return (
          <motion.div
            key={tile.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              className="p-4 border border-border bg-card hover:border-primary/50 cursor-pointer transition-all group"
              onClick={tile.onClick}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${tile.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${tile.color}`} />
                  </div>
                  <div>
                    <h4 className="font-display text-foreground tracking-wide">
                      {tile.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {tile.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {indicator && (
                    <span className={`text-sm font-medium ${tile.color}`}>
                      {indicator}
                    </span>
                  )}
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
