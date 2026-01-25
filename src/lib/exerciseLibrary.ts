// AI-powered exercise library data

export interface LibraryExercise {
  id: string;
  name: string;
  bodyPart: BodyPart;
  equipment: Equipment[];
  category: ExerciseCategory;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  defaultSets: number;
  defaultReps: string;
  description: string;
  tips: string[];
  alternatives: string[];
}

export type BodyPart = 
  | 'chest' 
  | 'back' 
  | 'shoulders' 
  | 'legs' 
  | 'arms' 
  | 'core' 
  | 'glutes' 
  | 'full_body';

export type Equipment = 
  | 'barbell' 
  | 'dumbbell' 
  | 'bodyweight' 
  | 'machine' 
  | 'cable' 
  | 'kettlebell'
  | 'bands'
  | 'cardio';

export type ExerciseCategory = 
  | 'compound' 
  | 'isolation' 
  | 'cardio' 
  | 'plyometric';

export type SplitType = 
  | 'full_body' 
  | 'upper_lower' 
  | 'push_pull_legs' 
  | 'bro_split'
  | 'custom';

// Body parts with labels (icons now handled by BodyPartIcon component)
export const BODY_PARTS: { value: BodyPart; label: string }[] = [
  { value: 'chest', label: 'Chest' },
  { value: 'back', label: 'Back' },
  { value: 'shoulders', label: 'Shoulders' },
  { value: 'legs', label: 'Legs' },
  { value: 'arms', label: 'Arms' },
  { value: 'core', label: 'Core' },
  { value: 'glutes', label: 'Glutes' },
  { value: 'full_body', label: 'Full Body' },
];

// Cardio exercises
export const CARDIO_EXERCISES: LibraryExercise[] = [
  {
    id: 'treadmill-run',
    name: 'Treadmill Running',
    bodyPart: 'full_body',
    equipment: ['cardio'],
    category: 'cardio',
    difficulty: 'beginner',
    defaultSets: 1,
    defaultReps: '20-30 mins',
    description: 'Cardiovascular training on the treadmill.',
    tips: ['Start with a warm-up pace', 'Gradually increase speed', 'Maintain good posture'],
    alternatives: ['Outdoor Running', 'Incline Walking'],
  },
  {
    id: 'rowing-machine',
    name: 'Rowing Machine',
    bodyPart: 'full_body',
    equipment: ['cardio'],
    category: 'cardio',
    difficulty: 'beginner',
    defaultSets: 1,
    defaultReps: '15-20 mins',
    description: 'Full body cardio and conditioning on the rowing machine.',
    tips: ['Drive with legs first', 'Keep core engaged', 'Smooth, controlled strokes'],
    alternatives: ['Kayaking', 'Battle Ropes'],
  },
  {
    id: 'stationary-bike',
    name: 'Stationary Bike',
    bodyPart: 'legs',
    equipment: ['cardio'],
    category: 'cardio',
    difficulty: 'beginner',
    defaultSets: 1,
    defaultReps: '20-30 mins',
    description: 'Low-impact cardiovascular exercise.',
    tips: ['Adjust seat height properly', 'Vary resistance levels', 'Keep a steady cadence'],
    alternatives: ['Outdoor Cycling', 'Spin Class'],
  },
  {
    id: 'jump-rope',
    name: 'Jump Rope',
    bodyPart: 'full_body',
    equipment: ['bodyweight'],
    category: 'cardio',
    difficulty: 'intermediate',
    defaultSets: 3,
    defaultReps: '2-3 mins',
    description: 'High-intensity cardio and coordination exercise.',
    tips: ['Use wrists to turn rope', 'Land softly on balls of feet', 'Keep jumps low'],
    alternatives: ['High Knees', 'Mountain Climbers'],
  },
  {
    id: 'burpees',
    name: 'Burpees',
    bodyPart: 'full_body',
    equipment: ['bodyweight'],
    category: 'plyometric',
    difficulty: 'intermediate',
    defaultSets: 3,
    defaultReps: '10-15',
    description: 'Full body explosive exercise combining squat, plank, and jump.',
    tips: ['Keep core tight', 'Land softly', 'Modify by stepping instead of jumping'],
    alternatives: ['Squat Thrusts', 'Mountain Climbers'],
  },
];

