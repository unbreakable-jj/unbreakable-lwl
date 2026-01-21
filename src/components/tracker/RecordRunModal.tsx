import { useState, useEffect, useCallback, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRuns } from '@/hooks/useRuns';
import { toast } from 'sonner';
import { Play, Square, MapPin, Timer, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { RunMap, positionsToGeoJSON } from './RunMap';

interface RecordRunModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Position {
  lat: number;
  lng: number;
  timestamp: number;
}

export function RecordRunModal({ isOpen, onClose }: RecordRunModalProps) {
  const { createRun } = useRuns();
  const [mode, setMode] = useState<'gps' | 'manual'>('gps');
  const [loading, setLoading] = useState(false);

  // GPS tracking state
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [positions, setPositions] = useState<Position[]>([]);
  const [distance, setDistance] = useState(0);
  const watchIdRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Manual entry state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [distanceKm, setDistanceKm] = useState('');
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('0');
  const [isPublic, setIsPublic] = useState(true);

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsTracking(true);
    setStartTime(new Date());
    setPositions([]);
    setDistance(0);
    setElapsedSeconds(0);

    // Start timer
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    // Start GPS tracking
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newPosition: Position = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: Date.now(),
        };

        setPositions((prev) => {
          if (prev.length > 0) {
            const lastPos = prev[prev.length - 1];
            const segmentDistance = calculateDistance(
              lastPos.lat,
              lastPos.lng,
              newPosition.lat,
              newPosition.lng
            );
            // Only add if moved more than 5 meters (0.005 km)
            if (segmentDistance > 0.005) {
              setDistance((d) => d + segmentDistance);
              return [...prev, newPosition];
            }
            return prev;
          }
          return [newPosition];
        });
      },
      (error) => {
        console.error('GPS Error:', error);
        toast.error('Could not get your location');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      }
    );
  }, []);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsTracking(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveGpsRun = async () => {
    if (distance < 0.01) {
      toast.error('Run distance is too short');
      return;
    }

    setLoading(true);

    // Calculate pace
    const paceSeconds = Math.round(elapsedSeconds / distance);
    const speedKph = (distance / elapsedSeconds) * 3600;

    // Convert positions to GeoJSON for storage
    const geoJSON = positionsToGeoJSON(positions);

    const { error } = await createRun({
      title: title || 'GPS Run',
      description: description || null,
      distance_km: Math.round(distance * 1000) / 1000,
      duration_seconds: elapsedSeconds,
      started_at: startTime?.toISOString() || new Date().toISOString(),
      ended_at: new Date().toISOString(),
      pace_per_km_seconds: paceSeconds,
      average_speed_kph: Math.round(speedKph * 100) / 100,
      elevation_gain_m: null,
      calories_burned: Math.round(distance * 60), // Rough estimate
      route_polyline: geoJSON, // Store as GeoJSON
      map_snapshot_url: null,
      is_gps_tracked: true,
      weather_conditions: null,
      temperature_celsius: null,
      notes: null,
      is_public: isPublic,
    });

    setLoading(false);

    if (error) {
      toast.error('Failed to save run');
    } else {
      toast.success('Run saved!');
      resetForm();
      onClose();
    }
  };

  const handleSaveManualRun = async () => {
    const dist = parseFloat(distanceKm);
    const totalSeconds =
      parseInt(hours || '0') * 3600 + parseInt(minutes || '0') * 60 + parseInt(seconds || '0');

    if (isNaN(dist) || dist <= 0) {
      toast.error('Please enter a valid distance');
      return;
    }
    if (totalSeconds <= 0) {
      toast.error('Please enter a valid time');
      return;
    }

    setLoading(true);

    const paceSeconds = Math.round(totalSeconds / dist);
    const speedKph = (dist / totalSeconds) * 3600;

    const { error } = await createRun({
      title: title || 'Run',
      description: description || null,
      distance_km: dist,
      duration_seconds: totalSeconds,
      started_at: new Date().toISOString(),
      ended_at: null,
      pace_per_km_seconds: paceSeconds,
      average_speed_kph: Math.round(speedKph * 100) / 100,
      elevation_gain_m: null,
      calories_burned: Math.round(dist * 60),
      route_polyline: null,
      map_snapshot_url: null,
      is_gps_tracked: false,
      weather_conditions: null,
      temperature_celsius: null,
      notes: null,
      is_public: isPublic,
    });

    setLoading(false);

    if (error) {
      toast.error('Failed to save run');
    } else {
      toast.success('Run saved!');
      resetForm();
      onClose();
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDistanceKm('');
    setHours('0');
    setMinutes('');
    setSeconds('0');
    setIsPublic(true);
    setPositions([]);
    setDistance(0);
    setElapsedSeconds(0);
    setStartTime(null);
    stopTracking();
  };

  const handleClose = () => {
    if (isTracking) {
      stopTracking();
    }
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-wide text-center">
            RECORD YOUR RUN
          </DialogTitle>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as 'gps' | 'manual')} className="mt-4">
          <TabsList className="grid w-full grid-cols-2 bg-muted">
            <TabsTrigger value="gps" className="font-display tracking-wide" disabled={isTracking}>
              <MapPin className="w-4 h-4 mr-2" />
              GPS Track
            </TabsTrigger>
            <TabsTrigger value="manual" className="font-display tracking-wide" disabled={isTracking}>
              <Pencil className="w-4 h-4 mr-2" />
              Manual Entry
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gps" className="space-y-6 mt-6">
            <AnimatePresence mode="wait">
              {!isTracking ? (
                <motion.div
                  key="start"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-8"
                >
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <MapPin className="w-12 h-12 text-primary" />
                  </div>
                  <p className="text-muted-foreground mb-6">
                    Tap start to begin tracking your run with GPS
                  </p>
                  <Button
                    size="lg"
                    className="font-display text-lg tracking-wide px-12 py-6"
                    onClick={startTracking}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    START RUN
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="tracking"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-4"
                >
                  <div className="text-center mb-4">
                    <p className="font-display text-5xl text-primary tracking-wide">
                      {formatTime(elapsedSeconds)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <p className="font-display text-2xl text-foreground tracking-wide">
                        {distance.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">km</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <p className="font-display text-2xl text-foreground tracking-wide">
                        {distance > 0
                          ? formatTime(Math.round(elapsedSeconds / distance)).slice(3)
                          : '--:--'}
                      </p>
                      <p className="text-xs text-muted-foreground">/km pace</p>
                    </div>
                  </div>

                  {/* Live GPS Map */}
                  <RunMap 
                    positions={positions} 
                    isTracking={true}
                    className="mb-4"
                  />

                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="w-2 h-2 bg-green-500 rounded-full"
                    />
                    GPS Active • {positions.length} points
                  </div>

                  <div className="text-center">
                    <Button
                      size="lg"
                      variant="destructive"
                      className="font-display text-lg tracking-wide px-12 py-6"
                      onClick={stopTracking}
                    >
                      <Square className="w-5 h-5 mr-2" />
                      STOP RUN
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!isTracking && distance > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 border-t border-border pt-6"
              >
                <div className="grid grid-cols-3 gap-4 text-center mb-4">
                  <div>
                    <p className="font-display text-2xl text-primary">{distance.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">km</p>
                  </div>
                  <div>
                    <p className="font-display text-2xl text-foreground">
                      {formatTime(elapsedSeconds)}
                    </p>
                    <p className="text-xs text-muted-foreground">time</p>
                  </div>
                  <div>
                    <p className="font-display text-2xl text-foreground">
                      {distance > 0
                        ? formatTime(Math.round(elapsedSeconds / distance)).slice(3)
                        : '--:--'}
                    </p>
                    <p className="text-xs text-muted-foreground">/km</p>
                  </div>
                </div>

                {/* Post-run map with replay and export */}
                <RunMap 
                  positions={positions}
                  showReplay={true}
                  showElevation={true}
                  showExport={true}
                />

                <div className="space-y-2">
                  <Label>Title (optional)</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Morning Run"
                    className="bg-input border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description (optional)</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="How did it feel?"
                    className="bg-input border-border"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Public activity</Label>
                  <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                </div>

                <Button
                  className="w-full font-display tracking-wide"
                  onClick={handleSaveGpsRun}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Run'}
                </Button>
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="manual" className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Morning Run"
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label>Distance (km)</Label>
              <Input
                type="number"
                step="0.01"
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value)}
                placeholder="5.00"
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label>Duration</Label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Input
                    type="number"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    placeholder="0"
                    min="0"
                    className="bg-input border-border text-center"
                  />
                  <p className="text-xs text-muted-foreground text-center mt-1">hours</p>
                </div>
                <div>
                  <Input
                    type="number"
                    value={minutes}
                    onChange={(e) => setMinutes(e.target.value)}
                    placeholder="30"
                    min="0"
                    max="59"
                    className="bg-input border-border text-center"
                  />
                  <p className="text-xs text-muted-foreground text-center mt-1">min</p>
                </div>
                <div>
                  <Input
                    type="number"
                    value={seconds}
                    onChange={(e) => setSeconds(e.target.value)}
                    placeholder="0"
                    min="0"
                    max="59"
                    className="bg-input border-border text-center"
                  />
                  <p className="text-xs text-muted-foreground text-center mt-1">sec</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="How did it feel?"
                className="bg-input border-border"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Public activity</Label>
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
            </div>

            <Button
              className="w-full font-display tracking-wide"
              onClick={handleSaveManualRun}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Run'}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
