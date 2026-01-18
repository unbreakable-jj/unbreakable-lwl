export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very' | 'extreme';
export type Goal = 'lose' | 'maintain' | 'build' | 'recomp';
export type MacroSplit = 'balanced' | 'high_protein' | 'low_carb' | 'keto' | 'custom';
export type Unit = 'imperial' | 'metric';

export interface FuelResult {
  bmr: number;
  tdee: number;
  targetCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  proteinPercent: number;
  carbPercent: number;
  fatPercent: number;
}

export const activityMultipliers: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very: 1.725,
  extreme: 1.9,
};

export const activityLabels: Record<ActivityLevel, string> = {
  sedentary: 'Sedentary (little to no exercise)',
  light: 'Lightly Active (1-3 days/week)',
  moderate: 'Moderately Active (3-5 days/week)',
  very: 'Very Active (6-7 days/week)',
  extreme: 'Extremely Active (2x per day)',
};

export const goalLabels: Record<Goal, string> = {
  lose: 'Lose Weight',
  maintain: 'Maintain',
  build: 'Build Muscle',
  recomp: 'Recomposition',
};

export const macroSplitLabels: Record<MacroSplit, string> = {
  balanced: 'Balanced (30/40/30)',
  high_protein: 'High Protein (40/35/25)',
  low_carb: 'Low Carb (35/25/40)',
  keto: 'Keto (25/5/70)',
  custom: 'Custom',
};

// Macro splits: [protein%, carbs%, fat%]
export const macroSplits: Record<Exclude<MacroSplit, 'custom'>, [number, number, number]> = {
  balanced: [30, 40, 30],
  high_protein: [40, 35, 25],
  low_carb: [35, 25, 40],
  keto: [25, 5, 70],
};

export function calculateBMR(
  gender: Gender,
  weightKg: number,
  heightCm: number,
  age: number
): number {
  // Mifflin-St Jeor Equation
  if (gender === 'male') {
    return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }
}

export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return bmr * activityMultipliers[activityLevel];
}

export function calculateTargetCalories(tdee: number, goal: Goal): number {
  switch (goal) {
    case 'lose':
      return tdee - 500; // 500 calorie deficit
    case 'build':
      return tdee + 300; // 300 calorie surplus
    case 'recomp':
      return tdee; // Maintain but adjust macros
    case 'maintain':
    default:
      return tdee;
  }
}

export function calculateMacros(
  targetCalories: number,
  macroSplit: MacroSplit,
  customSplit?: [number, number, number]
): { protein: number; carbs: number; fat: number; proteinPercent: number; carbPercent: number; fatPercent: number } {
  const split = macroSplit === 'custom' && customSplit ? customSplit : macroSplits[macroSplit as Exclude<MacroSplit, 'custom'>];
  
  const [proteinPercent, carbPercent, fatPercent] = split;
  
  // Calories per gram: protein=4, carbs=4, fat=9
  const proteinCalories = (targetCalories * proteinPercent) / 100;
  const carbCalories = (targetCalories * carbPercent) / 100;
  const fatCalories = (targetCalories * fatPercent) / 100;
  
  return {
    protein: Math.round(proteinCalories / 4),
    carbs: Math.round(carbCalories / 4),
    fat: Math.round(fatCalories / 9),
    proteinPercent,
    carbPercent,
    fatPercent,
  };
}

export function convertToMetric(
  value: number,
  type: 'weight' | 'height',
  unit: Unit
): number {
  if (unit === 'metric') return value;
  
  if (type === 'weight') {
    // lbs to kg
    return value * 0.453592;
  } else {
    // inches to cm
    return value * 2.54;
  }
}

export function calculateFuel(
  gender: Gender,
  age: number,
  heightFt: number,
  heightIn: number,
  weight: number,
  activityLevel: ActivityLevel,
  goal: Goal,
  macroSplit: MacroSplit,
  unit: Unit,
  customSplit?: [number, number, number]
): FuelResult {
  // Convert to metric if needed
  const weightKg = convertToMetric(weight, 'weight', unit);
  const heightCm = unit === 'imperial' 
    ? convertToMetric(heightFt * 12 + heightIn, 'height', unit)
    : heightFt; // In metric mode, heightFt is actually cm
  
  const bmr = calculateBMR(gender, weightKg, heightCm, age);
  const tdee = calculateTDEE(bmr, activityLevel);
  const targetCalories = calculateTargetCalories(tdee, goal);
  const macros = calculateMacros(targetCalories, macroSplit, customSplit);
  
  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targetCalories: Math.round(targetCalories),
    ...macros,
  };
}
