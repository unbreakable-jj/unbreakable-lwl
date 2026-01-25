import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Story {
  id: string;
  user_id: string;
  content: string | null;
  image_url: string | null;
  visibility: string;
  expires_at: string;
  created_at: string;
  profiles?: {
    display_name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
}

export function useStories() {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStories = useCallback(async () => {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching stories:', error);
      setLoading(false);
      return;
    }

    // Fetch profiles for story owners
    const userIds = [...new Set((data || []).map(s => s.user_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, display_name, username, avatar_url')
      .in('user_id', userIds);

    const profileMap = (profiles || []).reduce((acc, p) => {
      acc[p.user_id] = p;
      return acc;
    }, {} as Record<string, any>);

    const storiesWithProfiles = (data || []).map(s => ({
      ...s,
      profiles: profileMap[s.user_id] || null,
    }));

    setStories(storiesWithProfiles);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const createStory = async (story: {
    content?: string | null;
    image_url?: string | null;
    visibility?: string;
  }) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error, data } = await supabase
      .from('stories')
      .insert({
        user_id: user.id,
        content: story.content || null,
        image_url: story.image_url || null,
        visibility: story.visibility || 'public',
      })
      .select()
      .single();

    if (!error) {
      await fetchStories();
    }

    return { error, data };
  };

  const deleteStory = async (storyId: string) => {
    const { error } = await supabase
      .from('stories')
      .delete()
      .eq('id', storyId);

    if (!error) {
      setStories((prev) => prev.filter((s) => s.id !== storyId));
    }

    return { error };
  };

  // Group stories by user
  const groupedStories = stories.reduce((acc, story) => {
    if (!acc[story.user_id]) {
      acc[story.user_id] = {
        userId: story.user_id,
        profile: story.profiles,
        stories: [],
      };
    }
    acc[story.user_id].stories.push(story);
    return acc;
  }, {} as Record<string, { userId: string; profile: Story['profiles']; stories: Story[] }>);

  return {
    stories,
    groupedStories: Object.values(groupedStories),
    loading,
    refetch: fetchStories,
    createStory,
    deleteStory,
  };
}