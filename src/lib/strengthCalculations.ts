// Strength calculation utilities

export type Gender = 'male' | 'female';
export type Exercise = 'bench' | 'squat' | 'deadlift' | 'ohp';

export interface StrengthResult {
  oneRepMax: number;
  level: StrengthLevel;
  percentile: number;
  ratio: number;
}

export interface StrengthLevel {
  name: string;
  stars: number;
  color: string;
}

// Epley formula for 1RM estimation
export function calculateOneRepMax(weight: number, reps: number): number {
  if (reps === 1) return weight;
  if (reps <= 0 || weight <= 0) return 0;
  return Math.round(weight * (1 + reps / 30));
}

// Strength standards (bodyweight multipliers) for each level
// Based on commonly accepted strength standards
const strengthStandards: Record<Exercise, Record<Gender, number[]>> = {
  // [Beginner, Novice, Intermediate, Advanced, Elite]
  bench: {
    male: [0.5, 0.75, 1.0, 1.25, 1.5],
    female: [0.25, 0.4, 0.6, 0.8, 1.0],
  },
  squat: {
    male: [0.75, 1.0, 1.5, 2.0, 2.5],
    female: [0.5, 0.75, 1.0, 1.35, 1.75],
  },
  deadlift: {
    male: [1.0, 1.25, 1.75, 2.25, 3.0],
    female: [0.75, 1.0, 1.25, 1.75, 2.25],
  },
  ohp: {
    male: [0.35, 0.5, 0.65, 0.85, 1.0],
    female: [0.2, 0.3, 0.4, 0.55, 0.7],
  },
};

const levels: StrengthLevel[] = [
  { name: 'Beginner', stars: 1, color: 'hsl(var(--muted-foreground))' },
  { name: 'Novice', stars: 2, color: 'hsl(var(--accent))' },
  { name: 'Intermediate', stars: 3, color: 'hsl(var(--primary))' },
  { name: 'Advanced', stars: 4, color: 'hsl(var(--secondary))' },
  { name: 'Elite', stars: 5, color: 'hsl(var(--primary))' },
];

export function calculateStrengthLevel(
  oneRepMax: number,
  bodyweight: number,
  exercise: Exercise,
  gender: Gender
): StrengthResult {
  const standards = strengthStandards[exercise][gender];
  const ratio = oneRepMax / bodyweight;
  
  let levelIndex = 0;
  let percentile = 5;
  
  if (ratio >= standards[4]) {
    levelIndex = 4;
    percentile = 99;
  } else if (ratio >= standards[3]) {
    levelIndex = 4;
    const progress = (ratio - standards[3]) / (standards[4] - standards[3]);
    percentile = Math.round(95 + progress * 4);
  } else if (ratio >= standards[2]) {
    levelIndex = 3;
    const progress = (ratio - standards[2]) / (standards[3] - standards[2]);
    percentile = Math.round(80 + progress * 15);
  } else if (ratio >= standards[1]) {
    levelIndex = 2;
    const progress = (ratio - standards[1]) / (standards[2] - standards[1]);
    percentile = Math.round(50 + progress * 30);
  } else if (ratio >= standards[0]) {
    levelIndex = 1;
    const progress = (ratio - standards[0]) / (standards[1] - standards[0]);
    percentile = Math.round(20 + progress * 30);
  } else {
    levelIndex = 0;
    const progress = ratio / standards[0];
    percentile = Math.round(Math.max(1, progress * 20));
  }
  
  return {
    oneRepMax,
    level: levels[levelIndex],
    percentile,
    ratio: Math.round(ratio * 100) / 100,
  };
}

export const exerciseNames: Record<Exercise, string> = {
  bench: 'Bench Press',
  squat: 'Back Squat',
  deadlift: 'Deadlift',
  ohp: 'Overhead Press',
};
