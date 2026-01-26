import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'user_hashtags';
const MAX_STORED_HASHTAGS = 50;

export function useHashtagPrediction() {
  const [storedHashtags, setStoredHashtags] = useState<string[]>([]);

  // Load hashtags from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setStoredHashtags(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load hashtags:', e);
    }
  }, []);

  // Save a new hashtag
  const saveHashtag = useCallback((hashtag: string) => {
    const normalized = hashtag.toLowerCase().replace(/^#/, '');
    if (!normalized || normalized.length < 2) return;

    setStoredHashtags((prev) => {
      // Remove if exists, add to front
      const filtered = prev.filter((h) => h !== normalized);
      const updated = [normalized, ...filtered].slice(0, MAX_STORED_HASHTAGS);
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save hashtags:', e);
      }
      
      return updated;
    });
  }, []);

  // Extract and save hashtags from text
  const extractAndSaveHashtags = useCallback((text: string) => {
    const hashtagRegex = /#(\w+)/g;
    let match;
    while ((match = hashtagRegex.exec(text)) !== null) {
      saveHashtag(match[1]);
    }
  }, [saveHashtag]);

  // Get predictions based on partial input
  const getPredictions = useCallback((partial: string): string[] => {
    if (!partial) return storedHashtags.slice(0, 5);
    
    const normalized = partial.toLowerCase().replace(/^#/, '');
    if (!normalized) return storedHashtags.slice(0, 5);

    return storedHashtags
      .filter((h) => h.startsWith(normalized))
      .slice(0, 5);
  }, [storedHashtags]);

  return {
    storedHashtags,
    saveHashtag,
    extractAndSaveHashtags,
    getPredictions,
  };
}
