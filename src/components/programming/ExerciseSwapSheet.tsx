import { useState, useMemo } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Shuffle, Loader2, Search, Dumbbell } from 'lucide-react';
import { getExerciseDetails, EXERCISE_LIBRARY, findExerciseByName } from '@/lib/exerciseLibrary';

interface ExerciseSwapSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exerciseName: string;
  currentSets?: number;
  currentReps?: string;
  onSwap: (oldName: string, newExercise: { name: string; equipment: string; sets?: number; reps?: string }) => void;
  isSwapping?: boolean;
}

function getSmartSuggestions(exerciseName: string): Array<{ name: string; equipment: string; reason: string }> {
  const details = getExerciseDetails(exerciseName);
  const found = findExerciseByName(exerciseName);
  const suggestions: Array<{ name: string; equipment: string; reason: string }> = [];
  const addedNames = new Set<string>([exerciseName.toLowerCase()]);

  const addSuggestion = (name: string, equipment: string, reason: string) => {
    if (addedNames.has(name.toLowerCase())) return;
    addedNames.add(name.toLowerCase());
    suggestions.push({ name, equipment, reason });
  };

  if (details.exercise?.alternatives) {
    details.exercise.alternatives.forEach(alt => {
      const altEx = findExerciseByName(alt);
      addSuggestion(alt, altEx?.equipment?.[0] || 'bodyweight', 'Direct alternative — same movement pattern');
    });
  }

  if (details.exercise?.machineAlternatives) {
    details.exercise.machineAlternatives.forEach(alt => {
      addSuggestion(alt, 'machine', 'Machine alternative — no spotter needed');
    });
  }

  if (found) {
    const samePart = EXERCISE_LIBRARY.filter(e =>
      e.bodyPart === found.bodyPart &&
      e.name !== exerciseName &&
      !addedNames.has(e.name.toLowerCase()) &&
      (found.movementPattern ? e.movementPattern === found.movementPattern : true)
    ).slice(0, 4);

    samePart.forEach(e => {
      addSuggestion(e.name, e.equipment[0], `Same muscle group (${e.bodyPart}) — ${e.equipment[0]}`);
    });
  }

  return suggestions;
}

export function ExerciseSwapSheet({
  open,
  onOpenChange,
  exerciseName,
  currentSets,
  onSwap,
  isSwapping,
}: ExerciseSwapSheetProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const suggestions = useMemo(() => getSmartSuggestions(exerciseName), [exerciseName]);

  const filteredSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return suggestions;
    const q = searchQuery.toLowerCase();
    const libraryMatches = EXERCISE_LIBRARY
      .filter(e =>
        e.name.toLowerCase() !== exerciseName.toLowerCase() &&
        (e.name.toLowerCase().includes(q) || e.equipment.some(eq => eq.toLowerCase().includes(q)) || e.bodyPart.toLowerCase().includes(q))
      )
      .map(e => ({ name: e.name, equipment: e.equipment[0], reason: `${e.bodyPart} — ${e.equipment[0]}` }));
    const suggestionMatches = suggestions.filter(s =>
      s.name.toLowerCase().includes(q) || s.equipment.toLowerCase().includes(q)
    );
    const seen = new Set(suggestionMatches.map(s => s.name.toLowerCase()));
    const extra = libraryMatches.filter(m => !seen.has(m.name.toLowerCase()));
    return [...suggestionMatches, ...extra];
  }, [suggestions, searchQuery, exerciseName]);

  const handleSwapDirect = (exercise: { name: string; equipment: string }) => {
    // Keep same set count, blank target reps (user fills in manually)
    onSwap(exerciseName, {
      name: exercise.name,
      equipment: exercise.equipment,
      sets: currentSets,
      reps: undefined,
    });
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setSearchQuery('');
    }
    onOpenChange(isOpen);
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="z-[80] p-0">
        <div className="flex flex-col" style={{ maxHeight: '70vh' }}>
          {/* Fixed header */}
          <div className="p-6 pb-3">
            <SheetHeader>
              <SheetTitle className="font-display tracking-wide flex items-center gap-2">
                <Shuffle className="w-5 h-5 text-primary" />
                SWAP EXERCISE
              </SheetTitle>
              <p className="text-sm text-muted-foreground">
                Swap <span className="text-foreground font-medium">{exerciseName}</span> for an alternative:
              </p>
            </SheetHeader>

            {/* Search - fixed */}
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search alternatives..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Scrollable suggestions list */}
          <div
            className="flex-1 overflow-y-auto px-6 pb-6"
            style={{ touchAction: 'pan-y', overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}
          >
            <div className="space-y-2">
              {isSwapping && (
                <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span className="text-sm font-display tracking-wide">SWAPPING...</span>
                </div>
              )}

              {!isSwapping && filteredSuggestions.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No alternatives found. Try a different search.
                </p>
              )}

              {!isSwapping && filteredSuggestions.map((suggestion) => (
                <Card
                  key={suggestion.name}
                  className="p-4 border border-border bg-card hover:border-primary/50 active:bg-primary/5 transition-colors cursor-pointer"
                  onClick={() => handleSwapDirect({ name: suggestion.name, equipment: suggestion.equipment })}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Dumbbell className="w-4 h-4 text-primary shrink-0" />
                        <h4 className="font-display text-sm text-foreground">
                          {suggestion.name}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {suggestion.equipment}
                        </Badge>
                      </div>
                      <p className="text-xs text-primary italic">{suggestion.reason}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 gap-1 font-display tracking-wide"
                    >
                      <Shuffle className="w-3 h-3" />
                      SWAP
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
