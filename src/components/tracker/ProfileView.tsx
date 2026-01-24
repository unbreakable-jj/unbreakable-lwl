import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProfile } from '@/hooks/useProfile';
import { useAvatarUpload } from '@/hooks/useAvatarUpload';
import { useUserRuns } from '@/hooks/useRuns';
import { useAuth } from '@/hooks/useAuth';
import { useTrophies } from '@/hooks/useTrophies';
import { useTrainingPrograms } from '@/hooks/useTrainingPrograms';
import { useWorkoutSessions } from '@/hooks/useWorkoutSessions';
import { MyProgramsSection } from '@/components/programming/MyProgramsSection';
import { TrophyCase, TrophyCountsBadge } from '@/components/tracker/TrophyCase';
import { CombinedStatsView } from '@/components/tracker/CombinedStatsView';
import { CombinedRecordsView } from '@/components/tracker/CombinedRecordsView';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { toast } from 'sonner';
import { 
  Edit2, 
  Save, 
  X, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  Clock,
  Activity,
  Cake,
  Camera,
  Trash2,
  Globe,
  Lock,
  Dumbbell,
  BarChart2,
  Medal,
  User,
  Settings,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';

export function ProfileView() {
  const { user } = useAuth();
  const { profile, updateProfile, refetch } = useProfile();
  const { uploadAvatar, removeAvatar, uploading } = useAvatarUpload();
  const { runs } = useUserRuns(user?.id);
  const { getTrophyCounts } = useTrophies();
  const { activeProgram } = useTrainingPrograms();
  const { sessions } = useWorkoutSessions();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    display_name: '',
    username: '',
    bio: '',
    location: '',
    date_of_birth: '',
    is_public: true,
  });
  const [saving, setSaving] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState<'overview' | 'stats' | 'records' | 'settings'>('overview');
  const trophyCounts = getTrophyCounts();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const normalizeUsernameInput = (raw: string) => {
    let v = raw.trim();
    if (v.startsWith('@')) v = v.slice(1);
    v = v.replace(/[.\s-]+/g, '_');
    return v;
  };

  const usernameValidationError = (() => {
    const v = normalizeUsernameInput(editData.username);
    if (!v) return null; // empty -> will be saved as null
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(v)) {
      return 'Nickname must be 3–30 chars and use only letters, numbers, and _';
    }
    return null;
  })();

  const startEditing = () => {
    setEditData({
      display_name: profile?.display_name || '',
      username: profile?.username || '',
      bio: profile?.bio || '',
      location: profile?.location || '',
      date_of_birth: profile?.date_of_birth || '',
      is_public: profile?.is_public ?? true,
    });
    setIsEditing(true);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const { url, error } = await uploadAvatar(file);
    if (error) {
      toast.error(error.message);
    } else if (url) {
      toast.success('Avatar updated!');
      refetch();
    }
  };

  const handleRemoveAvatar = async () => {
    const { error } = await removeAvatar();
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Avatar removed');
      refetch();
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const saveProfile = async () => {
    setSaving(true);

    const normalizedUsername = normalizeUsernameInput(editData.username);
    if (normalizedUsername && !/^[a-zA-Z0-9_]{3,30}$/.test(normalizedUsername)) {
      setSaving(false);
      toast.error('Nickname can only use letters, numbers, and _ (3–30 chars)');
      return;
    }

    const payload = {
      ...editData,
      username: normalizedUsername,
    };

    const { error } = await updateProfile(payload);
    setSaving(false);

    if (error) {
      // Show the real reason (e.g. nickname taken / invalid) so users can fix it.
      const msg = (error as any)?.message || 'Failed to update profile';
      toast.error(msg);
    } else {
      toast.success('Profile updated!');
      setIsEditing(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getInitials = () => {
    if (profile?.display_name) {
      return profile.display_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.[0].toUpperCase() || 'U';
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-card border-border overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/5" />
          
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12">
              <div className="relative group">
                <Avatar className="h-24 w-24 border-4 border-card">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground font-display text-2xl">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                {/* Avatar overlay with upload/remove buttons */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white hover:bg-white/20"
                    onClick={handleAvatarClick}
                    disabled={uploading}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                  {profile.avatar_url && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-white hover:bg-white/20"
                      onClick={handleRemoveAvatar}
                      disabled={uploading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-3">
                    <Input
                      value={editData.display_name}
                      onChange={(e) => setEditData({ ...editData, display_name: e.target.value })}
                      placeholder="Display Name"
                      className="bg-input border-border"
                    />
                    <Input
                      value={editData.username}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          username: normalizeUsernameInput(e.target.value),
                        })
                      }
                      placeholder="@username"
                      className="bg-input border-border"
                    />
                    {usernameValidationError && (
                      <p className="text-xs text-destructive">{usernameValidationError}</p>
                    )}
                  </div>
                ) : (
                  <>
                    <h2 className="font-display text-2xl text-foreground tracking-wide">
                      {profile.display_name || 'Runner'}
                    </h2>
                    {profile.username && (
                      <p className="text-muted-foreground">@{profile.username}</p>
                    )}
                  </>
                )}
              </div>
              
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={cancelEditing}
                      disabled={saving}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={saveProfile}
                      disabled={saving}
                      className="font-display tracking-wide"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={startEditing}
                    className="font-display tracking-wide"
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                )}
              </div>
            </div>

            {isEditing ? (
              <div className="mt-4 space-y-3">
                <div className="space-y-2">
                  <Label>Bio</Label>
                  <Textarea
                    value={editData.bio}
                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={editData.location}
                    onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                    placeholder="City, Country"
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Cake className="w-4 h-4" />
                    Date of Birth
                  </Label>
                  <Input
                    type="date"
                    value={editData.date_of_birth}
                    onChange={(e) => setEditData({ ...editData, date_of_birth: e.target.value })}
                    className="bg-input border-border"
                  />
                  <p className="text-xs text-muted-foreground">
                    Required for age-group leaderboards and trophies
                  </p>
                </div>
                {/* Public/Private Profile Toggle */}
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    {editData.is_public ? (
                      <Globe className="w-4 h-4 text-primary" />
                    ) : (
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {editData.is_public ? 'Public Profile' : 'Private Profile'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {editData.is_public 
                          ? 'Anyone can see your profile and runs' 
                          : 'Only you can see your profile'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={editData.is_public}
                    onCheckedChange={(checked) => setEditData({ ...editData, is_public: checked })}
                  />
                </div>
              </div>
            ) : (
              <>
                {profile.bio && (
                  <p className="text-muted-foreground mt-4">{profile.bio}</p>
                )}
                {profile.location && (
                  <div className="flex items-center gap-1 text-muted-foreground mt-2">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {/* Trophy counts badge */}
                {(trophyCounts.gold > 0 || trophyCounts.silver > 0 || trophyCounts.bronze > 0) && (
                  <div className="mt-3">
                    <TrophyCountsBadge 
                      gold={trophyCounts.gold} 
                      silver={trophyCounts.silver} 
                      bronze={trophyCounts.bronze} 
                    />
                  </div>
                )}
              </>
            )}

            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Joined {format(parseISO(profile.created_at), 'MMM yyyy')}</span>
              </div>
              <div className="flex items-center gap-1">
                {profile.is_public ? (
                  <>
                    <Globe className="w-4 h-4" />
                    <span>Public</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Private</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Profile Tabs: Overview, Stats, Records */}
      <Tabs value={activeProfileTab} onValueChange={(v) => setActiveProfileTab(v as any)}>
        <TabsList className="w-full bg-card border border-border">
          <TabsTrigger value="overview" className="flex-1 font-display tracking-wide text-xs sm:text-sm">
            <User className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">OVERVIEW</span>
            <span className="sm:hidden">ABOUT</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex-1 font-display tracking-wide text-xs sm:text-sm">
            <BarChart2 className="w-4 h-4 mr-1 sm:mr-2" />
            STATS
          </TabsTrigger>
          <TabsTrigger value="records" className="flex-1 font-display tracking-wide text-xs sm:text-sm">
            <Medal className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">RECORDS</span>
            <span className="sm:hidden">PRs</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex-1 font-display tracking-wide text-xs sm:text-sm">
            <Settings className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">SETTINGS</span>
            <span className="sm:hidden">⚙️</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* Quick Stats Summary */}
          <div className="grid grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-card border-border p-4 text-center">
                <Activity className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="font-display text-2xl text-foreground tracking-wide">
                  {profile.total_runs}
                </p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Runs</p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-card border-border p-4 text-center">
                <TrendingUp className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="font-display text-2xl text-foreground tracking-wide">
                  {Number(profile.total_distance_km).toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">km</p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-card border-border p-4 text-center">
                <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="font-display text-2xl text-foreground tracking-wide">
                  {formatDuration(profile.total_time_seconds)}
                </p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Time</p>
              </Card>
            </motion.div>
          </div>

          {/* My Programmes */}
          <Card className="bg-card border-border p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-display text-xl text-foreground tracking-wide">MY PROGRAMMES</h3>
                <p className="text-sm text-muted-foreground">
                  {activeProgram ? `Active: ${activeProgram.name}` : 'Save a programme to start tracking workouts.'}
                </p>
              </div>
              <Dumbbell className="w-5 h-5 text-primary" />
            </div>
            <MyProgramsSection />
          </Card>

          {/* Workout History */}
          <Card className="bg-card border-border p-6">
            <h3 className="font-display text-xl text-foreground mb-4 tracking-wide">WORKOUT HISTORY</h3>
            {sessions && sessions.length > 0 ? (
              <div className="space-y-3">
                {sessions
                  .filter((s) => s.status !== 'cancelled')
                  .slice(0, 8)
                  .map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{s.session_type}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(parseISO(s.started_at), 'MMM d, yyyy')} • Week {s.week_number} • {s.day_name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground capitalize">{s.status.replace('_', ' ')}</p>
                        {typeof s.duration_seconds === 'number' && (
                          <p className="text-sm text-muted-foreground">
                            {Math.floor(s.duration_seconds / 60)}m
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No workouts logged yet — start your first session from a saved programme.
              </p>
            )}
          </Card>

          {/* Recent Activity */}
          <Card className="bg-card border-border p-6">
            <h3 className="font-display text-xl text-foreground mb-4 tracking-wide">
              RECENT RUNS
            </h3>
            {runs.length > 0 ? (
              <div className="space-y-3">
                {runs.slice(0, 5).map((run) => (
                  <div
                    key={run.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-foreground">{run.title || 'Run'}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(parseISO(run.started_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-lg text-primary">
                        {Number(run.distance_km).toFixed(2)} km
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {Math.floor(run.duration_seconds / 60)}:{(run.duration_seconds % 60).toString().padStart(2, '0')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No runs recorded yet. Start your journey!
              </p>
            )}
          </Card>

          {/* Trophy Case */}
          <TrophyCase />
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <CombinedStatsView />
        </TabsContent>

        <TabsContent value="records" className="mt-6">
          <CombinedRecordsView />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <SettingsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
