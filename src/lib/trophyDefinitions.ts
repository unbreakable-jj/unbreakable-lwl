// Trophy definitions for age/distance adjusted leaderboards

export type AgeGroup = '18-29' | '30-39' | '40-49' | '50-59' | '60+';
export type DistanceBucket = '5k' | '10k' | 'half' | 'any';
export type TrophyRank = 1 | 2 | 3;

export interface TrophyCategory {
  id: string;
  label: string;
  ageGroup: AgeGroup | null;
  distanceBucket: DistanceBucket;
}

export const AGE_GROUPS: { value: AgeGroup; label: string; minAge: number; maxAge: number }[] = [
  { value: '18-29', label: '18-29', minAge: 18, maxAge: 29 },
  { value: '30-39', label: '30-39', minAge: 30, maxAge: 39 },
  { value: '40-49', label: '40-49', minAge: 40, maxAge: 49 },
  { value: '50-59', label: '50-59', minAge: 50, maxAge: 59 },
  { value: '60+', label: '60+', minAge: 60, maxAge: 999 },
];

export const DISTANCE_BUCKETS: { 
  value: DistanceBucket; 
  label: string; 
  minKm: number; 
  maxKm: number;
}[] = [
  { value: '5k', label: '5K', minKm: 4.5, maxKm: 5.5 },
  { value: '10k', label: '10K', minKm: 9.0, maxKm: 11.0 },
  { value: 'half', label: 'Half Marathon', minKm: 19.1, maxKm: 23.1 },
  { value: 'any', label: 'Any Distance', minKm: 0, maxKm: 999 },
];

export const TROPHY_ICONS: Record<TrophyRank, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
};

export const TROPHY_LABELS: Record<TrophyRank, string> = {
  1: 'Gold',
  2: 'Silver',
  3: 'Bronze',
};

export function getAgeGroupFromDate(dateOfBirth: Date, runDate: Date): AgeGroup | null {
  const age = calculateAge(dateOfBirth, runDate);
  if (age < 18) return null;
  
  for (const group of AGE_GROUPS) {
    if (age >= group.minAge && age <= group.maxAge) {
      return group.value;
    }
  }
  return '60+';
}

export function calculateAge(birthDate: Date, atDate: Date): number {
  let age = atDate.getFullYear() - birthDate.getFullYear();
  const m = atDate.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && atDate.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export function getDistanceBucket(distanceKm: number): DistanceBucket | null {
  for (const bucket of DISTANCE_BUCKETS) {
    if (bucket.value === 'any') continue;
    if (distanceKm >= bucket.minKm && distanceKm <= bucket.maxKm) {
      return bucket.value;
    }
  }
  return 'any';
}

export function buildCategoryId(ageGroup: AgeGroup | null, distanceBucket: DistanceBucket): string {
  if (ageGroup) {
    return `${ageGroup}_${distanceBucket}`;
  }
  return `overall_${distanceBucket}`;
}

export function parseCategoryId(categoryId: string): { ageGroup: AgeGroup | null; distanceBucket: DistanceBucket } {
  const parts = categoryId.split('_');
  if (parts[0] === 'overall') {
    return { ageGroup: null, distanceBucket: parts[1] as DistanceBucket };
  }
  return { 
    ageGroup: parts[0] as AgeGroup, 
    distanceBucket: parts[1] as DistanceBucket 
  };
}

export function getCategoryLabel(categoryId: string): string {
  const { ageGroup, distanceBucket } = parseCategoryId(categoryId);
  const distLabel = DISTANCE_BUCKETS.find(d => d.value === distanceBucket)?.label || distanceBucket;
  
  if (ageGroup) {
    return `${ageGroup} ${distLabel}`;
  }
  return `Overall ${distLabel}`;
}

export function formatPace(secondsPerKm: number): string {
  const mins = Math.floor(secondsPerKm / 60);
  const secs = Math.round(secondsPerKm % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}/km`;
}