export const SPLIT_TYPES: { value: SplitType; label: string; description: string; daysRequired: number[] }[] = [
  { 
    value: 'full_body', 
    label: 'Full Body', 
    description: 'Train all muscle groups each session',
    daysRequired: [2, 3, 4]
  },
  { 
    value: 'upper_lower', 
    label: 'Upper/Lower', 
    description: 'Alternate between upper and lower body days',
    daysRequired: [4, 5, 6]
  },
  { 
    value: 'push_pull_legs', 
    label: 'Push/Pull/Legs', 
    description: 'Split by movement patterns',
    daysRequired: [3, 6]
  },
  { 
    value: 'bro_split', 
    label: 'Body Part Split', 
    description: 'Focus on one muscle group per day',
    daysRequired: [4, 5, 6]
  },
  { 
    value: 'custom', 
    label: 'Custom', 
    description: 'Design your own split',
    daysRequired: [1, 2, 3, 4, 5, 6, 7]
  },
];

export const EQUIPMENT_OPTIONS: { value: Equipment; label: string }[] = [
  { value: 'barbell', label: 'Barbell' },
  { value: 'dumbbell', label: 'Dumbbell' },
  { value: 'bodyweight', label: 'Bodyweight' },
  { value: 'machine', label: 'Machine' },
  { value: 'cable', label: 'Cable' },
  { value: 'kettlebell', label: 'Kettlebell' },
  { value: 'bands', label: 'Resistance Bands' },
  { value: 'cardio', label: 'Cardio Equipment' },
];

