import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface SearchResult {
  user_id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
}

export function useUserSearch() {
  const { user } = useAuth();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const searchUsers = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const searchTerm = `%${query}%`;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, display_name, username, avatar_url')
        .or(`display_name.ilike.${searchTerm},username.ilike.${searchTerm}`)
        .neq('user_id', user?.id || '')
        .limit(10);

      if (error) throw error;

      setResults(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const clearResults = useCallback(() => {
    setResults([]);
  }, []);

  return {
    results,
    loading,
    searchUsers,
    clearResults,
  };
}
