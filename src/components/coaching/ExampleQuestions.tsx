import { Dumbbell, UtensilsCrossed, TrendingUp, BarChart3 } from 'lucide-react';

interface ExampleQuestionsProps {
  onQuestionClick: (question: string) => void;
  disabled?: boolean;
}

const EXAMPLE_QUESTIONS = [
  {
    icon: Dumbbell,
    question: "Build me a 4-day workout based on my last session.",
  },
  {
    icon: UtensilsCrossed,
    question: "Create a meal plan for my current calorie and macro goals.",
  },
  {
    icon: TrendingUp,
    question: "Give me tips to improve my squat form.",
  },
  {
    icon: BarChart3,
    question: "Show me a breakdown of my logged meals and stats.",
  },
];

export function ExampleQuestions({ onQuestionClick, disabled }: ExampleQuestionsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {EXAMPLE_QUESTIONS.map(({ icon: Icon, question }, index) => (
        <button
          key={index}
          type="button"
          onClick={() => onQuestionClick(question)}
          disabled={disabled}
          className="group flex items-center gap-3 p-3 rounded-lg border border-primary/30 bg-card/50 
            hover:border-primary hover:bg-primary/10 transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed text-left"
        >
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center
            group-hover:bg-primary/30 transition-colors">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors line-clamp-2">
            {question}
          </span>
        </button>
      ))}
    </div>
  );
}
