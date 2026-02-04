import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Play, Pause, RotateCcw, Share2, Brain, ChevronLeft, Zap, Target, Heart, Volume2, VolumeX, Settings, Flame, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemedLogo } from "@/components/ThemedLogo";
import { NavigationDrawer } from "@/components/NavigationDrawer";
import { ThemeToggle } from "@/components/hub/ThemeToggle";
import { UnifiedFooter } from "@/components/UnifiedFooter";
import { CountdownOverlay } from "@/components/CountdownOverlay";
import { getVisibleExercises, BreathingExercise } from "@/lib/breathingExercises";
import { BreathingVisual } from "@/components/mindset/BreathingVisual";
import { useBreathingAudio, VoiceType } from "@/hooks/useBreathingAudio";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type BreathPhase = "idle" | "inhale" | "hold" | "exhale" | "rest" | "complete";
type ViewState = "selection" | "countdown" | "exercise" | "complete";

const VOICE_OPTIONS = [
  { value: "male" as VoiceType, label: "Male Voice", description: "Calm, warm guidance" },
  { value: "female" as VoiceType, label: "Female Voice", description: "Soothing, gentle guidance" },
];

const heroContent = {
  title: "UNBREAKABLE",
  titleAccent: "MINDSET",
  tagline: "LIVE WITHOUT LIMITS",
  intro: "Your mind is your ultimate weapon. This isn't meditation for relaxation — it's",
  emphasis: "MENTAL CONDITIONING",
  description: "Controlled breathing rewires your nervous system. Every session builds",
  descEmphasis: "RESILIENCE UNDER PRESSURE",
  descEnd: ".",
  goal: "Develop a mind that stays calm in chaos — focused, present, and",
  goalEmphasis: "UNBREAKABLE",
  goalEnd: ". KEEP SHOWING UP.",
  hashtag: "#UNBREAKABLEMOVEMENT",
};

