import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, RotateCcw, Share2, Brain } from "lucide-react";
import logo from "@/assets/logo.png";
import { NavigationDrawer } from "@/components/NavigationDrawer";

type BreathPhase = "idle" | "inhale" | "hold" | "exhale" | "relax";

const PHASE_DURATION = 4000; // 4 seconds per phase
const CYCLES_TOTAL = 15; // 15 cycles = ~3 minutes
const CYCLE_DURATION = PHASE_DURATION * 3; // inhale + hold + exhale

const Mindset = () => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathPhase>("idle");
  const [currentCycle, setCurrentCycle] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const phaseText: Record<BreathPhase, string> = {
    idle: "READY",
    inhale: "BREATHE IN",
    hold: "HOLD",
    exhale: "BREATHE OUT",
    relax: "RELAX...",
  };

  const getPhaseFromTime = useCallback((elapsed: number): { phase: BreathPhase; cycle: number } => {
    const totalDuration = CYCLES_TOTAL * CYCLE_DURATION;
    
    if (elapsed >= totalDuration) {
      return { phase: "relax", cycle: CYCLES_TOTAL };
    }

    const cycleNumber = Math.floor(elapsed / CYCLE_DURATION) + 1;
    const timeInCycle = elapsed % CYCLE_DURATION;

    if (timeInCycle < PHASE_DURATION) {
      return { phase: "inhale", cycle: cycleNumber };
    } else if (timeInCycle < PHASE_DURATION * 2) {
      return { phase: "hold", cycle: cycleNumber };
    } else {
      return { phase: "exhale", cycle: cycleNumber };
    }
  }, []);

  const startBreathing = useCallback(() => {
    setIsActive(true);
    setIsComplete(false);
    setCurrentCycle(1);
    setPhase("inhale");
    setProgress(0);
    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const totalDuration = CYCLES_TOTAL * CYCLE_DURATION;
      const progressPercent = Math.min((elapsed / totalDuration) * 100, 100);
      
      setProgress(progressPercent);

      const { phase: currentPhase, cycle } = getPhaseFromTime(elapsed);
      setPhase(currentPhase);
      setCurrentCycle(cycle);

      if (elapsed >= totalDuration) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        setIsActive(false);
        setIsComplete(true);
        setPhase("relax");
      }
    }, 100);
  }, [getPhaseFromTime]);

  const toggleBreathing = useCallback(() => {
    if (isActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setIsActive(false);
    } else if (isComplete) {
      startBreathing();
    } else {
      startBreathing();
    }
  }, [isActive, isComplete, startBreathing]);

  const resetBreathing = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsActive(false);
    setIsComplete(false);
    setPhase("idle");
    setCurrentCycle(0);
    setProgress(0);
  }, []);

  const handleShare = useCallback(() => {
    const shareText = "Just completed an Unbreakable Mindset breathing session! 🧘‍♂️ #UnbreakableMindset #KeepShowingUp";
    if (navigator.share) {
      navigator.share({
        title: "Unbreakable Mindset",
        text: shareText,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(shareText);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const getAnimationClass = () => {
    switch (phase) {
      case "inhale":
        return "animate-breathe-in";
      case "hold":
        return "animate-breathe-hold";
      case "exhale":
        return "animate-breathe-out";
      default:
        return "";
    }
  };

  // Hero view
  if (!isActive && !isComplete && phase === "idle") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="Unbreakable" className="h-10 w-auto" />
            </Link>
            <NavigationDrawer />
          </div>
        </header>

        {/* Hero */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 pt-24 pb-12">
          <div className="text-center max-w-2xl mx-auto">
            <div className="mb-8">
              <Brain className="w-20 h-20 text-primary mx-auto mb-6" />
            </div>
            
            <h1 className="font-display text-5xl md:text-7xl text-foreground mb-4 tracking-wide">
              UNBREAKABLE MINDSET
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-2">
              Live Without Limits
            </p>
            
            <p className="text-lg text-primary font-display tracking-wider mb-4">
              KEEP SHOWING UP
            </p>
            
            <p className="text-sm text-muted-foreground mb-8">
              #UnbreakableMindset
            </p>

            <div className="bg-card border border-border rounded-lg p-6 mb-8 border-l-4 border-l-primary">
              <h2 className="font-display text-xl text-foreground mb-2">3-MINUTE WIM HOF BREATHING</h2>
              <p className="text-muted-foreground text-sm">
                15 cycles of deep breathing. Inhale fully, hold, exhale completely.
                Build mental resilience and unlock your body's potential.
              </p>
            </div>

            <Button 
              onClick={startBreathing}
              size="lg"
              className="text-lg px-8 py-6 font-display tracking-wider"
            >
              START BREATHING →
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Breathing exercise view
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background pulse effect */}
      <div 
        className={`absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent transition-opacity duration-1000 ${
          phase === "inhale" ? "opacity-100" : phase === "hold" ? "opacity-80" : "opacity-30"
        }`}
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 w-full px-4">
        {/* Cycle counter */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2">
          <p className="text-muted-foreground text-sm font-display tracking-wider">
            CYCLE {Math.min(currentCycle, CYCLES_TOTAL)} / {CYCLES_TOTAL}
          </p>
        </div>

        {/* Breathing dot */}
        <div className="relative mb-12">
          <div
            className={`
              w-32 h-32 md:w-48 md:h-48 rounded-full bg-primary
              transition-all duration-[4000ms] ease-in-out
              ${getAnimationClass()}
              ${phase !== "idle" ? "shadow-[0_0_60px_20px_hsl(var(--primary)/0.4)]" : ""}
            `}
            style={{
              transform: phase === "inhale" ? "scale(1.8)" : 
                        phase === "hold" ? "scale(1.8)" : 
                        phase === "exhale" ? "scale(1)" : "scale(1)",
            }}
          />
          
          {/* Inner glow */}
          <div 
            className={`
              absolute inset-0 rounded-full bg-gradient-to-br from-[hsl(var(--primary-glow))] to-primary
              transition-all duration-[4000ms] ease-in-out opacity-60
            `}
            style={{
              transform: phase === "inhale" ? "scale(1.8)" : 
                        phase === "hold" ? "scale(1.8)" : 
                        phase === "exhale" ? "scale(1)" : "scale(1)",
            }}
          />
        </div>

        {/* Phase text */}
        <h2 className="font-display text-4xl md:text-6xl text-foreground mb-4 tracking-wider text-center">
          {phaseText[phase]}
        </h2>

        {/* Instruction */}
        {isComplete ? (
          <div className="text-center">
            <p className="text-2xl md:text-3xl text-primary font-display tracking-wider mb-2">
              SESSION COMPLETE 🧘‍♂️
            </p>
            <p className="text-muted-foreground mb-6">
              Feel the power of controlled breathing. Keep showing up.
            </p>
            <Button 
              onClick={handleShare}
              variant="outline"
              className="gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share #UnbreakableMindset
            </Button>
          </div>
        ) : (
          <p className="text-muted-foreground text-center max-w-md">
            {phase === "inhale" && "Fill your lungs completely through your nose"}
            {phase === "hold" && "Hold at the peak, feel the energy"}
            {phase === "exhale" && "Release slowly through your mouth"}
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="relative z-10 w-full max-w-md px-4 pb-8">
        {/* Progress bar */}
        <div className="mb-6">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{Math.floor((progress / 100) * 3)}:{String(Math.floor(((progress / 100) * 180) % 60)).padStart(2, '0')}</span>
            <span>3:00</span>
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={resetBreathing}
            className="w-12 h-12"
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
          
          <Button
            onClick={toggleBreathing}
            size="lg"
            className="w-16 h-16 rounded-full"
          >
            {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
          </Button>

          <Link to="/">
            <Button
              variant="outline"
              size="icon"
              className="w-12 h-12"
            >
              <span className="text-xs font-display">EXIT</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Mindset;
