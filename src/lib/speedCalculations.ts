export type Gender = 'male' | 'female';
export type Distance = '5k' | '10k' | 'half' | 'full';
export type AgeGroup = '18-29' | '30-39' | '40-49' | '50-59' | '60-69' | '70+';

export interface RaceTime {
  hours: number;
  minutes: number;
  seconds: number;
}

export interface SpeedResult {
  distance: Distance;
  time: RaceTime;
  totalSeconds: number;
  pacePerKm: RaceTime;
  pacePerMile: RaceTime;
  speedKph: number;
  speedMph: number;
  level: SpeedLevel;
  percentile: number;
  ageGroup: AgeGroup;
  ageAdjustedPercentile: number;
}

export interface SpeedLevel {
  name: string;
  stars: number;
  description: string;
}

export const distanceLabels: Record<Distance, string> = {
  '5k': '5K',
  '10k': '10K',
  'half': 'Half Marathon',
  'full': 'Marathon',
};

export const distanceKm: Record<Distance, number> = {
  '5k': 5,
  '10k': 10,
  'half': 21.0975,
  'full': 42.195,
};

export const distanceMiles: Record<Distance, number> = {
  '5k': 3.10686,
  '10k': 6.21371,
  'half': 13.1094,
  'full': 26.2188,
};

export const ageGroupLabels: Record<AgeGroup, string> = {
  '18-29': '18-29 years',
  '30-39': '30-39 years',
  '40-49': '40-49 years',
  '50-59': '50-59 years',
  '60-69': '60-69 years',
  '70+': '70+ years',
};

// Age adjustments (multiplier for performance - lower is faster/better)
const ageAdjustments: Record<AgeGroup, number> = {
  '18-29': 1.0,
  '30-39': 1.02,
  '40-49': 1.06,
  '50-59': 1.12,
  '60-69': 1.20,
  '70+': 1.30,
};

// Benchmark times in seconds for different performance levels
// These represent the total time for each distance
const benchmarkTimes: Record<Distance, Record<Gender, { elite: number; advanced: number; intermediate: number; novice: number; beginner: number }>> = {
  '5k': {
    male: {
      elite: 14 * 60,      // 14:00
      advanced: 18 * 60,   // 18:00
      intermediate: 23 * 60, // 23:00
      novice: 28 * 60,     // 28:00
      beginner: 35 * 60,   // 35:00
    },
    female: {
      elite: 16 * 60,      // 16:00
      advanced: 21 * 60,   // 21:00
      intermediate: 26 * 60, // 26:00
      novice: 32 * 60,     // 32:00
      beginner: 40 * 60,   // 40:00
    },
  },
  '10k': {
    male: {
      elite: 29 * 60,      // 29:00
      advanced: 38 * 60,   // 38:00
      intermediate: 48 * 60, // 48:00
      novice: 58 * 60,     // 58:00
      beginner: 70 * 60,   // 70:00
    },
    female: {
      elite: 33 * 60,      // 33:00
      advanced: 44 * 60,   // 44:00
      intermediate: 55 * 60, // 55:00
      novice: 66 * 60,     // 66:00
      beginner: 80 * 60,   // 80:00
    },
  },
  'half': {
    male: {
      elite: 63 * 60,       // 1:03
      advanced: 85 * 60,    // 1:25
      intermediate: 105 * 60, // 1:45
      novice: 130 * 60,     // 2:10
      beginner: 155 * 60,   // 2:35
    },
    female: {
      elite: 72 * 60,       // 1:12
      advanced: 95 * 60,    // 1:35
      intermediate: 120 * 60, // 2:00
      novice: 145 * 60,     // 2:25
      beginner: 175 * 60,   // 2:55
    },
  },
  'full': {
    male: {
      elite: 130 * 60,      // 2:10
      advanced: 180 * 60,   // 3:00
      intermediate: 225 * 60, // 3:45
      novice: 270 * 60,     // 4:30
      beginner: 330 * 60,   // 5:30
    },
    female: {
      elite: 150 * 60,      // 2:30
      advanced: 200 * 60,   // 3:20
      intermediate: 255 * 60, // 4:15
      novice: 300 * 60,     // 5:00
      beginner: 370 * 60,   // 6:10
    },
  },
};

const speedLevels: SpeedLevel[] = [
  { name: 'ELITE', stars: 5, description: 'Competitive athlete level' },
  { name: 'ADVANCED', stars: 4, description: 'Experienced runner' },
  { name: 'INTERMEDIATE', stars: 3, description: 'Dedicated recreational runner' },
  { name: 'NOVICE', stars: 2, description: 'Building consistency' },
  { name: 'BEGINNER', stars: 1, description: 'Starting your journey' },
];

export function getAgeGroup(age: number): AgeGroup {
  if (age < 30) return '18-29';
  if (age < 40) return '30-39';
  if (age < 50) return '40-49';
  if (age < 60) return '50-59';
  if (age < 70) return '60-69';
  return '70+';
}

export function timeToSeconds(hours: number, minutes: number, seconds: number): number {
  return hours * 3600 + minutes * 60 + seconds;
}

export function secondsToTime(totalSeconds: number): RaceTime {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.round(totalSeconds % 60);
  return { hours, minutes, seconds };
}

export function formatTime(time: RaceTime, includeHours = true): string {
  const parts: string[] = [];
  if (includeHours && time.hours > 0) {
    parts.push(time.hours.toString());
  }
  if (parts.length > 0 || time.hours > 0) {
    parts.push(time.minutes.toString().padStart(2, '0'));
  } else {
    parts.push(time.minutes.toString());
  }
  parts.push(time.seconds.toString().padStart(2, '0'));
  return parts.join(':');
}

