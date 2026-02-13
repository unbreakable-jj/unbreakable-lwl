import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Flame, Shield } from 'lucide-react';

interface U86AgreementProps {
  onAccept: () => void;
}

const COMMITMENTS = [
  'I commit to 86 consecutive days',
  'I understand there are no rest days',
  'I understand this programme prioritises discipline over motivation',
  'I accept responsibility for my execution',
];

export function U86Agreement({ onAccept }: U86AgreementProps) {
  const [accepted, setAccepted] = useState<boolean[]>(COMMITMENTS.map(() => false));

  const allAccepted = accepted.every(Boolean);

  const toggle = (i: number) => {
    setAccepted(prev => prev.map((v, idx) => idx === i ? !v : v));
  };

  return (
    <div className="max-w-xl mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-8 text-center"
      >
        <div className="space-y-4">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto neon-glow">
            <Shield className="w-10 h-10 text-primary" />
          </div>
          <h2 className="font-display text-3xl md:text-4xl tracking-wider text-foreground">
            <span className="text-primary neon-glow-subtle">UNBREAKABLE</span> COMMITMENT
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            This is not a programme you finish. This is a declaration of who you are becoming.
          </p>
        </div>

        <Card className="border-2 border-primary/30 bg-primary/5 p-6 text-left space-y-4">
          {COMMITMENTS.map((text, i) => (
            <div key={i} className="flex items-start gap-3 cursor-pointer" onClick={() => toggle(i)}>
              <Checkbox
                checked={accepted[i]}
                onCheckedChange={() => toggle(i)}
                className="mt-0.5 border-primary data-[state=checked]:bg-primary"
              />
              <p className="text-sm text-foreground leading-relaxed">{text}</p>
            </div>
          ))}
        </Card>

        <div className="space-y-3">
          <p className="text-primary font-display text-lg tracking-wider">
            "Leave enough to keep showing up."
          </p>
          <Button
            size="lg"
            onClick={onAccept}
            disabled={!allAccepted}
            className="gap-3 font-display tracking-wider text-lg px-10 py-6 shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
          >
            <Flame className="w-5 h-5" />
            I CHOOSE TO KEEP SHOWING UP
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
