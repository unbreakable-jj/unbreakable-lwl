// Medal definitions for the running app achievements system

export interface MedalDefinition {
  code: string;
  name: string;
  description: string;
  icon: string;
  category: 'distance' | 'streak' | 'pace' | 'milestone' | 'special';
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
}

export const MEDAL_DEFINITIONS: MedalDefinition[] = [
  // First run medals
  {
    code: 'first_run',
    name: 'First Steps',
    description: 'Complete your first run',
    icon: '🏃',
    category: 'milestone',
    checkCondition: (stats) => stats.totalRuns >= 1,
  },
  {
    code: 'first_gps_run',
    name: 'On The Map',
    description: 'Complete your first GPS-tracked run',
    icon: '📍',
    category: 'milestone',
    checkCondition: (stats) => stats.currentRun?.isGpsTracked === true,
  },

  // Distance milestones
  {
    code: 'distance_10km',
    name: '10K Club',
    description: 'Run a total of 10 kilometers',
    icon: '🎯',
    category: 'distance',
    checkCondition: (stats) => stats.totalDistanceKm >= 10,
  },
  {
    code: 'distance_50km',
    name: 'Half Century',
    description: 'Run a total of 50 kilometers',
    icon: '⭐',
    category: 'distance',
    checkCondition: (stats) => stats.totalDistanceKm >= 50,
  },
  {
    code: 'distance_100km',
    name: 'Century Runner',
    description: 'Run a total of 100 kilometers',
    icon: '💯',
    category: 'distance',
    checkCondition: (stats) => stats.totalDistanceKm >= 100,
  },
  {
    code: 'distance_250km',
    name: 'Marathon Master',
    description: 'Run a total of 250 kilometers',
    icon: '🏅',
    category: 'distance',
    checkCondition: (stats) => stats.totalDistanceKm >= 250,
  },
  {
    code: 'distance_500km',
    name: 'Ultra Legend',
    description: 'Run a total of 500 kilometers',
    icon: '🏆',
    category: 'distance',
    checkCondition: (stats) => stats.totalDistanceKm >= 500,
  },
  {
    code: 'distance_1000km',
    name: 'Thousand Miler',
    description: 'Run a total of 1000 kilometers',
    icon: '👑',
    category: 'distance',
    checkCondition: (stats) => stats.totalDistanceKm >= 1000,
  },

  // Single run distance achievements
  {
    code: 'single_5k',
    name: '5K Finisher',
    description: 'Complete a single run of 5 kilometers or more',
    icon: '🎖️',
    category: 'distance',
    checkCondition: (stats) => (stats.currentRun?.distanceKm || 0) >= 5,
  },
  {
    code: 'single_10k',
    name: '10K Warrior',
    description: 'Complete a single run of 10 kilometers or more',
    icon: '🥇',
    category: 'distance',
    checkCondition: (stats) => (stats.currentRun?.distanceKm || 0) >= 10,
  },
  {
    code: 'single_half_marathon',
    name: 'Half Marathon Hero',
    description: 'Complete a single run of 21.1 kilometers or more',
    icon: '🥈',
    category: 'distance',
    checkCondition: (stats) => (stats.currentRun?.distanceKm || 0) >= 21.1,
  },
  {
    code: 'single_marathon',
    name: 'Marathon Legend',
    description: 'Complete a single run of 42.2 kilometers or more',
    icon: '🥉',
    category: 'distance',
    checkCondition: (stats) => (stats.currentRun?.distanceKm || 0) >= 42.2,
  },

  // Run count milestones
  {
    code: 'runs_5',
    name: 'Getting Started',
    description: 'Complete 5 runs',
    icon: '✨',
    category: 'milestone',
    checkCondition: (stats) => stats.totalRuns >= 5,
  },
  {
    code: 'runs_10',
    name: 'Double Digits',
    description: 'Complete 10 runs',
    icon: '🔟',
    category: 'milestone',
    checkCondition: (stats) => stats.totalRuns >= 10,
  },
  {
    code: 'runs_25',
    name: 'Quarter Century',
    description: 'Complete 25 runs',
    icon: '💪',
    category: 'milestone',
    checkCondition: (stats) => stats.totalRuns >= 25,
  },
  {
    code: 'runs_50',
    name: 'Fifty & Fit',
    description: 'Complete 50 runs',
    icon: '🔥',
    category: 'milestone',
    checkCondition: (stats) => stats.totalRuns >= 50,
  },
  {
    code: 'runs_100',
    name: 'Centurion',
    description: 'Complete 100 runs',
    icon: '🎊',
    category: 'milestone',
    checkCondition: (stats) => stats.totalRuns >= 100,
  },

  // Pace achievements
  {
    code: 'pace_sub_6',
    name: 'Speed Demon',
    description: 'Complete a run with pace under 6:00/km',
    icon: '⚡',
    category: 'pace',
    checkCondition: (stats) => (stats.currentRun?.pacePerKmSeconds || 999) < 360,
  },
  {
    code: 'pace_sub_5',
    name: 'Lightning Fast',
    description: 'Complete a run with pace under 5:00/km',
    icon: '🌩️',
    category: 'pace',
    checkCondition: (stats) => (stats.currentRun?.pacePerKmSeconds || 999) < 300,
  },
  {
    code: 'pace_sub_4',
    name: 'Elite Pacer',
    description: 'Complete a run with pace under 4:00/km',
    icon: '🚀',
    category: 'pace',
    checkCondition: (stats) => (stats.currentRun?.pacePerKmSeconds || 999) < 240,
  },

  // PR medals
  {
    code: 'first_pr',
    name: 'Personal Best',
    description: 'Set your first personal record',
    icon: '🏆',
    category: 'special',
    checkCondition: (stats) => stats.personalRecords.some(pr => pr.isNewPR),
  },
  {
    code: 'pr_1km',
    name: '1K PR',
    description: 'Set a personal record for 1 kilometer',
    icon: '🥇',
    category: 'special',
    checkCondition: (stats) => stats.personalRecords.some(pr => pr.distanceType === '1km' && pr.isNewPR),
  },
  {
    code: 'pr_5km',
    name: '5K PR',
    description: 'Set a personal record for 5 kilometers',
    icon: '🥇',
    category: 'special',
    checkCondition: (stats) => stats.personalRecords.some(pr => pr.distanceType === '5km' && pr.isNewPR),
  },
  {
    code: 'pr_10km',
    name: '10K PR',
    description: 'Set a personal record for 10 kilometers',
    icon: '🥇',
    category: 'special',
    checkCondition: (stats) => stats.personalRecords.some(pr => pr.distanceType === '10km' && pr.isNewPR),
  },
  {
    code: 'pr_half_marathon',
    name: 'Half Marathon PR',
    description: 'Set a personal record for half marathon',
    icon: '🥇',
    category: 'special',
    checkCondition: (stats) => stats.personalRecords.some(pr => pr.distanceType === 'half_marathon' && pr.isNewPR),
  },

  // Weekly/Monthly streak
  {
    code: 'weekly_warrior',
    name: 'Weekly Warrior',
    description: 'Complete 5 runs in a single week',
    icon: '📅',
    category: 'streak',
    checkCondition: (stats) => stats.weeklyRuns >= 5,
  },
  {
    code: 'monthly_champion',
    name: 'Monthly Champion',
    description: 'Complete 20 runs in a single month',
    icon: '📆',
    category: 'streak',
    checkCondition: (stats) => stats.monthlyRuns >= 20,
  },
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
  for (const prDistance of PR_DISTANCES) {
    const minDistance = prDistance.distanceKm * (1 - prDistance.tolerance);
    const maxDistance = prDistance.distanceKm * (1 + prDistance.tolerance);
    if (distanceKm >= minDistance && distanceKm <= maxDistance) {
      return prDistance;
    }
  }
  return null;
}
