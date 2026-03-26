import { ImageIcon } from 'lucide-react';

interface Props {
  description: string;
}

export function ImagePlaceholder({ description }: Props) {
  return (
    <div className="border-2 border-dashed border-primary/20 rounded-lg p-6 my-4 flex flex-col items-center gap-2 bg-primary/5">
      <ImageIcon className="w-8 h-8 text-primary/40" />
      <p className="text-xs text-muted-foreground text-center max-w-sm">{description}</p>
    </div>
  );
}
