import { supabase } from '@/integrations/supabase/client';

/**
 * Parse @mentions from text content, look up user IDs, and create notifications.
 */
export async function notifyMentionedUsers(
  content: string | null | undefined,
  authorId: string,
  contentType: 'post' | 'story' | 'comment',
  contentId: string
) {
  if (!content) return;

  // Extract all @mentions (usernames)
  const mentionMatches = content.match(/@(\w+)/g);
  if (!mentionMatches || mentionMatches.length === 0) return;

  const usernames = [...new Set(mentionMatches.map(m => m.slice(1).toLowerCase()))];

  // Look up profiles by username
  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, username, display_name')
    .in('username', usernames);

  if (!profiles || profiles.length === 0) return;

  // Get author display name
  const { data: authorProfile } = await supabase
    .from('profiles')
    .select('display_name, username')
    .eq('user_id', authorId)
    .maybeSingle();

  const authorName = authorProfile?.display_name || authorProfile?.username || 'Someone';

  const typeLabels: Record<string, string> = {
    post: 'a post',
    story: 'a story',
    comment: 'a comment',
  };

  // Create notifications for each mentioned user (skip self-mentions)
  const notifications = profiles
    .filter(p => p.user_id !== authorId)
    .map(p => ({
      user_id: p.user_id,
      type: 'mention',
      title: 'You were tagged!',
      body: `${authorName} mentioned you in ${typeLabels[contentType]}`,
      data: {
        content_type: contentType,
        content_id: contentId,
        author_id: authorId,
      } as any,
    }));

  if (notifications.length > 0) {
    await supabase.from('notifications').insert(notifications);
  }
}
