import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX,
  Plus,
  Minus,
  Timer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RestTimerProps {
  suggestedTime?: number; // in seconds
  exerciseType?: 'strength' | 'hypertrophy' | 'endurance' | 'compound' | 'isolation';
  onComplete?: () => void;
}

const REST_PRESETS: Record<string, number> = {
  compound: 180, // 3 min for compound lifts
  strength: 180,
  isolation: 90, // 1.5 min for isolation
  hypertrophy: 90,
  endurance: 60, // 1 min for endurance
};

export function RestTimer({ suggestedTime, exerciseType = 'strength', onComplete }: RestTimerProps) {
  const defaultTime = suggestedTime || REST_PRESETS[exerciseType] || 120;
  const [timeLeft, setTimeLeft] = useState(defaultTime);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [initialTime, setInitialTime] = useState(defaultTime);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2AgHd0fIGDgoKCgYCAgH9/f4CAgIB/f39/f4CAgH9/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/');
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            if (soundEnabled && audioRef.current) {
              // Play sound 3 times
              let count = 0;
              const playBeep = () => {
                if (count < 3 && audioRef.current) {
                  audioRef.current.currentTime = 0;
                  audioRef.current.play().catch(() => {});
                  count++;
                  setTimeout(playBeep, 300);
                }
              };
              playBeep();
            }
            // Vibrate if supported
            if ('vibrate' in navigator) {
              navigator.vibrate([200, 100, 200, 100, 200]);
            }
            onComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft, soundEnabled, onComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(initialTime);
  };

  const adjustTime = (amount: number) => {
    const newTime = Math.max(15, initialTime + amount);
    setInitialTime(newTime);
    if (!isRunning) {
      setTimeLeft(newTime);
    }
  };

  const progress = (timeLeft / initialTime) * 100;
  const isWarning = timeLeft <= 10 && timeLeft > 0;
  const isComplete = timeLeft === 0;

  return (
    <Card className={`p-4 border transition-colors ${
      isComplete ? 'border-green-500 bg-green-500/10' :
      isWarning ? 'border-yellow-500 bg-yellow-500/10' :
      'border-border bg-card'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Timer className="w-5 h-5 text-primary" />
          <span className="font-display text-sm text-foreground">REST TIMER</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {exerciseType}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>

      {/* Timer Display */}
      <div className="relative flex items-center justify-center py-6">
        {/* Progress Ring */}
        <svg className="absolute w-32 h-32" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-surface"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeDasharray={`${(progress / 100) * 283} 283`}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            className={`transition-all duration-1000 ${
              isComplete ? 'text-green-500' :
              isWarning ? 'text-yellow-500' :
              'text-primary'
            }`}
          />
        </svg>

        <AnimatePresence mode="wait">
          <motion.span
            key={timeLeft}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            className={`font-display text-4xl ${
              isComplete ? 'text-green-500' :
              isWarning ? 'text-yellow-500' :
              'text-foreground'
            }`}
          >
            {isComplete ? 'GO!' : formatTime(timeLeft)}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Time Adjustment */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => adjustTime(-15)}
          disabled={isRunning}
        >
          <Minus className="w-4 h-4 mr-1" />
          15s
        </Button>
        <span className="text-sm text-muted-foreground">
          Set: {formatTime(initialTime)}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => adjustTime(15)}
          disabled={isRunning}
        >
          <Plus className="w-4 h-4 mr-1" />
          15s
        </Button>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={handleReset}
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        
        <Button
          size="lg"
          onClick={isRunning ? handlePause : handleStart}
          className="min-w-[120px] gap-2"
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              {timeLeft === initialTime ? 'Start' : 'Resume'}
            </>
          )}
        </Button>
      </div>

      {/* Quick Presets */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {[60, 90, 120, 180].map((preset) => (
          <Button
            key={preset}
            variant={initialTime === preset ? 'default' : 'ghost'}
            size="sm"
            className="text-xs"
            onClick={() => {
              setInitialTime(preset);
              if (!isRunning) setTimeLeft(preset);
            }}
          >
            {preset >= 60 ? `${preset / 60}m` : `${preset}s`}
          </Button>
        ))}
      </div>
    </Card>
  );
}
