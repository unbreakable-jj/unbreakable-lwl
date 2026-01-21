import { Slider } from '@/components/ui/slider';
import { Calendar, Clock } from 'lucide-react';

interface ProgramFormStep2Props {
  availability: number;
  sessionLength: number;
  onAvailabilityChange: (value: number) => void;
  onSessionLengthChange: (value: number) => void;
}

export function ProgramFormStep2({
  availability,
  sessionLength,
  onAvailabilityChange,
  onSessionLengthChange,
}: ProgramFormStep2Props) {
  const sessionLengthOptions = [30, 45, 60, 75, 90];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="font-display text-2xl text-foreground tracking-wide mb-2">
          YOUR SCHEDULE
        </h2>
        <p className="text-muted-foreground">
          How much time can you commit?
        </p>
      </div>

      {/* Days per week */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="font-display text-lg text-foreground tracking-wide">
            TRAINING DAYS PER WEEK
          </h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Days</span>
            <span className="font-display text-2xl text-primary">{availability}</span>
          </div>
          
          <Slider
            value={[availability]}
            onValueChange={(value) => onAvailabilityChange(value[0])}
            min={2}
            max={6}
            step={1}
            className="py-4"
          />
          
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>2 days</span>
            <span>6 days</span>
          </div>
        </div>
      </div>

      {/* Session length */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="font-display text-lg text-foreground tracking-wide">
            SESSION LENGTH
          </h3>
        </div>
        
        <div className="grid grid-cols-5 gap-2">
          {sessionLengthOptions.map((length) => (
            <button
              key={length}
              onClick={() => onSessionLengthChange(length)}
              className={`py-3 px-2 rounded-lg border-2 transition-all duration-300 ${
                sessionLength === length
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-surface hover:border-primary/50'
              }`}
            >
              <span className={`font-display text-lg ${sessionLength === length ? 'text-primary' : 'text-foreground'}`}>
                {length}
              </span>
              <span className="block text-xs text-muted-foreground">min</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
