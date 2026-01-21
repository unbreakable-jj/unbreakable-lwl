import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Play, Pause, RotateCcw, Share2, Brain, ChevronLeft, Zap, Target, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.png";
import { NavigationDrawer } from "@/components/NavigationDrawer";
import { CountdownOverlay } from "@/components/CountdownOverlay";
import { BREATHING_EXERCISES, BreathingExercise, getPhaseText } from "@/lib/breathingExercises";

type BreathPhase = "idle" | "inhale" | "hold" | "exhale" | "rest" | "complete";
type ViewState = "selection" | "countdown" | "exercise" | "complete";

const Mindset = () => {
  const [view, setView] = useState<ViewState>("selection");
  const [selectedExercise, setSelectedExercise] = useState<BreathingExercise | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathPhase>("idle");
  const [currentCycle, setCurrentCycle] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showHalfwayMessage, setShowHalfwayMessage] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const halfwayShownRef = useRef(false);

  const getCycleDuration = useCallback((exercise: BreathingExercise) => {
    const { inhale, hold, exhale, rest = 0 } = exercise.phases;
    return (inhale + hold + exhale + rest) * 1000;
  }, []);

  const getPhaseFromTime = useCallback((elapsed: number, exercise: BreathingExercise): { phase: BreathPhase; cycle: number } => {
    const cycleDuration = getCycleDuration(exercise);
    const totalDuration = exercise.cycles * cycleDuration;
    
    if (elapsed >= totalDuration) {
      return { phase: "complete", cycle: exercise.cycles };
    }

    const cycleNumber = Math.floor(elapsed / cycleDuration) + 1;
    const timeInCycle = elapsed % cycleDuration;
    const { inhale, hold, exhale } = exercise.phases;

    const inhaleMs = inhale * 1000;
    const holdMs = hold * 1000;
    const exhaleMs = exhale * 1000;

    if (timeInCycle < inhaleMs) {
      return { phase: "inhale", cycle: cycleNumber };
    } else if (timeInCycle < inhaleMs + holdMs) {
      return { phase: "hold", cycle: cycleNumber };
    } else if (timeInCycle < inhaleMs + holdMs + exhaleMs) {
      return { phase: "exhale", cycle: cycleNumber };
    } else {
      return { phase: "rest", cycle: cycleNumber };
    }
  }, [getCycleDuration]);

  const startExercise = useCallback(() => {
    if (!selectedExercise) return;
    
    setIsActive(true);
    setView("exercise");
    setCurrentCycle(1);
    setPhase("inhale");
    setProgress(0);
    halfwayShownRef.current = false;
    startTimeRef.current = Date.now();

    const cycleDuration = getCycleDuration(selectedExercise);
    const totalDuration = selectedExercise.cycles * cycleDuration;

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const progressPercent = Math.min((elapsed / totalDuration) * 100, 100);
      
      setProgress(progressPercent);

      // Show halfway message
      if (progressPercent >= 50 && !halfwayShownRef.current) {
        halfwayShownRef.current = true;
        setShowHalfwayMessage(true);
        setTimeout(() => setShowHalfwayMessage(false), 3000);
      }

      const { phase: currentPhase, cycle } = getPhaseFromTime(elapsed, selectedExercise);
      setPhase(currentPhase);
      setCurrentCycle(cycle);

      if (elapsed >= totalDuration) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        setIsActive(false);
        setView("complete");
        setPhase("complete");
      }
    }, 100);
  }, [selectedExercise, getCycleDuration, getPhaseFromTime]);

  const handleCountdownComplete = useCallback(() => {
    startExercise();
  }, [startExercise]);

  const selectExercise = useCallback((exercise: BreathingExercise) => {
    setSelectedExercise(exercise);
    setView("countdown");
  }, []);

  const toggleBreathing = useCallback(() => {
    if (isActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setIsActive(false);
    } else {
      startExercise();
    }
  }, [isActive, startExercise]);

  const resetExercise = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsActive(false);
    setPhase("idle");
    setCurrentCycle(0);
    setProgress(0);
    setView("selection");
    setSelectedExercise(null);
  }, []);

  const handleShare = useCallback(() => {
    const shareText = `Just completed ${selectedExercise?.name || "an Unbreakable Mindset"} breathing session! 🧘‍♂️ #UnbreakableMindset #KeepShowingUp`;
    if (navigator.share) {
      navigator.share({
        title: "Unbreakable Mindset",
        text: shareText,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(shareText);
    }
  }, [selectedExercise]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const getScaleForPhase = () => {
    if (!selectedExercise) return 1;
    switch (phase) {
      case "inhale":
        return 1.8;
      case "hold":
        return 1.8;
      case "exhale":
        return 1;
      case "rest":
        return 1;
      default:
        return 1;
    }
  };

  const formatTime = (progressPercent: number, totalMinutes: number) => {
    const totalSeconds = totalMinutes * 60;
    const elapsed = Math.floor((progressPercent / 100) * totalSeconds);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const getIntensityIcon = (intensity: string) => {
    switch (intensity) {
      case "high":
        return <Zap className="w-5 h-5" />;
      case "medium":
        return <Target className="w-5 h-5" />;
      case "calm":
        return <Heart className="w-5 h-5" />;
      default:
        return <Brain className="w-5 h-5" />;
    }
  };

  // Exercise selection view
  if (view === "selection") {
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
        <main className="flex-1 flex flex-col px-4 pt-24 pb-12">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="mb-6">
              <Brain className="w-16 h-16 text-primary mx-auto" />
            </div>
            
            <h1 className="font-display text-4xl md:text-6xl text-foreground mb-3 tracking-wide">
              UNBREAKABLE MINDSET
            </h1>
            
            <p className="text-lg text-muted-foreground mb-1">
              Live Without Limits
            </p>
            
            <p className="text-primary font-display tracking-wider mb-2">
              KEEP SHOWING UP
            </p>
            
            <p className="text-sm text-muted-foreground">
              #UnbreakableMindset
            </p>
          </div>

          {/* Exercise Cards */}
          <div className="max-w-4xl mx-auto w-full grid gap-4 md:grid-cols-3">
            {BREATHING_EXERCISES.map((exercise) => (
              <Card
                key={exercise.id}
                className="bg-card border border-border border-l-4 border-l-primary p-6 cursor-pointer hover:bg-muted/50 transition-all group"
                onClick={() => selectExercise(exercise)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    {getIntensityIcon(exercise.intensity)}
                  </div>
                  <div>
                    <h3 className="font-display text-lg text-foreground tracking-wide">
                      {exercise.name}
                    </h3>
                    <p className="text-xs text-primary">{exercise.duration}</p>
                  </div>
                </div>
                
                <p className="text-primary font-display text-sm tracking-wide mb-2">
                  {exercise.tagline}
                </p>
                
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {exercise.description}
                </p>

                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{exercise.cycles} cycles</span>
                  <span className="capitalize">{exercise.intensity} intensity</span>
                </div>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // Countdown view
  if (view === "countdown") {
    return (
      <CountdownOverlay
        isActive={true}
        onComplete={handleCountdownComplete}
        startFrom={3}
      />
    );
  }

  // Exercise/Complete view
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background pulse effect */}
      <div 
        className={`absolute inset-0 transition-opacity duration-1000 ${
          phase === "inhale" ? "opacity-100" : phase === "hold" ? "opacity-80" : "opacity-30"
        }`}
        style={{
          background: `radial-gradient(circle at center, hsl(var(--primary) / 0.15), transparent 70%)`
        }}
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 w-full px-4">
        {/* Exercise name & cycle counter */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center">
          <p className="font-display text-xl text-primary tracking-wider mb-1">
            {selectedExercise?.name}
          </p>
          <p className="text-muted-foreground text-sm font-display tracking-wider">
            CYCLE {Math.min(currentCycle, selectedExercise?.cycles || 0)} / {selectedExercise?.cycles}
          </p>
        </div>

        {/* Halfway message */}
        <AnimatePresence>
          {showHalfwayMessage && selectedExercise && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-24 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur border border-primary px-6 py-3 rounded-lg max-w-sm text-center"
            >
              <p className="text-foreground text-sm">{selectedExercise.scripts.halfway}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Breathing dot */}
        <div className="relative mb-12">
          <motion.div
            animate={{
              scale: getScaleForPhase(),
              boxShadow: phase === "inhale" || phase === "hold" 
                ? "0 0 60px 20px hsl(var(--primary) / 0.4)"
                : "0 0 20px 5px hsl(var(--primary) / 0.3)",
            }}
            transition={{
              duration: selectedExercise?.phases[phase === "rest" ? "exhale" : (phase === "complete" ? "exhale" : phase)] || 4,
              ease: "easeInOut",
            }}
            className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-primary to-[hsl(var(--primary-glow))]"
          />
        </div>

        {/* Phase text */}
        <AnimatePresence mode="wait">
          <motion.h2
            key={phase}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="font-display text-3xl md:text-5xl text-foreground mb-4 tracking-wider text-center max-w-lg"
          >
            {view === "complete" ? "SESSION COMPLETE 🧘‍♂️" : (
              phase === "inhale" ? "BREATHE IN" :
              phase === "hold" ? "HOLD" :
              phase === "exhale" ? "BREATHE OUT" :
              phase === "rest" ? "REST" : "READY"
            )}
          </motion.h2>
        </AnimatePresence>

        {/* Instructions or completion message */}
        {view === "complete" && selectedExercise ? (
          <div className="text-center max-w-md">
            <p className="text-muted-foreground mb-6">
              {selectedExercise.scripts.closing}
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
        ) : selectedExercise && (
          <p className="text-muted-foreground text-center max-w-md">
            {phase === "inhale" && "Fill your lungs completely through your nose"}
            {phase === "hold" && "Feel the energy building inside you"}
            {phase === "exhale" && "Release slowly through your mouth"}
            {phase === "rest" && "Embrace the stillness"}
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="relative z-10 w-full max-w-md px-4 pb-8">
        {/* Progress bar */}
        <div className="mb-6">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{formatTime(progress, selectedExercise?.durationMinutes || 3)}</span>
            <span>{selectedExercise?.durationMinutes || 3}:00</span>
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={resetExercise}
            className="w-12 h-12"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          {view !== "complete" && (
            <Button
              onClick={toggleBreathing}
              size="lg"
              className="w-16 h-16 rounded-full"
            >
              {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
            </Button>
          )}

          {view === "complete" && (
            <Button
              onClick={resetExercise}
              size="lg"
              className="px-8"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              NEW SESSION
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Mindset;
