import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.png";

type CountdownPhase = "welcome" | "getready" | "power" | "movement" | "fuel" | "mindset" | "go";

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
  const [phase, setPhase] = useState<CountdownPhase>("welcome");
  const gpsStartedRef = useRef(false);

  // Reset state when becoming active
  useEffect(() => {
    if (isActive) {
      setPhase("welcome");
      gpsStartedRef.current = false;
    }
  }, [isActive]);

  // Start GPS acquisition early during the countdown
  useEffect(() => {
    if (isActive && phase === "getready" && !gpsStartedRef.current && onStartGps) {
      gpsStartedRef.current = true;
      onStartGps();
    }
  }, [isActive, phase, onStartGps]);

  // Welcome phase - 1 second
  useEffect(() => {
    if (!isActive || phase !== "welcome") return;
    const timer = setTimeout(() => {
      setPhase("getready");
      onPlayAudio?.("Get ready");
    }, 1000);
    return () => clearTimeout(timer);
  }, [isActive, phase, onPlayAudio]);

  // Get Ready phase - 1 second
  useEffect(() => {
    if (!isActive || phase !== "getready") return;
    const timer = setTimeout(() => {
      setPhase("power");
      onPlayAudio?.("Power");
    }, 1000);
    return () => clearTimeout(timer);
  }, [isActive, phase, onPlayAudio]);

  // POWER phase - 1 second
  useEffect(() => {
    if (!isActive || phase !== "power") return;
    const timer = setTimeout(() => {
      setPhase("movement");
      onPlayAudio?.("Movement");
    }, 1000);
    return () => clearTimeout(timer);
  }, [isActive, phase, onPlayAudio]);

  // MOVEMENT phase - 1 second
  useEffect(() => {
    if (!isActive || phase !== "movement") return;
    const timer = setTimeout(() => {
      setPhase("fuel");
      onPlayAudio?.("Fuel");
    }, 1000);
    return () => clearTimeout(timer);
  }, [isActive, phase, onPlayAudio]);

  // FUEL phase - 1 second
  useEffect(() => {
    if (!isActive || phase !== "fuel") return;
    const timer = setTimeout(() => {
      setPhase("mindset");
      onPlayAudio?.("Mindset");
    }, 1000);
    return () => clearTimeout(timer);
  }, [isActive, phase, onPlayAudio]);

  // MINDSET phase - 1 second
  useEffect(() => {
    if (!isActive || phase !== "mindset") return;
    const timer = setTimeout(() => {
      setPhase("go");
      onPlayAudio?.("Go!");
    }, 1000);
    return () => clearTimeout(timer);
  }, [isActive, phase, onPlayAudio]);

  // Go phase - 2 seconds
  useEffect(() => {
    if (!isActive || phase !== "go") return;
    const timer = setTimeout(() => {
      onComplete();
    }, 2000);
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

        {/* Welcome Phase */}
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

        {/* Get Ready Phase */}
        {phase === "getready" && (
          <motion.div
            key="getready"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 flex flex-col items-center"
          >
            <span 
              className="font-display text-[5rem] md:text-[8rem] leading-none text-foreground tracking-widest"
              style={{
                textShadow: "0 0 40px hsl(var(--primary) / 0.5)",
              }}
            >
              GET READY
            </span>
          </motion.div>
        )}

        {phase === "power" && <PowerWord word="POWER" />}
        {phase === "movement" && <PowerWord word="MOVEMENT" />}
        {phase === "fuel" && <PowerWord word="FUEL" />}
        {phase === "mindset" && <PowerWord word="MINDSET" />}




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
