import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  useCoachingProfile, 
  cmToFeetInches, 
  feetInchesToCm, 
  kgToLb, 
  lbToKg 
} from '@/hooks/useCoachingProfile';
import { toast } from 'sonner';
import { Loader2, Flame } from 'lucide-react';

export function CoachingBioForm() {
  const { profile, loading, updateProfile } = useCoachingProfile();
  const [saving, setSaving] = useState(false);

  // Form state
  const [age, setAge] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [heightFeet, setHeightFeet] = useState('');
  const [heightInches, setHeightInches] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [weightLb, setWeightLb] = useState('');
  const [useMetricHeight, setUseMetricHeight] = useState(true);
  const [useMetricWeight, setUseMetricWeight] = useState(true);
  const [injuries, setInjuries] = useState('');
  const [mentalHealth, setMentalHealth] = useState('');
  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      setAge(profile.age_years?.toString() || '');
      setUseMetricHeight(profile.preferred_height_unit === 'cm');
      setUseMetricWeight(profile.preferred_weight_unit === 'kg');
      setInjuries(profile.injuries || '');
      setMentalHealth(profile.mental_health || '');

      if (profile.height_cm) {
        setHeightCm(profile.height_cm.toString());
        const { feet, inches } = cmToFeetInches(profile.height_cm);
        setHeightFeet(feet.toString());
        setHeightInches(inches.toString());
      }

      if (profile.weight_kg) {
        setWeightKg(profile.weight_kg.toString());
        setWeightLb(kgToLb(profile.weight_kg).toString());
      }
    }
  }, [profile]);

  const handleHeightUnitToggle = (metric: boolean) => {
    setUseMetricHeight(metric);
    // Convert existing values
    if (metric && heightFeet && heightInches) {
      const cm = feetInchesToCm(parseInt(heightFeet) || 0, parseInt(heightInches) || 0);
      setHeightCm(cm.toString());
    } else if (!metric && heightCm) {
      const { feet, inches } = cmToFeetInches(parseFloat(heightCm));
      setHeightFeet(feet.toString());
      setHeightInches(inches.toString());
    }
  };

  const handleWeightUnitToggle = (metric: boolean) => {
    setUseMetricWeight(metric);
    // Convert existing values
    if (metric && weightLb) {
      const kg = lbToKg(parseFloat(weightLb));
      setWeightKg(kg.toString());
    } else if (!metric && weightKg) {
      const lb = kgToLb(parseFloat(weightKg));
      setWeightLb(lb.toString());
    }
  };

  const handleSave = async () => {
    setSaving(true);

    // Calculate values in standard units (cm, kg)
    let finalHeightCm: number | null = null;
    let finalWeightKg: number | null = null;

    if (useMetricHeight && heightCm) {
      finalHeightCm = parseFloat(heightCm);
    } else if (!useMetricHeight && (heightFeet || heightInches)) {
      finalHeightCm = feetInchesToCm(parseInt(heightFeet) || 0, parseInt(heightInches) || 0);
    }

    if (useMetricWeight && weightKg) {
      finalWeightKg = parseFloat(weightKg);
    } else if (!useMetricWeight && weightLb) {
      finalWeightKg = lbToKg(parseFloat(weightLb));
    }

    const updates: Partial<import('@/hooks/useCoachingProfile').CoachingProfile> = {
      age_years: age ? parseInt(age) : null,
      height_cm: finalHeightCm,
      weight_kg: finalWeightKg,
      preferred_height_unit: useMetricHeight ? 'cm' : 'ft_in',
      preferred_weight_unit: useMetricWeight ? 'kg' : 'lb',
      injuries: injuries || null,
      mental_health: mentalHealth || null,
    };

    const { error } = await updateProfile(updates);
    setSaving(false);

    if (error) {
      toast.error('Failed to save coaching profile');
    } else {
      toast.success('Coaching profile updated!');
    }
  };

  if (loading) {
    return (
      <Card className="border-primary/30 neon-border-subtle">
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/30 neon-border-subtle">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-primary" />
          <CardTitle className="font-display tracking-wide">COACHING PROFILE</CardTitle>
        </div>
        <CardDescription>
          This data helps Unbreakable Coaching personalise your programmes and nutrition plans.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Age */}
        <div className="space-y-2">
          <Label htmlFor="age">Age (years)</Label>
          <Input
            id="age"
            type="number"
            min="0"
            max="120"
            placeholder="e.g. 35"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="bg-input border-border"
          />
        </div>

        {/* Height */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Height</Label>
            <div className="flex items-center gap-2 text-sm">
              <span className={useMetricHeight ? 'text-muted-foreground' : 'text-primary font-semibold'}>ft/in</span>
              <Switch
                checked={useMetricHeight}
                onCheckedChange={handleHeightUnitToggle}
              />
              <span className={useMetricHeight ? 'text-primary font-semibold' : 'text-muted-foreground'}>cm</span>
            </div>
          </div>
          {useMetricHeight ? (
            <Input
              type="number"
              min="30"
              max="300"
              placeholder="e.g. 180"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              className="bg-input border-border"
            />
          ) : (
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="number"
                  min="0"
                  max="8"
                  placeholder="Feet"
                  value={heightFeet}
                  onChange={(e) => setHeightFeet(e.target.value)}
                  className="bg-input border-border"
                />
                <span className="text-xs text-muted-foreground mt-1 block">ft</span>
              </div>
              <div className="flex-1">
                <Input
                  type="number"
                  min="0"
                  max="11"
                  placeholder="Inches"
                  value={heightInches}
                  onChange={(e) => setHeightInches(e.target.value)}
                  className="bg-input border-border"
                />
                <span className="text-xs text-muted-foreground mt-1 block">in</span>
              </div>
            </div>
          )}
        </div>

        {/* Weight */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Weight</Label>
            <div className="flex items-center gap-2 text-sm">
              <span className={useMetricWeight ? 'text-muted-foreground' : 'text-primary font-semibold'}>lb</span>
              <Switch
                checked={useMetricWeight}
                onCheckedChange={handleWeightUnitToggle}
              />
              <span className={useMetricWeight ? 'text-primary font-semibold' : 'text-muted-foreground'}>kg</span>
            </div>
          </div>
          <Input
            type="number"
            min="20"
            max={useMetricWeight ? 400 : 880}
            placeholder={useMetricWeight ? 'e.g. 80' : 'e.g. 176'}
            value={useMetricWeight ? weightKg : weightLb}
            onChange={(e) => useMetricWeight ? setWeightKg(e.target.value) : setWeightLb(e.target.value)}
            className="bg-input border-border"
          />
        </div>

        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="w-full font-display tracking-wide"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          SAVE COACHING PROFILE
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          This data is private and only used by your Unbreakable Coach.
        </p>
      </CardContent>
    </Card>
  );
}
