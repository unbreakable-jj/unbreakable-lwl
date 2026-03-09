import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.png";

type CountdownPhase = "ready" | "power" | "movement" | "fuel" | "mindset" | "go";

interface CountdownOverlayProps {
  isActive: boolean;
  onComplete: () => void;
  startFrom?: number;
  welcomeMessage?: string;
  exerciseName?: string;
  onPlayAudio?: (text: string) => void;
  onStartGps?: () => void;
}

export function CountdownOverlay({ 
  isActive, 
  onComplete, 
  startFrom = 3,
  exerciseName,
  onPlayAudio,
  onStartGps,
}: CountdownOverlayProps) {
  const [phase, setPhase] = useState<CountdownPhase>("ready");
  const gpsStartedRef = useRef(false);

  useEffect(() => {
    if (isActive) {
      setPhase("ready");
      gpsStartedRef.current = false;
    }
  }, [isActive]);

  // Start GPS during ready phase
  useEffect(() => {
    if (isActive && phase === "ready" && !gpsStartedRef.current && onStartGps) {
      gpsStartedRef.current = true;
      onStartGps();
    }
  }, [isActive, phase, onStartGps]);

  // Phase durations — no voice overlay during countdown
  const PHASE_DURATION: Record<CountdownPhase, number> = {
    ready: 1000,
    power: 1000,
    movement: 1000,
    fuel: 1000,
    mindset: 1000,
    go: 2000,
  };

  const PHASE_ORDER: CountdownPhase[] = ["ready", "power", "movement", "fuel", "mindset", "go"];

  useEffect(() => {
    if (!isActive) return;
    const currentIndex = PHASE_ORDER.indexOf(phase);
    if (currentIndex < 0) return;

    const duration = PHASE_DURATION[phase];
    const timer = setTimeout(() => {
      const nextIndex = currentIndex + 1;
      if (nextIndex < PHASE_ORDER.length) {
        setPhase(PHASE_ORDER[nextIndex]);
      } else {
        onComplete();
      }
    }, duration);

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
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(circle at center, hsl(var(--primary) / 0.15), transparent 70%)"
          }}
        />

        {phase === "ready" && (
          <motion.div
            key="ready"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 flex flex-col items-center gap-6"
          >
            <motion.img 
              src={logo} 
              alt="Unbreakable" 
              className="h-20 md:h-28"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
            <span 
              className="font-display text-[5rem] md:text-[8rem] leading-none text-foreground tracking-widest"
              style={{ textShadow: "0 0 40px hsl(var(--primary) / 0.5)" }}
            >
              READY
            </span>
            {exerciseName && (
              <span className="font-display text-xl text-primary tracking-wide neon-glow-subtle">
                {exerciseName}
              </span>
            )}
          </motion.div>
        )}

        {phase === "power" && <PowerWord word="POWER" />}
        {phase === "movement" && <PowerWord word="MOVEMENT" />}
        {phase === "fuel" && <PowerWord word="FUEL" />}
        {phase === "mindset" && <PowerWord word="MINDSET" />}

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
              style={{ textShadow: "0 0 80px hsl(var(--primary) / 0.8)" }}
            >
              GO!
            </span>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

function PowerWord({ word }: { word: string }) {
  return (
    <motion.div
      key={`word-${word}`}
      initial={{ scale: 0.3, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 1.3, opacity: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 15, duration: 0.5 }}
      className="relative z-10 flex flex-col items-center"
    >
      <motion.div
        animate={{
          scale: [1, 1.6, 1],
          opacity: [0.5, 0, 0.5],
        }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "easeOut" }}
        className="absolute w-56 h-56 rounded-full border-4 border-primary"
        style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
      />
      <span 
        className="font-display text-[6rem] md:text-[10rem] leading-none text-primary"
        style={{ textShadow: "0 0 60px hsl(var(--primary) / 0.7)" }}
      >
        {word}
      </span>
    </motion.div>
  );
}
