import { useState, useEffect, useCallback, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRuns } from '@/hooks/useRuns';
import { usePersonalRecords } from '@/hooks/usePersonalRecords';
import { useMedals } from '@/hooks/useMedals';
import { useTrophies } from '@/hooks/useTrophies';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { MedalCheckStats } from '@/lib/medalDefinitions';
import { getCategoryLabel, TROPHY_ICONS } from '@/lib/trophyDefinitions';
import { toast } from 'sonner';
import { Play, Square, Timer, Globe, Users, Lock, Footprints, Bike, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CountdownOverlay } from '@/components/CountdownOverlay';

interface CardioTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ActivityType = 'walk' | 'run' | 'cycle';
type EntryMode = 'live' | 'manual';

interface Position {
  lat: number;
  lng: number;
  timestamp: number;
}

const ACTIVITY_CONFIG = {
  walk: { 
    label: 'WALK', 
    icon: Footprints, 
    color: 'text-sky-500',
    bgColor: 'bg-sky-500/10',
    borderColor: 'border-sky-500/30'
  },
  run: { 
    label: 'RUN', 
    icon: Play, 
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/30'
  },
  cycle: { 
    label: 'CYCLE', 
    icon: Bike, 
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30'
  },
};

export function CardioTrackerModal({ isOpen, onClose }: CardioTrackerModalProps) {
  const { createRun } = useRuns();
  const { checkAndUpdatePRs } = usePersonalRecords();
  const { checkAndAwardMedals } = useMedals();
  const { checkAndAwardTrophies } = useTrophies();
  const { profile } = useProfile();
  const { user } = useAuth();
  
  const [entryMode, setEntryMode] = useState<EntryMode>('live');
  const [phase, setPhase] = useState<'select' | 'countdown' | 'tracking' | 'summary' | 'manual'>('select');
  const [activity, setActivity] = useState<ActivityType | null>(null);
  const [loading, setLoading] = useState(false);

  // GPS tracking state
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [positions, setPositions] = useState<Position[]>([]);
  const [distance, setDistance] = useState(0);
  const watchIdRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Post-session state (also used for manual entry)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('public');

  // Manual entry fields
  const [manualDistance, setManualDistance] = useState('');
  const [manualHours, setManualHours] = useState('0');
  const [manualMinutes, setManualMinutes] = useState('');
  const [manualSeconds, setManualSeconds] = useState('0');

  // Haversine distance calculation
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
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

  const selectActivity = (type: ActivityType) => {
    setActivity(type);
    if (entryMode === 'live') {
      if (!navigator.geolocation) {
        toast.error('Geolocation is not supported by your browser');
        return;
      }
      setPhase('countdown');
    } else {
      setPhase('manual');
    }
  };

  const startTracking = useCallback(() => {
    setPhase('tracking');
    setStartTime(new Date());
    setPositions([]);
    setDistance(0);
    setElapsedSeconds(0);

    // Start timer
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    // Start GPS tracking (background only - no map)
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
            // Only add if moved more than 5 meters
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
    setPhase('summary');
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

  const calculateSpeed = () => {
    if (elapsedSeconds === 0 || distance === 0) return 0;
    return (distance / elapsedSeconds) * 3600; // km/h
  };

  const calculatePace = () => {
    if (distance === 0) return '--:--';
    const paceSeconds = Math.round(elapsedSeconds / distance);
    const mins = Math.floor(paceSeconds / 60);
    const secs = paceSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const triggerConfetti = () => {
    const colors = ['#FF6600', '#FFB366', '#FF8533', '#FFCC99'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
          position: fixed;
          top: -10px;
          left: ${Math.random() * 100}vw;
          width: 10px;
          height: 10px;
          background: ${colors[Math.floor(Math.random() * colors.length)]};
          border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
          animation: confetti-fall 3s ease-out forwards;
          z-index: 9999;
          pointer-events: none;
        `;
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 3000);
      }, i * 30);
    }
  };

  const checkAchievements = async (runData: {
    id: string;
    distance_km: number;
    duration_seconds: number;
    started_at: string;
    is_gps_tracked: boolean;
    pace_per_km_seconds: number;
  }) => {
    const prResults = await checkAndUpdatePRs({
      id: runData.id,
      distance_km: runData.distance_km,
      duration_seconds: runData.duration_seconds,
      started_at: runData.started_at,
    });

    const totalRuns = (profile?.total_runs || 0) + 1;
    const totalDistanceKm = (Number(profile?.total_distance_km) || 0) + runData.distance_km;

    const stats: MedalCheckStats = {
      totalRuns,
      totalDistanceKm,
      currentRun: {
        distanceKm: runData.distance_km,
        durationSeconds: runData.duration_seconds,
        pacePerKmSeconds: runData.pace_per_km_seconds,
        isGpsTracked: runData.is_gps_tracked,
      },
      weeklyRuns: 1,
      monthlyRuns: 1,
      personalRecords: prResults,
    };

    const newMedals = await checkAndAwardMedals(stats, runData.id);

    const newPRs = prResults.filter(pr => pr.isNewPR);
    if (newPRs.length > 0) {
      setTimeout(() => {
        toast.success(`🏆 New Personal Record!`, {
          description: `You set a PR for ${newPRs.map(pr => pr.distanceType.replace('_', ' ')).join(', ')}`,
        });
      }, 500);
    }

    if (newMedals.length > 0) {
      setTimeout(() => {
        newMedals.forEach((medal, index) => {
          setTimeout(() => {
            toast.success(`${medal.icon} ${medal.name}`, {
              description: medal.description,
            });
          }, index * 800);
        });
      }, newPRs.length > 0 ? 1500 : 500);
    }

    const awardedTrophies = await checkAndAwardTrophies({
      id: runData.id,
      user_id: user!.id,
      distance_km: runData.distance_km,
      duration_seconds: runData.duration_seconds,
      started_at: runData.started_at,
      pace_per_km_seconds: runData.pace_per_km_seconds,
    });

    if (awardedTrophies.length > 0) {
      triggerConfetti();
      setTimeout(() => {
        awardedTrophies.forEach((trophy, index) => {
          setTimeout(() => {
            toast.success(`${TROPHY_ICONS[trophy.rank]} ${getCategoryLabel(trophy.category)}`, {
              description: `You're #${trophy.rank} in this category!`,
            });
          }, index * 800);
        });
      }, (newPRs.length > 0 ? 1500 : 500) + (newMedals.length * 800));
    }
  };

  const handleSave = async () => {
    if (distance < 0.01) {
      toast.error('Distance is too short to save');
      return;
    }

    setLoading(true);

    const paceSeconds = Math.round(elapsedSeconds / distance);
    const speedKph = calculateSpeed();
    const activityLabel = ACTIVITY_CONFIG[activity!].label;

    const { error, data } = await createRun({
      title: title || `${activityLabel} Session`,
      description: description || null,
      distance_km: Math.round(distance * 1000) / 1000,
      duration_seconds: elapsedSeconds,
      started_at: startTime?.toISOString() || new Date().toISOString(),
      ended_at: new Date().toISOString(),
      pace_per_km_seconds: paceSeconds,
      average_speed_kph: Math.round(speedKph * 100) / 100,
      elevation_gain_m: null,
      calories_burned: Math.round(distance * 60),
      route_polyline: null, // No map data stored
      map_snapshot_url: null,
      is_gps_tracked: true,
      weather_conditions: null,
      temperature_celsius: null,
      notes: activity,
      is_public: visibility === 'public',
      visibility: visibility,
      comments_enabled: true,
    });

    if (error) {
      setLoading(false);
      toast.error('Failed to save session');
    } else {
      if (data) {
        await checkAchievements({
          id: data.id,
          distance_km: Math.round(distance * 1000) / 1000,
          duration_seconds: elapsedSeconds,
          started_at: startTime?.toISOString() || new Date().toISOString(),
          is_gps_tracked: true,
          pace_per_km_seconds: paceSeconds,
        });
      }
      setLoading(false);
      toast.success('Session saved!');
      resetAndClose();
    }
  };

  const handleManualSave = async () => {
    const distanceKm = parseFloat(manualDistance);
    const hours = parseInt(manualHours) || 0;
    const mins = parseInt(manualMinutes) || 0;
    const secs = parseInt(manualSeconds) || 0;
    const totalSeconds = hours * 3600 + mins * 60 + secs;

    if (isNaN(distanceKm) || distanceKm <= 0) {
      toast.error('Please enter a valid distance');
      return;
    }

    if (totalSeconds <= 0) {
      toast.error('Please enter a valid duration');
      return;
    }

    setLoading(true);

    const paceSeconds = Math.round(totalSeconds / distanceKm);
    const speedKph = (distanceKm / totalSeconds) * 3600;
    const activityLabel = ACTIVITY_CONFIG[activity!].label;
    const sessionStart = new Date();

    const { error, data } = await createRun({
      title: title || `${activityLabel} Session`,
      description: description || null,
      distance_km: Math.round(distanceKm * 1000) / 1000,
      duration_seconds: totalSeconds,
      started_at: sessionStart.toISOString(),
      ended_at: new Date(sessionStart.getTime() + totalSeconds * 1000).toISOString(),
      pace_per_km_seconds: paceSeconds,
      average_speed_kph: Math.round(speedKph * 100) / 100,
      elevation_gain_m: null,
      calories_burned: Math.round(distanceKm * 60),
      route_polyline: null,
      map_snapshot_url: null,
      is_gps_tracked: false,
      weather_conditions: null,
      temperature_celsius: null,
      notes: `${activity} (manual entry)`,
      is_public: visibility === 'public',
      visibility: visibility,
      comments_enabled: true,
    });

    if (error) {
      setLoading(false);
      toast.error('Failed to save session');
    } else {
      if (data) {
        await checkAchievements({
          id: data.id,
          distance_km: distanceKm,
          duration_seconds: totalSeconds,
          started_at: sessionStart.toISOString(),
          is_gps_tracked: false,
          pace_per_km_seconds: paceSeconds,
        });
      }
      setLoading(false);
      toast.success('Session saved!');
      resetAndClose();
    }
  };

  const resetAndClose = () => {
    setPhase('select');
    setActivity(null);
    setEntryMode('live');
    setTitle('');
    setDescription('');
    setVisibility('public');
    setPositions([]);
    setDistance(0);
    setElapsedSeconds(0);
    setStartTime(null);
    setManualDistance('');
    setManualHours('0');
    setManualMinutes('');
    setManualSeconds('0');
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    onClose();
  };

  const handleClose = () => {
    if (phase === 'tracking') {
      // Confirm before closing during active session
      if (window.confirm('Stop tracking and discard this session?')) {
        resetAndClose();
      }
    } else {
      resetAndClose();
    }
  };

  const config = activity ? ACTIVITY_CONFIG[activity] : null;
  const ActivityIcon = config?.icon || Play;

  return (
    <>
      <CountdownOverlay
        isActive={phase === 'countdown'}
        onComplete={startTracking}
        startFrom={3}
        exerciseName={config?.label}
      />
      
      <Dialog open={isOpen && phase !== 'countdown'} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md bg-card border-border max-h-[90vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            {/* Activity Selection */}
            {phase === 'select' && (
              <motion.div
                key="select"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <DialogHeader>
                  <DialogTitle className="font-display text-2xl tracking-wide text-center neon-glow-subtle">
                    CARDIO TRACKER
                  </DialogTitle>
                </DialogHeader>
                
                <div className="py-6 space-y-6">
                  {/* Entry Mode Toggle */}
                  <Tabs value={entryMode} onValueChange={(v) => setEntryMode(v as EntryMode)} className="w-full">
                    <TabsList className="w-full">
                      <TabsTrigger value="live" className="flex-1 font-display tracking-wide">
                        <Timer className="w-4 h-4 mr-2" />
                        LIVE TRACK
                      </TabsTrigger>
                      <TabsTrigger value="manual" className="flex-1 font-display tracking-wide">
                        <Edit3 className="w-4 h-4 mr-2" />
                        MANUAL LOG
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <p className="text-center text-muted-foreground text-sm">
                    {entryMode === 'live' 
                      ? 'Track with GPS in real-time' 
                      : 'Log a completed session manually'}
                  </p>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {(Object.keys(ACTIVITY_CONFIG) as ActivityType[]).map((type) => {
                      const cfg = ACTIVITY_CONFIG[type];
                      const Icon = cfg.icon;
                      return (
                        <Card
                          key={type}
                          className={`p-6 cursor-pointer border-2 transition-all hover:scale-105 ${cfg.bgColor} ${cfg.borderColor} hover:border-opacity-100`}
                          onClick={() => selectActivity(type)}
                        >
                          <div className="flex flex-col items-center gap-3">
                            <div className={`w-14 h-14 rounded-full ${cfg.bgColor} flex items-center justify-center`}>
                              <Icon className={`w-7 h-7 ${cfg.color}`} />
                            </div>
                            <span className={`font-display text-sm tracking-wide ${cfg.color}`}>
                              {cfg.label}
                            </span>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Manual Entry Phase */}
            {phase === 'manual' && (
              <motion.div
                key="manual"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <DialogHeader>
                  <DialogTitle className="font-display text-2xl tracking-wide text-center">
                    MANUAL LOG
                  </DialogTitle>
                </DialogHeader>

                <div className="py-6 space-y-6">
                  {/* Activity Badge */}
                  <div className="flex justify-center">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${config?.bgColor}`}>
                      <ActivityIcon className={`w-5 h-5 ${config?.color}`} />
                      <span className={`font-display tracking-wide ${config?.color}`}>
                        {config?.label}
                      </span>
                    </div>
                  </div>

                  {/* Distance Input */}
                  <div className="space-y-2">
                    <Label>Distance (km)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={manualDistance}
                      onChange={(e) => setManualDistance(e.target.value)}
                      placeholder="5.00"
                      className="bg-input border-border text-center text-2xl font-display"
                    />
                  </div>

                  {/* Duration Inputs */}
                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center">
                        <Input
                          type="number"
                          min="0"
                          value={manualHours}
                          onChange={(e) => setManualHours(e.target.value)}
                          className="bg-input border-border text-center"
                        />
                        <span className="text-xs text-muted-foreground">hrs</span>
                      </div>
                      <div className="text-center">
                        <Input
                          type="number"
                          min="0"
                          max="59"
                          value={manualMinutes}
                          onChange={(e) => setManualMinutes(e.target.value)}
                          placeholder="30"
                          className="bg-input border-border text-center"
                        />
                        <span className="text-xs text-muted-foreground">mins</span>
                      </div>
                      <div className="text-center">
                        <Input
                          type="number"
                          min="0"
                          max="59"
                          value={manualSeconds}
                          onChange={(e) => setManualSeconds(e.target.value)}
                          className="bg-input border-border text-center"
                        />
                        <span className="text-xs text-muted-foreground">secs</span>
                      </div>
                    </div>
                  </div>

                  {/* Title & Notes */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Title (optional)</Label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={`${config?.label} Session`}
                        className="bg-input border-border"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Notes (optional)</Label>
                      <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="How did it feel?"
                        className="bg-input border-border"
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Visibility</Label>
                      <Select value={visibility} onValueChange={(v) => setVisibility(v as 'public' | 'friends' | 'private')}>
                        <SelectTrigger className="bg-input border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">
                            <div className="flex items-center gap-2">
                              <Globe className="w-4 h-4" />
                              Public
                            </div>
                          </SelectItem>
                          <SelectItem value="friends">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              Friends Only
                            </div>
                          </SelectItem>
                          <SelectItem value="private">
                            <div className="flex items-center gap-2">
                              <Lock className="w-4 h-4" />
                              Private
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Save Button */}
                  <Button
                    className="w-full font-display tracking-wide py-6"
                    onClick={handleManualSave}
                    disabled={loading || !manualDistance}
                  >
                    {loading ? 'Saving...' : 'SAVE SESSION'}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Active Tracking */}
            {phase === 'tracking' && (
              <motion.div
                key="tracking"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-6"
              >
                <div className="text-center mb-8">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${config?.bgColor} mb-4`}>
                    <ActivityIcon className={`w-5 h-5 ${config?.color}`} />
                    <span className={`font-display tracking-wide ${config?.color}`}>
                      {config?.label}
                    </span>
                  </div>
                  
                  {/* Large Timer Display */}
                  <p className="font-display text-7xl text-primary tracking-wide mb-2">
                    {formatTime(elapsedSeconds)}
                  </p>
                  
                  {/* GPS Indicator */}
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="w-2 h-2 bg-emerald-500 rounded-full"
                    />
                    GPS Active
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                  <div className="bg-muted/50 rounded-xl p-4 text-center">
                    <p className="font-display text-3xl text-foreground tracking-wide">
                      {distance.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">km</p>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-4 text-center">
                    <p className="font-display text-3xl text-foreground tracking-wide">
                      {calculateSpeed().toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">km/h</p>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-4 text-center">
                    <p className="font-display text-3xl text-foreground tracking-wide">
                      {calculatePace()}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">/km</p>
                  </div>
                </div>

                {/* Stop Button */}
                <div className="text-center">
                  <Button
                    size="lg"
                    variant="destructive"
                    className="font-display text-xl tracking-wide px-16 py-8 rounded-full"
                    onClick={stopTracking}
                  >
                    <Square className="w-6 h-6 mr-3" />
                    STOP
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Summary / Save */}
            {phase === 'summary' && (
              <motion.div
                key="summary"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <DialogHeader>
                  <DialogTitle className="font-display text-2xl tracking-wide text-center">
                    SESSION COMPLETE
                  </DialogTitle>
                </DialogHeader>

                <div className="py-6 space-y-6">
                  {/* Activity Badge */}
                  <div className="flex justify-center">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${config?.bgColor}`}>
                      <ActivityIcon className={`w-5 h-5 ${config?.color}`} />
                      <span className={`font-display tracking-wide ${config?.color}`}>
                        {config?.label}
                      </span>
                    </div>
                  </div>

                  {/* Final Stats */}
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="font-display text-3xl text-primary">{distance.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">km</p>
                    </div>
                    <div>
                      <p className="font-display text-3xl text-foreground">
                        {formatTime(elapsedSeconds)}
                      </p>
                      <p className="text-xs text-muted-foreground">time</p>
                    </div>
                    <div>
                      <p className="font-display text-3xl text-foreground">
                        {calculateSpeed().toFixed(1)}
                      </p>
                      <p className="text-xs text-muted-foreground">km/h</p>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Title (optional)</Label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={`${config?.label} Session`}
                        className="bg-input border-border"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Notes (optional)</Label>
                      <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="How did it feel?"
                        className="bg-input border-border"
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Visibility</Label>
                      <Select value={visibility} onValueChange={(v) => setVisibility(v as 'public' | 'friends' | 'private')}>
                        <SelectTrigger className="bg-input border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">
                            <div className="flex items-center gap-2">
                              <Globe className="w-4 h-4" />
                              Public
                            </div>
                          </SelectItem>
                          <SelectItem value="friends">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              Friends Only
                            </div>
                          </SelectItem>
                          <SelectItem value="private">
                            <div className="flex items-center gap-2">
                              <Lock className="w-4 h-4" />
                              Private
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Save Button */}
                  <Button
                    className="w-full font-display tracking-wide py-6"
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'SAVE SESSION'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  );
}
