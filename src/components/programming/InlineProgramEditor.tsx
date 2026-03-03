import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { X, Plus, Trash2, Save, GripVertical } from 'lucide-react';
import { GeneratedProgram, Exercise, WorkoutDay } from '@/lib/programTypes';
import { useTrainingPrograms } from '@/hooks/useTrainingPrograms';
import { toast } from 'sonner';

const EQUIPMENT_OPTIONS = ['barbell', 'dumbbell', 'bodyweight', 'machine', 'cable', 'kettlebell', 'bands', 'cardio'] as const;

interface InlineProgramEditorProps {
  programId: string;
  programData: GeneratedProgram;
  onClose: () => void;
  onSaved: () => void;
}

export function InlineProgramEditor({ programId, programData, onClose, onSaved }: InlineProgramEditorProps) {
  const { updateProgram } = useTrainingPrograms();
  const [data, setData] = useState<GeneratedProgram>(JSON.parse(JSON.stringify(programData)));
  const [saving, setSaving] = useState(false);

  const days = data.templateWeek?.days || data.weeks?.[0]?.days || [];

  const updateDay = (dayIdx: number, updates: Partial<WorkoutDay>) => {
    setData(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      const target = copy.templateWeek?.days || copy.weeks?.[0]?.days;
      if (target) target[dayIdx] = { ...target[dayIdx], ...updates };
      return copy;
    });
  };

  const updateExercise = (dayIdx: number, exIdx: number, updates: Partial<Exercise>) => {
    setData(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      const target = copy.templateWeek?.days || copy.weeks?.[0]?.days;
      if (target?.[dayIdx]?.exercises) {
        target[dayIdx].exercises[exIdx] = { ...target[dayIdx].exercises[exIdx], ...updates };
      }
      return copy;
    });
  };

  const removeExercise = (dayIdx: number, exIdx: number) => {
    setData(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      const target = copy.templateWeek?.days || copy.weeks?.[0]?.days;
      if (target?.[dayIdx]?.exercises) {
        target[dayIdx].exercises.splice(exIdx, 1);
      }
      return copy;
    });
  };

  const addExercise = (dayIdx: number) => {
    setData(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      const target = copy.templateWeek?.days || copy.weeks?.[0]?.days;
      if (target?.[dayIdx]) {
        if (!target[dayIdx].exercises) target[dayIdx].exercises = [];
        target[dayIdx].exercises.push({
          name: 'New Exercise',
          equipment: 'barbell',
          sets: 3,
          reps: '8-12',
          intensity: 'moderate',
          rest: '90s',
        });
      }
      return copy;
    });
  };

  const [showConfirm, setShowConfirm] = useState(false);

  const handleSave = async () => {
    setShowConfirm(true);
  };

  const confirmSave = async () => {
    setShowConfirm(false);
    setSaving(true);
    try {
      await updateProgram.mutateAsync({ programId, programData: data });

      // Notify athlete about the programme update
      try {
        const { data: program } = await supabase
          .from('training_programs')
          .select('user_id, name')
          .eq('id', programId)
          .single();

        if (program && program.user_id) {
          await supabase.from('notifications').insert({
            user_id: program.user_id,
            type: 'programme_updated',
            title: 'Programme Updated',
            body: `Your coach has updated your programme: "${program.name || 'Untitled'}"`,
            data: { program_id: programId },
          });
        }
      } catch (notifErr) {
        console.error('Failed to notify athlete:', notifErr);
      }

      toast.success('Programme updated and athlete notified');
      onSaved();
      onClose();
    } catch (err) {
      toast.error('Failed to save programme');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm tracking-wide text-foreground">EDIT PROGRAMME</h3>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} className="font-display text-xs">
            <X className="w-3 h-3 mr-1" /> CANCEL
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving} className="font-display text-xs">
            <Save className="w-3 h-3 mr-1" /> {saving ? 'SAVING...' : 'SAVE & PUBLISH'}
          </Button>
        </div>
      </div>

      {/* Programme Name */}
      <div>
        <label className="text-[10px] font-display tracking-wide text-muted-foreground">PROGRAMME NAME</label>
        <Input
          value={data.programName}
          onChange={e => setData(prev => ({ ...prev, programName: e.target.value }))}
          className="mt-1"
        />
      </div>

      {/* Days */}
      {days.map((day, dayIdx) => (
        <Card key={dayIdx} className="border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-1">
                <Input
                  value={day.day || ''}
                  onChange={e => updateDay(dayIdx, { day: e.target.value })}
                  className="font-display text-sm h-7"
                  placeholder="Day name"
                />
                <Input
                  value={day.sessionType || ''}
                  onChange={e => updateDay(dayIdx, { sessionType: e.target.value })}
                  className="text-xs h-6"
                  placeholder="Session type"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Warmup */}
            <div>
              <label className="text-[10px] font-display tracking-wide text-muted-foreground">WARMUP</label>
              <Textarea
                value={day.warmup || ''}
                onChange={e => updateDay(dayIdx, { warmup: e.target.value })}
                className="mt-1 text-xs min-h-[40px]"
                rows={1}
              />
            </div>

            {/* Exercises */}
            <div className="space-y-2">
              <p className="text-[10px] font-display tracking-wide text-muted-foreground">EXERCISES</p>
              {(day.exercises || []).map((ex, exIdx) => (
                <div key={exIdx} className="border border-border rounded-lg p-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-3 h-3 text-muted-foreground shrink-0" />
                    <Input
                      value={ex.name}
                      onChange={e => updateExercise(dayIdx, exIdx, { name: e.target.value })}
                      className="flex-1 text-xs h-7 font-medium"
                      placeholder="Exercise name"
                    />
                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => removeExercise(dayIdx, exIdx)}>
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    <div>
                      <label className="text-[9px] text-muted-foreground">Sets</label>
                      <Input
                        value={String(ex.sets)}
                        onChange={e => updateExercise(dayIdx, exIdx, { sets: e.target.value })}
                        className="text-xs h-6"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-muted-foreground">Reps</label>
                      <Input
                        value={ex.reps}
                        onChange={e => updateExercise(dayIdx, exIdx, { reps: e.target.value })}
                        className="text-xs h-6"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-muted-foreground">Intensity</label>
                      <Input
                        value={ex.intensity}
                        onChange={e => updateExercise(dayIdx, exIdx, { intensity: e.target.value })}
                        className="text-xs h-6"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-muted-foreground">Rest</label>
                      <Input
                        value={ex.rest}
                        onChange={e => updateExercise(dayIdx, exIdx, { rest: e.target.value })}
                        className="text-xs h-6"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-muted-foreground">Equipment</label>
                      <Select value={ex.equipment} onValueChange={v => updateExercise(dayIdx, exIdx, { equipment: v as any })}>
                        <SelectTrigger className="text-xs h-6">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {EQUIPMENT_OPTIONS.map(eq => (
                            <SelectItem key={eq} value={eq} className="text-xs">{eq}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full text-xs h-7" onClick={() => addExercise(dayIdx)}>
                <Plus className="w-3 h-3 mr-1" /> Add Exercise
              </Button>
            </div>

            {/* Cooldown */}
            <div>
              <label className="text-[10px] font-display tracking-wide text-muted-foreground">COOLDOWN</label>
              <Textarea
                value={day.cooldown || ''}
                onChange={e => updateDay(dayIdx, { cooldown: e.target.value })}
                className="mt-1 text-xs min-h-[40px]"
                rows={1}
              />
            </div>
          </CardContent>
        </Card>
      ))}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Publish Programme Changes</AlertDialogTitle>
            <AlertDialogDescription>
              This will update the athlete's programme and notify them of the changes. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSave}>Save & Notify</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
