import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Volume2, VolumeX } from 'lucide-react';
import { useAIPreferences } from '@/hooks/useAIPreferences';

interface VoiceSettingsSheetProps {
  children?: React.ReactNode;
}

export function VoiceSettingsSheet({ children }: VoiceSettingsSheetProps) {
  const { preferences, isLoading, updatePreferences } = useAIPreferences();

  if (isLoading || !preferences) {
    return children || (
      <Button variant="ghost" size="icon" disabled>
        <Volume2 className="w-5 h-5 text-primary" />
      </Button>
    );
  }

  const handleVoiceToggle = (enabled: boolean) => {
    updatePreferences.mutate({ voice_feedback_enabled: enabled });
  };

  const handleVoiceGenderChange = (gender: 'male' | 'female') => {
    updatePreferences.mutate({ voice_gender: gender });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children || (
          <Button 
            variant="ghost" 
            size="icon"
            className="relative"
          >
            {preferences.voice_feedback_enabled ? (
              <Volume2 className="w-5 h-5 text-primary" />
            ) : (
              <VolumeX className="w-5 h-5 text-muted-foreground" />
            )}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle className="font-display tracking-wide">VOICE SETTINGS</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6 mt-6">
          {/* Voice Feedback Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground font-medium">Voice Feedback</Label>
              <p className="text-sm text-muted-foreground">
                Enable audio responses from your coach
              </p>
            </div>
            <Switch
              checked={preferences.voice_feedback_enabled}
              onCheckedChange={handleVoiceToggle}
            />
          </div>

          {/* Voice Gender Selection */}
          {preferences.voice_feedback_enabled && (
            <div className="space-y-3">
              <Label className="text-foreground font-medium">Voice Type</Label>
              <RadioGroup
                value={preferences.voice_gender}
                onValueChange={(value) => handleVoiceGenderChange(value as 'male' | 'female')}
                className="space-y-2"
              >
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30 border border-border">
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female" className="flex-1 cursor-pointer">
                    <span className="font-medium">Female Voice</span>
                    <p className="text-xs text-muted-foreground">Clear and encouraging tone</p>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30 border border-border">
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male" className="flex-1 cursor-pointer">
                    <span className="font-medium">Male Voice</span>
                    <p className="text-xs text-muted-foreground">Strong and motivating tone</p>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          <p className="text-xs text-muted-foreground pt-4 border-t border-border">
            Voice settings sync across the app. You can also manage these in your Profile Settings.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
