export type CardioTrackerActivity = 'walk' | 'run' | 'cycle' | 'row' | 'swim';

export interface CardioTrackerPosition {
  lat: number;
  lng: number;
  timestamp: number;
  accuracy: number;
  speed: number | null;
}

interface ActivityTrackingRules {
  minMovementKm: number;
  maxSpeedKph: number;
  baseAccuracyM: number;
  maxAccuracyM: number;
}

const ACTIVITY_TRACKING_RULES: Record<CardioTrackerActivity, ActivityTrackingRules> = {
  walk: { minMovementKm: 0.002, maxSpeedKph: 12, baseAccuracyM: 55, maxAccuracyM: 90 },
  run: { minMovementKm: 0.0025, maxSpeedKph: 28, baseAccuracyM: 45, maxAccuracyM: 85 },
  cycle: { minMovementKm: 0.005, maxSpeedKph: 75, baseAccuracyM: 60, maxAccuracyM: 110 },
  row: { minMovementKm: 0.004, maxSpeedKph: 35, baseAccuracyM: 55, maxAccuracyM: 95 },
  swim: { minMovementKm: 0.002, maxSpeedKph: 12, baseAccuracyM: 35, maxAccuracyM: 65 },
};

export interface DistanceIncrementResult {
  accepted: boolean;
  incrementKm: number;
  displaySpeedKph: number | null;
  allowedAccuracyM: number;
}

export function haversineDistanceKm(
  first: Pick<CardioTrackerPosition, 'lat' | 'lng'>,
  second: Pick<CardioTrackerPosition, 'lat' | 'lng'>
): number {
  const earthRadiusKm = 6371;
  const deltaLat = ((second.lat - first.lat) * Math.PI) / 180;
  const deltaLng = ((second.lng - first.lng) * Math.PI) / 180;
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos((first.lat * Math.PI) / 180) *
      Math.cos((second.lat * Math.PI) / 180) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);

  return earthRadiusKm * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export function getAcceptedAccuracyMeters(
  activity: CardioTrackerActivity,
  timeDeltaSeconds: number
): number {
  const rules = ACTIVITY_TRACKING_RULES[activity];
  const dynamicBuffer = Math.min(30, Math.floor(timeDeltaSeconds / 10) * 10);
  return Math.min(rules.maxAccuracyM, rules.baseAccuracyM + dynamicBuffer);
}

export function calculateDistanceIncrement({
  activity,
  previousPosition,
  nextPosition,
}: {
  activity: CardioTrackerActivity;
  previousPosition: CardioTrackerPosition | null;
  nextPosition: CardioTrackerPosition;
}): DistanceIncrementResult {
  const rules = ACTIVITY_TRACKING_RULES[activity];
  const reportedSpeedKph =
    nextPosition.speed !== null && nextPosition.speed > 0 ? nextPosition.speed * 3.6 : null;

  if (!previousPosition) {
    return {
      accepted: nextPosition.accuracy <= rules.maxAccuracyM,
      incrementKm: 0,
      displaySpeedKph: reportedSpeedKph,
      allowedAccuracyM: rules.maxAccuracyM,
    };
  }

  const timeDeltaSeconds = Math.max(1, (nextPosition.timestamp - previousPosition.timestamp) / 1000);
  const allowedAccuracyM = getAcceptedAccuracyMeters(activity, timeDeltaSeconds);

  if (nextPosition.accuracy > allowedAccuracyM) {
    return {
      accepted: false,
      incrementKm: 0,
      displaySpeedKph: reportedSpeedKph,
      allowedAccuracyM,
    };
  }

  const linearDistanceKm = haversineDistanceKm(previousPosition, nextPosition);
  const derivedSpeedKph = (linearDistanceKm / timeDeltaSeconds) * 3600;

  if (linearDistanceKm < rules.minMovementKm && (!reportedSpeedKph || reportedSpeedKph < 1.5)) {
    return {
      accepted: false,
      incrementKm: 0,
      displaySpeedKph: reportedSpeedKph,
      allowedAccuracyM,
    };
  }

  if (derivedSpeedKph > rules.maxSpeedKph * 1.2) {
    return {
      accepted: false,
      incrementKm: 0,
      displaySpeedKph: reportedSpeedKph,
      allowedAccuracyM,
    };
  }

  let incrementKm = linearDistanceKm;

  if (reportedSpeedKph && timeDeltaSeconds >= 12) {
    const speedDistanceKm = (reportedSpeedKph * timeDeltaSeconds) / 3600;
    const maxBoostKm = Math.max(
      linearDistanceKm * 1.6,
      linearDistanceKm + Math.min(nextPosition.accuracy / 1000, 0.08)
    );

    incrementKm = Math.min(Math.max(linearDistanceKm, speedDistanceKm), maxBoostKm);
  }

  return {
    accepted: true,
    incrementKm,
    displaySpeedKph: reportedSpeedKph ?? derivedSpeedKph,
    allowedAccuracyM,
  };
}

export function getPersistedTrackerPositions<T>(positions: T[], maxPoints: number = 250): T[] {
  if (positions.length <= maxPoints) return positions;
  return positions.slice(-maxPoints);
}

export function positionsToRouteGeoJSON(
  positions: Array<Pick<CardioTrackerPosition, 'lat' | 'lng' | 'timestamp'>>
): string {
  return JSON.stringify({
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: positions.map((position) => [position.lng, position.lat, 0, position.timestamp]),
    },
    properties: {
      timestamps: positions.map((position) => position.timestamp),
    },
  });
}