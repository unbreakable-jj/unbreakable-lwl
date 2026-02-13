import { useEffect } from 'react';
import { Settings, ToggleLeft, ToggleRight, AlertTriangle, Users, MessageSquare, Brain, FileText, Wrench } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { usePlatformSettings } from '@/hooks/usePlatformSettings';
import { useState } from 'react';

export function AdminSettingsPanel() {
  const { settingsMap, loading, toggleFeature, updateSetting, fetchSettings } = usePlatformSettings();
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [maxPosts, setMaxPosts] = useState('50');

  useEffect(() => {
    setMaintenanceMessage(settingsMap.maintenance_mode.message);
    setMaxPosts(String(settingsMap.max_posts_per_day));
  }, [settingsMap]);

  const handleMaintenanceToggle = async (enabled: boolean) => {
    await updateSetting('maintenance_mode', { enabled, message: maintenanceMessage });
  };

  const handleMaintenanceMessageSave = async () => {
    await updateSetting('maintenance_mode', { 
      enabled: settingsMap.maintenance_mode.enabled, 
      message: maintenanceMessage 
    });
  };

  const handleMaxPostsSave = async () => {
    await updateSetting('max_posts_per_day', { limit: parseInt(maxPosts, 10) || 50 });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Feature Toggles */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Settings className="w-5 h-5" />
            FEATURE TOGGLES
          </CardTitle>
          <CardDescription>
            Enable or disable platform features globally
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Registration */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <Label className="font-medium">New User Registration</Label>
                <p className="text-sm text-muted-foreground">Allow new users to sign up</p>
              </div>
            </div>
            <Switch
              checked={settingsMap.registration_enabled}
              onCheckedChange={(checked) => toggleFeature('registration_enabled', checked)}
            />
          </div>

          {/* Social Features */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <Label className="font-medium">Social Features</Label>
                <p className="text-sm text-muted-foreground">Posts, comments, follows, and kudos</p>
              </div>
            </div>
            <Switch
              checked={settingsMap.social_features_enabled}
              onCheckedChange={(checked) => toggleFeature('social_features_enabled', checked)}
            />
          </div>

          {/* Messaging */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <Label className="font-medium">Direct Messaging</Label>
                <p className="text-sm text-muted-foreground">Allow users to message each other</p>
              </div>
            </div>
            <Switch
              checked={settingsMap.messaging_enabled}
              onCheckedChange={(checked) => toggleFeature('messaging_enabled', checked)}
            />
          </div>

          {/* AI Coaching */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <Label className="font-medium">Unbreakable Coaching</Label>
                <p className="text-sm text-muted-foreground">Coaching-powered feedback and guidance</p>
              </div>
            </div>
            <Switch
              checked={settingsMap.ai_coaching_enabled}
              onCheckedChange={(checked) => toggleFeature('ai_coaching_enabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Limits */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            RATE LIMITS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Label>Max Posts Per Day</Label>
              <Input
                type="number"
                value={maxPosts}
                onChange={(e) => setMaxPosts(e.target.value)}
                min={1}
                max={1000}
              />
            </div>
            <Button onClick={handleMaxPostsSave}>Save</Button>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Mode */}
      <Card className={settingsMap.maintenance_mode.enabled ? 'border-destructive' : ''}>
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <AlertTriangle className={`w-5 h-5 ${settingsMap.maintenance_mode.enabled ? 'text-destructive' : ''}`} />
            MAINTENANCE MODE
          </CardTitle>
          <CardDescription>
            When enabled, users will see a maintenance message instead of the app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="font-medium">Enable Maintenance Mode</Label>
            <Switch
              checked={settingsMap.maintenance_mode.enabled}
              onCheckedChange={handleMaintenanceToggle}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Maintenance Message</Label>
            <Textarea
              placeholder="We're currently performing maintenance. Please check back soon!"
              value={maintenanceMessage}
              onChange={(e) => setMaintenanceMessage(e.target.value)}
            />
            <Button onClick={handleMaintenanceMessageSave} variant="outline" size="sm">
              Save Message
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
