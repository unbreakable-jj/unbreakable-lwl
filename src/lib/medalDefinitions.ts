// Medal definitions for the UNBREAKABLE achievements system

export interface MedalDefinition {
  code: string;
  name: string;
  description: string;
  icon: string;
  category: 'distance' | 'streak' | 'pace' | 'milestone' | 'special' | 'strength' | 'cardio';
  checkCondition: (stats: MedalCheckStats) => boolean;
}

export interface MedalCheckStats {
  totalRuns: number;
  totalDistanceKm: number;
  currentRun?: {
    distanceKm: number;
    durationSeconds: number;
    pacePerKmSeconds: number;
    isGpsTracked: boolean;
  };
  weeklyRuns: number;
  monthlyRuns: number;
  personalRecords: {
    distanceType: string;
    isNewPR: boolean;
  }[];
  // Strength stats (optional for backward compat)
  totalWorkouts?: number;
  totalSetsCompleted?: number;
}

export const MEDAL_DEFINITIONS: MedalDefinition[] = [
  // ===== CARDIO MILESTONES =====
  { code: 'first_run', name: 'First Steps', description: 'Complete your first run', icon: '🏃', category: 'milestone', checkCondition: (s) => s.totalRuns >= 1 },
  { code: 'first_gps_run', name: 'On The Map', description: 'Complete your first GPS-tracked run', icon: '📍', category: 'milestone', checkCondition: (s) => s.currentRun?.isGpsTracked === true },

  // Distance milestones (cumulative)
  { code: 'distance_10km', name: '10K Club', description: 'Run a total of 10 km', icon: '🎯', category: 'distance', checkCondition: (s) => s.totalDistanceKm >= 10 },
  { code: 'distance_50km', name: 'Half Century', description: 'Run a total of 50 km', icon: '⭐', category: 'distance', checkCondition: (s) => s.totalDistanceKm >= 50 },
  { code: 'distance_100km', name: 'Century Runner', description: 'Run a total of 100 km', icon: '💯', category: 'distance', checkCondition: (s) => s.totalDistanceKm >= 100 },
  { code: 'distance_250km', name: 'Marathon Master', description: 'Run a total of 250 km', icon: '🏅', category: 'distance', checkCondition: (s) => s.totalDistanceKm >= 250 },
  { code: 'distance_500km', name: 'Ultra Legend', description: 'Run a total of 500 km', icon: '🏆', category: 'distance', checkCondition: (s) => s.totalDistanceKm >= 500 },
  { code: 'distance_1000km', name: 'Thousand Miler', description: 'Run a total of 1000 km', icon: '👑', category: 'distance', checkCondition: (s) => s.totalDistanceKm >= 1000 },

  // Single run distance
  { code: 'single_5k', name: '5K Finisher', description: 'Complete a single run of 5 km+', icon: '🎖️', category: 'distance', checkCondition: (s) => (s.currentRun?.distanceKm || 0) >= 5 },
  { code: 'single_10k', name: '10K Warrior', description: 'Complete a single run of 10 km+', icon: '🥇', category: 'distance', checkCondition: (s) => (s.currentRun?.distanceKm || 0) >= 10 },
  { code: 'single_half_marathon', name: 'Half Marathon Hero', description: 'Complete a single run of 21.1 km+', icon: '🥈', category: 'distance', checkCondition: (s) => (s.currentRun?.distanceKm || 0) >= 21.1 },
  { code: 'single_marathon', name: 'Marathon Legend', description: 'Complete a single run of 42.2 km+', icon: '🏅', category: 'distance', checkCondition: (s) => (s.currentRun?.distanceKm || 0) >= 42.2 },

  // Run count milestones
  { code: 'runs_5', name: 'Getting Started', description: 'Complete 5 runs', icon: '✨', category: 'milestone', checkCondition: (s) => s.totalRuns >= 5 },
  { code: 'runs_10', name: 'Double Digits', description: 'Complete 10 runs', icon: '🔟', category: 'milestone', checkCondition: (s) => s.totalRuns >= 10 },
  { code: 'runs_25', name: 'Quarter Century', description: 'Complete 25 runs', icon: '💪', category: 'milestone', checkCondition: (s) => s.totalRuns >= 25 },
  { code: 'runs_50', name: 'Fifty & Fit', description: 'Complete 50 runs', icon: '🔥', category: 'milestone', checkCondition: (s) => s.totalRuns >= 50 },
  { code: 'runs_100', name: 'Centurion', description: 'Complete 100 runs', icon: '🎊', category: 'milestone', checkCondition: (s) => s.totalRuns >= 100 },

  // Pace achievements
  { code: 'pace_sub_6', name: 'Speed Demon', description: 'Run with pace under 6:00/km', icon: '⚡', category: 'pace', checkCondition: (s) => (s.currentRun?.pacePerKmSeconds || 999) < 360 },
  { code: 'pace_sub_5', name: 'Lightning Fast', description: 'Run with pace under 5:00/km', icon: '🌩️', category: 'pace', checkCondition: (s) => (s.currentRun?.pacePerKmSeconds || 999) < 300 },
  { code: 'pace_sub_4', name: 'Elite Pacer', description: 'Run with pace under 4:00/km', icon: '🚀', category: 'pace', checkCondition: (s) => (s.currentRun?.pacePerKmSeconds || 999) < 240 },

  // PR medals
  { code: 'first_pr', name: 'Personal Best', description: 'Set your first personal record', icon: '🏆', category: 'special', checkCondition: (s) => s.personalRecords.some(pr => pr.isNewPR) },
  { code: 'pr_5km', name: '5K PR', description: 'Set a PR for 5 km', icon: '🥇', category: 'special', checkCondition: (s) => s.personalRecords.some(pr => pr.distanceType === '5km' && pr.isNewPR) },
  { code: 'pr_10km', name: '10K PR', description: 'Set a PR for 10 km', icon: '🥇', category: 'special', checkCondition: (s) => s.personalRecords.some(pr => pr.distanceType === '10km' && pr.isNewPR) },
  { code: 'pr_half_marathon', name: 'Half Marathon PR', description: 'Set a PR for half marathon', icon: '🥇', category: 'special', checkCondition: (s) => s.personalRecords.some(pr => pr.distanceType === 'half_marathon' && pr.isNewPR) },
  { code: 'pr_marathon', name: 'Marathon PR', description: 'Set a PR for marathon', icon: '🥇', category: 'special', checkCondition: (s) => s.personalRecords.some(pr => pr.distanceType === 'marathon' && pr.isNewPR) },

  // Streak achievements
  { code: 'weekly_warrior', name: 'Weekly Warrior', description: 'Complete 5 runs in a single week', icon: '📅', category: 'streak', checkCondition: (s) => s.weeklyRuns >= 5 },
  { code: 'monthly_champion', name: 'Monthly Champion', description: 'Complete 20 runs in a single month', icon: '📆', category: 'streak', checkCondition: (s) => s.monthlyRuns >= 20 },

  // ===== STRENGTH / GYM TROPHIES =====
  { code: 'first_workout', name: 'Iron Baptism', description: 'Complete your first workout', icon: '🏋️', category: 'strength', checkCondition: (s) => (s.totalWorkouts || 0) >= 1 },
  { code: 'workouts_10', name: 'Gym Regular', description: 'Complete 10 workouts', icon: '💪', category: 'strength', checkCondition: (s) => (s.totalWorkouts || 0) >= 10 },
  { code: 'workouts_25', name: 'Iron Addict', description: 'Complete 25 workouts', icon: '🔩', category: 'strength', checkCondition: (s) => (s.totalWorkouts || 0) >= 25 },
  { code: 'workouts_50', name: 'Beast Mode', description: 'Complete 50 workouts', icon: '🦍', category: 'strength', checkCondition: (s) => (s.totalWorkouts || 0) >= 50 },
  { code: 'workouts_100', name: 'Century Lifter', description: 'Complete 100 workouts', icon: '🏛️', category: 'strength', checkCondition: (s) => (s.totalWorkouts || 0) >= 100 },
  { code: 'sets_100', name: 'Set Crusher', description: 'Complete 100 total sets', icon: '📊', category: 'strength', checkCondition: (s) => (s.totalSetsCompleted || 0) >= 100 },
  { code: 'sets_500', name: 'Volume King', description: 'Complete 500 total sets', icon: '📈', category: 'strength', checkCondition: (s) => (s.totalSetsCompleted || 0) >= 500 },
  { code: 'sets_1000', name: 'Iron Testament', description: 'Complete 1000 total sets', icon: '🗿', category: 'strength', checkCondition: (s) => (s.totalSetsCompleted || 0) >= 1000 },

  // ===== CARDIO-SPECIFIC TROPHIES =====
  { code: 'first_walk', name: 'First Walk', description: 'Complete your first walk session', icon: '🚶', category: 'cardio', checkCondition: () => false },
  { code: 'first_cycle', name: 'First Ride', description: 'Complete your first cycle session', icon: '🚴', category: 'cardio', checkCondition: () => false },
  { code: 'cardio_multi', name: 'All-Rounder', description: 'Log walk, run, and cycle sessions', icon: '🌟', category: 'cardio', checkCondition: () => false },
  { code: 'early_bird', name: 'Early Bird', description: 'Complete a session before 7am', icon: '🌅', category: 'cardio', checkCondition: () => false },
  { code: 'night_owl', name: 'Night Owl', description: 'Complete a session after 9pm', icon: '🌙', category: 'cardio', checkCondition: () => false },
];

