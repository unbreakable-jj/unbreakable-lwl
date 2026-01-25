export type ActivityType = 'walk' | 'run' | 'cycle';
export type CardioGoal = 'fitness' | 'distance' | 'speed' | 'endurance' | 'weight_loss';
export type CardioLevel = 'beginner' | 'intermediate' | 'advanced';

export interface CardioFormData {
  activityType: ActivityType;
  goal: CardioGoal;
  currentLevel: CardioLevel;
  sessionsPerWeek: number;
  sessionLength: number;
  targetDistance?: string;
  currentPace?: string;
  age?: number;
  gender?: 'male' | 'female';
}

export interface CardioSessionSegment {
  segment: string;
  duration: string;
  notes?: string;
}

export interface CardioSession {
  day: string;
  sessionType: string;
  duration: string;
  distance?: string;
  intensity: string;
  warmup: string;
  mainSession: CardioSessionSegment[];
  cooldown: string;
  notes?: string;
}

export interface CardioWeek {
  weekNumber: number;
  phase: string;
  totalDistance?: string;
  sessions: CardioSession[];
}

export interface CardioPhase {
  name: string;
  weeks: string;
  focus: string;
  notes: string;
}

export interface CardioScheduleDay {
  day: string;
  focus: string;
  type: ActivityType | 'cross_training' | 'rest' | 'active_recovery';
}

export interface GeneratedCardioProgram {
  programName: string;
  overview: string;
  activityType: ActivityType;
  weeklySchedule: CardioScheduleDay[];
  phases: CardioPhase[];
  weeks: CardioWeek[];
  progressionRules: string[];
  recoveryTips: string[];
  nutritionTips: string[];
}

export const activityLabels: Record<ActivityType, string> = {
  walk: 'Walking',
  run: 'Running',
  cycle: 'Cycling',
};

export const goalLabels: Record<CardioGoal, string> = {
  fitness: 'General Fitness',
  distance: 'Build Distance',
  speed: 'Improve Speed',
  endurance: 'Build Endurance',
  weight_loss: 'Weight Loss',
};

export const goalDescriptions: Record<CardioGoal, string> = {
  fitness: 'Overall cardiovascular health',
  distance: 'Train for longer distances',
  speed: 'Get faster at your target distance',
  endurance: 'Increase stamina and capacity',
  weight_loss: 'Optimize fat burning',
};

export const levelLabels: Record<CardioLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export const levelDescriptions: Record<CardioLevel, string> = {
  beginner: 'New to consistent training',
  intermediate: '6+ months regular activity',
  advanced: '2+ years structured training',
};
