import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Video, Radio, Loader2, Globe, Users, Lock } from 'lucide-react';
import { useLiveStreams } from '@/hooks/useLiveStreams';
import { toast } from 'sonner';

interface GoLiveButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function GoLiveButton({ variant = 'outline', size = 'sm', className }: GoLiveButtonProps) {
  const { myStream, startStream, goLive, endStream } = useLiveStreams();
  const [showDialog, setShowDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('friends');

  const handleStartStream = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title for your stream');
      return;
    }

    setIsLoading(true);
    const { error, stream } = await startStream(title, visibility, description);
    setIsLoading(false);

    if (error) {
      toast.error(error.message || 'Failed to start stream');
      return;
    }

    toast.success('Stream created! Going live...');
    setShowDialog(false);
    
    // Simulate going live after setup
    setTimeout(async () => {
      await goLive();
      toast.success('You are now LIVE! 🔴');
    }, 2000);
  };

  const handleEndStream = async () => {
    setIsLoading(true);
    const { error } = await endStream();
    setIsLoading(false);

    if (error) {
      toast.error('Failed to end stream');
      return;
    }

    toast.success('Stream ended');
  };

  if (myStream) {
    return (
      <Button
        variant="destructive"
        size={size}
        onClick={handleEndStream}
        disabled={isLoading}
        className={className}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <Radio className="w-4 h-4 mr-2 animate-pulse" />
            End Stream
          </>
        )}
      </Button>
    );
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setShowDialog(true)}
        className={className}
      >
        <Video className="w-4 h-4 mr-2" />
        Go Live
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              <Video className="w-5 h-5 text-primary" />
              GO LIVE
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Stream Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's happening?"
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell viewers what to expect..."
                rows={3}
                maxLength={500}
              />
            </div>

            <div className="space-y-2">
              <Label>Who can watch?</Label>
              <Select
                value={visibility}
                onValueChange={(v: 'public' | 'friends' | 'private') => setVisibility(v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Everyone
                    </div>
                  </SelectItem>
                  <SelectItem value="friends">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Friends Only
                    </div>
                  </SelectItem>
                  <SelectItem value="private">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Private
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Before going live:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Make sure you have good lighting</li>
                <li>Check your audio is working</li>
                <li>Find a stable surface for your device</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStartStream}
              disabled={isLoading || !title.trim()}
              className="gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Radio className="w-4 h-4" />
              )}
              Start Stream
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
