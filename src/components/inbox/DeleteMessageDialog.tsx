import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface DeleteMessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDeleteForMe: () => void;
  onDeleteForEveryone: () => void;
  isOwnMessage: boolean;
  loading?: boolean;
}

export function DeleteMessageDialog({
  isOpen,
  onClose,
  onDeleteForMe,
  onDeleteForEveryone,
  isOwnMessage,
  loading = false,
}: DeleteMessageDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-destructive" />
            Delete Message
          </AlertDialogTitle>
          <AlertDialogDescription>
            How would you like to delete this message?
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="flex flex-col gap-3 py-4">
          <Button
            variant="outline"
            onClick={onDeleteForMe}
            disabled={loading}
            className="justify-start"
          >
            Delete for me
            <span className="text-xs text-muted-foreground ml-auto">
              Only removes from your view
            </span>
          </Button>
          
          {isOwnMessage && (
            <Button
              variant="destructive"
              onClick={onDeleteForEveryone}
              disabled={loading}
              className="justify-start"
            >
              Delete for everyone
              <span className="text-xs text-destructive-foreground/70 ml-auto">
                Removes for all participants
              </span>
            </Button>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} disabled={loading}>
            Cancel
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
