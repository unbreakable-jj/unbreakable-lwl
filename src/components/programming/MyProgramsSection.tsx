import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTrainingPrograms, TrainingProgram } from '@/hooks/useTrainingPrograms';
import { useAuth } from '@/hooks/useAuth';
import { ProgramDisplay } from './ProgramDisplay';
import { 
  Calendar, 
  Play, 
  Trash2, 
  ChevronRight,
  Dumbbell,
  Clock,
  Loader2,
  FolderOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

export function MyProgramsSection() {
  const { user } = useAuth();
  const { programs, isLoading, activeProgram, activateProgram, deleteProgram } = useTrainingPrograms();
  const [expandedProgramId, setExpandedProgramId] = useState<string | null>(null);

  if (!user) {
    return (
      <Card className="p-6 border border-border bg-card text-center">
        <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-display text-lg text-foreground mb-2">Sign in to view your programs</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Save and track your generated training programs by signing in.
        </p>
        <Link to="/tracker">
          <Button variant="default">Sign In</Button>
        </Link>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="p-6 border border-border bg-card flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </Card>
    );
  }

  if (!programs || programs.length === 0) {
    return (
      <Card className="p-6 border border-border bg-card text-center">
        <Dumbbell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-display text-lg text-foreground mb-2">No saved programs</h3>
        <p className="text-sm text-muted-foreground">
          Generate and save a program above to start tracking your workouts.
        </p>
      </Card>
    );
  }

  const handleExpandProgram = (programId: string) => {
    setExpandedProgramId(expandedProgramId === programId ? null : programId);
  };

  const handleActivate = (programId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    activateProgram.mutate(programId);
  };

  const handleDelete = (programId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this program?')) {
      deleteProgram.mutate(programId);
      if (expandedProgramId === programId) {
        setExpandedProgramId(null);
      }
    }
  };

  return (
    <div className="space-y-4">
      {programs.map((program) => (
        <div key={program.id}>
          <Card 
            className={`p-4 border bg-card cursor-pointer transition-all hover:border-primary/50 ${
              program.is_active ? 'border-primary' : 'border-border'
            }`}
            onClick={() => handleExpandProgram(program.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-display text-lg text-foreground truncate">
                    {program.name}
                  </h3>
                  {program.is_active && (
                    <Badge variant="default" className="bg-primary shrink-0">Active</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {program.overview || 'Custom training program'}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(program.created_at), 'MMM d, yyyy')}
                  </span>
                  {program.is_active && program.current_week && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Week {program.current_week}, Day {program.current_day}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                {!program.is_active && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => handleActivate(program.id, e)}
                    disabled={activateProgram.isPending}
                    className="gap-1"
                  >
                    {activateProgram.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    Start
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => handleDelete(program.id, e)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${
                  expandedProgramId === program.id ? 'rotate-90' : ''
                }`} />
              </div>
            </div>
          </Card>

          <AnimatePresence>
            {expandedProgramId === program.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-4">
                  <ProgramDisplay 
                    program={program.program_data} 
                    onReset={() => setExpandedProgramId(null)}
                    savedProgramId={program.id}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
