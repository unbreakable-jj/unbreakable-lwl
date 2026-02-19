import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Dumbbell, Footprints, ClipboardCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface RecordActionMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRunModal: () => void;
}

export function RecordActionMenu({ isOpen, onClose, onOpenRunModal }: RecordActionMenuProps) {
  const navigate = useNavigate();

  const handleCardioTracker = () => {
    onClose();
    onOpenRunModal();
  };

  const handleProgrammeTracking = () => {
    onClose();
    navigate('/programming/my-programmes');
  };

  const handleHabitTracker = () => {
    onClose();
    navigate('/habits');
  };

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
                <p className="text-sm text-muted-foreground">Start from your library</p>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card 
              className="cursor-pointer transition-all border-2 border-primary/30 hover:border-primary hover:bg-primary/10 neon-border-subtle"
              onClick={handleHabitTracker}
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 neon-border-subtle">
                  <ClipboardCheck className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display text-xl text-foreground tracking-wide mb-1">HABIT TRACKER</h3>
                <p className="text-sm text-muted-foreground">Track your Daily 6</p>
              </div>
            </Card>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}