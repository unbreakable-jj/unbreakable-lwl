import { cn } from '@/lib/utils';
import type { BodyPart } from '@/lib/exerciseLibrary';

interface BodyPartBadgeProps {
  bodyPart: BodyPart;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
}

export const BODY_PART_LETTERS: Record<BodyPart, string> = {
  chest: 'C',
  back: 'B',
  shoulders: 'S',
  legs: 'L',
  arms: 'A',
  core: 'Co',
  glutes: 'G',
  full_body: 'FB',
};

export const BODY_PART_LABELS: Record<BodyPart, string> = {
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  legs: 'Legs',
  arms: 'Arms',
  core: 'Core',
  glutes: 'Glutes',
  full_body: 'Full Body',
};

const SIZE_CLASSES = {
  sm: 'w-6 h-6 text-[10px]',
  md: 'w-7 h-7 text-xs',
  lg: 'w-8 h-8 text-sm',
};

export function BodyPartBadge({ 
  bodyPart, 
  className, 
  size = 'md',
  active = false,
}: BodyPartBadgeProps) {
  return (
    <div 
      className={cn(
        SIZE_CLASSES[size],
        'rounded font-display font-bold flex items-center justify-center shrink-0 tracking-wide',
        active 
          ? 'bg-primary text-primary-foreground shadow-[0_0_8px_hsl(var(--primary)/0.5)]' 
          : 'bg-primary/15 text-primary border border-primary/30',
        className
      )}
    >
      {BODY_PART_LETTERS[bodyPart]}
    </div>
  );
}

export const BODY_PART_OPTIONS: { value: BodyPart; label: string; letter: string }[] = [
  { value: 'chest', label: 'Chest', letter: 'C' },
  { value: 'back', label: 'Back', letter: 'B' },
  { value: 'shoulders', label: 'Shoulders', letter: 'S' },
  { value: 'legs', label: 'Legs', letter: 'L' },
  { value: 'arms', label: 'Arms', letter: 'A' },
  { value: 'core', label: 'Core', letter: 'Co' },
  { value: 'glutes', label: 'Glutes', letter: 'G' },
  { value: 'full_body', label: 'Full Body', letter: 'FB' },
];
