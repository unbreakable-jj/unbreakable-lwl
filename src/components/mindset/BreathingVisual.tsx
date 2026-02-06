import { motion } from "framer-motion";

type BreathPhase = "idle" | "inhale" | "hold" | "exhale" | "rest" | "complete";

interface BreathingVisualProps {
  phase: BreathPhase;
  progress: number; // 0-100 overall session progress
  phaseDuration: number; // Current phase duration in seconds
  phaseProgress?: number; // 0-100 progress within current phase
}

export function BreathingVisual({ 
  phase, 
  progress, 
  phaseDuration,
  phaseProgress = 0,
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

  const getSubtext = () => {
    switch (phase) {
      case "inhale":
        return "Breathe In";
      case "hold":
        return "Hold";
      case "exhale":
        return "Breathe Out";
      case "rest":
        return "Rest";
      case "complete":
        return "Complete";
      default:
        return "";
    }
  };

  // SVG parameters for progress ring
  const size = 280;
  const strokeWidth = 4;
  const center = size / 2;
  const radius = center - strokeWidth - 20;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (progress / 100) * circumference;

  // Calculate dot position on the circle perimeter based on overall progress
  const dotAngle = (progress / 100) * 360 - 90; // Start from top (-90 degrees)
  const dotAngleRad = (dotAngle * Math.PI) / 180;
  const dotX = center + radius * Math.cos(dotAngleRad);
  const dotY = center + radius * Math.sin(dotAngleRad);

  // Trail dots (comet effect)
  const trailCount = 5;
  const trailDots = Array.from({ length: trailCount }, (_, i) => {
    const trailProgress = Math.max(0, progress - (i + 1) * 1.5);
    const trailAngle = (trailProgress / 100) * 360 - 90;
    const trailAngleRad = (trailAngle * Math.PI) / 180;
    return {
      x: center + radius * Math.cos(trailAngleRad),
      y: center + radius * Math.sin(trailAngleRad),
      opacity: 0.6 - i * 0.1,
      size: 8 - i * 1.2,
    };
  });

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Progress Ring with Trailing Dot */}
      <div className="relative">
        <svg
          width={size}
          height={size}
          className="absolute transform -rotate-90"
          style={{ left: 0, top: 0 }}
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

        {/* Trailing dots (comet effect) */}
        <svg
          width={size}
          height={size}
          className="absolute"
          style={{ left: 0, top: 0 }}
        >
          {progress > 2 && trailDots.map((dot, i) => (
            <motion.circle
              key={i}
              cx={dot.x}
              cy={dot.y}
              r={dot.size / 2}
              fill="hsl(var(--primary))"
              opacity={dot.opacity}
              initial={false}
              animate={{ cx: dot.x, cy: dot.y }}
              transition={{ duration: 0.1 }}
            />
          ))}
          
          {/* Main progress dot */}
          {progress > 0 && (
            <motion.circle
              cx={dotX}
              cy={dotY}
              r={6}
              fill="hsl(var(--primary))"
              initial={false}
              animate={{ cx: dotX, cy: dotY }}
              transition={{ duration: 0.1 }}
              style={{
                filter: "drop-shadow(0 0 8px hsl(var(--primary)))",
              }}
            />
          )}
        </svg>

        {/* Central Breathing Orb */}
        <div className="flex items-center justify-center" style={{ width: size, height: size }}>
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
        </div>

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
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 md:w-52 md:h-52 rounded-full border border-primary/40"
          style={{
            boxShadow: "inset 0 0 20px hsl(var(--primary) / 0.1)",
          }}
        />
      </div>

      {/* Subtext below the visual */}
      {phase !== "idle" && phase !== "complete" && (
        <motion.p
          key={phase}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.2 }}
          className="mt-8 text-lg text-muted-foreground font-display tracking-widest uppercase"
        >
          {getSubtext()}
        </motion.p>
      )}
    </div>
  );
}
