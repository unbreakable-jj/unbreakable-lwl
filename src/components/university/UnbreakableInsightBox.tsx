import { Flame } from 'lucide-react';

interface Props {
  text: string;
}

export function UnbreakableInsightBox({ text }: Props) {
  return (
    <div className="border-l-4 border-primary bg-primary/10 rounded-r-lg p-4 my-6">
      <div className="flex items-center gap-2 mb-2">
        <Flame className="w-5 h-5 text-primary" />
        <span className="font-display text-sm tracking-wider text-primary">UNBREAKABLE INSIGHT</span>
      </div>
      <p className="text-foreground font-semibold text-sm leading-relaxed">{text}</p>
    </div>
  );
}
