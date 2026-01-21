// Utility functions for segment detection, matching, and GPS calculations

export interface Coordinate {
  lat: number;
  lng: number;
}

export interface SegmentCandidate {
  startIndex: number;
  endIndex: number;
  startCoord: Coordinate;
  endCoord: Coordinate;
  distanceM: number;
  polyline: Coordinate[];
}

// Haversine formula to calculate distance between two coordinates in meters
export function haversineDistance(coord1: Coordinate, coord2: Coordinate): number {
  const R = 6371000; // Earth's radius in meters
  const lat1Rad = (coord1.lat * Math.PI) / 180;
  const lat2Rad = (coord2.lat * Math.PI) / 180;
  const deltaLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const deltaLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Calculate total distance of a polyline
export function calculatePolylineDistance(coords: Coordinate[]): number {
  let total = 0;
  for (let i = 1; i < coords.length; i++) {
    total += haversineDistance(coords[i - 1], coords[i]);
  }
  return total;
}

// Decode Google Maps encoded polyline
export function decodePolyline(encoded: string): Coordinate[] {
  const coords: Coordinate[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += deltaLat;

    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += deltaLng;

    coords.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }

  return coords;
}

// Encode coordinates to polyline
export function encodePolyline(coords: Coordinate[]): string {
  let encoded = '';
  let prevLat = 0;
  let prevLng = 0;

  for (const coord of coords) {
    const lat = Math.round(coord.lat * 1e5);
    const lng = Math.round(coord.lng * 1e5);

    encoded += encodeNumber(lat - prevLat);
    encoded += encodeNumber(lng - prevLng);

    prevLat = lat;
    prevLng = lng;
  }

  return encoded;
}

function encodeNumber(num: number): string {
  let encoded = '';
  let value = num < 0 ? ~(num << 1) : num << 1;

  while (value >= 0x20) {
    encoded += String.fromCharCode((0x20 | (value & 0x1f)) + 63);
    value >>= 5;
  }

  encoded += String.fromCharCode(value + 63);
  return encoded;
}

// Check if a point is within tolerance of another point (25m default)
export function isPointNear(point: Coordinate, target: Coordinate, toleranceM: number = 25): boolean {
  return haversineDistance(point, target) <= toleranceM;
}

// Find if a run matches a segment (start and end points within tolerance)
export function findSegmentMatch(
  runCoords: Coordinate[],
  segmentStart: Coordinate,
  segmentEnd: Coordinate,
  toleranceM: number = 25
): { matched: boolean; startIndex: number; endIndex: number } | null {
  let startIndex = -1;
  let endIndex = -1;

  // Find start point match
  for (let i = 0; i < runCoords.length; i++) {
    if (isPointNear(runCoords[i], segmentStart, toleranceM)) {
      startIndex = i;
      break;
    }
  }

  if (startIndex === -1) return null;

  // Find end point match (must come after start)
  for (let i = startIndex + 1; i < runCoords.length; i++) {
    if (isPointNear(runCoords[i], segmentEnd, toleranceM)) {
      endIndex = i;
      break;
    }
  }

  if (endIndex === -1) return null;

  return { matched: true, startIndex, endIndex };
}

// Generate segment candidates from a run (for auto-detection)
// Looks for segments between 400m and 5km
export function generateSegmentCandidates(
  coords: Coordinate[],
  minDistanceM: number = 400,
  maxDistanceM: number = 5000
): SegmentCandidate[] {
  const candidates: SegmentCandidate[] = [];
  const step = Math.max(1, Math.floor(coords.length / 50)); // Sample every ~2% of points

  for (let i = 0; i < coords.length - 10; i += step) {
    let accumulatedDistance = 0;

    for (let j = i + 1; j < coords.length; j++) {
      accumulatedDistance += haversineDistance(coords[j - 1], coords[j]);

      // Check if we're in the valid range
      if (accumulatedDistance >= minDistanceM && accumulatedDistance <= maxDistanceM) {
        // Only add segments at meaningful intervals (every 200m or so)
        if (
          accumulatedDistance >= minDistanceM &&
          (candidates.length === 0 ||
            haversineDistance(coords[i], candidates[candidates.length - 1].startCoord) > 100)
        ) {
          candidates.push({
            startIndex: i,
            endIndex: j,
            startCoord: coords[i],
            endCoord: coords[j],
            distanceM: accumulatedDistance,
            polyline: coords.slice(i, j + 1),
          });
        }
      }

      if (accumulatedDistance > maxDistanceM) break;
    }
  }

  return candidates;
}

// Check if two segments are similar (same route)
export function areSegmentsSimilar(
  seg1Start: Coordinate,
  seg1End: Coordinate,
  seg2Start: Coordinate,
  seg2End: Coordinate,
  toleranceM: number = 50
): boolean {
  return (
    isPointNear(seg1Start, seg2Start, toleranceM) && isPointNear(seg1End, seg2End, toleranceM)
  );
}

// Generate a name for an auto-detected segment
export function generateSegmentName(distanceM: number, index: number): string {
  const distanceKm = (distanceM / 1000).toFixed(1);
  const prefixes = ['Sprint', 'Loop', 'Climb', 'Stretch', 'Trail', 'Path'];
  const prefix = prefixes[index % prefixes.length];
  return `${prefix} ${distanceKm}km`;
}

// Calculate elapsed time for a segment from run timestamps
export function calculateSegmentTime(
  startIndex: number,
  endIndex: number,
  totalDurationSeconds: number,
  totalPoints: number
): number {
  // Approximate time based on point indices
  const fraction = (endIndex - startIndex) / totalPoints;
  return Math.round(totalDurationSeconds * fraction);
}

// Format time for display
export function formatSegmentTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Get achievement icon based on rank
export function getAchievementIcon(rank: number, isLocalLegend: boolean = false): string {
  if (isLocalLegend) return '🌿';
  if (rank === 1) return '👑'; // KOM/QOM/CR
  if (rank <= 10) return '🏆'; // Top 10
  return '';
}

// Get PR medal icon
export function getPRMedalIcon(prRank: number): string {
  switch (prRank) {
    case 1: return '🥇';
    case 2: return '🥈';
    case 3: return '🥉';
    default: return '';
  }
}
