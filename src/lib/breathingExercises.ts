export interface BreathingExercise {
  id: string;
  name: string;
  tagline: string;
  description: string;
  duration: string;
  durationMinutes: number;
  cycles: number;
  phases: {
    inhale: number; // seconds
    hold: number;
    exhale: number;
    rest?: number;
  };
  scripts: {
    intro: string;
    inhale: string;
    hold: string;
    exhale: string;
    rest?: string;
    halfway: string;
    closing: string;
  };
  intensity: "high" | "medium" | "calm";
  color: string;
}

export const BREATHING_EXERCISES: BreathingExercise[] = [
  {
    id: "power-breath",
    name: "POWER BREATH",
    tagline: "Ignite Your Fire",
    description: "High-intensity controlled breathing to energize your body and sharpen focus. Rapid cycles build internal heat and mental clarity.",
    duration: "3 MIN",
    durationMinutes: 3,
    cycles: 18,
    phases: {
      inhale: 3,
      hold: 3,
      exhale: 4,
    },
    scripts: {
      intro: "Welcome to Power Breath. We're about to ignite your inner fire. Find your stance. This is where you become unbreakable.",
      inhale: "BREATHE IN — fill your lungs completely",
      hold: "HOLD — feel the energy build",
      exhale: "RELEASE — let it all go",
      halfway: "You're halfway there. Keep showing up. Every breath makes you stronger.",
      closing: "Session complete. You've unlocked your power. Carry this energy with you. Stay unbreakable.",
    },
    intensity: "high",
    color: "from-primary to-[hsl(20,100%,45%)]",
  },
  {
    id: "focus-flow",
    name: "FOCUS FLOW",
    tagline: "Sharpen Your Mind",
    description: "Balanced rhythmic breathing for peak mental performance. The steady 4-4-4 pattern trains your nervous system for calm under pressure.",
    duration: "4 MIN",
    durationMinutes: 4,
    cycles: 20,
    phases: {
      inhale: 4,
      hold: 4,
      exhale: 4,
    },
    scripts: {
      intro: "Welcome to Focus Flow. Clear the noise. Your mind is about to become your greatest weapon.",
      inhale: "IN — steady and deep",
      hold: "HOLD — quiet your mind",
      exhale: "OUT — release all tension",
      halfway: "Halfway through. Your focus sharpens with every cycle. Keep showing up.",
      closing: "Complete. Your mind is clear, your focus razor-sharp. You are unbreakable.",
    },
    intensity: "medium",
    color: "from-[hsl(30,100%,50%)] to-primary",
  },
  {
    id: "deep-reset",
    name: "DEEP RESET",
    tagline: "Restore & Recover",
    description: "Slow, deep breathing for recovery and stress release. Extended exhales activate your parasympathetic nervous system for total reset.",
    duration: "5 MIN",
    durationMinutes: 5,
    cycles: 15,
    phases: {
      inhale: 4,
      hold: 4,
      exhale: 6,
      rest: 2,
    },
    scripts: {
      intro: "Welcome to Deep Reset. It's time to restore. Slow down. Breathe with intention. Recovery is where strength is built.",
      inhale: "BREATHE IN — deep into your belly",
      hold: "HOLD — embrace the stillness",
      exhale: "EXHALE SLOWLY — release everything",
      rest: "REST — feel the calm",
      halfway: "Halfway. Each breath rebuilds you. Keep showing up, even in stillness.",
      closing: "Reset complete. You've restored your power. Go forward unbreakable.",
    },
    intensity: "calm",
    color: "from-[hsl(35,100%,50%)] to-[hsl(25,100%,45%)]",
  },
];

export const getExerciseById = (id: string): BreathingExercise | undefined => {
  return BREATHING_EXERCISES.find((ex) => ex.id === id);
};

export const getPhaseText = (
  exercise: BreathingExercise,
  phase: "inhale" | "hold" | "exhale" | "rest" | "idle" | "complete"
): string => {
  switch (phase) {
    case "inhale":
      return exercise.scripts.inhale;
    case "hold":
      return exercise.scripts.hold;
    case "exhale":
      return exercise.scripts.exhale;
    case "rest":
      return exercise.scripts.rest || "REST";
    case "complete":
      return exercise.scripts.closing;
    default:
      return "READY";
  }
};
