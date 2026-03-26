import { MessageCircle } from 'lucide-react';

interface Props {
  text: string;
}

export function CoachNoteBox({ text }: Props) {
  return (
    <div className="border-l-4 border-muted-foreground/30 bg-muted/30 rounded-r-lg p-4 my-6">
      <div className="flex items-center gap-2 mb-2">
        <MessageCircle className="w-4 h-4 text-muted-foreground" />
        <span className="font-display text-xs tracking-wider text-muted-foreground">COACH'S NOTE</span>
      </div>
      <p className="text-muted-foreground italic text-sm leading-relaxed">{text}</p>
    </div>
  );
}
