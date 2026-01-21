import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Post {
  id: string;
  user_id: string;
  content: string | null;
  image_url: string | null;
  visibility: 'public' | 'friends' | 'private';
  comments_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface PostWithProfile extends Post {
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
    username: string | null;
  };
  kudos_count?: number;
  comments_count?: number;
  has_kudos?: boolean;
}

export function usePosts() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
    } else if (data) {
      // Get kudos counts, profiles, and user kudos status
      const postsWithCounts = await Promise.all(
        data.map(async (post) => {
          const [kudosResult, commentsResult, hasKudosResult, profileResult] = await Promise.all([
            supabase.from('post_kudos').select('id', { count: 'exact', head: true }).eq('post_id', post.id),
            supabase.from('post_comments').select('id', { count: 'exact', head: true }).eq('post_id', post.id),
            user
              ? supabase.from('post_kudos').select('id').eq('post_id', post.id).eq('user_id', user.id).maybeSingle()
              : Promise.resolve({ data: null }),
            supabase.from('profiles').select('display_name, avatar_url, username').eq('user_id', post.user_id).maybeSingle(),
          ]);

          return {
            ...post,
            visibility: (post.visibility || 'public') as 'public' | 'friends' | 'private',
            profiles: profileResult.data || undefined,
            kudos_count: kudosResult.count || 0,
            comments_count: commentsResult.count || 0,
            has_kudos: !!hasKudosResult.data,
          };
        })
      );

      setPosts(postsWithCounts);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const createPost = async (postData: { content?: string; image_url?: string; visibility: string }) => {
    if (!user) return { error: new Error('Not authenticated'), data: null };

    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        content: postData.content || null,
        image_url: postData.image_url || null,
        visibility: postData.visibility,
      })
      .select()
      .single();

    if (!error) {
      await fetchPosts();
    }

    return { error, data };
  };

  const deletePost = async (postId: string) => {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (!error) {
      await fetchPosts();
    }

    return { error };
  };

  const toggleKudos = async (postId: string) => {
    if (!user) return;

    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    if (post.has_kudos) {
      await supabase.from('post_kudos').delete().eq('post_id', postId).eq('user_id', user.id);
    } else {
      await supabase.from('post_kudos').insert({ post_id: postId, user_id: user.id });
    }

    await fetchPosts();
  };

  const toggleCommentsEnabled = async (postId: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    const post = posts.find((p) => p.id === postId);
    if (!post) return { error: new Error('Post not found') };

    if (post.user_id !== user.id) return { error: new Error('Not authorized') };

    const { error } = await supabase
      .from('posts')
      .update({ comments_enabled: !post.comments_enabled })
      .eq('id', postId);

    if (!error) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, comments_enabled: !p.comments_enabled } : p
        )
      );
    }

    return { error };
  };

  const uploadImage = async (file: File): Promise<{ url: string | null; error: Error | null }> => {
    if (!user) return { url: null, error: new Error('Not authenticated') };

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('post-images')
      .upload(fileName, file);

    if (uploadError) {
      return { url: null, error: uploadError };
    }

    const { data } = supabase.storage.from('post-images').getPublicUrl(fileName);
    return { url: data.publicUrl, error: null };
  };

  return {
    posts,
    loading,
    refetch: fetchPosts,
    createPost,
    deletePost,
    toggleKudos,
    toggleCommentsEnabled,
    uploadImage,
  };
}
