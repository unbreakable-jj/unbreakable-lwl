import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { GoogleMap, useLoadScript, Marker, Polyline } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import { Play, Pause, Download, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts';

interface Position {
  lat: number;
  lng: number;
  timestamp: number;
  elevation?: number;
}

interface RunMapProps {
  positions: Position[];
  isTracking?: boolean;
  showReplay?: boolean;
  showElevation?: boolean;
  showExport?: boolean;
  className?: string;
}

// Dark theme map styles
const darkMapStyles = [
  { elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a1a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#263c3f' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#6b9a76' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1f2835' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#f3d19c' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2f3948' }] },
  { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#515c6d' }] },
  { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: '#17263c' }] },
];

const mapContainerStyle = {
  width: '100%',
  height: '300px',
};

const polylineOptions = {
  strokeColor: '#FF6600',
  strokeOpacity: 0.9,
  strokeWeight: 5,
};

export function RunMap({ 
  positions, 
  isTracking = false, 
  showReplay = false,
  showElevation = false,
  showExport = false,
  className = ''
}: RunMapProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayIndex, setReplayIndex] = useState(0);
  const replayIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate center based on positions
  const center = useMemo(() => {
    if (positions.length === 0) {
      return { lat: 51.505, lng: -0.09 }; // Default to London
    }
    const lastPos = positions[positions.length - 1];
    return { lat: lastPos.lat, lng: lastPos.lng };
  }, [positions]);

  // Get path for polyline
  const path = useMemo(() => {
    return positions.map(p => ({ lat: p.lat, lng: p.lng }));
  }, [positions]);

  // Replay path (partial during replay)
  const replayPath = useMemo(() => {
    if (!isReplaying && replayIndex === 0) return path;
    return path.slice(0, replayIndex + 1);
  }, [path, isReplaying, replayIndex]);

  // Current marker position
  const currentPosition = useMemo(() => {
    if (isReplaying && positions[replayIndex]) {
      return { lat: positions[replayIndex].lat, lng: positions[replayIndex].lng };
    }
    if (positions.length > 0) {
      const last = positions[positions.length - 1];
      return { lat: last.lat, lng: last.lng };
    }
    return null;
  }, [positions, isReplaying, replayIndex]);

  // Elevation data for chart
  const elevationData = useMemo(() => {
    if (!showElevation) return [];
    return positions.map((p, i) => ({
      distance: i,
      elevation: p.elevation || Math.random() * 50 + 10, // Mock elevation if not available
    }));
  }, [positions, showElevation]);

  // Center map on current position
  useEffect(() => {
    if (mapRef.current && isTracking && positions.length > 0) {
      const last = positions[positions.length - 1];
      mapRef.current.panTo({ lat: last.lat, lng: last.lng });
    }
  }, [positions, isTracking]);

  // Handle map load
  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    
    // Fit bounds if we have multiple positions
    if (positions.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      positions.forEach(p => bounds.extend({ lat: p.lat, lng: p.lng }));
      map.fitBounds(bounds, 50);
    }
  }, [positions]);

  // Start replay
  const startReplay = useCallback(() => {
    setIsReplaying(true);
    setReplayIndex(0);
    
    replayIntervalRef.current = setInterval(() => {
      setReplayIndex(prev => {
        if (prev >= positions.length - 1) {
          if (replayIntervalRef.current) {
            clearInterval(replayIntervalRef.current);
          }
          setIsReplaying(false);
          return positions.length - 1;
        }
        return prev + 1;
      });
    }, 200); // 5x speed (1 second = 5 positions)
  }, [positions.length]);

  // Stop replay
  const stopReplay = useCallback(() => {
    if (replayIntervalRef.current) {
      clearInterval(replayIntervalRef.current);
    }
    setIsReplaying(false);
  }, []);

  // Reset replay
  const resetReplay = useCallback(() => {
    stopReplay();
    setReplayIndex(0);
  }, [stopReplay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (replayIntervalRef.current) {
        clearInterval(replayIntervalRef.current);
      }
    };
  }, []);

  // Export to GPX
  const exportToGPX = useCallback(() => {
    const gpxContent = generateGPX(positions);
    const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `run-${new Date().toISOString().split('T')[0]}.gpx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [positions]);

  if (loadError) {
    return (
      <div className={`w-full h-[300px] bg-muted flex items-center justify-center ${className}`}>
        <p className="text-muted-foreground">Error loading map</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`w-full h-[300px] bg-muted flex items-center justify-center ${className}`}>
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Map Container */}
      <div className="w-full rounded-lg overflow-hidden border border-border">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={16}
          onLoad={onMapLoad}
          options={{
            styles: darkMapStyles,
            disableDefaultUI: true,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
          }}
        >
          {/* Route Polyline */}
          {(isReplaying ? replayPath : path).length > 1 && (
            <Polyline
              path={isReplaying ? replayPath : path}
              options={polylineOptions}
            />
          )}

          {/* Current Position Marker */}
          {currentPosition && (
            <Marker
              position={currentPosition}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: '#FF6600',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 3,
              }}
            />
          )}

          {/* Start Marker */}
          {positions.length > 0 && (
            <Marker
              position={{ lat: positions[0].lat, lng: positions[0].lng }}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: '#22C55E',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 2,
              }}
            />
          )}
        </GoogleMap>
      </div>

      {/* Controls */}
      {(showReplay || showExport) && positions.length > 1 && (
        <div className="flex items-center justify-center gap-3 mt-4">
          {showReplay && (
            <>
              {!isReplaying ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={startReplay}
                  className="font-display tracking-wide"
                >
                  <Play className="w-4 h-4 mr-1" />
                  REPLAY
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={stopReplay}
                  className="font-display tracking-wide"
                >
                  <Pause className="w-4 h-4 mr-1" />
                  PAUSE
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={resetReplay}
                className="font-display tracking-wide"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </>
          )}
          
          {showExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={exportToGPX}
              className="font-display tracking-wide"
            >
              <Download className="w-4 h-4 mr-1" />
              GPX
            </Button>
          )}
        </div>
      )}

      {/* Elevation Chart */}
      {showElevation && elevationData.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 bg-card rounded-lg border border-border p-4"
        >
          <p className="text-xs text-muted-foreground mb-2 font-display tracking-wide">ELEVATION</p>
          <ChartContainer
            config={{
              elevation: {
                label: 'Elevation',
                color: 'hsl(var(--primary))',
              },
            }}
            className="h-[100px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={elevationData}>
                <defs>
                  <linearGradient id="elevationGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="distance" hide />
                <YAxis hide domain={['auto', 'auto']} />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 }}
                />
                <Area
                  type="monotone"
                  dataKey="elevation"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#elevationGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </motion.div>
      )}
    </div>
  );
}

// Helper function to generate GPX content
function generateGPX(positions: Position[]): string {
  const timestamp = new Date().toISOString();
  const trackpoints = positions
    .map(p => `      <trkpt lat="${p.lat}" lon="${p.lng}">
        <time>${new Date(p.timestamp).toISOString()}</time>
        ${p.elevation ? `<ele>${p.elevation}</ele>` : ''}
      </trkpt>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Live Without Limits Run Tracker"
  xmlns="http://www.topografix.com/GPX/1/1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <time>${timestamp}</time>
  </metadata>
  <trk>
    <name>Run ${timestamp.split('T')[0]}</name>
    <trkseg>
${trackpoints}
    </trkseg>
  </trk>
</gpx>`;
}

// Helper function to convert positions to GeoJSON
export function positionsToGeoJSON(positions: Position[]): string {
  const coordinates = positions.map(p => [p.lng, p.lat, p.elevation || 0, p.timestamp]);
  
  return JSON.stringify({
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates,
    },
    properties: {
      timestamps: positions.map(p => p.timestamp),
    },
  });
}

// Helper function to parse GeoJSON or legacy format back to positions
export function geoJSONToPositions(routeData: string): Position[] {
  if (!routeData) return [];
  
  // Try to parse as GeoJSON first
  try {
    const data = JSON.parse(routeData);
    if (data.geometry?.type === 'LineString' && data.geometry?.coordinates) {
      return data.geometry.coordinates.map((coord: number[], i: number) => ({
        lng: coord[0],
        lat: coord[1],
        elevation: coord[2] || undefined,
        timestamp: data.properties?.timestamps?.[i] || Date.now(),
      }));
    }
  } catch {
    // Not JSON, try legacy pipe-separated format: "lat,lng|lat,lng|..."
    const points = routeData.split('|');
    if (points.length > 0 && points[0].includes(',')) {
      return points.map((point, i) => {
        const [lat, lng] = point.split(',').map(Number);
        return {
          lat: lat || 0,
          lng: lng || 0,
          timestamp: Date.now() - (points.length - i) * 1000,
        };
      }).filter(p => p.lat !== 0 && p.lng !== 0);
    }
  }
  
  return [];
}
