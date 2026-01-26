import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTrainingPrograms, TrainingProgram, ProgramStatus } from '@/hooks/useTrainingPrograms';
import { useAuth } from '@/hooks/useAuth';
import { ProgramDisplay } from './ProgramDisplay';
import { ProgrammeExecutionView } from './ProgrammeExecutionView';
import { 
  Calendar, 
  Play, 
  Pause,
  Trash2, 
  ChevronRight,
  Dumbbell,
  Clock,
  Loader2,
  FolderOpen,
  AlertCircle,
  Target,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const statusConfig: Record<ProgramStatus, { label: string; className: string }> = {
  not_started: { label: 'Not Started', className: 'bg-muted text-muted-foreground border-muted' },
  active: { label: 'Active', className: 'bg-primary text-primary-foreground border-primary' },
  completed: { label: 'Completed', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
  paused: { label: 'Paused', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
};

export function MyProgramsSection() {
  const { user } = useAuth();
  const { 
    programs, 
    isLoading, 
    activeProgramCount,
    canActivateMore,
    maxActivePrograms,
    startProgrammeExecution,
    deactivateProgram,
    deleteProgram 
  } = useTrainingPrograms();
  const [expandedProgramId, setExpandedProgramId] = useState<string | null>(null);
  const [executingProgramId, setExecutingProgramId] = useState<string | null>(null);

  // Find the program being executed
  const executingProgram = programs?.find(p => p.id === executingProgramId);

  if (!user) {
    return (
      <Card className="p-6 border border-border bg-card text-center">
        <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-display text-lg text-foreground mb-2">Sign in to view your programmes</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Save and track your generated training programmes by signing in.
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
        <h3 className="font-display text-lg text-foreground mb-2">No saved programmes</h3>
        <p className="text-sm text-muted-foreground">
          Generate and save a programme above to start tracking your workouts.
        </p>
      </Card>
    );
  }

  const handleExpandProgram = (programId: string) => {
    if (executingProgramId) return; // Don't expand while executing
    setExpandedProgramId(expandedProgramId === programId ? null : programId);
  };

  const handleStartProgramme = async (programId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await startProgrammeExecution.mutateAsync(programId);
      // Open execution view after successful start
      setExecutingProgramId(programId);
      setExpandedProgramId(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleResumeProgramme = (programId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExecutingProgramId(programId);
    setExpandedProgramId(null);
  };

  const handleDeactivate = (programId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deactivateProgram.mutate(programId);
  };

  const handleDelete = (programId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this programme? This will also delete all scheduled sessions.')) {
      deleteProgram.mutate(programId);
      if (expandedProgramId === programId) {
        setExpandedProgramId(null);
      }
      if (executingProgramId === programId) {
        setExecutingProgramId(null);
      }
    }
  };

  // Show execution view if a program is being executed
  if (executingProgram) {
    return (
      <ProgrammeExecutionView
        program={executingProgram}
        onClose={() => setExecutingProgramId(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Active Programs Counter */}
      <div className="flex items-center justify-between p-3 bg-surface rounded-lg border border-border">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">
            Active Programmes: <span className="text-foreground font-medium">{activeProgramCount}</span> / {maxActivePrograms}
          </span>
        </div>
        {!canActivateMore && (
          <Badge variant="outline" className="border-yellow-500/50 text-yellow-400">
            Max Reached
          </Badge>
        )}
      </div>

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
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-display text-lg text-foreground truncate">
                    {program.name}
                  </h3>
                  <Badge 
                    variant="outline" 
                    className={statusConfig[program.status].className}
                  >
                    {statusConfig[program.status].label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {program.overview || 'Custom training programme'}
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
                {program.is_active ? (
                  <>
                    {/* Resume button for active programs */}
                    <Button
                      variant="default"
                      size="sm"
                      onClick={(e) => handleResumeProgramme(program.id, e)}
                      className="gap-1"
                    >
                      <Target className="w-4 h-4" />
                      Track
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleDeactivate(program.id, e)}
                      disabled={deactivateProgram.isPending}
                      className="gap-1"
                    >
                      {deactivateProgram.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Pause className="w-4 h-4" />
                      )}
                      Pause
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={(e) => handleStartProgramme(program.id, e)}
                    disabled={startProgrammeExecution.isPending || !canActivateMore}
                    className="gap-1"
                    title={!canActivateMore ? `Maximum ${maxActivePrograms} active programmes` : undefined}
                  >
                    {startProgrammeExecution.isPending ? (
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
