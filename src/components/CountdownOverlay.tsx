import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.png";

type CountdownPhase = "welcome" | "countdown" | "go";

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
  welcomeMessage,
  exerciseName,
  onPlayAudio,
}: CountdownOverlayProps) {
  const [phase, setPhase] = useState<CountdownPhase>("welcome");
  const [count, setCount] = useState(startFrom);
  const [welcomeComplete, setWelcomeComplete] = useState(false);

  // Reset state when becoming active
  useEffect(() => {
    if (isActive) {
      setPhase("welcome");
      setCount(startFrom);
      setWelcomeComplete(false);
      
      // Play welcome audio
      if (onPlayAudio && welcomeMessage) {
        onPlayAudio(welcomeMessage);
      }
    }
  }, [isActive, startFrom, welcomeMessage, onPlayAudio]);

  // Welcome phase timer - wait for voice to finish
  useEffect(() => {
    if (!isActive || phase !== "welcome") return;

    // Wait 5 seconds for welcome message to play, then transition
    const welcomeTimer = setTimeout(() => {
      setWelcomeComplete(true);
    }, 5000);

    return () => clearTimeout(welcomeTimer);
  }, [isActive, phase]);

  // Transition from welcome to countdown after pause
  useEffect(() => {
    if (!welcomeComplete || phase !== "welcome") return;

    // Brief pause before countdown starts
    const pauseTimer = setTimeout(() => {
      setPhase("countdown");
    }, 1000);

    return () => clearTimeout(pauseTimer);
  }, [welcomeComplete, phase]);

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
            background: "radial-gradient(circle at center, hsl(var(--primary) / 0.1), transparent 70%)"
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
              className="h-20 md:h-28 mb-8 opacity-80"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 0.8, y: 0 }}
              transition={{ delay: 0.2 }}
            />

            {/* Exercise name */}
            {exerciseName && (
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="font-display text-4xl md:text-6xl text-primary tracking-wide mb-6"
              >
                {exerciseName}
              </motion.h1>
            )}

            {/* Welcome message */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-foreground text-lg md:text-xl leading-relaxed mb-8"
            >
              {welcomeMessage || "Prepare yourself. Find your center. Breathe."}
            </motion.p>

            {/* Pulsing indicator */}
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-4 h-4 rounded-full bg-primary"
            />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-muted-foreground text-sm mt-6 font-display tracking-widest"
            >
              PREPARING...
            </motion.p>
          </motion.div>
        )}

        {/* Countdown Phase */}
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
              className="font-display text-[14rem] md:text-[18rem] leading-none text-primary"
              style={{
                textShadow: "0 0 80px hsl(var(--primary) / 0.6)",
              }}
            >
              {count}
            </span>

            {/* Phase label */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-foreground font-display text-2xl md:text-3xl tracking-widest mt-4"
            >
              {count === 3 && "BREATHE"}
              {count === 2 && "FOCUS"}
              {count === 1 && "GO"}
            </motion.p>
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
              className="font-display text-[10rem] md:text-[14rem] leading-none text-primary"
              style={{
                textShadow: "0 0 100px hsl(var(--primary) / 0.8)",
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