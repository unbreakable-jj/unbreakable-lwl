import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.png";

type CountdownPhase = "welcome" | "power" | "speed" | "mindset" | "countdown" | "pause" | "go";

interface CountdownOverlayProps {
  isActive: boolean;
  onComplete: () => void;
  startFrom?: number;
  welcomeMessage?: string;
  exerciseName?: string;
  onPlayAudio?: (text: string) => void;
}

export function CountdownOverlay({ 
  isActive, 
  onComplete, 
  startFrom = 3,
  exerciseName,
  onPlayAudio,
}: CountdownOverlayProps) {
  const [phase, setPhase] = useState<CountdownPhase>("welcome");
  const [count, setCount] = useState(startFrom);

  // Reset state when becoming active
  useEffect(() => {
    if (isActive) {
      setPhase("welcome");
      setCount(startFrom);
    }
  }, [isActive, startFrom]);

  // Welcome phase - brief logo display
  useEffect(() => {
    if (!isActive || phase !== "welcome") return;

    const timer = setTimeout(() => {
      setPhase("power");
      if (onPlayAudio) {
        onPlayAudio("Power");
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [isActive, phase, onPlayAudio]);

  // POWER phase
  useEffect(() => {
    if (!isActive || phase !== "power") return;

    const timer = setTimeout(() => {
      setPhase("speed");
      if (onPlayAudio) {
        onPlayAudio("Speed");
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [isActive, phase, onPlayAudio]);

  // SPEED phase
  useEffect(() => {
    if (!isActive || phase !== "speed") return;

    const timer = setTimeout(() => {
      setPhase("mindset");
      if (onPlayAudio) {
        onPlayAudio("Mindset");
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [isActive, phase, onPlayAudio]);

  // MINDSET phase
  useEffect(() => {
    if (!isActive || phase !== "mindset") return;

    const timer = setTimeout(() => {
      setPhase("countdown");
      setCount(3);
      if (onPlayAudio) {
        onPlayAudio("3");
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [isActive, phase, onPlayAudio]);

  // Countdown phase - 3, 2, 1
  useEffect(() => {
    if (!isActive || phase !== "countdown") return;

    if (count === 0) {
      setPhase("pause");
      return;
    }

    const timer = setTimeout(() => {
      const nextCount = count - 1;
      setCount(nextCount);
      if (onPlayAudio && nextCount > 0) {
        onPlayAudio(String(nextCount));
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [isActive, count, phase, onPlayAudio]);

  // Pause phase - 2 second pause before GO
  useEffect(() => {
    if (!isActive || phase !== "pause") return;

    const timer = setTimeout(() => {
      setPhase("go");
    }, 2000);

    return () => clearTimeout(timer);
  }, [isActive, phase]);

  // Go phase - brief display then complete
  useEffect(() => {
    if (!isActive || phase !== "go") return;

    const timer = setTimeout(() => {
      onComplete();
    }, 600);

    return () => clearTimeout(timer);
  }, [isActive, phase, onComplete]);

  if (!isActive) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center overflow-hidden"
      >
        {/* Subtle background glow */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(circle at center, hsl(var(--primary) / 0.15), transparent 70%)"
          }}
        />

        {/* Welcome Phase - Logo + Exercise Name */}
        {phase === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 flex flex-col items-center text-center px-6"
          >
            <motion.img 
              src={logo} 
              alt="Unbreakable" 
              className="h-28 md:h-36 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            />
            {exerciseName && (
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="font-display text-4xl md:text-5xl text-primary tracking-wide neon-glow-subtle"
              >
                {exerciseName}
              </motion.h1>
            )}
          </motion.div>
        )}

        {/* POWER Phase */}
        {phase === "power" && (
          <PowerWord word="POWER" />
        )}

        {/* SPEED Phase */}
        {phase === "speed" && (
          <PowerWord word="SPEED" />
        )}

        {/* MINDSET Phase */}
        {phase === "mindset" && (
          <PowerWord word="MINDSET" />
        )}

        {/* Countdown Phase - 3, 2, 1 */}
        {phase === "countdown" && count > 0 && (
          <motion.div
            key={`count-${count}`}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 20,
              duration: 0.4 
            }}
            className="relative z-10 flex flex-col items-center"
          >
            {/* Outer ring pulse */}
            <motion.div
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeOut",
              }}
              className="absolute w-48 h-48 rounded-full border-4 border-primary"
              style={{ 
                left: "50%", 
                top: "50%", 
                transform: "translate(-50%, -50%)" 
              }}
            />

            <span 
              className="font-display text-[12rem] md:text-[16rem] leading-none text-primary"
              style={{
                textShadow: "0 0 60px hsl(var(--primary) / 0.6)",
              }}
            >
              {count}
            </span>
          </motion.div>
        )}

        {/* Pause Phase - visual breath before GO */}
        {phase === "pause" && (
          <motion.div
            key="pause"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex flex-col items-center"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{
                duration: 2,
                ease: "easeInOut",
              }}
              className="w-32 h-32 rounded-full bg-primary/20 border-2 border-primary"
              style={{
                boxShadow: "0 0 40px hsl(var(--primary) / 0.4)",
              }}
            />
          </motion.div>
        )}

        {/* Go Phase */}
        {phase === "go" && (
          <motion.div
            key="go"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 flex flex-col items-center"
          >
            <span 
              className="font-display text-[10rem] md:text-[14rem] leading-none text-primary"
              style={{
                textShadow: "0 0 80px hsl(var(--primary) / 0.8)",
              }}
            >
              GO
            </span>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// Reusable PowerWord component for POWER/SPEED/MINDSET
function PowerWord({ word }: { word: string }) {
  return (
    <motion.div
      key={`word-${word}`}
      initial={{ scale: 0.3, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 1.3, opacity: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 200, 
        damping: 15,
        duration: 0.5 
      }}
      className="relative z-10 flex flex-col items-center"
    >
      {/* Outer ring pulse */}
      <motion.div
        animate={{
          scale: [1, 1.6, 1],
          opacity: [0.5, 0, 0.5],
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: "easeOut",
        }}
        className="absolute w-56 h-56 rounded-full border-4 border-primary"
        style={{ 
          left: "50%", 
          top: "50%", 
          transform: "translate(-50%, -50%)" 
        }}
      />

      <span 
        className="font-display text-[6rem] md:text-[10rem] leading-none text-primary"
        style={{
          textShadow: "0 0 60px hsl(var(--primary) / 0.7)",
        }}
      >
        {word}
      </span>
    </motion.div>
  );
}
