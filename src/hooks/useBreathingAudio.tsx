import { useCallback, useRef } from "react";

export type VoiceType = "male" | "female";

interface UseBreathingAudioOptions {
  voiceType: VoiceType;
  enabled: boolean;
}

const MAX_CONCURRENT_REQUESTS = 2;
const RETRY_DELAY_MS = 1000;
const MAX_RETRIES = 3;

// Helper to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useBreathingAudio({ voiceType, enabled }: UseBreathingAudioOptions) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCache = useRef<Map<string, string>>(new Map());
  const pendingRequests = useRef<Set<string>>(new Set());

  const generateAudioWithRetry = useCallback(async (
    text: string, 
    retryCount = 0
  ): Promise<string | null> => {
    if (!enabled) return null;

    const cacheKey = `${voiceType}-${text}`;
    
    // Check cache first
    if (audioCache.current.has(cacheKey)) {
      return audioCache.current.get(cacheKey)!;
    }

    // Skip if already being fetched
    if (pendingRequests.current.has(cacheKey)) {
      return null;
    }

    pendingRequests.current.add(cacheKey);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/breathing-tts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text, voiceType }),
        }
      );

      // Handle rate limiting with retry
      if (response.status === 429 && retryCount < MAX_RETRIES) {
        pendingRequests.current.delete(cacheKey);
        await delay(RETRY_DELAY_MS * (retryCount + 1));
        return generateAudioWithRetry(text, retryCount + 1);
      }

      if (!response.ok) {
        console.error("TTS request failed:", response.status);
        pendingRequests.current.delete(cacheKey);
        return null;
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Cache the audio URL
      audioCache.current.set(cacheKey, audioUrl);
      pendingRequests.current.delete(cacheKey);
      
      return audioUrl;
    } catch (error) {
      console.error("Error generating audio:", error);
      pendingRequests.current.delete(cacheKey);
      return null;
    }
  }, [voiceType, enabled]);

  const playAudio = useCallback(async (text: string) => {
    if (!enabled) return;

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const audioUrl = await generateAudioWithRetry(text);
    if (!audioUrl) return;

    try {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.volume = 0.8;
      await audioRef.current.play();
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  }, [enabled, generateAudioWithRetry]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  // Sequential preloading with limited concurrency to avoid rate limits
  const preloadAudio = useCallback(async (texts: string[]) => {
    if (!enabled) return;
    
    // Filter out already cached texts
    const uncachedTexts = texts.filter(text => {
      const cacheKey = `${voiceType}-${text}`;
      return !audioCache.current.has(cacheKey);
    });

    // Process in batches to respect rate limits
    for (let i = 0; i < uncachedTexts.length; i += MAX_CONCURRENT_REQUESTS) {
      const batch = uncachedTexts.slice(i, i + MAX_CONCURRENT_REQUESTS);
      await Promise.all(batch.map(text => generateAudioWithRetry(text)));
      
      // Small delay between batches to avoid hitting rate limits
      if (i + MAX_CONCURRENT_REQUESTS < uncachedTexts.length) {
        await delay(500);
      }
    }
  }, [enabled, voiceType, generateAudioWithRetry]);

  // Cleanup function
  const cleanup = useCallback(() => {
    stopAudio();
    // Revoke all cached blob URLs
    audioCache.current.forEach((url) => {
      URL.revokeObjectURL(url);
    });
    audioCache.current.clear();
    pendingRequests.current.clear();
  }, [stopAudio]);

  return {
    playAudio,
    stopAudio,
    preloadAudio,
    cleanup,
  };
}
