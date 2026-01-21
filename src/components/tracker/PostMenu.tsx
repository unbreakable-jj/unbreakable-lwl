import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Trash2, MessageSquareOff, MessageSquare } from 'lucide-react';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface PostMenuProps {
  isOwner: boolean;
  commentsEnabled: boolean;
  onDelete: () => void;
  onToggleComments: () => void;
}

export function PostMenu({
  isOwner,
  commentsEnabled,
  onDelete,
  onToggleComments,
}: PostMenuProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!isOwner) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onToggleComments}>
            {commentsEnabled ? (
              <>
                <MessageSquareOff className="w-4 h-4 mr-2" />
                Disable Comments
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4 mr-2" />
                Enable Comments
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowDeleteModal(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Post
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          onDelete();
          setShowDeleteModal(false);
        }}
        title="Delete Post"
        description="Are you sure you want to delete this post? All likes and comments will also be removed. This action cannot be undone."
      />
    </>
  );
}
