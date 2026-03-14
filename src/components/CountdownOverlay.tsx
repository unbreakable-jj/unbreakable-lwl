import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.png";

type CountdownPhase = "power" | "movement" | "fuel" | "mindset" | "three" | "two" | "one" | "go";

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
  const [phase, setPhase] = useState<CountdownPhase>("power");
  const gpsStartedRef = useRef(false);

  useEffect(() => {
    if (isActive) {
      setPhase("power");
      gpsStartedRef.current = false;
    }
  }, [isActive]);

  // Start GPS immediately on mount
  useEffect(() => {
    if (isActive && !gpsStartedRef.current && onStartGps) {
      gpsStartedRef.current = true;
      onStartGps();
    }
  }, [isActive, onStartGps]);

  const PHASE_DURATION: Record<CountdownPhase, number> = {
    power: 1000,
    movement: 1000,
    fuel: 1000,
    mindset: 1000,
    three: 1000,
    two: 1000,
    one: 1000,
    go: 1000,
  };

  const PHASE_ORDER: CountdownPhase[] = ["power", "movement", "fuel", "mindset", "three", "two", "one", "go"];

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

  const isNumberPhase = phase === "three" || phase === "two" || phase === "one";
  const numberText = phase === "three" ? "3" : phase === "two" ? "2" : phase === "one" ? "1" : "";

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

        {/* Power words */}
        {phase === "power" && <PowerWord word="POWER" />}
        {phase === "movement" && <PowerWord word="MOVEMENT" />}
        {phase === "fuel" && <PowerWord word="FUEL" />}
        {phase === "mindset" && <PowerWord word="MINDSET" />}

        {/* 3-2-1 countdown numbers */}
        {isNumberPhase && (
          <motion.div
            key={`number-${phase}`}
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 250, damping: 18, duration: 0.4 }}
            className="relative z-10 flex flex-col items-center"
          >
            <motion.div
              animate={{
                scale: [1, 1.8, 1],
                opacity: [0.4, 0, 0.4],
              }}
              transition={{ duration: 0.7, repeat: Infinity, ease: "easeOut" }}
              className="absolute w-48 h-48 rounded-full border-4 border-primary"
              style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
            />
            <span 
              className="font-display text-[10rem] md:text-[14rem] leading-none text-primary"
              style={{ textShadow: "0 0 80px hsl(var(--primary) / 0.8)" }}
            >
              {numberText}
            </span>
          </motion.div>
        )}

        {/* GO! */}
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
            {exerciseName && (
              <span className="font-display text-xl text-foreground/70 tracking-wide mt-4">
                {exerciseName}
              </span>
            )}
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
