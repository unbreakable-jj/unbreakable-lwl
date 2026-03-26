export interface BreathingExercise {
  id: string;
  name: string;
  tagline: string;
  description: string;
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
  isVisible?: boolean;
}

export const DURATION_OPTIONS = [
  { label: "2 MIN", minutes: 2 },
  { label: "3 MIN", minutes: 3 },
  { label: "5 MIN", minutes: 5 },
  { label: "10 MIN", minutes: 10 },
  { label: "15 MIN", minutes: 15 },
  { label: "20 MIN", minutes: 20 },
];

export const BREATHING_EXERCISES: BreathingExercise[] = [
  {
    id: "power-breath",
    name: "POWER BREATH",
    tagline: "4-7-8 Pattern",
    description: "The scientifically-proven 4-7-8 technique. Inhale for 4, hold for 7, release for 8. This pattern activates your parasympathetic nervous system while building mental resilience.",
    phases: {
      inhale: 4,
      hold: 7,
      exhale: 8,
    },
    scripts: {
      intro: "Find your stance. Ground yourself. Let's begin.",
      inhale: "Breathe in slowly through your nose... fill your lungs completely",
      hold: "Hold it here... feel the stillness... you are in control",
      exhale: "Now release... slowly... let everything go through your mouth",
      halfway: "You're halfway there. Stay present. Each breath is building you stronger.",
      closing: "Beautiful work. You've completed your session. You are calm. You are focused. You are unbreakable.",
    },
    intensity: "high",
    color: "from-primary to-[hsl(20,100%,45%)]",
    isVisible: true,
  },
  {
    id: "box-breathing",
    name: "BOX BREATHING",
    tagline: "4-4-4-4 Pattern",
    description: "The Navy SEAL technique for staying calm under fire. Equal phases of inhale, hold, exhale, hold create total nervous system balance and razor-sharp focus.",
    phases: {
      inhale: 4,
      hold: 4,
      exhale: 4,
      rest: 4,
    },
    scripts: {
      intro: "Box Breathing. Four equal sides. Total control.",
      inhale: "Breathe in gently through your nose... nice and steady",
      hold: "Hold it here... stay calm... stay present",
      exhale: "Breathe out softly through your mouth... let it all go",
      rest: "And rest... embrace the stillness... feel the quiet",
      halfway: "Halfway through. You're doing beautifully. Stay with the rhythm.",
      closing: "Session complete. Your mind is sharp. Your body is calm. You are unbreakable.",
    },
    intensity: "medium",
    color: "from-[hsl(30,100%,50%)] to-primary",
    isVisible: true,
  },
  {
    id: "tactical-calm",
    name: "TACTICAL CALM",
    tagline: "4-2-6 Pattern",
    description: "A rapid stress-reset technique. Short inhale, brief hold, extended exhale. Designed to activate your parasympathetic response fast — when you need calm NOW.",
    phases: {
      inhale: 4,
      hold: 2,
      exhale: 6,
    },
    scripts: {
      intro: "Tactical Calm. Fast reset. Extended exhale.",
      inhale: "Draw the breath in through your nose... deep and steady",
      hold: "Hold... centre yourself",
      exhale: "Now a long, slow release through your mouth... let all the tension melt away",
      halfway: "Halfway there. You're resetting. Stay locked in to the rhythm.",
      closing: "Reset complete. You've found your calm under pressure. You are unbreakable.",
    },
    intensity: "high",
    color: "from-primary to-[hsl(15,100%,45%)]",
    isVisible: true,
  },
  {
    id: "deep-reset",
    name: "DEEP RESET",
    tagline: "4-4-6-2 Pattern",
    description: "Slow, deep breathing for recovery and stress release. Extended exhale with a brief rest activates your parasympathetic nervous system for total restoration.",
    phases: {
      inhale: 4,
      hold: 4,
      exhale: 6,
      rest: 2,
    },
    scripts: {
      intro: "Deep Reset. It's time to restore.",
      inhale: "Breathe in deeply through your nose... feel your chest expand... fill up completely",
      hold: "Hold it here... embrace the stillness... let peace wash over you",
      exhale: "Now exhale slowly through your mouth... release every bit of tension",
      rest: "And rest... be still... feel the calm",
      halfway: "Halfway through your session. Each breath is rebuilding you from the inside out.",
      closing: "Your deep reset is complete. You've restored your power. You are calm. You are strong. You are unbreakable.",
    },
    intensity: "calm",
    color: "from-[hsl(35,100%,50%)] to-[hsl(25,100%,45%)]",
    isVisible: true,
  },
];

export const getVisibleExercises = (): BreathingExercise[] => {
  return BREATHING_EXERCISES.filter((ex) => ex.isVisible !== false);
};

export const getExerciseById = (id: string): BreathingExercise | undefined => {
  return BREATHING_EXERCISES.find((ex) => ex.id === id);
};

export const getCycleDurationSeconds = (exercise: BreathingExercise): number => {
  const { inhale, hold, exhale, rest = 0 } = exercise.phases;
  return inhale + hold + exhale + rest;
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
