import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dumbbell, Timer, User } from 'lucide-react';

interface StrengthData {
  benchMax?: number;
  squatMax?: number;
  deadliftMax?: number;
  ohpMax?: number;
}

interface SpeedData {
  fiveKTime?: string;
  tenKTime?: string;
  pacePerKm?: string;
}

interface ProgramFormStep4Props {
  strengthData: StrengthData;
  speedData: SpeedData;
  bodyweight?: number;
  age?: number;
  gender?: 'male' | 'female';
  onStrengthDataChange: (data: StrengthData) => void;
  onSpeedDataChange: (data: SpeedData) => void;
  onBodyweightChange: (value: number | undefined) => void;
  onAgeChange: (value: number | undefined) => void;
  onGenderChange: (value: 'male' | 'female') => void;
}

export function ProgramFormStep4({
  strengthData,
  speedData,
  bodyweight,
  age,
  gender,
  onStrengthDataChange,
  onSpeedDataChange,
  onBodyweightChange,
  onAgeChange,
  onGenderChange,
}: ProgramFormStep4Props) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="font-display text-2xl text-foreground tracking-wide mb-2">
          YOUR CURRENT STATS
        </h2>
        <p className="text-muted-foreground">
          Optional: Help us personalize your program
        </p>
      </div>

      {/* Basic Info */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-5 h-5 text-primary" />
          <h3 className="font-display text-lg text-foreground tracking-wide">
            BASIC INFO
          </h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground">Gender</Label>
            <RadioGroup
              value={gender || ''}
              onValueChange={(val) => onGenderChange(val as 'male' | 'female')}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male" className="text-foreground cursor-pointer">Male</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female" className="text-foreground cursor-pointer">Female</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label className="text-muted-foreground">Age</Label>
            <Input
              type="number"
              placeholder="Years"
              value={age || ''}
              onChange={(e) => onAgeChange(e.target.value ? parseInt(e.target.value) : undefined)}
              className="bg-surface border-border"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-muted-foreground">Bodyweight (kg)</Label>
            <Input
              type="number"
              placeholder="kg"
              value={bodyweight || ''}
              onChange={(e) => onBodyweightChange(e.target.value ? parseFloat(e.target.value) : undefined)}
              className="bg-surface border-border"
            />
          </div>
        </div>
      </div>

      {/* Strength Stats */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Dumbbell className="w-5 h-5 text-primary" />
          <h3 className="font-display text-lg text-foreground tracking-wide">
            STRENGTH (1RM in kg)
          </h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground">Bench Press</Label>
            <Input
              type="number"
              placeholder="kg"
              value={strengthData.benchMax || ''}
              onChange={(e) => onStrengthDataChange({
                ...strengthData,
                benchMax: e.target.value ? parseFloat(e.target.value) : undefined
              })}
              className="bg-surface border-border"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-muted-foreground">Squat</Label>
            <Input
              type="number"
              placeholder="kg"
              value={strengthData.squatMax || ''}
              onChange={(e) => onStrengthDataChange({
                ...strengthData,
                squatMax: e.target.value ? parseFloat(e.target.value) : undefined
              })}
              className="bg-surface border-border"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-muted-foreground">Deadlift</Label>
            <Input
              type="number"
              placeholder="kg"
              value={strengthData.deadliftMax || ''}
              onChange={(e) => onStrengthDataChange({
                ...strengthData,
                deadliftMax: e.target.value ? parseFloat(e.target.value) : undefined
              })}
              className="bg-surface border-border"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-muted-foreground">OHP</Label>
            <Input
              type="number"
              placeholder="kg"
              value={strengthData.ohpMax || ''}
              onChange={(e) => onStrengthDataChange({
                ...strengthData,
                ohpMax: e.target.value ? parseFloat(e.target.value) : undefined
              })}
              className="bg-surface border-border"
            />
          </div>
        </div>
      </div>

      {/* Speed Stats */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Timer className="w-5 h-5 text-primary" />
          <h3 className="font-display text-lg text-foreground tracking-wide">
            RUNNING TIMES
          </h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground">5K Time</Label>
            <Input
              type="text"
              placeholder="MM:SS"
              value={speedData.fiveKTime || ''}
              onChange={(e) => onSpeedDataChange({
                ...speedData,
                fiveKTime: e.target.value || undefined
              })}
              className="bg-surface border-border"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-muted-foreground">10K Time</Label>
            <Input
              type="text"
              placeholder="MM:SS"
              value={speedData.tenKTime || ''}
              onChange={(e) => onSpeedDataChange({
                ...speedData,
                tenKTime: e.target.value || undefined
              })}
              className="bg-surface border-border"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-muted-foreground">Easy Pace</Label>
            <Input
              type="text"
              placeholder="M:SS/km"
              value={speedData.pacePerKm || ''}
              onChange={(e) => onSpeedDataChange({
                ...speedData,
                pacePerKm: e.target.value || undefined
              })}
              className="bg-surface border-border"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
