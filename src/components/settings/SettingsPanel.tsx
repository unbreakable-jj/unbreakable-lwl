import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Moon,
  Sun,
  Globe,
  Users,
  Lock,
  Bell,
  MessageSquare,
  Heart,
  Trophy,
  Eye,
  UserPlus,
  Settings,
  Dumbbell,
  
  LogOut,
  Sparkles,
  Video,
  Volume2,
  Brain,
} from 'lucide-react';
import { useUserSettings, UserSettings } from '@/hooks/useUserSettings';
import { useAIPreferences } from '@/hooks/useAIPreferences';
import { useNutritionGoals } from '@/hooks/useNutritionGoals';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { toast } from 'sonner';
import { Flame, UtensilsCrossed } from 'lucide-react';
import {
  activityLabels,
  macroSplitLabels,
  type ActivityLevel,
  type MacroSplit,
} from '@/lib/fuelCalculations';

import { BlockedUsersSection } from './BlockedUsersSection';

export function SettingsPanel() {
  const { settings, loading, updateSettings, toggleTheme } = useUserSettings();
  const { preferences: aiPreferences, isLoading: aiLoading, updatePreferences } = useAIPreferences();
  const { goals: nutritionGoals, rawGoals, autoCalculatedGoals, isAutoMode, saveGoals } = useNutritionGoals();
  const { profile, updateProfile } = useProfile();
  const { signOut } = useAuth();
  const [saving, setSaving] = useState(false);
  const [manualCalories, setManualCalories] = useState('');
  const [manualProtein, setManualProtein] = useState('');
  const [manualCarbs, setManualCarbs] = useState('');
  const [manualFat, setManualFat] = useState('');

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleUpdate = async (updates: Partial<UserSettings>) => {
    setSaving(true);
    const { error } = await updateSettings(updates);
    setSaving(false);
    if (error) {
      toast.error('Failed to update settings');
    } else {
      toast.success('Settings updated');
    }
  };

  const handleThemeToggle = async () => {
    const { error } = await toggleTheme();
    if (error) {
      toast.error('Failed to update theme');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
  };


  return (
    <div className="space-y-6">
      {/* Theme Settings */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-xl tracking-wide flex items-center gap-2">
            {settings.theme === 'dark' ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
            APPEARANCE
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground font-medium">Theme</Label>
              <p className="text-sm text-muted-foreground">
                Switch between dark and light mode
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Sun className={`w-4 h-4 ${settings.theme === 'light' ? 'text-primary' : 'text-muted-foreground'}`} />
              <Switch
                checked={settings.theme === 'dark'}
                onCheckedChange={handleThemeToggle}
              />
              <Moon className={`w-4 h-4 ${settings.theme === 'dark' ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-xl tracking-wide flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            PRIVACY
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground font-medium">Profile Visibility</Label>
              <p className="text-sm text-muted-foreground">
                Who can see your profile
              </p>
            </div>
            <Select
              value={settings.profile_visibility}
              onValueChange={(value: 'public' | 'friends' | 'private') => 
                handleUpdate({ profile_visibility: value })
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary" />
                    Public
                  </div>
                </SelectItem>
                <SelectItem value="friends">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    Friends Only
                  </div>
                </SelectItem>
                <SelectItem value="private">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-primary" />
                    Private
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground font-medium flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                Show Stats Publicly
              </Label>
              <p className="text-sm text-muted-foreground">
                Allow others to see your stats and records
              </p>
            </div>
            <Switch
              checked={settings.show_stats_publicly}
              onCheckedChange={(checked) => handleUpdate({ show_stats_publicly: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground font-medium flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Allow Comments by Default
              </Label>
              <p className="text-sm text-muted-foreground">
                Enable comments on new posts by default
              </p>
            </div>
            <Switch
              checked={settings.allow_comments_default}
              onCheckedChange={(checked) => handleUpdate({ allow_comments_default: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground font-medium flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-primary" />
                Allow Friend Requests
              </Label>
              <p className="text-sm text-muted-foreground">
                Let others send you friend requests
              </p>
            </div>
            <Switch
              checked={settings.allow_friend_requests}
              onCheckedChange={(checked) => handleUpdate({ allow_friend_requests: checked })}
            />
          </div>

          <Separator />

          {/* Messaging Settings */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground font-medium flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Who Can Message Me
              </Label>
              <p className="text-sm text-muted-foreground">
                Control who can send you direct messages
              </p>
            </div>
            <Select
              value={(settings as any).allow_messages || 'friends'}
              onValueChange={(value: 'everyone' | 'friends' | 'none') => 
                handleUpdate({ allow_messages: value } as any)
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="everyone">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary" />
                    Everyone
                  </div>
                </SelectItem>
                <SelectItem value="friends">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    Friends Only
                  </div>
                </SelectItem>
                <SelectItem value="none">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-primary" />
                    No One
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground font-medium flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                Show Online Status
              </Label>
              <p className="text-sm text-muted-foreground">
                Let friends see when you're online
              </p>
            </div>
            <Switch
              checked={(settings as any).show_online_status ?? true}
              onCheckedChange={(checked) => handleUpdate({ show_online_status: checked } as any)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Blocked Users */}
      <BlockedUsersSection />


      {/* Programme Tracking Preferences */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-xl tracking-wide flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-primary" />
            PROGRAMME TRACKING
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground mb-2">
            Configure your strength training preferences
          </p>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground font-medium">Rest Timer Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Sound and vibration when rest ends
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground font-medium">Auto-start Rest Timer</Label>
              <p className="text-sm text-muted-foreground">
                Start timer after logging a set
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Coaching Feedback
              </Label>
              <p className="text-sm text-muted-foreground">
                Get personalised feedback on form, progression, and recovery
              </p>
            </div>
            <Switch
              checked={settings.ai_feedback_enabled}
              onCheckedChange={(checked) => handleUpdate({ ai_feedback_enabled: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Coaching Bio moved to Profile → Overview */}

      {/* Coaching Settings */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-xl tracking-wide flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            UNBREAKABLE COACHING
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground mb-2">
            Configure your coaching and voice feedback preferences — built on 10+ years of coaching experience
          </p>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground font-medium flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-primary" />
                Voice Feedback
              </Label>
              <p className="text-sm text-muted-foreground">
                Enable audio responses from your coach
              </p>
            </div>
            <Switch
              checked={aiPreferences?.voice_feedback_enabled ?? false}
              onCheckedChange={(checked) => updatePreferences.mutate({ voice_feedback_enabled: checked })}
              disabled={aiLoading}
            />
          </div>

          {aiPreferences?.voice_feedback_enabled && (
            <>
              <Separator />
              <div className="space-y-3">
                <Label className="text-foreground font-medium">Voice Type</Label>
                <RadioGroup
                  value={aiPreferences?.voice_gender || 'female'}
                  onValueChange={(value) => updatePreferences.mutate({ voice_gender: value as 'male' | 'female' })}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30 border border-border">
                    <RadioGroupItem value="female" id="female-settings" />
                    <Label htmlFor="female-settings" className="flex-1 cursor-pointer">
                      <span className="font-medium">Female Voice</span>
                      <p className="text-xs text-muted-foreground">Clear and encouraging tone</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30 border border-border">
                    <RadioGroupItem value="male" id="male-settings" />
                    <Label htmlFor="male-settings" className="flex-1 cursor-pointer">
                      <span className="font-medium">Male Voice</span>
                      <p className="text-xs text-muted-foreground">Strong and motivating tone</p>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground font-medium flex items-center gap-2">
                <Video className="w-4 h-4 text-primary" />
                Movement Analysis
              </Label>
              <p className="text-sm text-muted-foreground">
                Analyse technique from uploaded videos
              </p>
            </div>
            <Switch
              checked={aiPreferences?.movement_analysis_enabled ?? false}
              onCheckedChange={(checked) => updatePreferences.mutate({ movement_analysis_enabled: checked })}
              disabled={aiLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Auto Progression
              </Label>
              <p className="text-sm text-muted-foreground">
                Automatically suggest weight/rep increases
              </p>
            </div>
            <Switch
              checked={aiPreferences?.auto_progression_enabled ?? true}
              onCheckedChange={(checked) => updatePreferences.mutate({ auto_progression_enabled: checked })}
              disabled={aiLoading}
            />
          </div>
        </CardContent>
      </Card>


      {/* Notification Settings */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-xl tracking-wide flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            NOTIFICATIONS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground font-medium flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary" />
                Likes
              </Label>
              <p className="text-sm text-muted-foreground">
                When someone likes your post
              </p>
            </div>
            <Switch
              checked={settings.notify_likes}
              onCheckedChange={(checked) => handleUpdate({ notify_likes: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground font-medium flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Comments
              </Label>
              <p className="text-sm text-muted-foreground">
                When someone comments on your post
              </p>
            </div>
            <Switch
              checked={settings.notify_comments}
              onCheckedChange={(checked) => handleUpdate({ notify_comments: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground font-medium flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-primary" />
                Friend Requests
              </Label>
              <p className="text-sm text-muted-foreground">
                When you receive a friend request
              </p>
            </div>
            <Switch
              checked={settings.notify_friend_requests}
              onCheckedChange={(checked) => handleUpdate({ notify_friend_requests: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground font-medium flex items-center gap-2">
                <Trophy className="w-4 h-4 text-primary" />
                Achievements
              </Label>
              <p className="text-sm text-muted-foreground">
                When you earn a new achievement
              </p>
            </div>
            <Switch
              checked={settings.notify_achievements}
              onCheckedChange={(checked) => handleUpdate({ notify_achievements: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground font-medium flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Messages
              </Label>
              <p className="text-sm text-muted-foreground">
                When you receive a new message
              </p>
            </div>
            <Switch
              checked={(settings as any).notify_messages ?? true}
              onCheckedChange={(checked) => handleUpdate({ notify_messages: checked } as any)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Feed Settings */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-xl tracking-wide flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            FEED PREFERENCES
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground font-medium">Show Community Posts</Label>
              <p className="text-sm text-muted-foreground">
                See posts from people you follow
              </p>
            </div>
            <Switch
              checked={settings.show_community_posts}
              onCheckedChange={(checked) => handleUpdate({ show_community_posts: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground font-medium">Show Achievements in Feed</Label>
              <p className="text-sm text-muted-foreground">
                Display achievement cards in your feed
              </p>
            </div>
            <Switch
              checked={settings.show_achievements_in_feed}
              onCheckedChange={(checked) => handleUpdate({ show_achievements_in_feed: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Nutrition Goals */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-xl tracking-wide flex items-center gap-2">
            <Flame className="w-5 h-5 text-primary" />
            NUTRITION GOALS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Auto / Manual Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground font-medium">Auto-Sync from Profile</Label>
              <p className="text-sm text-muted-foreground">
                Calculate goals from your coaching profile (weight, height, age, training goal)
              </p>
            </div>
            <Switch
              checked={isAutoMode}
              onCheckedChange={(checked) => {
                saveGoals.mutate({ goals_mode: checked ? 'auto' : 'manual' } as any);
              }}
            />
          </div>

          <Separator />

          {isAutoMode ? (
            <div className="space-y-4">
              {/* Activity Level Selector */}
              <div className="space-y-1.5">
                <Label className="text-foreground font-medium">Activity Level</Label>
                <Select
                  value={rawGoals?.activity_level || 'moderate'}
                  onValueChange={(val) => saveGoals.mutate({ activity_level: val } as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(activityLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Macro Split Selector */}
              <div className="space-y-1.5">
                <Label className="text-foreground font-medium">Macro Split</Label>
                <Select
                  value={rawGoals?.macro_split || 'high_protein'}
                  onValueChange={(val) => saveGoals.mutate({ macro_split: val } as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(macroSplitLabels).filter(([k]) => k !== 'custom').map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Auto-calculated Preview */}
              {autoCalculatedGoals ? (
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-xs font-display tracking-wide text-primary mb-2 flex items-center gap-1.5">
                    <UtensilsCrossed className="w-3.5 h-3.5" />
                    CALCULATED DAILY TARGETS
                  </p>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div>
                      <p className="font-display text-lg text-foreground">{autoCalculatedGoals.daily_calories}</p>
                      <p className="text-[10px] text-muted-foreground">KCAL</p>
                    </div>
                    <div>
                      <p className="font-display text-lg text-foreground">{autoCalculatedGoals.daily_protein_g}g</p>
                      <p className="text-[10px] text-muted-foreground">PROTEIN</p>
                    </div>
                    <div>
                      <p className="font-display text-lg text-foreground">{autoCalculatedGoals.daily_carbs_g}g</p>
                      <p className="text-[10px] text-muted-foreground">CARBS</p>
                    </div>
                    <div>
                      <p className="font-display text-lg text-foreground">{autoCalculatedGoals.daily_fat_g}g</p>
                      <p className="text-[10px] text-muted-foreground">FAT</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-2">
                  Complete your coaching profile (weight, height, age) to auto-calculate goals
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Set your own daily targets manually</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Daily Calories</Label>
                  <Input
                    type="number"
                    placeholder={String(nutritionGoals?.daily_calories || 2000)}
                    value={manualCalories}
                    onChange={(e) => setManualCalories(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Protein (g)</Label>
                  <Input
                    type="number"
                    placeholder={String(nutritionGoals?.daily_protein_g || 150)}
                    value={manualProtein}
                    onChange={(e) => setManualProtein(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Carbs (g)</Label>
                  <Input
                    type="number"
                    placeholder={String(nutritionGoals?.daily_carbs_g || 200)}
                    value={manualCarbs}
                    onChange={(e) => setManualCarbs(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Fat (g)</Label>
                  <Input
                    type="number"
                    placeholder={String(nutritionGoals?.daily_fat_g || 70)}
                    value={manualFat}
                    onChange={(e) => setManualFat(e.target.value)}
                  />
                </div>
              </div>
              <Button
                size="sm"
                className="w-full font-display tracking-wide"
                disabled={saveGoals.isPending}
                onClick={() => {
                  saveGoals.mutate({
                    goals_mode: 'manual',
                    daily_calories: manualCalories ? Number(manualCalories) : (nutritionGoals?.daily_calories || 2000),
                    daily_protein_g: manualProtein ? Number(manualProtein) : (nutritionGoals?.daily_protein_g || 150),
                    daily_carbs_g: manualCarbs ? Number(manualCarbs) : (nutritionGoals?.daily_carbs_g || 200),
                    daily_fat_g: manualFat ? Number(manualFat) : (nutritionGoals?.daily_fat_g || 70),
                  } as any);
                  setManualCalories('');
                  setManualProtein('');
                  setManualCarbs('');
                  setManualFat('');
                }}
              >
                SAVE TARGETS
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Card className="bg-card border-border border-destructive/30">
        <CardContent className="pt-6">
          <Button 
            variant="destructive" 
            className="w-full font-display tracking-wide"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            SIGN OUT
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}