export const EXERCISE_LIBRARY: LibraryExercise[] = [
  // CHEST
  {
    id: 'bench-press',
    name: 'Bench Press',
    bodyPart: 'chest',
    equipment: ['barbell'],
    category: 'compound',
    difficulty: 'intermediate',
    defaultSets: 4,
    defaultReps: '6-8',
    description: 'The king of chest exercises. Lie flat on a bench and press the barbell up.',
    tips: ['Keep your feet flat on the floor', 'Retract your shoulder blades', 'Lower the bar to mid-chest'],
    alternatives: ['Dumbbell Press', 'Machine Chest Press'],
  },
  {
    id: 'incline-bench-press',
    name: 'Incline Bench Press',
    bodyPart: 'chest',
    equipment: ['barbell', 'dumbbell'],
    category: 'compound',
    difficulty: 'intermediate',
    defaultSets: 3,
    defaultReps: '8-10',
    description: 'Targets the upper chest with an inclined bench angle.',
    tips: ['Set bench to 30-45 degrees', 'Keep core braced', 'Control the descent'],
    alternatives: ['Incline Dumbbell Press', 'Low-to-High Cable Flyes'],
  },
  {
    id: 'dumbbell-flyes',
    name: 'Dumbbell Flyes',
    bodyPart: 'chest',
    equipment: ['dumbbell'],
    category: 'isolation',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: '12-15',
    description: 'Isolation exercise for chest stretch and contraction.',
    tips: ['Keep slight bend in elbows', 'Focus on the stretch', 'Squeeze at the top'],
    alternatives: ['Cable Flyes', 'Machine Flyes'],
  },
  {
    id: 'push-ups',
    name: 'Push Ups',
    bodyPart: 'chest',
    equipment: ['bodyweight'],
    category: 'compound',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: '10-15',
    description: 'Classic bodyweight exercise for chest, shoulders, and triceps.',
    tips: ['Keep body in a straight line', 'Elbows at 45-degree angle', 'Full range of motion'],
    alternatives: ['Knee Push Ups', 'Decline Push Ups'],
  },
  {
    id: 'cable-crossover',
    name: 'Cable Crossover',
    bodyPart: 'chest',
    equipment: ['cable'],
    category: 'isolation',
    difficulty: 'intermediate',
    defaultSets: 3,
    defaultReps: '12-15',
    description: 'Cable exercise for constant tension on the chest.',
    tips: ['Step forward for better stretch', 'Cross hands at the bottom', 'Control the movement'],
    alternatives: ['Dumbbell Flyes', 'Pec Deck'],
  },

  // BACK
  {
    id: 'deadlift',
    name: 'Deadlift',
    bodyPart: 'back',
    equipment: ['barbell'],
    category: 'compound',
    difficulty: 'advanced',
    defaultSets: 4,
    defaultReps: '5-6',
    description: 'The ultimate posterior chain builder.',
    tips: ['Keep the bar close to your body', 'Drive through your heels', 'Keep your back flat'],
    alternatives: ['Romanian Deadlift', 'Trap Bar Deadlift'],
  },
  {
    id: 'barbell-row',
    name: 'Barbell Row',
    bodyPart: 'back',
    equipment: ['barbell'],
    category: 'compound',
    difficulty: 'intermediate',
    defaultSets: 4,
    defaultReps: '8-10',
    description: 'Fundamental back exercise for thickness and strength.',
    tips: ['Hinge at the hips', 'Pull to lower chest', 'Squeeze shoulder blades'],
    alternatives: ['Dumbbell Row', 'T-Bar Row'],
  },
  {
    id: 'pull-ups',
    name: 'Pull Ups',
    bodyPart: 'back',
    equipment: ['bodyweight'],
    category: 'compound',
    difficulty: 'intermediate',
    defaultSets: 3,
    defaultReps: '8-12',
    description: 'Bodyweight vertical pulling movement.',
    tips: ['Full hang at bottom', 'Lead with your chest', 'Control the descent'],
    alternatives: ['Lat Pulldown', 'Assisted Pull Ups'],
  },
  {
    id: 'lat-pulldown',
    name: 'Lat Pulldown',
    bodyPart: 'back',
    equipment: ['cable'],
    category: 'compound',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: '10-12',
    description: 'Cable machine exercise targeting the lats.',
    tips: ['Lean back slightly', 'Pull to upper chest', 'Squeeze at the bottom'],
    alternatives: ['Pull Ups', 'Close-Grip Pulldown'],
  },
  {
    id: 'seated-cable-row',
    name: 'Seated Cable Row',
    bodyPart: 'back',
    equipment: ['cable'],
    category: 'compound',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: '10-12',
    description: 'Horizontal rowing for mid-back development.',
    tips: ['Keep chest up', 'Pull to belly button', 'Pause at contraction'],
    alternatives: ['Machine Row', 'Dumbbell Row'],
  },
  {
    id: 'dumbbell-row',
    name: 'Dumbbell Row',
    bodyPart: 'back',
    equipment: ['dumbbell'],
    category: 'compound',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: '10-12',
    description: 'Unilateral rowing exercise for back development.',
    tips: ['Support on bench', 'Pull to hip', 'Keep core tight'],
    alternatives: ['Barbell Row', 'Cable Row'],
  },

  // SHOULDERS
  {
    id: 'overhead-press',
    name: 'Overhead Press',
    bodyPart: 'shoulders',
    equipment: ['barbell'],
    category: 'compound',
    difficulty: 'intermediate',
    defaultSets: 4,
    defaultReps: '6-8',
    description: 'The primary vertical pressing movement for shoulders.',
    tips: ['Brace your core', 'Press in a straight line', 'Lock out at the top'],
    alternatives: ['Dumbbell Shoulder Press', 'Machine Press'],
  },
  {
    id: 'dumbbell-shoulder-press',
    name: 'Dumbbell Shoulder Press',
    bodyPart: 'shoulders',
    equipment: ['dumbbell'],
    category: 'compound',
    difficulty: 'intermediate',
    defaultSets: 3,
    defaultReps: '8-10',
    description: 'Dumbbell variation allowing greater range of motion.',
    tips: ['Seated or standing', 'Press to full extension', 'Control the descent'],
    alternatives: ['Overhead Press', 'Arnold Press'],
  },
  {
    id: 'lateral-raises',
    name: 'Lateral Raises',
    bodyPart: 'shoulders',
    equipment: ['dumbbell', 'cable'],
    category: 'isolation',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: '12-15',
    description: 'Isolation for the side delts.',
    tips: ['Lead with elbows', 'Slight forward lean', 'Control the weight'],
    alternatives: ['Cable Lateral Raises', 'Machine Lateral Raises'],
  },
  {
    id: 'face-pulls',
    name: 'Face Pulls',
    bodyPart: 'shoulders',
    equipment: ['cable'],
    category: 'isolation',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: '15-20',
    description: 'Rear delt and rotator cuff exercise.',
    tips: ['High cable position', 'Pull to face level', 'External rotation at end'],
    alternatives: ['Rear Delt Flyes', 'Band Pull Aparts'],
  },
  {
    id: 'rear-delt-flyes',
    name: 'Rear Delt Flyes',
    bodyPart: 'shoulders',
    equipment: ['dumbbell', 'machine'],
    category: 'isolation',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: '12-15',
    description: 'Isolation for the rear deltoids.',
    tips: ['Bend forward at hips', 'Lead with elbows', 'Squeeze at top'],
    alternatives: ['Face Pulls', 'Reverse Pec Deck'],
  },

  // LEGS
  {
    id: 'squat',
    name: 'Barbell Squat',
    bodyPart: 'legs',
    equipment: ['barbell'],
    category: 'compound',
    difficulty: 'intermediate',
    defaultSets: 4,
    defaultReps: '6-8',
    description: 'The king of leg exercises. Full lower body development.',
    tips: ['Feet shoulder-width apart', 'Break at hips and knees', 'Hit parallel or below'],
    alternatives: ['Goblet Squat', 'Leg Press'],
  },
  {
    id: 'romanian-deadlift',
    name: 'Romanian Deadlift',
    bodyPart: 'legs',
    equipment: ['barbell', 'dumbbell'],
    category: 'compound',
    difficulty: 'intermediate',
    defaultSets: 4,
    defaultReps: '8-10',
    description: 'Hip hinge movement for hamstrings and glutes.',
    tips: ['Slight knee bend', 'Push hips back', 'Feel hamstring stretch'],
    alternatives: ['Stiff Leg Deadlift', 'Good Mornings'],
  },
  {
    id: 'leg-press',
    name: 'Leg Press',
    bodyPart: 'legs',
    equipment: ['machine'],
    category: 'compound',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: '10-12',
    description: 'Machine-based quad-dominant exercise.',
    tips: ['Feet shoulder-width', 'Full range of motion', 'Don\'t lock knees'],
    alternatives: ['Squat', 'Hack Squat'],
  },
  {
    id: 'lunges',
    name: 'Lunges',
    bodyPart: 'legs',
    equipment: ['dumbbell', 'bodyweight', 'barbell'],
    category: 'compound',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: '10 each',
    description: 'Unilateral leg exercise for balance and strength.',
    tips: ['Step forward', 'Knee tracks over toe', '90-degree angles'],
    alternatives: ['Walking Lunges', 'Bulgarian Split Squats'],
  },
  {
    id: 'leg-curl',
    name: 'Leg Curl',
    bodyPart: 'legs',
    equipment: ['machine'],
    category: 'isolation',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: '12-15',
    description: 'Isolation exercise for hamstrings.',
    tips: ['Control the weight', 'Full contraction', 'Don\'t swing'],
    alternatives: ['Nordic Curls', 'Glute Ham Raise'],
  },
  {
    id: 'leg-extension',
    name: 'Leg Extension',
    bodyPart: 'legs',
    equipment: ['machine'],
    category: 'isolation',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: '12-15',
    description: 'Isolation exercise for quadriceps.',
    tips: ['Full extension', 'Control the negative', 'Pause at top'],
    alternatives: ['Sissy Squats', 'Front Squats'],
  },
  {
    id: 'calf-raises',
    name: 'Calf Raises',
    bodyPart: 'legs',
    equipment: ['machine', 'dumbbell', 'bodyweight'],
    category: 'isolation',
    difficulty: 'beginner',
    defaultSets: 4,
    defaultReps: '15-20',
    description: 'Isolation for calf muscles.',
    tips: ['Full stretch at bottom', 'Pause at top', 'Slow negatives'],
    alternatives: ['Seated Calf Raises', 'Donkey Calf Raises'],
  },

  // ARMS
  {
    id: 'barbell-curl',
    name: 'Barbell Curl',
    bodyPart: 'arms',
    equipment: ['barbell'],
    category: 'isolation',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: '10-12',
    description: 'Classic bicep exercise.',
    tips: ['Keep elbows fixed', 'Full contraction', 'Control the negative'],
    alternatives: ['Dumbbell Curls', 'EZ Bar Curls'],
  },
  {
    id: 'dumbbell-curl',
    name: 'Dumbbell Curl',
    bodyPart: 'arms',
    equipment: ['dumbbell'],
    category: 'isolation',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: '10-12',
    description: 'Unilateral bicep exercise with supination.',
    tips: ['Rotate wrist during curl', 'Alternate or both arms', 'Full range of motion'],
    alternatives: ['Hammer Curls', 'Concentration Curls'],
  },
  {
    id: 'hammer-curls',
    name: 'Hammer Curls',
    bodyPart: 'arms',
    equipment: ['dumbbell'],
    category: 'isolation',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: '10-12',
    description: 'Neutral grip curl for brachialis and forearms.',
    tips: ['Thumbs up position', 'Keep elbows fixed', 'Control the weight'],
    alternatives: ['Cross Body Curls', 'Rope Curls'],
  },
  {
    id: 'tricep-pushdown',
    name: 'Tricep Pushdown',
    bodyPart: 'arms',
    equipment: ['cable'],
    category: 'isolation',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: '12-15',
    description: 'Cable exercise for triceps.',
    tips: ['Elbows at sides', 'Full extension', 'Squeeze at bottom'],
    alternatives: ['Rope Pushdowns', 'Overhead Extensions'],
  },
  {
    id: 'skull-crushers',
    name: 'Skull Crushers',
    bodyPart: 'arms',
    equipment: ['barbell', 'dumbbell'],
    category: 'isolation',
    difficulty: 'intermediate',
    defaultSets: 3,
    defaultReps: '10-12',
    description: 'Lying tricep extension for long head.',
    tips: ['Lower to forehead', 'Keep elbows fixed', 'Extend fully'],
    alternatives: ['Overhead Extensions', 'Cable Extensions'],
  },
  {
    id: 'close-grip-bench',
    name: 'Close Grip Bench Press',
    bodyPart: 'arms',
    equipment: ['barbell'],
    category: 'compound',
    difficulty: 'intermediate',
    defaultSets: 3,
    defaultReps: '8-10',
    description: 'Compound movement emphasizing triceps.',
    tips: ['Hands shoulder-width', 'Elbows tucked', 'Full lockout'],
    alternatives: ['Diamond Push Ups', 'Dips'],
  },
  {
    id: 'dips',
    name: 'Dips',
    bodyPart: 'arms',
    equipment: ['bodyweight'],
    category: 'compound',
    difficulty: 'intermediate',
    defaultSets: 3,
    defaultReps: '8-12',
    description: 'Bodyweight tricep and chest exercise.',
    tips: ['Lean forward for chest focus', 'Upright for triceps', 'Full range'],
    alternatives: ['Bench Dips', 'Machine Dips'],
  },

  // CORE
  {
    id: 'plank',
    name: 'Plank',
    bodyPart: 'core',
    equipment: ['bodyweight'],
    category: 'isolation',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: '30-60s',
    description: 'Isometric core stabilization exercise.',
    tips: ['Straight line from head to heels', 'Don\'t let hips sag', 'Breathe steadily'],
    alternatives: ['Side Plank', 'Dead Bug'],
  },
  {
    id: 'hanging-leg-raises',
    name: 'Hanging Leg Raises',
    bodyPart: 'core',
    equipment: ['bodyweight'],
    category: 'isolation',
    difficulty: 'intermediate',
    defaultSets: 3,
    defaultReps: '10-15',
    description: 'Advanced ab exercise targeting lower abs.',
    tips: ['Control the swing', 'Raise legs to parallel', 'Lower slowly'],
    alternatives: ['Lying Leg Raises', 'Captain\'s Chair'],
  },
  {
    id: 'cable-crunches',
    name: 'Cable Crunches',
    bodyPart: 'core',
    equipment: ['cable'],
    category: 'isolation',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: '15-20',
    description: 'Weighted ab crunch for progressive overload.',
    tips: ['Focus on contracting abs', 'Don\'t pull with arms', 'Exhale at bottom'],
    alternatives: ['Machine Crunches', 'Ab Wheel'],
  },
  {
    id: 'russian-twists',
    name: 'Russian Twists',
    bodyPart: 'core',
    equipment: ['bodyweight', 'dumbbell', 'kettlebell'],
    category: 'isolation',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: '20 total',
    description: 'Rotational core exercise for obliques.',
    tips: ['Lean back slightly', 'Rotate from core', 'Touch both sides'],
    alternatives: ['Bicycle Crunches', 'Woodchops'],
  },
  {
    id: 'dead-bug',
    name: 'Dead Bug',
    bodyPart: 'core',
    equipment: ['bodyweight'],
    category: 'isolation',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: '10 each side',
    description: 'Anti-extension core exercise.',
    tips: ['Keep lower back pressed down', 'Opposite arm/leg extend', 'Slow and controlled'],
    alternatives: ['Bird Dog', 'Hollow Body Hold'],
  },

  // GLUTES
  {
    id: 'hip-thrust',
    name: 'Hip Thrust',
    bodyPart: 'glutes',
    equipment: ['barbell', 'dumbbell'],
    category: 'compound',
    difficulty: 'beginner',
    defaultSets: 4,
    defaultReps: '10-12',
    description: 'Primary glute-building exercise.',
    tips: ['Upper back on bench', 'Drive through heels', 'Squeeze at top'],
    alternatives: ['Glute Bridge', 'Cable Pull-Through'],
  },
  {
    id: 'glute-bridge',
    name: 'Glute Bridge',
    bodyPart: 'glutes',
    equipment: ['bodyweight', 'barbell'],
    category: 'isolation',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: '15-20',
    description: 'Floor-based glute exercise.',
    tips: ['Feet flat on floor', 'Squeeze glutes at top', 'Hold briefly'],
    alternatives: ['Hip Thrust', 'Single Leg Bridge'],
  },
  {
    id: 'cable-kickback',
    name: 'Cable Kickback',
    bodyPart: 'glutes',
    equipment: ['cable'],
    category: 'isolation',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: '12-15',
    description: 'Isolated glute exercise with cable resistance.',
    tips: ['Slight forward lean', 'Squeeze at top', 'Control throughout'],
    alternatives: ['Donkey Kicks', 'Machine Kickback'],
  },

  // FULL BODY
  {
    id: 'burpees',
    name: 'Burpees',
    bodyPart: 'full_body',
    equipment: ['bodyweight'],
    category: 'plyometric',
    difficulty: 'intermediate',
    defaultSets: 3,
    defaultReps: '10-15',
    description: 'Full body conditioning exercise.',
    tips: ['Explosive jump', 'Full push up at bottom', 'Land softly'],
    alternatives: ['Mountain Climbers', 'Squat Jumps'],
  },
  {
    id: 'clean-and-press',
    name: 'Clean and Press',
    bodyPart: 'full_body',
    equipment: ['barbell', 'kettlebell', 'dumbbell'],
    category: 'compound',
    difficulty: 'advanced',
    defaultSets: 4,
    defaultReps: '5-6',
    description: 'Olympic-style compound movement.',
    tips: ['Explosive hip drive', 'Catch in front rack', 'Press overhead'],
    alternatives: ['Push Press', 'Clean'],
  },
  {
    id: 'thrusters',
    name: 'Thrusters',
    bodyPart: 'full_body',
    equipment: ['barbell', 'dumbbell'],
    category: 'compound',
    difficulty: 'intermediate',
    defaultSets: 3,
    defaultReps: '10-12',
    description: 'Squat to press combination movement.',
    tips: ['Front squat position', 'Drive through heels', 'One fluid motion'],
    alternatives: ['Wall Balls', 'Squat Press'],
  },
  {
    id: 'kettlebell-swings',
    name: 'Kettlebell Swings',
    bodyPart: 'full_body',
    equipment: ['kettlebell'],
    category: 'compound',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: '15-20',
    description: 'Hip hinge explosive movement.',
    tips: ['Hip hinge, not squat', 'Explosive hip thrust', 'Control at the top'],
    alternatives: ['Dumbbell Swings', 'Sumo Deadlift High Pull'],
  },
];

