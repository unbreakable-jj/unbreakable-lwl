import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Trash2, MessageSquareOff, MessageSquare, Pencil, BookImage } from 'lucide-react';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface PostMenuProps {
  isOwner: boolean;
  commentsEnabled: boolean;
  hasMedia: boolean;
  onDelete: () => void;
  onToggleComments: () => void;
  onEdit: () => void;
  onShareToStory: () => void;
  itemType?: 'post' | 'run' | 'workout';
}

export function PostMenu({
  isOwner,
  commentsEnabled,
  hasMedia,
  onDelete,
  onToggleComments,
  onEdit,
  onShareToStory,
  itemType = 'post',
}: PostMenuProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!isOwner) return null;

  const getEditLabel = () => {
    switch (itemType) {
      case 'run':
        return 'Edit Run';
      case 'workout':
        return 'Edit Workout';
      default:
        return 'Edit Post';
    }
  };

  const getDeleteLabel = () => {
    switch (itemType) {
      case 'run':
        return 'Delete Run';
      case 'workout':
        return 'Delete Workout';
      default:
        return 'Delete Post';
    }
  };

  const getDeleteDescription = () => {
    switch (itemType) {
      case 'run':
        return 'Are you sure you want to delete this run? All kudos and comments will also be removed. This action cannot be undone.';
      case 'workout':
        return 'Are you sure you want to delete this workout? All kudos and comments will also be removed. This action cannot be undone.';
      default:
        return 'Are you sure you want to delete this post? All likes and comments will also be removed. This action cannot be undone.';
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-popover border-border z-50">
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="w-4 h-4 mr-2" />
            {getEditLabel()}
          </DropdownMenuItem>
          {hasMedia && (
            <DropdownMenuItem onClick={onShareToStory}>
              <BookImage className="w-4 h-4 mr-2" />
              Share to Story
            </DropdownMenuItem>
          )}
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
            {getDeleteLabel()}
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
        title={getDeleteLabel()}
        description={getDeleteDescription()}
      />
    </>
  );
}
