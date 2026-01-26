import { Card } from '@/components/ui/card';
import { 
  ClipboardList, 
  StickyNote, 
  Sparkles, 
  Video, 
  BarChart3,
  ChevronRight 
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SessionActionTilesProps {
  onOpenLogging: () => void;
  onOpenNotes: () => void;
  onOpenFeedback: () => void;
  onOpenVideo: () => void;
  onOpenProgress: () => void;
  completedSets: number;
  totalSets: number;
  hasNotes?: boolean;
  hasFeedback?: boolean;
  hasVideo?: boolean;
}

const tiles = [
  {
    id: 'logging',
    title: 'Log Session',
    description: 'Record sets, reps & weight',
    icon: ClipboardList,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    action: 'onOpenLogging',
  },
  {
    id: 'notes',
    title: 'Session Notes',
    description: 'Add workout notes',
    icon: StickyNote,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    action: 'onOpenNotes',
  },
  {
    id: 'feedback',
    title: 'AI Feedback',
    description: 'Get coaching insights',
    icon: Sparkles,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    action: 'onOpenFeedback',
  },
  {
    id: 'video',
    title: 'Record Video',
    description: 'Capture your form',
    icon: Video,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    action: 'onOpenVideo',
  },
  {
    id: 'progress',
    title: 'View Progress',
    description: 'Track your gains',
    icon: BarChart3,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    action: 'onOpenProgress',
  },
] as const;

export function SessionActionTiles({
  onOpenLogging,
  onOpenNotes,
  onOpenFeedback,
  onOpenVideo,
  onOpenProgress,
  completedSets,
  totalSets,
  hasNotes,
  hasFeedback,
  hasVideo,
}: SessionActionTilesProps) {
  const actions: Record<string, () => void> = {
    onOpenLogging,
    onOpenNotes,
    onOpenFeedback,
    onOpenVideo,
    onOpenProgress,
  };

  const getIndicator = (id: string) => {
    if (id === 'logging') {
      return `${completedSets}/${totalSets}`;
    }
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
              onClick={actions[tile.action]}
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
