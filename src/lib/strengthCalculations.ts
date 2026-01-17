// Strength calculation utilities

export type Gender = 'male' | 'female';
export type Exercise = 
  | 'bench' | 'incline_bench' 
  | 'squat' | 'sumo_squat' 
  | 'deadlift' | 'sumo_deadlift' 
  | 'ohp' 
  | 'db_chest_press' | 'incline_db_chest_press'
  | 'leg_press' 
  | 'bent_over_row' 
  | 'db_shoulder_press'
  | 'barbell_curl' | 'db_curl'
  | 'tricep_dips'
  | 'pull_up' | 'chin_up'
  | 'press_up';
export type AgeGroup = '18-23' | '24-34' | '35-44' | '45-54' | '55-64' | '65+';

export interface StrengthResult {
  oneRepMax: number;
  level: StrengthLevel;
  percentile: number;
  ratio: number;
  ageGroup: AgeGroup;
  ageAdjustedPercentile: number;
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

// Get age group from age
export function getAgeGroup(age: number): AgeGroup {
  if (age < 24) return '18-23';
  if (age < 35) return '24-34';
  if (age < 45) return '35-44';
  if (age < 55) return '45-54';
  if (age < 65) return '55-64';
  return '65+';
}

// Age adjustment multipliers - older lifters get credit for maintaining strength
// These multiply the effective ratio to account for natural decline
const ageAdjustments: Record<AgeGroup, number> = {
  '18-23': 1.0,    // Peak years - baseline
  '24-34': 1.0,    // Still peak performance
  '35-44': 1.08,   // ~8% adjustment
  '45-54': 1.18,   // ~18% adjustment
  '55-64': 1.30,   // ~30% adjustment
  '65+': 1.45,     // ~45% adjustment
};

export const ageGroupLabels: Record<AgeGroup, string> = {
  '18-23': '18-23 years',
  '24-34': '24-34 years',
  '35-44': '35-44 years',
  '45-54': '45-54 years',
  '55-64': '55-64 years',
  '65+': '65+ years',
};

// Strength standards (bodyweight multipliers) for each level
// Based on commonly accepted strength standards
const strengthStandards: Record<Exercise, Record<Gender, number[]>> = {
  // [Beginner, Novice, Intermediate, Advanced, Elite]
  bench: {
    male: [0.5, 0.75, 1.0, 1.25, 1.5],
    female: [0.25, 0.4, 0.6, 0.8, 1.0],
  },
  incline_bench: {
    male: [0.4, 0.65, 0.85, 1.1, 1.35],
    female: [0.2, 0.35, 0.5, 0.7, 0.9],
  },
  squat: {
    male: [0.75, 1.0, 1.5, 2.0, 2.5],
    female: [0.5, 0.75, 1.0, 1.35, 1.75],
  },
  sumo_squat: {
    male: [0.7, 0.95, 1.4, 1.9, 2.4],
    female: [0.45, 0.7, 0.95, 1.3, 1.7],
  },
  deadlift: {
    male: [1.0, 1.25, 1.75, 2.25, 3.0],
    female: [0.75, 1.0, 1.25, 1.75, 2.25],
  },
  sumo_deadlift: {
    male: [1.0, 1.25, 1.75, 2.25, 3.0],
    female: [0.75, 1.0, 1.25, 1.75, 2.25],
  },
  ohp: {
    male: [0.35, 0.5, 0.65, 0.85, 1.0],
    female: [0.2, 0.3, 0.4, 0.55, 0.7],
  },
  db_chest_press: {
    male: [0.2, 0.35, 0.5, 0.65, 0.8],
    female: [0.1, 0.2, 0.3, 0.4, 0.5],
  },
  incline_db_chest_press: {
    male: [0.18, 0.3, 0.45, 0.6, 0.75],
    female: [0.08, 0.18, 0.28, 0.38, 0.48],
  },
  leg_press: {
    male: [1.5, 2.0, 3.0, 4.0, 5.0],
    female: [1.0, 1.5, 2.0, 2.75, 3.5],
  },
  bent_over_row: {
    male: [0.5, 0.7, 0.9, 1.15, 1.4],
    female: [0.3, 0.45, 0.6, 0.75, 0.95],
  },
  db_shoulder_press: {
    male: [0.15, 0.25, 0.35, 0.45, 0.55],
    female: [0.08, 0.15, 0.22, 0.3, 0.4],
  },
  barbell_curl: {
    male: [0.25, 0.4, 0.55, 0.7, 0.85],
    female: [0.15, 0.25, 0.35, 0.45, 0.55],
  },
  db_curl: {
    male: [0.1, 0.18, 0.25, 0.32, 0.4],
    female: [0.05, 0.1, 0.15, 0.2, 0.28],
  },
  tricep_dips: {
    male: [0.5, 0.75, 1.0, 1.35, 1.75],
    female: [0.3, 0.5, 0.7, 0.9, 1.15],
  },
  pull_up: {
    male: [0.5, 0.75, 1.0, 1.35, 1.75],
    female: [0.3, 0.5, 0.7, 0.9, 1.15],
  },
  chin_up: {
    male: [0.55, 0.8, 1.1, 1.45, 1.85],
    female: [0.35, 0.55, 0.75, 0.95, 1.2],
  },
  press_up: {
    male: [0.5, 0.65, 0.8, 1.0, 1.2],
    female: [0.3, 0.45, 0.6, 0.75, 0.9],
  },
};

const levels: StrengthLevel[] = [
  { name: 'Beginner', stars: 1, color: 'hsl(var(--muted-foreground))' },
  { name: 'Novice', stars: 2, color: 'hsl(var(--accent))' },
  { name: 'Intermediate', stars: 3, color: 'hsl(var(--primary))' },
  { name: 'Advanced', stars: 4, color: 'hsl(var(--secondary))' },
  { name: 'Elite', stars: 5, color: 'hsl(var(--primary))' },
];

function calculatePercentileFromRatio(ratio: number, standards: number[]): { levelIndex: number; percentile: number } {
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
  
  return { levelIndex, percentile };
}

export function calculateStrengthLevel(
  oneRepMax: number,
  bodyweight: number,
  exercise: Exercise,
  gender: Gender,
  age: number
): StrengthResult {
  const standards = strengthStandards[exercise][gender];
  const ratio = oneRepMax / bodyweight;
  const ageGroup = getAgeGroup(age);
  const ageAdjustment = ageAdjustments[ageGroup];
  
  // Calculate base percentile (absolute strength)
  const { levelIndex, percentile } = calculatePercentileFromRatio(ratio, standards);
  
  // Calculate age-adjusted percentile (compares to same age group)
  const adjustedRatio = ratio * ageAdjustment;
  const { percentile: ageAdjustedPercentile } = calculatePercentileFromRatio(adjustedRatio, standards);
  
  return {
    oneRepMax,
    level: levels[levelIndex],
    percentile,
    ratio: Math.round(ratio * 100) / 100,
    ageGroup,
    ageAdjustedPercentile: Math.min(99, ageAdjustedPercentile),
  };
}

export const exerciseNames: Record<Exercise, string> = {
  bench: 'Bench Press',
  incline_bench: 'Incline Bench Press',
  squat: 'Squat',
  sumo_squat: 'Sumo Squat',
  deadlift: 'Deadlift',
  sumo_deadlift: 'Sumo Deadlift',
  ohp: 'Overhead Press',
  db_chest_press: 'Dumbbell Chest Press',
  incline_db_chest_press: 'Incline Dumbbell Chest Press',
  leg_press: 'Leg Press',
  bent_over_row: 'Bent Over Row',
  db_shoulder_press: 'Dumbbell Shoulder Press',
  barbell_curl: 'Barbell Curl',
  db_curl: 'Dumbbell Curl',
  tricep_dips: 'Tricep Dips',
  pull_up: 'Pull Up',
  chin_up: 'Chin Up',
  press_up: 'Press Up',
};
