import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Pause, Play, RotateCcw, Share2 } from "lucide-react";
import { BreathingVisual } from "./BreathingVisual";

type BreathPhase = "idle" | "inhale" | "hold" | "exhale" | "rest" | "complete";

interface ImmersiveSessionViewProps {
  phase: BreathPhase;
  progress: number;
  currentCycle: number;
  totalCycles: number;
  phaseDuration: number;
  isActive: boolean;
  isComplete: boolean;
  closingMessage?: string;
  onToggle: () => void;
  onReset: () => void;
  onShare: () => void;
}

export function ImmersiveSessionView({
  phase,
  progress,
  currentCycle,
  totalCycles,
  phaseDuration,
  isActive,
  isComplete,
  closingMessage,
  onToggle,
  onReset,
  onShare,
}: ImmersiveSessionViewProps) {
  const getPhaseText = () => {
    if (isComplete) return "COMPLETE";
    switch (phase) {
      case "inhale": return "BREATHE IN";
      case "hold": return "HOLD";
      case "exhale": return "RELEASE";
      case "rest": return "REST";
      default: return "READY";
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-background flex flex-col items-center justify-center overflow-hidden">
      {/* Ambient background glow - responds to phase */}
      <div 
        className={`absolute inset-0 transition-opacity duration-1000 ${
          phase === "inhale" ? "opacity-100" : phase === "hold" ? "opacity-80" : "opacity-30"
        }`}
        style={{
          background: "radial-gradient(circle at center, hsl(var(--primary) / 0.12), transparent 60%)"
        }}
      />

      {/* Cycle indicator - top */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center z-10">
        <p className="font-display text-lg text-muted-foreground tracking-widest">
          {isComplete ? "SESSION COMPLETE" : `${Math.min(currentCycle, totalCycles)} / ${totalCycles}`}
        </p>
      </div>

      {/* Main breathing visual - centered and large */}
      <div className="flex-1 flex items-center justify-center w-full">
        <div className="relative">
          <BreathingVisual
            phase={phase}
            progress={progress}
            phaseDuration={phaseDuration}
          />
        </div>
      </div>

      {/* Phase text - below orb */}
      <div className="absolute bottom-32 md:bottom-36 left-1/2 -translate-x-1/2 text-center z-10">
        <AnimatePresence mode="wait">
          <motion.h2
            key={phase}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="font-display text-4xl md:text-6xl text-foreground tracking-widest"
          >
            {getPhaseText()}
          </motion.h2>
        </AnimatePresence>

        {/* Completion message */}
        {isComplete && closingMessage && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground mt-4 max-w-md mx-auto px-6"
          >
            {closingMessage}
          </motion.p>
        )}
      </div>

      {/* Controls - bottom */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-10">
        <Button
          variant="outline"
          size="icon"
          onClick={onReset}
          className="w-12 h-12 rounded-full border-muted-foreground/30"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        {!isComplete ? (
          <Button
            onClick={onToggle}
            size="lg"
            className="w-16 h-16 rounded-full"
          >
            {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
          </Button>
        ) : (
          <>
            <Button
              onClick={onReset}
              size="lg"
              className="px-6 gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              AGAIN
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={onShare}
              className="w-12 h-12 rounded-full border-muted-foreground/30"
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
