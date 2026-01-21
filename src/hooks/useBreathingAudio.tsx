import { useCallback, useRef } from "react";

export type VoiceType = "male" | "female";

interface UseBreathingAudioOptions {
  voiceType: VoiceType;
  enabled: boolean;
}

export function useBreathingAudio({ voiceType, enabled }: UseBreathingAudioOptions) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCache = useRef<Map<string, string>>(new Map());

  const generateAudio = useCallback(async (text: string): Promise<string | null> => {
    if (!enabled) return null;

    const cacheKey = `${voiceType}-${text}`;
    
    // Check cache first
    if (audioCache.current.has(cacheKey)) {
      return audioCache.current.get(cacheKey)!;
    }

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

      if (!response.ok) {
        console.error("TTS request failed:", response.status);
        return null;
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Cache the audio URL
      audioCache.current.set(cacheKey, audioUrl);
      
      return audioUrl;
    } catch (error) {
      console.error("Error generating audio:", error);
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

    const audioUrl = await generateAudio(text);
    if (!audioUrl) return;

    try {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.volume = 0.8;
      await audioRef.current.play();
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  }, [enabled, generateAudio]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  const preloadAudio = useCallback(async (texts: string[]) => {
    if (!enabled) return;
    
    // Preload audio in parallel
    await Promise.all(texts.map(text => generateAudio(text)));
  }, [enabled, generateAudio]);

  // Cleanup function
  const cleanup = useCallback(() => {
    stopAudio();
    // Revoke all cached blob URLs
    audioCache.current.forEach((url) => {
      URL.revokeObjectURL(url);
    });
    audioCache.current.clear();
  }, [stopAudio]);

  return {
    playAudio,
    stopAudio,
    preloadAudio,
    cleanup,
  };
}
