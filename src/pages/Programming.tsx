import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '@/assets/logo.png';
import { Button } from '@/components/ui/button';
import { NavigationDrawer } from '@/components/NavigationDrawer';
import { ProgramFormStep1 } from '@/components/programming/ProgramFormStep1';
import { ProgramFormStep2 } from '@/components/programming/ProgramFormStep2';
import { ProgramFormStep3 } from '@/components/programming/ProgramFormStep3';
import { ProgramFormStep4 } from '@/components/programming/ProgramFormStep4';
import { ProgramDisplay } from '@/components/programming/ProgramDisplay';
import { MyProgramsSection } from '@/components/programming/MyProgramsSection';
import { useAuth } from '@/hooks/useAuth';
import { 
  Goal, 
  Level, 
  Commitment, 
  ProgramFormData, 
  GeneratedProgram,
  goalLabels 
} from '@/lib/programTypes';
import { 
  ArrowLeft, 
  ArrowRight, 
  Loader2, 
  Sparkles,
  Target,
  Dumbbell
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Programming() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProgram, setGeneratedProgram] = useState<GeneratedProgram | null>(null);
  
  // Form state
  const [goal, setGoal] = useState<Goal | null>(null);
  const [availability, setAvailability] = useState(4);
  const [sessionLength, setSessionLength] = useState(60);
  const [level, setLevel] = useState<Level | null>(null);
  const [commitment, setCommitment] = useState<Commitment | null>(null);
  const [strengthData, setStrengthData] = useState<ProgramFormData['strengthData']>({});
  const [speedData, setSpeedData] = useState<ProgramFormData['speedData']>({});
  const [bodyweight, setBodyweight] = useState<number | undefined>();
  const [age, setAge] = useState<number | undefined>();
  const [gender, setGender] = useState<'male' | 'female' | undefined>();

  const totalSteps = 4;

  const canProceed = () => {
    switch (currentStep) {
      case 1: return goal !== null;
      case 2: return true;
      case 3: return level !== null && commitment !== null;
      case 4: return true;
      default: return false;
    }
  };

  const handleNext = () => {
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
    if (!goal || !level || !commitment) return;

    setIsGenerating(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-program`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            goal: goalLabels[goal],
            availability,
            sessionLength,
            level,
            commitment,
            strengthData,
            speedData,
            bodyweight,
            age,
            gender,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate program');
      }

      const data = await response.json();
      setGeneratedProgram(data.program);
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate your program. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setGeneratedProgram(null);
    setCurrentStep(1);
    setGoal(null);
    setLevel(null);
    setCommitment(null);
    setStrengthData({});
    setSpeedData({});
    setBodyweight(undefined);
    setAge(undefined);
    setGender(undefined);
  };

  if (generatedProgram) {
    return (
      <div className="min-h-screen bg-background brick-texture">
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
                    PROGRAMMING
                  </span>
                </div>
              </Link>
              <NavigationDrawer />
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <ProgramDisplay program={generatedProgram} onReset={handleReset} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background brick-texture">
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
                  PROGRAMMING
                </span>
              </div>
            </Link>
            <NavigationDrawer />
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-sm font-display text-primary tracking-wide">
                PERSONALISED PROGRAMMING
              </span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl tracking-wider mb-4">
              <span className="text-foreground">BUILD YOUR</span>
              <br />
              <span className="text-primary">TRAINING PROGRAM</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Get a personalized 12-week training program using barbell, dumbbell, 
              bodyweight exercises, and running. Tailored to your goals, schedule, and current fitness level.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Progress Bar */}
      <div className="bg-card border-b border-border py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-primary font-display">
              {currentStep === 1 && 'SELECT GOAL'}
              {currentStep === 2 && 'SET SCHEDULE'}
              {currentStep === 3 && 'YOUR LEVEL'}
              {currentStep === 4 && 'CURRENT STATS'}
            </span>
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
              {currentStep === 1 && (
                <ProgramFormStep1 
                  selectedGoal={goal} 
                  onSelect={setGoal} 
                />
              )}
              {currentStep === 2 && (
                <ProgramFormStep2
                  availability={availability}
                  sessionLength={sessionLength}
                  onAvailabilityChange={setAvailability}
                  onSessionLengthChange={setSessionLength}
                />
              )}
              {currentStep === 3 && (
                <ProgramFormStep3
                  level={level}
                  commitment={commitment}
                  onLevelChange={setLevel}
                  onCommitmentChange={setCommitment}
                />
              )}
              {currentStep === 4 && (
                <ProgramFormStep4
                  strengthData={strengthData}
                  speedData={speedData}
                  bodyweight={bodyweight}
                  age={age}
                  gender={gender}
                  onStrengthDataChange={setStrengthData}
                  onSpeedDataChange={setSpeedData}
                  onBodyweightChange={setBodyweight}
                  onAgeChange={setAge}
                  onGenderChange={setGender}
                />
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
              className="gap-2 min-w-[160px]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : currentStep === totalSteps ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Program
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

      {/* My Programs Section */}
      {user && (
        <section className="container mx-auto px-4 py-8 border-t border-border">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-2xl text-foreground mb-6 flex items-center gap-2">
              <Dumbbell className="w-6 h-6 text-primary" />
              MY PROGRAMS
            </h2>
            <MyProgramsSection />
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border bg-card py-6 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 Unbreakable. Live Without Limits.
          </p>
        </div>
      </footer>
    </div>
  );
}
