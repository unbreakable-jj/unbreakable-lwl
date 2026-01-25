import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTrainingPrograms } from '@/hooks/useTrainingPrograms';
import { useWorkoutSessions } from '@/hooks/useWorkoutSessions';
import { Timer, Dumbbell, AlertCircle, Footprints } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface RecordActionMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRunModal: () => void;
}

export function RecordActionMenu({ isOpen, onClose, onOpenRunModal }: RecordActionMenuProps) {
  const navigate = useNavigate();
  const { activeProgram } = useTrainingPrograms();
  const { activeSession } = useWorkoutSessions();
  const [showNoProgramWarning, setShowNoProgramWarning] = useState(false);

  const handleCardioTracker = () => {
    onClose();
    onOpenRunModal();
  };

  const handleProgrammeTracking = () => {
    if (activeSession) {
      // Resume active session - navigate to programming page
      toast.info('Resuming your active workout session');
      onClose();
      navigate('/programming');
      return;
    }

    if (!activeProgram) {
      setShowNoProgramWarning(true);
      return;
    }

    // Has program, navigate to it
    onClose();
    navigate('/programming');
  };

  const handleGoToProgramming = () => {
    setShowNoProgramWarning(false);
    onClose();
    navigate('/programming');
  };

  if (showNoProgramWarning) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-foreground tracking-wide text-center">
              NO PROGRAMME SELECTED
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-primary" />
              </div>
            </div>
            <p className="text-center text-muted-foreground">
              You don't have an active training programme. Create or select one to start tracking workouts.
            </p>
            <div className="flex flex-col gap-2">
              <Button 
                className="w-full font-display tracking-wide"
                onClick={handleGoToProgramming}
              >
                <Dumbbell className="w-4 h-4 mr-2" />
                GO TO PROGRAMMING
              </Button>
              <Button 
                variant="outline"
                className="w-full font-display tracking-wide"
                onClick={() => setShowNoProgramWarning(false)}
              >
                BACK
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-foreground tracking-wide text-center">
            TRACK ACTIVITY
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card 
              className="cursor-pointer transition-all border-2 border-primary/30 hover:border-primary hover:bg-primary/10 neon-border-subtle"
              onClick={handleCardioTracker}
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 neon-border-subtle">
                  <Footprints className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display text-xl text-foreground tracking-wide mb-1">CARDIO TRACKER</h3>
                <p className="text-sm text-muted-foreground">Walk, Run, or Cycle with GPS</p>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card 
              className="cursor-pointer transition-all border-2 border-primary/30 hover:border-primary hover:bg-primary/10 neon-border-subtle"
              onClick={handleProgrammeTracking}
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 neon-border-subtle">
                  <Dumbbell className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display text-xl text-foreground tracking-wide mb-1">PROGRAMME TRACKING</h3>
                <p className="text-sm text-muted-foreground">
                  {activeSession 
                    ? 'Resume active session' 
                    : activeProgram 
                      ? `From: ${activeProgram.name}`
                      : 'Start from your programme'
                  }
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}