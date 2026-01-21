import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, MessageCircle, Globe, Users, Lock } from 'lucide-react';
import { PostWithProfile } from '@/hooks/usePosts';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { PostMenu } from './PostMenu';
import { PostCommentSection } from './PostCommentSection';

interface StatusCardProps {
  post: PostWithProfile;
  onKudos: (postId: string) => void;
  onDelete: (postId: string) => void;
  onToggleComments: (postId: string) => void;
}

export function StatusCard({ post, onKudos, onDelete, onToggleComments }: StatusCardProps) {
  const { user } = useAuth();
  const [isLiking, setIsLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const isOwner = user?.id === post.user_id;

  const handleKudos = async () => {
    if (!user) return;
    setIsLiking(true);
    await onKudos(post.id);
    setIsLiking(false);
  };

  const getInitials = () => {
    if (post.profiles?.display_name) {
      return post.profiles.display_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return 'R';
  };

  const getVisibilityIcon = () => {
    switch (post.visibility) {
      case 'friends':
        return <Users className="w-3 h-3" />;
      case 'private':
        return <Lock className="w-3 h-3" />;
      default:
        return <Globe className="w-3 h-3" />;
    }
  };

  const getVisibilityLabel = () => {
    switch (post.visibility) {
      case 'friends':
        return 'Friends';
      case 'private':
        return 'Private';
      default:
        return 'Public';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-card border-border overflow-hidden">
        {/* Header */}
        <div className="p-4 flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={post.profiles?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground font-display">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate">
              {post.profiles?.display_name || 'User'}
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                {getVisibilityIcon()}
                {getVisibilityLabel()}
              </span>
            </div>
          </div>
          <PostMenu
            isOwner={isOwner}
            commentsEnabled={post.comments_enabled}
            onDelete={() => onDelete(post.id)}
            onToggleComments={() => onToggleComments(post.id)}
          />
        </div>

        {/* Content */}
        {post.content && (
          <div className="px-4 pb-3">
            <p className="text-foreground whitespace-pre-wrap">{post.content}</p>
          </div>
        )}

        {/* Image */}
        {post.image_url && (
          <div className="px-4 pb-3">
            <img
              src={post.image_url}
              alt="Post"
              className="rounded-lg w-full max-h-[500px] object-cover"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 px-4 py-3 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            className={`flex-1 ${post.has_kudos ? 'text-primary' : 'text-muted-foreground'}`}
            onClick={handleKudos}
            disabled={!user || isLiking}
          >
            <motion.div
              animate={isLiking ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Heart className={`w-5 h-5 mr-2 ${post.has_kudos ? 'fill-primary' : ''}`} />
            </motion.div>
            <span className="font-display tracking-wide">
              {post.kudos_count || 0} Like{post.kudos_count !== 1 ? 's' : ''}
            </span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`flex-1 ${showComments ? 'text-primary' : 'text-muted-foreground'}`}
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className={`w-5 h-5 mr-2 ${showComments ? 'fill-primary/20' : ''}`} />
            <span className="font-display tracking-wide">
              {post.comments_count || 0} Comment{post.comments_count !== 1 ? 's' : ''}
            </span>
          </Button>
        </div>

        {/* Comments Section */}
        <PostCommentSection
          postId={post.id}
          commentsEnabled={post.comments_enabled}
          isExpanded={showComments}
          onToggle={() => setShowComments(!showComments)}
        />
      </Card>
    </motion.div>
  );
}
