import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
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
  Footprints,
  Dumbbell,
  Share2,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { useUserSettings, UserSettings } from '@/hooks/useUserSettings';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function SettingsPanel() {
  const { settings, loading, updateSettings, toggleTheme } = useUserSettings();
  const { signOut } = useAuth();
  const [saving, setSaving] = useState(false);

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

  const handleSocialConnect = (platform: string) => {
    toast.info(`${platform} integration coming soon`);
  };

  return (
    <div className="space-y-6">
      {/* Theme Settings */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-xl tracking-wide flex items-center gap-2">
            {settings.theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
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
            <Lock className="w-5 h-5" />
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

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground font-medium flex items-center gap-2">
                <Eye className="w-4 h-4" />
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
                <MessageSquare className="w-4 h-4" />
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
                <UserPlus className="w-4 h-4" />
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
        </CardContent>
      </Card>

      {/* Social Integration */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-xl tracking-wide flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            SOCIAL ACCOUNTS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Connect your social accounts to share achievements and posts directly
          </p>
          
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-between"
              onClick={() => handleSocialConnect('Facebook')}
            >
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">f</div>
                Facebook
              </span>
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-between"
              onClick={() => handleSocialConnect('Instagram')}
            >
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded flex items-center justify-center text-white text-xs font-bold">📷</div>
                Instagram
              </span>
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-between"
              onClick={() => handleSocialConnect('TikTok')}
            >
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 bg-black rounded flex items-center justify-center text-white text-xs font-bold">♪</div>
                TikTok
              </span>
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-between"
              onClick={() => handleSocialConnect('X')}
            >
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 bg-black rounded flex items-center justify-center text-white text-xs font-bold">𝕏</div>
                X (Twitter)
              </span>
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cardio Tracker Preferences */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-xl tracking-wide flex items-center gap-2">
            <Footprints className="w-5 h-5" />
            CARDIO TRACKER
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground mb-2">
            Configure your cardio tracking preferences
          </p>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground font-medium">Auto-pause</Label>
              <p className="text-sm text-muted-foreground">
                Automatically pause when stationary
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground font-medium">Audio Cues</Label>
              <p className="text-sm text-muted-foreground">
                Voice updates during sessions
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Programme Tracking Preferences */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-xl tracking-wide flex items-center gap-2">
            <Dumbbell className="w-5 h-5" />
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
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-xl tracking-wide flex items-center gap-2">
            <Bell className="w-5 h-5" />
            NOTIFICATIONS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground font-medium flex items-center gap-2">
                <Heart className="w-4 h-4" />
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
                <MessageSquare className="w-4 h-4" />
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
                <UserPlus className="w-4 h-4" />
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
                <Trophy className="w-4 h-4" />
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
        </CardContent>
      </Card>

      {/* Feed Settings */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-xl tracking-wide flex items-center gap-2">
            <Settings className="w-5 h-5" />
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