import { useState, useMemo } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shuffle, Loader2, Search, Dumbbell, ChevronLeft, Check } from 'lucide-react';
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
  currentReps,
  onSwap,
  isSwapping,
}: ExerciseSwapSheetProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<{ name: string; equipment: string } | null>(null);
  const [newSets, setNewSets] = useState('');
  const [newReps, setNewReps] = useState('');

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

  const handleSelectExercise = (exercise: { name: string; equipment: string }) => {
    setSelectedExercise(exercise);
    setNewSets(String(currentSets || 3));
    setNewReps(currentReps || '10');
  };

  const handleConfirmSwap = () => {
    if (!selectedExercise) return;
    const setsVal = parseInt(newSets);
    const repsVal = newReps.trim();
    onSwap(exerciseName, {
      name: selectedExercise.name,
      equipment: selectedExercise.equipment,
      sets: setsVal > 0 ? setsVal : undefined,
      reps: repsVal || undefined,
    });
  };

  const handleBack = () => {
    setSelectedExercise(null);
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedExercise(null);
      setSearchQuery('');
    }
    onOpenChange(isOpen);
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="z-[70]">
        <div className="max-h-[75vh] overflow-y-auto" style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}>
          <SheetHeader className="pb-4">
            <SheetTitle className="font-display tracking-wide flex items-center gap-2">
              <Shuffle className="w-5 h-5 text-primary" />
              {selectedExercise ? 'CONFIGURE SWAP' : 'SWAP EXERCISE'}
            </SheetTitle>
            <p className="text-sm text-muted-foreground">
              {selectedExercise ? (
                <>Swapping <span className="text-foreground font-medium">{exerciseName}</span> → <span className="text-primary font-medium">{selectedExercise.name}</span></>
              ) : (
                <>Swap <span className="text-foreground font-medium">{exerciseName}</span> for an alternative:</>
              )}
            </p>
          </SheetHeader>

          {selectedExercise ? (
            <div className="space-y-4 pb-6">
              <Card className="p-4 border-primary/30 bg-primary/5">
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-primary" />
                  <span className="font-display text-sm text-foreground">{selectedExercise.name}</span>
                  <Badge variant="outline" className="text-xs">{selectedExercise.equipment}</Badge>
                </div>
              </Card>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-display tracking-wide">SETS</Label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={newSets}
                    onChange={(e) => setNewSets(e.target.value)}
                    className="mt-1"
                    min="1"
                    max="10"
                    placeholder={String(currentSets || 3)}
                  />
                </div>
                <div>
                  <Label className="text-xs font-display tracking-wide">TARGET REPS</Label>
                  <Input
                    value={newReps}
                    onChange={(e) => setNewReps(e.target.value)}
                    className="mt-1"
                    placeholder={currentReps || '10'}
                  />
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground">
                Adjust sets and reps or keep the current targets.
              </p>

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleBack} className="gap-1 font-display tracking-wide">
                  <ChevronLeft className="w-4 h-4" />
                  BACK
                </Button>
                <Button
                  onClick={handleConfirmSwap}
                  disabled={isSwapping}
                  className="flex-1 gap-2 font-display tracking-wide"
                >
                  {isSwapping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  CONFIRM SWAP
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search alternatives..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="space-y-2">
                {filteredSuggestions.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No alternatives found. Try a different search.
                  </p>
                )}
                {filteredSuggestions.map((suggestion) => (
                  <Card
                    key={suggestion.name}
                    className="p-4 border border-border bg-card hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => handleSelectExercise({ name: suggestion.name, equipment: suggestion.equipment })}
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
                        SELECT
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
