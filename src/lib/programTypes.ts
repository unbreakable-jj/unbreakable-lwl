export type Goal = 'strength' | 'muscle' | 'endurance' | 'fat_loss' | 'hybrid' | 'athletic';
export type Level = 'beginner' | 'intermediate' | 'advanced';
export type Commitment = 'realistic' | 'committed' | 'aggressive';

export interface ProgramFormData {
  goal: Goal;
  availability: number;
  sessionLength: number;
  level: Level;
  commitment: Commitment;
  strengthData?: {
    benchMax?: number;
    squatMax?: number;
    deadliftMax?: number;
    ohpMax?: number;
  };
  speedData?: {
    fiveKTime?: string;
    tenKTime?: string;
    pacePerKm?: string;
  };
  bodyweight?: number;
  age?: number;
  gender?: 'male' | 'female';
}

export interface Exercise {
  id?: string;
  name: string;
  bodyPart?: string;
  equipment: 'barbell' | 'dumbbell' | 'bodyweight' | 'running' | 'machine' | 'cable' | 'kettlebell' | 'bands' | 'cardio';
  sets: number | string;
  reps: string;
  intensity: string;
  rest: string;
  notes?: string;
}

export interface WorkoutDay {
  day: string;
  sessionType: string;
  duration: string;
  warmup: string;
  exercises: Exercise[];
  cooldown: string;
}

export interface ProgramWeek {
  weekNumber: number;
  phase: string;
  isDeload: boolean;
  days: WorkoutDay[];
}

export interface PhaseProgression {
  phase: string;
  adjustments: string;
}

export interface TemplateWeek {
  days: WorkoutDay[];
}

export interface ProgramPhase {
  name: string;
  weeks: string;
  focus: string;
  notes: string;
}

export interface WeeklyScheduleDay {
  day: string;
  focus: string;
  type: 'strength' | 'running' | 'rest' | 'active_recovery';
}

export interface GeneratedProgram {
  programName: string;
  overview: string;
  weeklySchedule: WeeklyScheduleDay[];
  phases: ProgramPhase[];
  templateWeek?: TemplateWeek;
  weeks?: ProgramWeek[];
  phaseProgressions?: PhaseProgression[];
  progressionRules: string[];
  nutritionTips: string[];
}

export const goalLabels: Record<Goal, string> = {
  strength: 'Build Strength',
  muscle: 'Build Muscle',
  endurance: 'Improve Endurance',
  fat_loss: 'Lose Fat',
  hybrid: 'Hybrid Athlete',
  athletic: 'Athletic Performance',
};

export const goalDescriptions: Record<Goal, string> = {
  strength: 'Maximize your 1RM on key lifts',
  muscle: 'Hypertrophy-focused for muscle growth',
  endurance: 'Improve cardiovascular capacity',
  fat_loss: 'Metabolic training for body recomp',
  hybrid: 'Balance strength and conditioning',
  athletic: 'Power, speed, and agility focus',
};

export const levelLabels: Record<Level, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export const levelDescriptions: Record<Level, string> = {
  beginner: 'Less than 1 year training',
  intermediate: '1-3 years consistent training',
  advanced: '3+ years serious training',
};

export const commitmentLabels: Record<Commitment, string> = {
  realistic: 'Realistic',
  committed: 'Committed',
  aggressive: 'Aggressive',
};

export const commitmentDescriptions: Record<Commitment, string> = {
  realistic: 'Sustainable progress with flexibility',
  committed: 'Consistent effort and dedication',
  aggressive: 'Maximum intensity, rapid results',
};
