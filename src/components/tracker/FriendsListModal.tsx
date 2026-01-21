import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserMinus, Activity } from 'lucide-react';
import { useFriends } from '@/hooks/useFriends';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { toast } from 'sonner';

interface FriendsListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FriendsListModal({ isOpen, onClose }: FriendsListModalProps) {
  const { friends, removeFriend } = useFriends();
  const [friendToRemove, setFriendToRemove] = useState<{ id: string; name: string } | null>(null);
  const [removing, setRemoving] = useState(false);

  const handleRemove = async () => {
    if (!friendToRemove) return;

    setRemoving(true);
    const { error } = await removeFriend(friendToRemove.id);
    setRemoving(false);
    setFriendToRemove(null);

    if (error) {
      toast.error('Failed to remove friend');
    } else {
      toast.success('Friend removed');
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-xl tracking-wide">
              My Friends ({friends.length})
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {friends.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No friends yet. Start by searching for runners!
              </div>
            )}

            {friends.map((friend) => (
              <div 
                key={friend.friendship_id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={friend.avatar_url || undefined} alt="Profile" />
                    <AvatarFallback className="bg-primary text-primary-foreground font-display">
                      {getInitials(friend.display_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-display text-foreground">
                      {friend.display_name || 'Runner'}
                    </p>
                    {friend.username && (
                      <p className="text-xs text-muted-foreground">@{friend.username}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground"
                    title="View Activity"
                  >
                    <Activity className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setFriendToRemove({ 
                      id: friend.friendship_id, 
                      name: friend.display_name || 'this friend' 
                    })}
                    title="Remove Friend"
                  >
                    <UserMinus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal
        isOpen={!!friendToRemove}
        onClose={() => setFriendToRemove(null)}
        onConfirm={handleRemove}
        title="Remove Friend"
        description={`Are you sure you want to remove ${friendToRemove?.name}? They will no longer see your friends-only posts.`}
        confirmText="Remove"
        loading={removing}
      />
    </>
  );
}
