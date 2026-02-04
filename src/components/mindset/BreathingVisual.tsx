import { motion } from "framer-motion";

type BreathPhase = "idle" | "inhale" | "hold" | "exhale" | "rest" | "complete";

interface BreathingVisualProps {
  phase: BreathPhase;
  progress: number; // 0-100 overall session progress
  phaseDuration: number; // Current phase duration in seconds
  cycleProgress?: number; // 0-100 progress within current cycle
}

export function BreathingVisual({ 
  phase, 
  progress, 
  phaseDuration,
}: BreathingVisualProps) {
  const getScaleForPhase = () => {
    switch (phase) {
      case "inhale":
        return 1.6;
      case "hold":
        return 1.6;
      case "exhale":
        return 1;
      case "rest":
        return 1;
      default:
        return 1;
    }
  };

  const getGlowIntensity = () => {
    switch (phase) {
      case "inhale":
        return "0 0 80px 30px hsl(var(--primary) / 0.5)";
      case "hold":
        return "0 0 100px 40px hsl(var(--primary) / 0.6)";
      case "exhale":
        return "0 0 40px 15px hsl(var(--primary) / 0.3)";
      case "rest":
        return "0 0 20px 10px hsl(var(--primary) / 0.2)";
      default:
        return "0 0 30px 10px hsl(var(--primary) / 0.3)";
    }
  };

  // SVG parameters for progress ring
  const size = 280;
  const strokeWidth = 4;
  const center = size / 2;
  const radius = center - strokeWidth - 20; // Leave room for glow
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      {/* Progress Ring (SVG) */}
      <svg
        width={size}
        height={size}
        className="absolute transform -rotate-90"
      >
        {/* Background ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          opacity={0.3}
        />
        {/* Progress ring */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: progressOffset }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{
            filter: "drop-shadow(0 0 6px hsl(var(--primary) / 0.6))",
          }}
        />
      </svg>

      {/* Central Breathing Orb */}
      <motion.div
        animate={{
          scale: getScaleForPhase(),
          boxShadow: getGlowIntensity(),
        }}
        transition={{
          duration: phaseDuration,
          ease: "easeInOut",
        }}
        className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-primary via-primary to-[hsl(var(--primary-glow))] relative z-10"
      >
        {/* Inner pulse ring */}
        <motion.div
          animate={{
            scale: phase === "hold" ? [1, 1.1, 1] : 1,
            opacity: phase === "hold" ? [0.5, 0.8, 0.5] : 0.3,
          }}
          transition={{
            duration: 2,
            repeat: phase === "hold" ? Infinity : 0,
            ease: "easeInOut",
          }}
          className="absolute inset-0 rounded-full border-2 border-primary-foreground/30"
        />
      </motion.div>

      {/* Outer glow ring that expands on inhale */}
      <motion.div
        animate={{
          scale: phase === "inhale" ? [1, 1.3] : phase === "hold" ? 1.3 : 1,
          opacity: phase === "inhale" || phase === "hold" ? 0.4 : 0.1,
        }}
        transition={{
          duration: phaseDuration,
          ease: "easeInOut",
        }}
        className="absolute w-40 h-40 md:w-52 md:h-52 rounded-full border border-primary/40"
        style={{
          boxShadow: "inset 0 0 20px hsl(var(--primary) / 0.1)",
        }}
      />
    </div>
  );
}
