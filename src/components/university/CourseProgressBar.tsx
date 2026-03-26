import { Progress } from '@/components/ui/progress';

interface Props {
  label: string;
  completed: number;
  total: number;
}

export function CourseProgressBar({ label, completed, total }: Props) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-primary font-display tracking-wider">{percent}%</span>
      </div>
      <Progress value={percent} className="h-2" />
    </div>
  );
}
