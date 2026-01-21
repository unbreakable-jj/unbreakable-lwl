import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useProfile } from '@/hooks/useProfile';
import { useUserRuns } from '@/hooks/useRuns';
import { useAuth } from '@/hooks/useAuth';
import { useTrophies } from '@/hooks/useTrophies';
import { TrophyCase, TrophyCountsBadge } from '@/components/tracker/TrophyCase';
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
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';

export function ProfileView() {
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();
  const { runs } = useUserRuns(user?.id);
  const { getTrophyCounts } = useTrophies();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    display_name: '',
    username: '',
    bio: '',
    location: '',
    date_of_birth: '',
  });
  const [saving, setSaving] = useState(false);
  const trophyCounts = getTrophyCounts();

  const startEditing = () => {
    setEditData({
      display_name: profile?.display_name || '',
      username: profile?.username || '',
      bio: profile?.bio || '',
      location: profile?.location || '',
      date_of_birth: profile?.date_of_birth || '',
    });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const saveProfile = async () => {
    setSaving(true);
    const { error } = await updateProfile(editData);
    setSaving(false);

    if (error) {
      toast.error('Failed to update profile');
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
              <Avatar className="h-24 w-24 border-4 border-card">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground font-display text-2xl">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              
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
                      onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                      placeholder="@username"
                      className="bg-input border-border"
                    />
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
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Stats Summary */}
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

      {/* Recent Activity */}
      <Card className="bg-card border-border p-6">
        <h3 className="font-display text-xl text-foreground mb-4 tracking-wide">
          RECENT ACTIVITY
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
    </div>
  );
}
