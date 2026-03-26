import type { Chapter } from '@/lib/university/types';
import { UnbreakableInsightBox } from './UnbreakableInsightBox';
import { CoachNoteBox } from './CoachNoteBox';
import { ImagePlaceholder } from './ImagePlaceholder';
import { Card } from '@/components/ui/card';
import { CheckSquare } from 'lucide-react';

interface Props {
  chapter: Chapter;
}

export function ChapterContent({ chapter }: Props) {
  return (
    <div className="space-y-6">
      {/* Learning Outcome */}
      <Card className="p-4 border-primary/20 bg-primary/5">
        <p className="font-display text-xs tracking-wider text-primary mb-1">LEARNING OUTCOME</p>
        <p className="text-sm text-foreground leading-relaxed">{chapter.learningOutcome}</p>
      </Card>

      {/* Assessment Criteria */}
      <div>
        <p className="font-display text-xs tracking-wider text-muted-foreground mb-2">ASSESSMENT CRITERIA</p>
        <ul className="space-y-1.5">
          {chapter.assessmentCriteria.map((c, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="text-primary font-semibold mt-0.5">{i + 1}.</span>
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Content Sections */}
      {chapter.content.map((section, i) => (
        <div key={i} className="space-y-3">
          {section.heading && (
            <h3 className="font-display text-lg tracking-wider text-foreground">{section.heading}</h3>
          )}
          {section.paragraphs?.map((p, j) => (
            <p key={j} className="text-sm text-muted-foreground leading-relaxed">{p}</p>
          ))}
          {section.bullets && (
            <ul className="space-y-2 ml-1">
              {section.bullets.map((b, j) => (
                <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary mt-1">•</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}
          {section.imagePlaceholder && (
            <ImagePlaceholder description={section.imagePlaceholder} />
          )}
        </div>
      ))}

      {/* Unbreakable Insight */}
      <UnbreakableInsightBox text={chapter.unbreakableInsight} />

      {/* Coach's Note */}
      <CoachNoteBox text={chapter.coachNote} />

      {/* Practical Task */}
      <Card className="p-5 border-primary/20">
        <div className="flex items-center gap-2 mb-3">
          <CheckSquare className="w-5 h-5 text-primary" />
          <span className="font-display text-sm tracking-wider text-primary">PRACTICAL TASK</span>
        </div>
        <h4 className="text-foreground font-semibold text-sm mb-2">{chapter.practicalTask.title}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">{chapter.practicalTask.instructions}</p>
        <div>
          <p className="text-xs font-display tracking-wider text-muted-foreground mb-2">REFLECTION QUESTIONS</p>
          <ul className="space-y-1.5">
            {chapter.practicalTask.reflectionQuestions.map((q, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-primary">{i + 1}.</span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </div>
      </Card>
    </div>
  );
}