export function calculateSpeedLevel(
  totalSeconds: number,
  distance: Distance,
  gender: Gender,
  age: number
): SpeedResult {
  const ageGroup = getAgeGroup(age);
  const benchmarks = benchmarkTimes[distance][gender];
  const ageAdjustment = ageAdjustments[ageGroup];
  
  // Adjust benchmarks for age (slower times are acceptable for older runners)
  const adjustedBenchmarks = {
    elite: benchmarks.elite * ageAdjustment,
    advanced: benchmarks.advanced * ageAdjustment,
    intermediate: benchmarks.intermediate * ageAdjustment,
    novice: benchmarks.novice * ageAdjustment,
    beginner: benchmarks.beginner * ageAdjustment,
  };
  
  // Determine level and percentile based on time (lower is better)
  let level: SpeedLevel;
  let percentile: number;
  
  if (totalSeconds <= adjustedBenchmarks.elite) {
    level = speedLevels[0];
    percentile = 95 + (adjustedBenchmarks.elite - totalSeconds) / adjustedBenchmarks.elite * 5;
  } else if (totalSeconds <= adjustedBenchmarks.advanced) {
    level = speedLevels[1];
    const range = adjustedBenchmarks.advanced - adjustedBenchmarks.elite;
    const position = adjustedBenchmarks.advanced - totalSeconds;
    percentile = 80 + (position / range) * 15;
  } else if (totalSeconds <= adjustedBenchmarks.intermediate) {
    level = speedLevels[2];
    const range = adjustedBenchmarks.intermediate - adjustedBenchmarks.advanced;
    const position = adjustedBenchmarks.intermediate - totalSeconds;
    percentile = 50 + (position / range) * 30;
  } else if (totalSeconds <= adjustedBenchmarks.novice) {
    level = speedLevels[3];
    const range = adjustedBenchmarks.novice - adjustedBenchmarks.intermediate;
    const position = adjustedBenchmarks.novice - totalSeconds;
    percentile = 25 + (position / range) * 25;
  } else if (totalSeconds <= adjustedBenchmarks.beginner) {
    level = speedLevels[4];
    const range = adjustedBenchmarks.beginner - adjustedBenchmarks.novice;
    const position = adjustedBenchmarks.beginner - totalSeconds;
    percentile = 5 + (position / range) * 20;
  } else {
    level = speedLevels[4];
    percentile = Math.max(1, 5 - (totalSeconds - adjustedBenchmarks.beginner) / adjustedBenchmarks.beginner * 5);
  }
  
  percentile = Math.min(99, Math.max(1, Math.round(percentile)));
  
  // Calculate age-adjusted percentile (against their own age group)
  const unadjustedBenchmarks = benchmarkTimes[distance][gender];
  let ageAdjustedPercentile: number;
  
  if (totalSeconds <= unadjustedBenchmarks.elite) {
    ageAdjustedPercentile = 95 + (unadjustedBenchmarks.elite - totalSeconds) / unadjustedBenchmarks.elite * 5;
  } else if (totalSeconds <= unadjustedBenchmarks.advanced) {
    const range = unadjustedBenchmarks.advanced - unadjustedBenchmarks.elite;
    const position = unadjustedBenchmarks.advanced - totalSeconds;
    ageAdjustedPercentile = 80 + (position / range) * 15;
  } else if (totalSeconds <= unadjustedBenchmarks.intermediate) {
    const range = unadjustedBenchmarks.intermediate - unadjustedBenchmarks.advanced;
    const position = unadjustedBenchmarks.intermediate - totalSeconds;
    ageAdjustedPercentile = 50 + (position / range) * 30;
  } else if (totalSeconds <= unadjustedBenchmarks.novice) {
    const range = unadjustedBenchmarks.novice - unadjustedBenchmarks.intermediate;
    const position = unadjustedBenchmarks.novice - totalSeconds;
    ageAdjustedPercentile = 25 + (position / range) * 25;
  } else if (totalSeconds <= unadjustedBenchmarks.beginner) {
    const range = unadjustedBenchmarks.beginner - unadjustedBenchmarks.novice;
    const position = unadjustedBenchmarks.beginner - totalSeconds;
    ageAdjustedPercentile = 5 + (position / range) * 20;
  } else {
    ageAdjustedPercentile = Math.max(1, 5 - (totalSeconds - unadjustedBenchmarks.beginner) / unadjustedBenchmarks.beginner * 5);
  }
  
  ageAdjustedPercentile = Math.min(99, Math.max(1, Math.round(ageAdjustedPercentile)));
  
  // Calculate pace and speed
  const km = distanceKm[distance];
  const miles = distanceMiles[distance];
  
  const paceSecondsPerKm = totalSeconds / km;
  const paceSecondsPerMile = totalSeconds / miles;
  
  const speedKph = (km / totalSeconds) * 3600;
  const speedMph = (miles / totalSeconds) * 3600;
  
  return {
    distance,
    time: secondsToTime(totalSeconds),
    totalSeconds,
    pacePerKm: secondsToTime(paceSecondsPerKm),
    pacePerMile: secondsToTime(paceSecondsPerMile),
    speedKph: Math.round(speedKph * 10) / 10,
    speedMph: Math.round(speedMph * 10) / 10,
    level,
    percentile,
    ageGroup,
    ageAdjustedPercentile,
  };
}
