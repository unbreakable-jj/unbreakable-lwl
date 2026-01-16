import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { StrengthResult, Exercise } from '@/lib/strengthCalculations';
import { exerciseNames } from '@/lib/strengthCalculations';

interface StrengthResultsProps {
  result: StrengthResult;
  exercise: Exercise;
  unit: 'kg' | 'lb';
}

export function StrengthResults({ result, exercise, unit }: StrengthResultsProps) {
  const { oneRepMax, level, percentile, ratio } = result;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 1RM Result */}
      <Card className="bg-card border-border overflow-hidden">
        <div className="bg-primary/10 border-b border-border px-6 py-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Estimated One-Rep Max
          </h3>
        </div>
        <CardContent className="p-6 text-center">
          <div className="text-6xl font-black text-primary mb-2">
            {oneRepMax}
            <span className="text-2xl text-muted-foreground ml-2">{unit}</span>
          </div>
          <p className="text-muted-foreground">
            {exerciseNames[exercise]}
          </p>
        </CardContent>
      </Card>

      {/* Strength Level */}
      <Card className="bg-card border-border overflow-hidden">
        <div className="bg-primary/10 border-b border-border px-6 py-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Strength Level
          </h3>
        </div>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl font-bold text-foreground">
              {level.name}
            </span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-6 h-6 ${
                    star <= level.stars
                      ? 'fill-primary text-primary'
                      : 'text-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Beginner</span>
              <span className="text-muted-foreground">Elite</span>
            </div>
            <Progress value={percentile} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-1">
              {ratio}x
            </div>
            <p className="text-sm text-muted-foreground">Bodyweight Ratio</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-1">
              Top {100 - percentile}%
            </div>
            <p className="text-sm text-muted-foreground">Percentile</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