const Mindset = () => {
  const [view, setView] = useState<ViewState>("selection");
  const [selectedExercise, setSelectedExercise] = useState<BreathingExercise | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathPhase>("idle");
  const [currentCycle, setCurrentCycle] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showHalfwayMessage, setShowHalfwayMessage] = useState(false);
  
  // Voice settings
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceType, setVoiceType] = useState<VoiceType>("male");
  const [showSettings, setShowSettings] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const halfwayShownRef = useRef(false);
  const lastPhaseRef = useRef<BreathPhase>("idle");

  // Audio hook
  const { playAudio, stopAudio, preloadAudio, cleanup } = useBreathingAudio({
    voiceType,
    enabled: voiceEnabled,
  });

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

  // Play audio when phase changes - MINIMAL CUES
  useEffect(() => {
    if (!selectedExercise || !voiceEnabled || view !== "exercise") return;
    
    if (phase !== lastPhaseRef.current) {
      lastPhaseRef.current = phase;
      
      let textToSpeak = "";
      
      switch (phase) {
        case "inhale":
          // Only first 2 cycles get voice cues, then every 3rd cycle
          if (currentCycle <= 2 || currentCycle % 3 === 0) {
            textToSpeak = selectedExercise.scripts.inhale; // "Breathe in"
          }
          break;
        case "hold":
          if (currentCycle <= 2 || currentCycle % 3 === 0) {
            textToSpeak = selectedExercise.scripts.hold; // "Hold"
          }
          break;
        case "exhale":
          if (currentCycle <= 2 || currentCycle % 3 === 0) {
            textToSpeak = selectedExercise.scripts.exhale; // "Release"
          }
          break;
        case "complete":
          textToSpeak = selectedExercise.scripts.closing;
          break;
        // No rest cues for minimal approach
      }
      
      if (textToSpeak) {
        playAudio(textToSpeak);
      }
    }
  }, [phase, currentCycle, selectedExercise, voiceEnabled, view, playAudio]);

  // Play halfway message
  useEffect(() => {
    if (showHalfwayMessage && selectedExercise && voiceEnabled) {
      playAudio(selectedExercise.scripts.halfway);
    }
  }, [showHalfwayMessage, selectedExercise, voiceEnabled, playAudio]);

  const startExercise = useCallback(() => {
    if (!selectedExercise) return;
    
    setIsActive(true);
    setView("exercise");
    setCurrentCycle(1);
    setPhase("inhale");
    setProgress(0);
    halfwayShownRef.current = false;
    lastPhaseRef.current = "idle";
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

  // Callback for countdown to play audio
  const handleCountdownAudio = useCallback((text: string) => {
    if (voiceEnabled) {
      playAudio(text);
    }
  }, [voiceEnabled, playAudio]);

  const selectExercise = useCallback((exercise: BreathingExercise) => {
    setSelectedExercise(exercise);
    
    // Preload minimal audio phrases
    if (voiceEnabled) {
      preloadAudio([
        exercise.scripts.inhale,
        exercise.scripts.hold,
        exercise.scripts.exhale,
        exercise.scripts.intro,
        exercise.scripts.halfway,
        exercise.scripts.closing,
      ]);
    }
    
    setView("countdown");
  }, [voiceEnabled, preloadAudio]);

  const toggleBreathing = useCallback(() => {
    if (isActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setIsActive(false);
      stopAudio();
    } else {
      startExercise();
    }
  }, [isActive, startExercise, stopAudio]);

  const resetExercise = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    stopAudio();
    setIsActive(false);
    setPhase("idle");
    setCurrentCycle(0);
    setProgress(0);
    setView("selection");
    setSelectedExercise(null);
    lastPhaseRef.current = "idle";
  }, [stopAudio]);

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
      cleanup();
    };
  }, [cleanup]);

  // getScaleForPhase moved to BreathingVisual component

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

  // Settings sheet content
  const SettingsSheet = () => (
    <Sheet open={showSettings} onOpenChange={setShowSettings}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="absolute top-4 right-4">
          <Settings className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-card border-border">
        <SheetHeader>
          <SheetTitle className="font-display text-xl tracking-wide text-foreground">
            VOICE SETTINGS
          </SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6 mt-6">
          {/* Voice enabled toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {voiceEnabled ? (
                <Volume2 className="w-5 h-5 text-primary" />
              ) : (
                <VolumeX className="w-5 h-5 text-muted-foreground" />
              )}
              <Label htmlFor="voice-enabled" className="font-display tracking-wide">
                VOICE GUIDANCE
              </Label>
            </div>
            <Switch
              id="voice-enabled"
              checked={voiceEnabled}
              onCheckedChange={setVoiceEnabled}
            />
          </div>

          {/* Voice type selection */}
          {voiceEnabled && (
            <div className="space-y-3">
              <Label className="font-display tracking-wide text-muted-foreground">
                VOICE TYPE
              </Label>
              <div className="space-y-2">
                {VOICE_OPTIONS.map((option) => (
                  <Card
                    key={option.value}
                    className={`p-4 cursor-pointer transition-all border ${
                      voiceType === option.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setVoiceType(option.value)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-display text-foreground tracking-wide">
                          {option.label}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                      {voiceType === option.value && (
                        <div className="w-3 h-3 rounded-full bg-primary" />
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );

  // Exercise selection view - matches Calculator page structure
  if (view === "selection") {
    return (
      <div className="min-h-screen bg-background">
        {/* Header with Theme Toggle */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <Link to="/" className="flex items-center gap-3">
                  <ThemedLogo />
                  <span className="font-display text-lg tracking-wide text-foreground hidden sm:block">
                    UNBREAKABLE
                  </span>
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSettings(true)}
                >
                  {voiceEnabled ? (
                    <Volume2 className="w-5 h-5" />
                  ) : (
                    <VolumeX className="w-5 h-5" />
                  )}
                </Button>
                <NavigationDrawer />
              </div>
            </div>
          </div>
        </header>

        <SettingsSheet />

        {/* Hero Section - matches Calculator style */}
        <section className="pt-32 pb-12 text-center px-6">
          <div className="max-w-4xl mx-auto">
            <ThemedLogo className="h-32 md:h-40 object-contain mx-auto mb-6" />
            <h1 className="font-display text-6xl md:text-8xl text-primary tracking-wide leading-none mb-2 neon-glow-subtle">
              {heroContent.title}
            </h1>
            <h1 className="font-display text-6xl md:text-8xl text-foreground tracking-wide leading-none">
              {heroContent.titleAccent}
            </h1>
            <p className="text-primary font-display text-xl md:text-2xl tracking-wide mt-6 neon-glow-subtle">
              {heroContent.tagline}
            </p>

            {/* Voice indicator */}
            <div className="flex items-center justify-center gap-2 mt-6 text-sm">
              {voiceEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">
                    {voiceType === "male" ? "Male" : "Female"} voice guidance enabled
                  </span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Voice guidance disabled</span>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Description Card - matches Calculator style */}
            <div className="bg-card border-2 border-primary/30 neon-border-subtle rounded-lg p-8 md:p-10 mb-10 text-center max-w-4xl mx-auto">
              <p className="text-muted-foreground leading-relaxed mb-4">
                {heroContent.intro}{' '}
                <span className="text-primary font-semibold">{heroContent.emphasis}</span>.
              </p>
              
              <p className="text-muted-foreground leading-relaxed mb-4">
                {heroContent.description}{' '}
                <span className="text-primary font-semibold">{heroContent.descEmphasis}</span>
                {heroContent.descEnd}
              </p>
              
              <p className="text-muted-foreground leading-relaxed">
                {heroContent.goal}{' '}
                <span className="text-primary font-semibold">{heroContent.goalEmphasis}</span>{' '}
                {heroContent.goalEnd}
              </p>
              
              <p className="text-primary font-display text-2xl tracking-wide mt-6 neon-glow-subtle">
                {heroContent.hashtag}
              </p>
            </div>

            {/* Exercise Selection Header */}
            <h2 className="font-display text-2xl text-primary mb-8 tracking-wide text-center neon-glow-subtle">
              SELECT YOUR SESSION
            </h2>

            {/* Exercise Cards Grid - matches Calculator grid */}
            <div className="grid md:grid-cols-1 gap-6 max-w-lg mx-auto">
              {getVisibleExercises().map((exercise) => (
                <Card
                  key={exercise.id}
                  className="bg-card border-2 border-primary/30 neon-border-subtle border-l-4 border-l-primary p-6 cursor-pointer hover:bg-muted/50 transition-all group"
                  onClick={() => selectExercise(exercise)}
                >
                  {/* Icon & Title */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      {getIntensityIcon(exercise.intensity)}
                    </div>
                    <div>
                      <h3 className="font-display text-xl text-foreground tracking-wide">
                        {exercise.name}
                      </h3>
                      <p className="text-xs text-primary font-display">{exercise.duration}</p>
                    </div>
                  </div>

                  {/* Tagline */}
                  <p className="text-primary font-display text-sm tracking-wide mb-3">
                    {exercise.tagline}
                  </p>
                  
                  {/* Description */}
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    {exercise.description}
                  </p>

                  {/* Meta info */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border">
                    <span>{exercise.cycles} cycles</span>
                    <span className="capitalize">{exercise.intensity} intensity</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </main>

        {/* Coach Banner - Bottom of page */}
        <section className="container mx-auto px-6 py-12 border-t border-border">
          <Link to="/help" className="block max-w-3xl mx-auto">
            <Card className="border-2 border-primary/40 bg-primary/5 p-6 hover:bg-primary/10 transition-all neon-border-subtle">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center neon-glow">
                    <Flame className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <p className="font-display text-xl tracking-wide text-foreground">
                      NEED MORE? <span className="text-primary neon-glow-subtle">ASK YOUR COACH</span>
                    </p>
                    <p className="text-muted-foreground mt-1">
                      Mindset tips, stress management, and mental performance coaching
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 text-primary hidden sm:block" />
              </div>
            </Card>
          </Link>
        </section>

        <UnifiedFooter className="mt-16" />
      </div>
    );
  }

  // Countdown view with welcome message
  if (view === "countdown") {
    return (
      <CountdownOverlay
        isActive={true}
        onComplete={handleCountdownComplete}
        startFrom={3}
        exerciseName={selectedExercise?.name}
        welcomeMessage={selectedExercise?.scripts.intro}
        onPlayAudio={handleCountdownAudio}
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
          {/* Voice indicator */}
          {voiceEnabled && (
            <div className="flex items-center justify-center gap-1 mt-2">
              <Volume2 className="w-3 h-3 text-primary" />
              <span className="text-xs text-muted-foreground">Voice on</span>
            </div>
          )}
        </div>

        {/* Halfway message */}
        <AnimatePresence>
          {showHalfwayMessage && selectedExercise && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-28 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur border border-primary px-6 py-3 rounded-lg max-w-sm text-center"
            >
              <p className="text-foreground text-sm">{selectedExercise.scripts.halfway}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Breathing Visual - combined orb + progress ring */}
        <div className="relative mb-8">
          <BreathingVisual
            phase={phase}
            progress={progress}
            phaseDuration={selectedExercise?.phases[phase === "rest" ? "exhale" : (phase === "complete" ? "exhale" : phase)] || 4}
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