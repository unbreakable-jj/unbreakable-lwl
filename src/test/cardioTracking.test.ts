import { describe, expect, it } from 'vitest';
import {
  calculateDistanceIncrement,
  getPersistedTrackerPositions,
  positionsToRouteGeoJSON,
} from '@/lib/cardioTracking';

describe('cardioTracking', () => {
  it('accepts normal running movement and accumulates linear distance', () => {
    const result = calculateDistanceIncrement({
      activity: 'run',
      previousPosition: {
        lat: 53.4084,
        lng: -2.9916,
        timestamp: 1_000,
        accuracy: 8,
        speed: 2.8,
      },
      nextPosition: {
        lat: 53.4093,
        lng: -2.9916,
        timestamp: 21_000,
        accuracy: 12,
        speed: 3.1,
      },
    });

    expect(result.accepted).toBe(true);
    expect(result.incrementKm).toBeGreaterThan(0.09);
    expect(result.displaySpeedKph).toBeGreaterThan(10);
  });

  it('allows broader accuracy after long gaps and uses speed to reduce undercount', () => {
    const result = calculateDistanceIncrement({
      activity: 'run',
      previousPosition: {
        lat: 53.4084,
        lng: -2.9916,
        timestamp: 0,
        accuracy: 10,
        speed: 3.1,
      },
      nextPosition: {
        lat: 53.4093,
        lng: -2.9911,
        timestamp: 60_000,
        accuracy: 72,
        speed: 3.2,
      },
    });

    expect(result.accepted).toBe(true);
    expect(result.incrementKm).toBeGreaterThan(0.05);
    expect(result.allowedAccuracyM).toBeGreaterThanOrEqual(70);
  });

  it('rejects implausible GPS jumps', () => {
    const result = calculateDistanceIncrement({
      activity: 'run',
      previousPosition: {
        lat: 53.4084,
        lng: -2.9916,
        timestamp: 0,
        accuracy: 10,
        speed: 3,
      },
      nextPosition: {
        lat: 53.4284,
        lng: -2.9916,
        timestamp: 10_000,
        accuracy: 10,
        speed: 3,
      },
    });

    expect(result.accepted).toBe(false);
    expect(result.incrementKm).toBe(0);
  });

  it('limits persisted route history and serializes geojson', () => {
    const points = Array.from({ length: 300 }, (_, index) => ({
      lat: 53.4 + index / 10_000,
      lng: -2.99,
      timestamp: index * 1000,
      accuracy: 10,
      speed: 3,
    }));

    const persisted = getPersistedTrackerPositions(points);
    const geojson = JSON.parse(positionsToRouteGeoJSON(persisted));

    expect(persisted).toHaveLength(250);
    expect(geojson.geometry.coordinates).toHaveLength(250);
    expect(geojson.properties.timestamps[0]).toBe(50_000);
  });
});