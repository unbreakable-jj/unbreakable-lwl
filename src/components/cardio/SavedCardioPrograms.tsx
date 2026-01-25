import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Footprints, 
  Zap, 
  Bike, 
  Calendar,
  Trash2,
  Eye
} from 'lucide-react';
import { useCardioPrograms, CardioProgram } from '@/hooks/useCardioPrograms';
import { GeneratedCardioProgram, activityLabels } from '@/lib/cardioTypes';
import { format } from 'date-fns';

interface SavedCardioProgramsProps {
  onViewProgram: (program: GeneratedCardioProgram) => void;
}

export function SavedCardioPrograms({ onViewProgram }: SavedCardioProgramsProps) {
  const { programs, isLoading, deleteProgram } = useCardioPrograms();

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'walk': return <Footprints className="w-5 h-5 text-primary" />;
      case 'run': return <Zap className="w-5 h-5 text-primary" />;
      case 'cycle': return <Bike className="w-5 h-5 text-primary" />;
      default: return <Zap className="w-5 h-5 text-primary" />;
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6 text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </CardContent>
      </Card>
    );
  }

  if (!programs || programs.length === 0) {
    return null;
  }

  return (
    <Card className="bg-card border-border overflow-hidden neon-border-subtle">
      <div className="bg-primary/10 border-b border-border px-6 py-4">
        <h3 className="font-display text-lg text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          MY PROGRAMMES
        </h3>
      </div>
      <CardContent className="p-6">
        <div className="space-y-3">
          {programs.map((program) => (
            <div
              key={program.id}
              className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  {getActivityIcon(program.program_data.activityType)}
                </div>
                <div>
                  <p className="font-display tracking-wide text-foreground">
                    {program.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {activityLabels[program.program_data.activityType]}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(program.created_at), 'dd MMM yyyy')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onViewProgram(program.program_data)}
                  className="font-display tracking-wide"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  VIEW
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteProgram.mutate(program.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
