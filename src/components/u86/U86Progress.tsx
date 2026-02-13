import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RotateCcw, Trash2, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { U86Day, U86Program } from '@/hooks/useUnbreakable86';

interface U86ProgressProps {
  program: U86Program;
  days: U86Day[];
  completedDays: number;
  streak: number;
  onRestart: () => void;
  onAbandon: () => void;
}

export const U86Progress = React.forwardRef<HTMLDivElement, U86ProgressProps>(function U86Progress({ program, days, completedDays, streak, onRestart, onAbandon }, ref) {
  const progressPercent = Math.round((completedDays / 86) * 100);

  // Build 86-day grid
  const dayGrid = Array.from({ length: 86 }, (_, i) => {
    const dayNum = i + 1;
    const dayData = days.find(d => d.day_number === dayNum);
    const isCurrent = dayNum === program.current_day;
    const isCompleted = dayData?.day_completed;
    const isFuture = dayNum > program.current_day;
    return { dayNum, isCompleted, isCurrent, isFuture, dayData };
  });

  return (
    <div ref={ref} className="max-w-2xl mx-auto space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center border-primary/30 bg-primary/5">
          <p className="font-display text-2xl text-primary neon-glow-subtle">{completedDays}</p>
          <p className="text-xs text-muted-foreground font-display tracking-wider">COMPLETED</p>
        </Card>
        <Card className="p-4 text-center border-primary/30 bg-primary/5">
          <p className="font-display text-2xl text-primary neon-glow-subtle">{streak}</p>
          <p className="text-xs text-muted-foreground font-display tracking-wider">STREAK</p>
        </Card>
        <Card className="p-4 text-center border-primary/30 bg-primary/5">
          <p className="font-display text-2xl text-primary neon-glow-subtle">{86 - completedDays}</p>
          <p className="text-xs text-muted-foreground font-display tracking-wider">REMAINING</p>
        </Card>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Overall Progress</span>
          <span className="text-primary font-display">{progressPercent}%</span>
        </div>
        <Progress value={progressPercent} className="h-3" />
      </div>

      {/* 86-Day Grid */}
      <Card className="p-4 border-primary/20">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-primary" />
          <h4 className="font-display text-sm tracking-wider text-foreground">86-DAY MAP</h4>
        </div>
        <div className="grid grid-cols-14 gap-1">
          {dayGrid.map(({ dayNum, isCompleted, isCurrent, isFuture }) => (
            <div
              key={dayNum}
              className={cn(
                'w-full aspect-square rounded-sm flex items-center justify-center text-[8px] font-display transition-all',
                isCompleted && 'bg-green-500 text-green-50',
                isCurrent && !isCompleted && 'bg-primary text-primary-foreground ring-2 ring-primary/50 animate-pulse',
                isFuture && 'bg-muted/30 text-muted-foreground/30',
                !isCompleted && !isCurrent && !isFuture && 'bg-destructive/30 text-destructive/50',
              )}
              title={`Day ${dayNum}`}
            >
              {dayNum}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-green-500" /> Done</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-primary" /> Today</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-muted/30" /> Upcoming</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-destructive/30" /> Missed</div>
        </div>
      </Card>

      {/* Restart info */}
      {program.restart_count > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          Restarts: {program.restart_count}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-border">
        {program.restart_enabled && (
          <Button variant="outline" size="sm" onClick={onRestart} className="gap-2 flex-1">
            <RotateCcw className="w-4 h-4" /> Restart
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={onAbandon} className="gap-2 text-destructive hover:text-destructive flex-1">
          <Trash2 className="w-4 h-4" /> Abandon
        </Button>
      </div>
    </div>
  );
});
