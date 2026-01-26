import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '@/assets/logo.png';
import { useAuth } from '@/hooks/useAuth';
import { NavigationDrawer } from '@/components/NavigationDrawer';
import { UnifiedFooter } from '@/components/UnifiedFooter';
import { CardioTrackerModal } from '@/components/tracker/CardioTrackerModal';
import { AuthModal } from '@/components/tracker/AuthModal';
import { CardioProgramDisplay } from '@/components/cardio/CardioProgramDisplay';
import { SavedCardioPrograms } from '@/components/cardio/SavedCardioPrograms';
import { CardioModeSelector } from '@/components/cardio/CardioModeSelector';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { useCardioPrograms } from '@/hooks/useCardioPrograms';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Timer, 
  Footprints, 
  Zap, 
  Bike, 
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  Target,
  Sparkles,
  Heart,
  Flame,
  Loader2,
  Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ActivityType as CardioActivityType,
  CardioGoal,
  CardioLevel,
  CardioFormData,
  GeneratedCardioProgram,
  activityLabels,
  goalLabels,
  goalDescriptions,
  levelLabels,
  levelDescriptions,
} from '@/lib/cardioTypes';

type ActivityType = 'walk' | 'run' | 'cycle' | null;
type ViewState = 'select' | 'wizard' | 'program' | 'track';

