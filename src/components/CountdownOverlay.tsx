import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.png";

type CountdownPhase = "welcome" | "power" | "speed" | "mindset" | "countdown" | "go";

interface CountdownOverlayProps {
  isActive: boolean;
  onComplete: () => void;
  startFrom?: number;
  welcomeMessage?: string;
  exerciseName?: string;
  onPlayAudio?: (text: string) => void;
}

const POWER_WORDS = [
  { word: "POWER", delay: 0 },
  { word: "SPEED", delay: 1200 },
  { word: "MINDSET", delay: 2400 },
];

export function CountdownOverlay({ 
  isActive, 
  onComplete, 
  startFrom = 3,
  welcomeMessage,
  exerciseName,
  onPlayAudio,
}: CountdownOverlayProps) {
  const [phase, setPhase] = useState<CountdownPhase>("welcome");
  const [count, setCount] = useState(startFrom);
  const [welcomeComplete, setWelcomeComplete] = useState(false);
  const [powerWordIndex, setPowerWordIndex] = useState(0);

  // Reset state when becoming active
  useEffect(() => {
    if (isActive) {
      setPhase("welcome");
      setCount(startFrom);
      setWelcomeComplete(false);
      setPowerWordIndex(0);
      
      // Play welcome audio
      if (onPlayAudio && welcomeMessage) {
        onPlayAudio(welcomeMessage);
      }
    }
  }, [isActive, startFrom, welcomeMessage, onPlayAudio]);

  // Welcome phase timer - shorter for cardio
  useEffect(() => {
    if (!isActive || phase !== "welcome") return;

    const welcomeTimer = setTimeout(() => {
      setWelcomeComplete(true);
    }, 2500);

    return () => clearTimeout(welcomeTimer);
  }, [isActive, phase]);

  // Transition from welcome to power words
  useEffect(() => {
    if (!welcomeComplete || phase !== "welcome") return;

    const pauseTimer = setTimeout(() => {
      setPhase("power");
    }, 500);

    return () => clearTimeout(pauseTimer);
  }, [welcomeComplete, phase]);

  // Power words phase - cycle through POWER, SPEED, MINDSET
  useEffect(() => {
    if (!isActive || phase !== "power") return;

    if (powerWordIndex >= POWER_WORDS.length) {
      // All power words shown, move to countdown
      setPhase("countdown");
      return;
    }

    const timer = setTimeout(() => {
      setPowerWordIndex((prev) => prev + 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isActive, phase, powerWordIndex]);

  // Countdown phase
  useEffect(() => {
    if (!isActive || phase !== "countdown") return;

    if (count === 0) {
      setPhase("go");
      return;
    }

    const timer = setTimeout(() => {
      setCount((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isActive, count, phase]);

  // Go phase - brief display then complete
  useEffect(() => {
    if (!isActive || phase !== "go") return;

    const goTimer = setTimeout(() => {
      onComplete();
    }, 800);

    return () => clearTimeout(goTimer);
  }, [isActive, phase, onComplete]);

  if (!isActive) return null;

  const currentPowerWord = powerWordIndex < POWER_WORDS.length 
    ? POWER_WORDS[powerWordIndex].word 
    : null;

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

        {/* Welcome Phase */}
        {phase === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl"
          >
            {/* Logo */}
            <motion.img 
              src={logo} 
              alt="Unbreakable" 
              className="h-24 md:h-32 mb-6 opacity-90"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 0.9, y: 0 }}
              transition={{ delay: 0.2 }}
            />

            {/* Exercise name */}
            {exerciseName && (
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="font-display text-4xl md:text-6xl text-primary tracking-wide mb-4"
              >
                {exerciseName}
              </motion.h1>
            )}

            {/* Pulsing indicator */}
            <motion.div
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-3 h-3 rounded-full bg-primary mt-6"
            />
          </motion.div>
        )}

        {/* Power Words Phase - POWER, SPEED, MINDSET */}
        {phase === "power" && currentPowerWord && (
          <motion.div
            key={`power-${currentPowerWord}`}
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 15,
              duration: 0.6 
            }}
            className="relative z-10 flex flex-col items-center"
          >
            {/* Outer ring pulse */}
            <motion.div
              animate={{
                scale: [1, 1.8, 1],
                opacity: [0.6, 0, 0.6],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                ease: "easeOut",
              }}
              className="absolute w-64 h-64 rounded-full border-4 border-primary"
              style={{ 
                left: "50%", 
                top: "50%", 
                transform: "translate(-50%, -50%)" 
              }}
            />

            {/* Power Word */}
            <span 
              className="font-display text-[8rem] md:text-[12rem] leading-none countdown-power neon-glow"
              style={{
                textShadow: "0 0 60px hsl(var(--primary) / 0.8)",
              }}
            >
              {currentPowerWord}
            </span>
          </motion.div>
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
              duration: 0.5 
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

            {/* Number */}
            <span 
              className="font-display text-[14rem] md:text-[18rem] leading-none text-primary neon-glow"
            >
              {count}
            </span>
          </motion.div>
        )}

        {/* Go Phase */}
        {phase === "go" && (
          <motion.div
            key="go"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 flex flex-col items-center"
          >
            <span 
              className="font-display text-[10rem] md:text-[14rem] leading-none text-primary neon-glow"
            >
              GO
            </span>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}