// Helper functions for exercise library
export function getExercisesByBodyPart(bodyPart: BodyPart): LibraryExercise[] {
  return EXERCISE_LIBRARY.filter(ex => ex.bodyPart === bodyPart);
}

export function searchExercises(query: string): LibraryExercise[] {
  const lowerQuery = query.toLowerCase();
  return EXERCISE_LIBRARY.filter(ex => 
    ex.name.toLowerCase().includes(lowerQuery) ||
    ex.bodyPart.toLowerCase().includes(lowerQuery) ||
    ex.equipment.some(eq => eq.toLowerCase().includes(lowerQuery))
  );
}

export function getExerciseById(id: string): LibraryExercise | undefined {
  return EXERCISE_LIBRARY.find(ex => ex.id === id);
}

export function getSplitDayNames(split: SplitType, days: number): string[] {
  switch (split) {
    case 'full_body':
      return Array.from({ length: days }, (_, i) => `Full Body Day ${i + 1}`);
    case 'upper_lower':
      if (days === 4) return ['Upper A', 'Lower A', 'Upper B', 'Lower B'];
      if (days === 5) return ['Upper A', 'Lower A', 'Upper B', 'Lower B', 'Full Body'];
      return ['Upper A', 'Lower A', 'Upper B', 'Lower B', 'Upper C', 'Lower C'];
    case 'push_pull_legs':
      if (days === 3) return ['Push', 'Pull', 'Legs'];
      return ['Push A', 'Pull A', 'Legs A', 'Push B', 'Pull B', 'Legs B'];
    case 'bro_split':
      const bodyParts = ['Chest', 'Back', 'Shoulders', 'Legs', 'Arms', 'Core'];
      return bodyParts.slice(0, days);
    case 'custom':
    default:
      return Array.from({ length: days }, (_, i) => `Day ${i + 1}`);
  }
}
