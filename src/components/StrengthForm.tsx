import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { Gender, Exercise } from '@/lib/strengthCalculations';
import { exerciseNames } from '@/lib/strengthCalculations';

interface StrengthFormProps {
  onCalculate: (data: {
    gender: Gender;
    age: number;
    bodyweight: number;
    exercise: Exercise;
    weight: number;
    reps: number;
    unit: 'kg' | 'lb';
  }) => void;
}

export function StrengthForm({ onCalculate }: StrengthFormProps) {
  const [gender, setGender] = useState<Gender>('male');
  const [age, setAge] = useState('');
  const [bodyweight, setBodyweight] = useState('');
  const [exercise, setExercise] = useState<Exercise>('bench');
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [unit, setUnit] = useState<'kg' | 'lb'>('kg');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const a = parseInt(age, 10);
    const bw = parseFloat(bodyweight);
    const w = parseFloat(weight);
    const r = parseInt(reps, 10);
    
    if (a > 0 && bw > 0 && w > 0 && r > 0) {
      onCalculate({
        gender,
        age: a,
        bodyweight: bw,
        exercise,
        weight: w,
        reps: r,
        unit,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Gender Selection */}
      <div className="space-y-3">
        <Label className="text-foreground font-semibold">Gender</Label>
        <RadioGroup
          value={gender}
          onValueChange={(v) => setGender(v as Gender)}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="male" id="male" />
            <Label htmlFor="male" className="cursor-pointer text-muted-foreground">Male</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="female" id="female" />
            <Label htmlFor="female" className="cursor-pointer text-muted-foreground">Female</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Age */}
      <div className="space-y-3">
        <Label htmlFor="age" className="text-foreground font-semibold">
          Age
        </Label>
        <Input
          id="age"
          type="number"
          placeholder="Enter your age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          className="bg-input border-border text-foreground placeholder:text-muted-foreground"
          min="18"
          max="100"
          required
        />
      </div>

      {/* Bodyweight */}
      <div className="space-y-3">
        <Label htmlFor="bodyweight" className="text-foreground font-semibold">
          Bodyweight
        </Label>
        <div className="flex gap-2">
          <Input
            id="bodyweight"
            type="number"
            placeholder="Enter bodyweight"
            value={bodyweight}
            onChange={(e) => setBodyweight(e.target.value)}
            className="flex-1 bg-input border-border text-foreground placeholder:text-muted-foreground"
            min="1"
            step="0.1"
            required
          />
          <Select value={unit} onValueChange={(v) => setUnit(v as 'kg' | 'lb')}>
            <SelectTrigger className="w-20 bg-input border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kg">kg</SelectItem>
              <SelectItem value="lb">lb</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Exercise */}
      <div className="space-y-3">
        <Label className="text-foreground font-semibold">Exercise</Label>
        <Select value={exercise} onValueChange={(v) => setExercise(v as Exercise)}>
          <SelectTrigger className="bg-input border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(exerciseNames) as Exercise[]).map((ex) => (
              <SelectItem key={ex} value={ex}>
                {exerciseNames[ex]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Weight Lifted */}
      <div className="space-y-3">
        <Label htmlFor="weight" className="text-foreground font-semibold">
          Weight Lifted ({unit})
        </Label>
        <Input
          id="weight"
          type="number"
          placeholder="Enter weight"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="bg-input border-border text-foreground placeholder:text-muted-foreground"
          min="1"
          step="0.5"
          required
        />
      </div>

      {/* Reps */}
      <div className="space-y-3">
        <Label htmlFor="reps" className="text-foreground font-semibold">
          Repetitions
        </Label>
        <Input
          id="reps"
          type="number"
          placeholder="Enter reps (1-12)"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          className="bg-input border-border text-foreground placeholder:text-muted-foreground"
          min="1"
          max="12"
          required
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg py-6"
      >
        Calculate Strength
      </Button>
    </form>
  );
}
