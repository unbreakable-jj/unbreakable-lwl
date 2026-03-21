import { useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Uses ElevenLabs TTS (via breathing-tts edge function) to play voice
 * updates during cardio sessions. Unlike Web Speech API, Audio element
 * playback continues when the screen is off or the tab is backgrounded.
 */
export function useCardioVoice({ enabled }: { enabled: boolean }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cacheRef = useRef<Map<string, string>>(new Map());
  const pendingRef = useRef<Set<string>>(new Set());

  const speak = useCallback(async (text: string) => {
    if (!enabled) return;

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const cacheKey = text;

    // Check cache first
    if (cacheRef.current.has(cacheKey)) {
      try {
        audioRef.current = new Audio(cacheRef.current.get(cacheKey)!);
        audioRef.current.volume = 1;
        await audioRef.current.play();
      } catch (e) {
        console.error("Cardio voice playback error:", e);
      }
      return;
    }

    // Skip if already fetching this text
    if (pendingRef.current.has(cacheKey)) return;
    pendingRef.current.add(cacheKey);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      if (!accessToken) {
        pendingRef.current.delete(cacheKey);
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/breathing-tts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ text }),
        }
      );

      pendingRef.current.delete(cacheKey);

      if (!response.ok) {
        console.error("Cardio TTS failed:", response.status);
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      cacheRef.current.set(cacheKey, url);

      audioRef.current = new Audio(url);
      audioRef.current.volume = 1;
      await audioRef.current.play();
    } catch (error) {
      pendingRef.current.delete(cacheKey);
      console.error("Cardio voice error:", error);
    }
  }, [enabled]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  const cleanup = useCallback(() => {
    stop();
    cacheRef.current.forEach(url => URL.revokeObjectURL(url));
    cacheRef.current.clear();
    pendingRef.current.clear();
  }, [stop]);

  return { speak, stop, cleanup };
}