const Tracker = () => {
  const { user, loading } = useAuth();
  const { saveProgram: saveProgramMutation } = useCardioPrograms();
  const { toast } = useToast();
  
  const [view, setView] = useState<ViewState>('select');
  const [showCardioModal, setShowCardioModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityType>(null);
  const [generatedProgram, setGeneratedProgram] = useState<GeneratedCardioProgram | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Form data
  const [formData, setFormData] = useState<CardioFormData>({
    activityType: 'run',
    goal: 'fitness',
    currentLevel: 'beginner',
    sessionsPerWeek: 3,
    sessionLength: 30,
  });

  const activityOptions: { value: CardioActivityType; label: string; icon: React.ReactNode; description: string }[] = [
    { value: 'walk', label: 'WALK', icon: <Footprints className="w-10 h-10" />, description: 'Low-impact, steady state' },
    { value: 'run', label: 'RUN', icon: <Zap className="w-10 h-10" />, description: 'Build speed & power' },
    { value: 'cycle', label: 'CYCLE', icon: <Bike className="w-10 h-10" />, description: 'Leg power, zero impact' },
  ];

  const goalOptions: { value: CardioGoal; icon: React.ReactNode }[] = [
    { value: 'fitness', icon: <Heart className="w-6 h-6" /> },
    { value: 'distance', icon: <TrendingUp className="w-6 h-6" /> },
    { value: 'speed', icon: <Zap className="w-6 h-6" /> },
    { value: 'endurance', icon: <Timer className="w-6 h-6" /> },
    { value: 'weight_loss', icon: <Flame className="w-6 h-6" /> },
  ];

  const handleActivitySelect = (activity: ActivityType) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setSelectedActivity(activity);
    setShowCardioModal(true);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.activityType !== null;
      case 2: return formData.goal !== null;
      case 3: return formData.currentLevel !== null;
      case 4: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleGenerate();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerate = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-cardio-program', {
        body: formData,
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setGeneratedProgram(data.program);
      setView('program');
      toast({
        title: 'Programme Generated',
        description: `Your ${activityLabels[formData.activityType]} programme is ready!`,
      });
    } catch (error) {
      console.error('Generate error:', error);
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveProgram = async () => {
    if (!generatedProgram) return;
    setIsSaving(true);
    try {
      await saveProgramMutation.mutateAsync(generatedProgram);
      handleReset();
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewSavedProgram = (program: GeneratedCardioProgram) => {
    setGeneratedProgram(program);
    setView('program');
  };

  const handleReset = () => {
    setGeneratedProgram(null);
    setCurrentStep(1);
    setView('select');
    setFormData({
      activityType: 'run',
      goal: 'fitness',
      currentLevel: 'beginner',
      sessionsPerWeek: 3,
      sessionLength: 30,
    });
  };

  const handleModeSelect = (mode: 'auto' | 'manual') => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (mode === 'auto') {
      setView('wizard');
    } else {
      // Manual mode - go straight to quick track
      setView('track');
    }
  };

  const handleBackToSelect = () => {
    setView('select');
    setCurrentStep(1);
  };

  const getStepLabel = () => {
    switch (currentStep) {
      case 1: return 'SELECT ACTIVITY';
      case 2: return 'SET GOAL';
      case 3: return 'YOUR LEVEL';
      case 4: return 'OPTIONAL DETAILS';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Program display view
  if (view === 'program' && generatedProgram) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-3">
                <img src={logo} alt="Unbreakable" className="h-10 object-contain" />
                <div className="hidden sm:block">
                  <span className="font-display text-lg tracking-wide text-foreground">
                    UNBREAKABLE
                  </span>
                  <span className="font-display text-sm tracking-wide text-primary ml-2">
                    CARDIO
                  </span>
                </div>
              </Link>
              <NavigationDrawer variant="minimal" />
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <CardioProgramDisplay
            program={generatedProgram}
            onSave={handleSaveProgram}
            onBack={handleReset}
            isSaving={isSaving}
          />
        </main>
      </div>
    );
  }

  // Mode selection view
  if (view === 'select') {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-3">
                <img src={logo} alt="Unbreakable" className="h-10 object-contain" />
                <div className="hidden sm:block">
                  <span className="font-display text-lg tracking-wide text-foreground">
                    UNBREAKABLE
                  </span>
                  <span className="font-display text-sm tracking-wide text-primary ml-2">
                    CARDIO
                  </span>
                </div>
              </Link>
              <div className="flex items-center gap-3">
                {!user && (
                  <Button
                    className="font-display tracking-wide"
                    onClick={() => setShowAuthModal(true)}
                  >
                    SIGN IN
                  </Button>
                )}
                <NavigationDrawer variant="minimal" />
              </div>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="py-12 md:py-16 border-b border-border">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="font-display text-5xl sm:text-6xl md:text-8xl tracking-wide leading-none mb-2">
                <span className="text-foreground">BECOME </span>
                <span className="text-primary neon-glow-subtle">UNBREAKABLE</span>
              </h1>
              <p className="text-primary font-display text-xl md:text-2xl tracking-wide mt-6 neon-glow-subtle">
                LIVE WITHOUT LIMITS
              </p>
              <p className="text-muted-foreground text-base md:text-lg mt-4 max-w-2xl mx-auto">
                Choose how you want to train. Build a personalised 12-week programme or 
                start a quick tracking session for Walk, Run, or Cycle activities.
              </p>
              <p className="text-primary font-display text-lg mt-3 neon-glow-subtle">KEEP SHOWING UP.</p>
            </motion.div>
          </div>
        </section>

        {/* Mode Selector */}
        <main className="container mx-auto px-4 py-8 md:py-12">
          <CardioModeSelector onSelectMode={handleModeSelect} />
        </main>

        {/* Saved Programmes Section */}
        {user && (
          <section className="container mx-auto px-4 py-8 border-t border-border">
            <div className="max-w-3xl mx-auto">
              <h2 className="font-display text-2xl text-foreground mb-6 flex items-center gap-2">
                <Timer className="w-6 h-6 text-primary" />
                MY CARDIO PROGRAMMES
              </h2>
              <SavedCardioPrograms onViewProgram={handleViewSavedProgram} />
            </div>
          </section>
        )}

        <UnifiedFooter className="mt-auto" />
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>
    );
  }

  // Quick track view
  if (view === 'track') {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-3">
                <img src={logo} alt="Unbreakable" className="h-10 object-contain" />
                <div className="hidden sm:block">
                  <span className="font-display text-lg tracking-wide text-foreground">
                    UNBREAKABLE
                  </span>
                  <span className="font-display text-sm tracking-wide text-primary ml-2">
                    CARDIO
                  </span>
                </div>
              </Link>
              <NavigationDrawer variant="minimal" />
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 md:py-12">
          <Button variant="ghost" onClick={handleBackToSelect} className="mb-6 gap-2">
            <Home className="w-4 h-4" />
            Back to Selection
          </Button>

          <h2 className="font-display text-3xl text-center mb-8 tracking-wide">
            QUICK <span className="text-primary neon-glow-subtle">TRACK</span>
          </h2>
          <p className="text-muted-foreground text-center mb-8 max-w-lg mx-auto">
            Start a cardio session immediately. Choose your activity to begin tracking with GPS or log manually.
          </p>

          <div className="max-w-2xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              {activityOptions.map((option) => (
                <Card
                  key={option.value}
                  className="cursor-pointer transition-all border-2 border-border hover:border-primary/50 hover:bg-primary/5"
                  onClick={() => handleActivitySelect(option.value)}
                >
                  <CardContent className="p-8 text-center">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <div className="text-primary">{option.icon}</div>
                    </div>
                    <h3 className="font-display text-2xl tracking-wide mb-2">{option.label}</h3>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>

        <UnifiedFooter className="mt-auto" />
        <CardioTrackerModal
          isOpen={showCardioModal}
          onClose={() => {
            setShowCardioModal(false);
            setSelectedActivity(null);
          }}
          initialActivity={selectedActivity || undefined}
        />
      </div>
    );
  }

  // Main wizard view (auto programme builder)
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img src={logo} alt="Unbreakable" className="h-10 object-contain" />
              <div className="hidden sm:block">
                <span className="font-display text-lg tracking-wide text-foreground">
                  UNBREAKABLE
                </span>
                <span className="font-display text-sm tracking-wide text-primary ml-2">
                  CARDIO
                </span>
              </div>
            </Link>
            <NavigationDrawer variant="minimal" />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-8 md:py-12 border-b border-border">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display text-4xl sm:text-5xl tracking-wide leading-none mb-2">
              BUILD YOUR <span className="text-primary neon-glow-subtle">PROGRAMME</span>
            </h1>
            <p className="text-muted-foreground mt-4">
              Answer a few questions to get a personalised 12-week cardio plan.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Back Button */}
      <div className="container mx-auto px-4 pt-6">
        <Button variant="ghost" onClick={handleBackToSelect} className="gap-2">
          <Home className="w-4 h-4" />
          Back to Selection
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="bg-card border-b border-border py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-primary font-display">{getStepLabel()}</span>
          </div>
          <div className="h-2 bg-surface rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Form Steps */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step 1: Activity Type */}
              {currentStep === 1 && (
                <div>
                  <h2 className="font-display text-2xl text-center mb-8 tracking-wide">
                    SELECT YOUR <span className="text-primary neon-glow-subtle">ACTIVITY</span>
                  </h2>
                  <div className="grid md:grid-cols-3 gap-6">
                    {activityOptions.map((option) => (
                      <Card
                        key={option.value}
                        className={`cursor-pointer transition-all ${
                          formData.activityType === option.value
                            ? 'border-primary bg-primary/10 neon-border-subtle'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setFormData({ ...formData, activityType: option.value })}
                      >
                        <CardContent className="p-8 text-center">
                          <div className={`w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 ${
                            formData.activityType === option.value ? 'neon-border-subtle' : ''
                          }`}>
                            <div className={formData.activityType === option.value ? 'text-primary' : 'text-muted-foreground'}>
                              {option.icon}
                            </div>
                          </div>
                          <h3 className="font-display text-2xl tracking-wide mb-2">{option.label}</h3>
                          <p className="text-sm text-muted-foreground">{option.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Goal */}
              {currentStep === 2 && (
                <div>
                  <h2 className="font-display text-2xl text-center mb-8 tracking-wide">
                    WHAT'S YOUR <span className="text-primary neon-glow-subtle">GOAL</span>?
                  </h2>
                  <div className="space-y-3">
                    {goalOptions.map((option) => (
                      <Card
                        key={option.value}
                        className={`cursor-pointer transition-all ${
                          formData.goal === option.value
                            ? 'border-primary bg-primary/10 neon-border-subtle'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setFormData({ ...formData, goal: option.value })}
                      >
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center ${
                            formData.goal === option.value ? 'text-primary' : 'text-muted-foreground'
                          }`}>
                            {option.icon}
                          </div>
                          <div className="flex-1">
                            <p className="font-display tracking-wide text-lg">{goalLabels[option.value]}</p>
                            <p className="text-sm text-muted-foreground">{goalDescriptions[option.value]}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Level & Schedule */}
              {currentStep === 3 && (
                <div>
                  <h2 className="font-display text-2xl text-center mb-8 tracking-wide">
                    YOUR <span className="text-primary neon-glow-subtle">LEVEL</span> & SCHEDULE
                  </h2>
                  
                  <div className="space-y-8">
                    {/* Level */}
                    <div className="bg-card border-2 border-primary/30 neon-border-subtle rounded-lg p-6">
                      <Label className="font-display tracking-wide text-muted-foreground mb-4 block">
                        EXPERIENCE LEVEL
                      </Label>
                      <RadioGroup
                        value={formData.currentLevel}
                        onValueChange={(v) => setFormData({ ...formData, currentLevel: v as CardioLevel })}
                        className="grid md:grid-cols-3 gap-4"
                      >
                        {(['beginner', 'intermediate', 'advanced'] as CardioLevel[]).map((level) => (
                          <Label
                            key={level}
                            className={`flex flex-col items-center p-6 rounded-lg border-2 cursor-pointer transition-all ${
                              formData.currentLevel === level
                                ? 'border-primary bg-primary/10 neon-border-subtle'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <RadioGroupItem value={level} className="sr-only" />
                            <span className="font-display text-lg tracking-wide">{levelLabels[level]}</span>
                            <span className="text-xs text-muted-foreground mt-2 text-center">{levelDescriptions[level]}</span>
                          </Label>
                        ))}
                      </RadioGroup>
                    </div>

                    {/* Sessions per week */}
                    <div className="bg-card border-2 border-primary/30 neon-border-subtle rounded-lg p-6">
                      <Label className="font-display tracking-wide text-muted-foreground mb-4 block">
                        SESSIONS PER WEEK: <span className="text-primary neon-glow-subtle">{formData.sessionsPerWeek}</span>
                      </Label>
                      <Slider
                        value={[formData.sessionsPerWeek]}
                        onValueChange={([v]) => setFormData({ ...formData, sessionsPerWeek: v })}
                        min={2}
                        max={6}
                        step={1}
                        className="mb-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>2 days</span>
                        <span>6 days</span>
                      </div>
                    </div>

                    {/* Session length */}
                    <div className="bg-card border-2 border-primary/30 neon-border-subtle rounded-lg p-6">
                      <Label className="font-display tracking-wide text-muted-foreground mb-4 block">
                        SESSION LENGTH: <span className="text-primary neon-glow-subtle">{formData.sessionLength} mins</span>
                      </Label>
                      <Slider
                        value={[formData.sessionLength]}
                        onValueChange={([v]) => setFormData({ ...formData, sessionLength: v })}
                        min={20}
                        max={90}
                        step={5}
                        className="mb-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>20 min</span>
                        <span>90 min</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Optional Details */}
              {currentStep === 4 && (
                <div>
                  <h2 className="font-display text-2xl text-center mb-8 tracking-wide">
                    OPTIONAL <span className="text-primary neon-glow-subtle">DETAILS</span>
                  </h2>
                  
                  <div className="bg-card border-2 border-primary/30 neon-border-subtle rounded-lg p-6 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label className="font-display tracking-wide text-muted-foreground mb-2 block text-sm">
                          TARGET DISTANCE
                        </Label>
                        <Input
                          placeholder="e.g., 5K, 10K, Half Marathon"
                          value={formData.targetDistance || ''}
                          onChange={(e) => setFormData({ ...formData, targetDistance: e.target.value })}
                          className="border-primary/40 focus:border-primary"
                        />
                      </div>
                      <div>
                        <Label className="font-display tracking-wide text-muted-foreground mb-2 block text-sm">
                          CURRENT PACE
                        </Label>
                        <Input
                          placeholder="e.g., 6:30/km"
                          value={formData.currentPace || ''}
                          onChange={(e) => setFormData({ ...formData, currentPace: e.target.value })}
                          className="border-primary/40 focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label className="font-display tracking-wide text-muted-foreground mb-2 block text-sm">
                          AGE
                        </Label>
                        <Input
                          type="number"
                          placeholder="Your age"
                          value={formData.age || ''}
                          onChange={(e) => setFormData({ ...formData, age: e.target.value ? parseInt(e.target.value) : undefined })}
                          className="border-primary/40 focus:border-primary"
                        />
                      </div>
                      <div>
                        <Label className="font-display tracking-wide text-muted-foreground mb-2 block text-sm">
                          GENDER
                        </Label>
                        <RadioGroup
                          value={formData.gender || ''}
                          onValueChange={(v) => setFormData({ ...formData, gender: v as 'male' | 'female' })}
                          className="flex gap-6 mt-3"
                        >
                          <Label className="flex items-center gap-2 cursor-pointer">
                            <RadioGroupItem value="male" />
                            <span>Male</span>
                          </Label>
                          <Label className="flex items-center gap-2 cursor-pointer">
                            <RadioGroupItem value="female" />
                            <span>Female</span>
                          </Label>
                        </RadioGroup>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>

            <Button
              onClick={handleNext}
              disabled={!canProceed() || isGenerating}
              className="gap-2 min-w-[180px]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : currentStep === totalSteps ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  Build Programme
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </main>

      {/* Hashtag */}
      <section className="container mx-auto px-4 py-8 text-center">
        <p className="text-primary font-display text-2xl md:text-3xl tracking-wide neon-glow-subtle">
          #UNBREAKABLEMOVEMENT
        </p>
      </section>

      <UnifiedFooter className="mt-auto" />

      {/* Modals */}
      <CardioTrackerModal
        isOpen={showCardioModal}
        onClose={() => {
          setShowCardioModal(false);
          setSelectedActivity(null);
        }}
        initialActivity={selectedActivity || undefined}
      />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};

export default Tracker;
