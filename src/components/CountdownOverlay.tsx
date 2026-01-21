import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CountdownOverlayProps {
  isActive: boolean;
  onComplete: () => void;
  startFrom?: number;
}

export function CountdownOverlay({ isActive, onComplete, startFrom = 3 }: CountdownOverlayProps) {
  const [count, setCount] = useState(startFrom);

  useEffect(() => {
    if (!isActive) {
      setCount(startFrom);
      return;
    }

    if (count === 0) {
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setCount((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isActive, count, onComplete, startFrom]);

  if (!isActive || count === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/95 flex flex-col items-center justify-center"
      >
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-muted-foreground font-display text-xl tracking-wider mb-8"
        >
          GET READY
        </motion.p>

        <motion.div
          key={count}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.5, opacity: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 20,
            duration: 0.5 
          }}
          className="relative"
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
            className="absolute inset-0 w-40 h-40 rounded-full border-4 border-primary"
            style={{ 
              left: "50%", 
              top: "50%", 
              transform: "translate(-50%, -50%)" 
            }}
          />

          {/* Number */}
          <span 
            className="font-display text-[12rem] leading-none text-primary"
            style={{
              textShadow: "0 0 60px hsl(var(--primary) / 0.5)",
            }}
          >
            {count}
          </span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-foreground font-display text-2xl tracking-wider mt-8"
        >
          {count === 3 && "BREATHE"}
          {count === 2 && "FOCUS"}
          {count === 1 && "GO"}
        </motion.p>
      </motion.div>
    </AnimatePresence>
  );
}
