import { Level, Commitment, levelLabels, levelDescriptions, commitmentLabels, commitmentDescriptions } from '@/lib/programTypes';
import { GraduationCap, Flame } from 'lucide-react';

interface ProgramFormStep3Props {
  level: Level | null;
  commitment: Commitment | null;
  onLevelChange: (level: Level) => void;
  onCommitmentChange: (commitment: Commitment) => void;
}

export function ProgramFormStep3({
  level,
  commitment,
  onLevelChange,
  onCommitmentChange,
}: ProgramFormStep3Props) {
  const levels: Level[] = ['beginner', 'intermediate', 'advanced'];
  const commitments: Commitment[] = ['realistic', 'committed', 'aggressive'];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="font-display text-2xl text-foreground tracking-wide mb-2">
          YOUR LEVEL & COMMITMENT
        </h2>
        <p className="text-muted-foreground">
          Help us calibrate your program intensity
        </p>
      </div>

      {/* Experience Level */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <GraduationCap className="w-5 h-5 text-primary" />
          <h3 className="font-display text-lg text-foreground tracking-wide">
            EXPERIENCE LEVEL
          </h3>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {levels.map((lvl) => (
            <button
              key={lvl}
              onClick={() => onLevelChange(lvl)}
              className={`p-4 rounded-lg border-2 transition-all duration-300 text-center ${
                level === lvl
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-surface hover:border-primary/50'
              }`}
            >
              <span className={`block font-display text-lg mb-1 ${level === lvl ? 'text-primary' : 'text-foreground'}`}>
                {levelLabels[lvl]}
              </span>
              <span className="block text-xs text-muted-foreground">
                {levelDescriptions[lvl]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Commitment Level */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Flame className="w-5 h-5 text-primary" />
          <h3 className="font-display text-lg text-foreground tracking-wide">
            COMMITMENT LEVEL
          </h3>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {commitments.map((com) => (
            <button
              key={com}
              onClick={() => onCommitmentChange(com)}
              className={`p-4 rounded-lg border-2 transition-all duration-300 text-center ${
                commitment === com
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-surface hover:border-primary/50'
              }`}
            >
              <span className={`block font-display text-lg mb-1 ${commitment === com ? 'text-primary' : 'text-foreground'}`}>
                {commitmentLabels[com]}
              </span>
              <span className="block text-xs text-muted-foreground">
                {commitmentDescriptions[com]}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
