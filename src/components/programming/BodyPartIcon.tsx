import { cn } from '@/lib/utils';
import { 
  Heart, 
  Target, 
  Footprints, 
  Dumbbell,
  Flame,
  Circle,
  Zap,
  Move3D
} from 'lucide-react';
import type { BodyPart } from '@/lib/exerciseLibrary';

interface BodyPartIconProps {
  bodyPart: BodyPart;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showGlow?: boolean;
}

const ICON_MAP: Record<BodyPart, React.ComponentType<{ className?: string }>> = {
  chest: Heart,
  back: Move3D,
  shoulders: Target,
  legs: Footprints,
  arms: Dumbbell,
  core: Flame,
  glutes: Circle,
  full_body: Zap,
};

const SIZE_CLASSES = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export function BodyPartIcon({ 
  bodyPart, 
  className, 
  size = 'md',
  showGlow = true 
}: BodyPartIconProps) {
  const Icon = ICON_MAP[bodyPart];
  
  return (
    <Icon 
      className={cn(
        SIZE_CLASSES[size],
        'text-primary',
        showGlow && 'drop-shadow-[0_0_6px_hsl(var(--primary)/0.6)]',
        className
      )} 
    />
  );
}

export const BODY_PART_ICONS: { value: BodyPart; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'chest', label: 'Chest', Icon: Heart },
  { value: 'back', label: 'Back', Icon: Move3D },
  { value: 'shoulders', label: 'Shoulders', Icon: Target },
  { value: 'legs', label: 'Legs', Icon: Footprints },
  { value: 'arms', label: 'Arms', Icon: Dumbbell },
  { value: 'core', label: 'Core', Icon: Flame },
  { value: 'glutes', label: 'Glutes', Icon: Circle },
  { value: 'full_body', label: 'Full Body', Icon: Zap },
];