// Standard PR distances
export const PR_DISTANCES = [
  { type: '1km', label: '1 KM', distanceKm: 1, tolerance: 0.05 },
  { type: '3km', label: '3 KM', distanceKm: 3, tolerance: 0.05 },
  { type: '5km', label: '5 KM', distanceKm: 5, tolerance: 0.05 },
  { type: '10km', label: '10 KM', distanceKm: 10, tolerance: 0.05 },
  { type: 'half_marathon', label: 'Half Marathon', distanceKm: 21.0975, tolerance: 0.05 },
  { type: 'marathon', label: 'Marathon', distanceKm: 42.195, tolerance: 0.05 },
];

export function getMatchingPRDistance(distanceKm: number): typeof PR_DISTANCES[number] | null {
  // First check for exact match within tolerance
  for (const prDistance of PR_DISTANCES) {
    const minDistance = prDistance.distanceKm * (1 - prDistance.tolerance);
    const maxDistance = prDistance.distanceKm * (1 + prDistance.tolerance);
    if (distanceKm >= minDistance && distanceKm <= maxDistance) {
      return prDistance;
    }
  }
  // If no exact match, find the highest standard distance the run exceeds
  // e.g., a 7km walk should award a 5km PR
  let bestMatch: typeof PR_DISTANCES[number] | null = null;
  for (const prDistance of PR_DISTANCES) {
    if (distanceKm >= prDistance.distanceKm) {
      bestMatch = prDistance;
    }
  }
  return bestMatch;
}
