import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Gender, Distance } from '@/lib/speedCalculations';
import { distanceLabels } from '@/lib/speedCalculations';

interface SpeedFormProps {
  onCalculate: (data: {
    gender: Gender;
    age: number;
    distance: Distance;
    hours: number;
    minutes: number;
    seconds: number;
  }) => void;
}

export function SpeedForm({ onCalculate }: SpeedFormProps) {
  const [gender, setGender] = useState<Gender>('male');
  const [age, setAge] = useState('');
  const [distance, setDistance] = useState<Distance>('5k');
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('0');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const ageNum = parseInt(age);
    const hoursNum = parseInt(hours) || 0;
    const minutesNum = parseInt(minutes) || 0;
    const secondsNum = parseInt(seconds) || 0;
    
    if (ageNum && (hoursNum > 0 || minutesNum > 0 || secondsNum > 0)) {
      onCalculate({
        gender,
        age: ageNum,
        distance,
        hours: hoursNum,
        minutes: minutesNum,
        seconds: secondsNum,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Gender Selection */}
      <div className="space-y-3">
        <Label className="text-muted-foreground">Gender</Label>
        <RadioGroup
          value={gender}
          onValueChange={(value) => setGender(value as Gender)}
          className="flex gap-4"
        >
          <div className="flex items-center">
            <RadioGroupItem value="male" id="speed-male" className="peer sr-only" />
            <Label
              htmlFor="speed-male"
              className={`px-6 py-2 rounded-md cursor-pointer transition-colors font-display tracking-wide ${
                gender === 'male'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              Male
            </Label>
          </div>
          <div className="flex items-center">
            <RadioGroupItem value="female" id="speed-female" className="peer sr-only" />
            <Label
              htmlFor="speed-female"
              className={`px-6 py-2 rounded-md cursor-pointer transition-colors font-display tracking-wide ${
                gender === 'female'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              Female
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Age */}
      <div className="space-y-3">
        <Label htmlFor="speed-age" className="text-muted-foreground">Age</Label>
        <Input
          id="speed-age"
          type="number"
          placeholder="Enter your age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          className="bg-input border-border text-foreground"
          min="16"
          max="99"
        />
      </div>

      {/* Distance Selection */}
      <div className="space-y-3">
        <Label className="text-muted-foreground">Distance</Label>
        <Select value={distance} onValueChange={(value) => setDistance(value as Distance)}>
          <SelectTrigger className="bg-input border-border text-foreground">
            <SelectValue placeholder="Select distance" />
          </SelectTrigger>
          <SelectContent>
            {(Object.entries(distanceLabels) as [Distance, string][]).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Time Input */}
      <div className="space-y-3">
        <Label className="text-muted-foreground">Your Time</Label>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Hours</Label>
            <Input
              type="number"
              placeholder="0"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="bg-input border-border text-foreground text-center"
              min="0"
              max="12"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Minutes</Label>
            <Input
              type="number"
              placeholder="0"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              className="bg-input border-border text-foreground text-center"
              min="0"
              max="59"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Seconds</Label>
            <Input
              type="number"
              placeholder="0"
              value={seconds}
              onChange={(e) => setSeconds(e.target.value)}
              className="bg-input border-border text-foreground text-center"
              min="0"
              max="59"
            />
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full font-display text-lg tracking-wide py-6">
        Calculate Speed
      </Button>
    </form>
  );
}
