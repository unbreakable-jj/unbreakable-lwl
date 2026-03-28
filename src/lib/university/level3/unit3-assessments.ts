import type { UnitAssessment } from '../types';

export const level3Unit3Assessment: UnitAssessment = {
  unitNumber: 3,
  title: 'Programme Design — Unit Assessment',
  passMarkPercent: 80,
  questions: [
    // ─── CH1: Periodisation Models ───
    {
      type: 'multiple_choice',
      question: 'Linear periodisation involves:',
      options: ['Randomly changing variables each week', 'Gradually increasing intensity while decreasing volume over a training block', 'Training the same way every session', 'Only using bodyweight exercises'],
      correctAnswer: 1,
      explanation: 'Linear (or classical) periodisation progressively increases intensity and reduces volume across a mesocycle — moving from higher-rep, lower-load phases to lower-rep, higher-load phases.',
    },
    {
      type: 'multiple_choice',
      question: 'Daily Undulating Periodisation (DUP) differs from linear because:',
      options: ['It never changes intensity', 'It varies rep ranges and intensity within the same week', 'It only works for beginners', 'It requires daily maximal effort'],
      correctAnswer: 1,
      explanation: 'DUP manipulates training variables (load, volume, intensity) across different sessions within a single week rather than across longer phases.',
    },
    {
      type: 'multiple_choice',
      question: 'Block periodisation concentrates training into focused phases called:',
      options: ['Microcycles', 'Mesocycles with a singular dominant quality', 'Warm-up blocks', 'Recovery phases only'],
      correctAnswer: 1,
      explanation: 'Block periodisation dedicates each mesocycle to developing one primary quality (e.g. accumulation → transmutation → realisation).',
    },
    // ─── CH2: Exercise Selection ───
    {
      type: 'multiple_choice',
      question: 'The Stimulus-to-Fatigue Ratio (SFR) helps determine:',
      options: ['How many calories an exercise burns', 'How much muscle stimulus an exercise provides relative to the systemic fatigue it creates', 'Whether an exercise is safe', 'The ideal rest period between sets'],
      correctAnswer: 1,
      explanation: 'SFR evaluates whether an exercise delivers sufficient training stimulus relative to the recovery cost it imposes — helping you choose efficient exercises.',
    },
    {
      type: 'multiple_choice',
      question: 'Compound exercises should generally be placed:',
      options: ['At the end of a session when fatigued', 'Early in a session when fresh', 'Only on rest days', 'Exclusively in warm-ups'],
      correctAnswer: 1,
      explanation: 'Compound movements require the most neural drive and energy, so placing them early maximises performance and reduces injury risk.',
    },
    // ─── CH3: Training Splits ───
    {
      type: 'multiple_choice',
      question: 'A Push/Pull/Legs split typically trains each muscle group how many times per week?',
      options: ['Once', 'Twice (over 6 sessions)', 'Three times', 'Four times'],
      correctAnswer: 1,
      explanation: 'A classic PPL split run twice per week (6 sessions) hits each muscle group approximately twice, which aligns well with hypertrophy research.',
    },
    {
      type: 'multiple_choice',
      question: 'For a beginner with 3 days available, which split is generally most appropriate?',
      options: ['Body-part bro split', 'Full-body programme', 'Push/Pull/Legs', 'Twice-daily sessions'],
      correctAnswer: 1,
      explanation: 'Full-body training 3 days per week allows beginners to practice movements frequently and accumulate sufficient volume with adequate recovery.',
    },
    // ─── CH4: Auto-Regulation ───
    {
      type: 'multiple_choice',
      question: 'RPE 9 means approximately:',
      options: ['Maximum effort, no reps left', '1 rep in reserve', '3 reps in reserve', 'A warm-up intensity'],
      correctAnswer: 1,
      explanation: 'RPE 9 corresponds to roughly 1 repetition in reserve — a very challenging set where you could have completed one more rep.',
    },
    {
      type: 'multiple_choice',
      question: 'The main advantage of auto-regulation over fixed percentages is:',
      options: ['It requires no thinking', 'It accounts for daily readiness and fatigue fluctuations', 'It always results in heavier loads', 'It eliminates the need for progressive overload'],
      correctAnswer: 1,
      explanation: 'Auto-regulation adjusts training intensity to your actual capacity on any given day, rather than relying on percentages that assume consistent readiness.',
    },
    // ─── CH5: Weak Point Training ───
    {
      type: 'multiple_choice',
      question: 'The first step in addressing a weak muscle group is:',
      options: ['Adding 10 sets immediately', 'Identifying the weakness through assessment, then prioritising it in programming', 'Ignoring it and focusing on strengths', 'Using machines exclusively'],
      correctAnswer: 1,
      explanation: 'Effective weak-point training starts with honest assessment, then prioritises the lagging area through strategic exercise selection and volume placement.',
    },
    {
      type: 'multiple_choice',
      question: 'Prioritisation in programming typically means:',
      options: ['Training the weak muscle group first in a session when neural drive is highest', 'Always training it last', 'Only training it once per month', 'Replacing all other exercises'],
      correctAnswer: 0,
      explanation: 'Placing the priority muscle group early in a session ensures maximum energy, focus, and neural activation — increasing the quality of the training stimulus.',
    },
    // ─── CH6: Peaking & Tapering ───
    {
      type: 'multiple_choice',
      question: 'A taper before a strength test typically involves:',
      options: ['Dramatically increasing volume', 'Maintaining or slightly increasing intensity while reducing volume', 'Complete rest for two weeks', 'Switching to cardio-only training'],
      correctAnswer: 1,
      explanation: 'Tapering preserves intensity to maintain neural readiness while reducing volume to shed accumulated fatigue — allowing peak performance.',
    },
    {
      type: 'multiple_choice',
      question: 'Peaking is most appropriate for:',
      options: ['Everyday gym sessions', 'Competitions, tests, or milestone performances', 'Beginners in their first month', 'Deload weeks'],
      correctAnswer: 1,
      explanation: 'Peaking strategies are designed to maximise short-term performance for a specific event or test, not for routine training.',
    },
    // ─── CH7: Training Age ───
    {
      type: 'multiple_choice',
      question: 'A "training age" of 2 years means:',
      options: ['The person is 2 years old', 'They have been training consistently for approximately 2 years', 'They can only train twice per week', 'They need a personal trainer'],
      correctAnswer: 1,
      explanation: 'Training age refers to the total duration of consistent, structured resistance training — not chronological age.',
    },
    {
      type: 'multiple_choice',
      question: 'As training age increases, a lifter typically requires:',
      options: ['Less volume and simpler programming', 'More volume, more variation, and more sophisticated periodisation', 'No changes — the same programme works forever', 'Only bodyweight training'],
      correctAnswer: 1,
      explanation: 'Advanced lifters have higher thresholds for adaptation, requiring greater volume, strategic variation, and structured periodisation to continue progressing.',
    },
    // ─── CH8: Putting It Together ───
    {
      type: 'multiple_choice',
      question: 'When building a 12-week programme, the first step should be:',
      options: ['Choosing exercises randomly', 'Defining the primary goal and identifying the training phase structure', 'Jumping straight into week 1', 'Copying someone else\'s programme exactly'],
      correctAnswer: 1,
      explanation: 'Effective programme design starts with a clear goal and structured phases — everything else (exercise selection, volume, intensity) flows from that foundation.',
    },
    {
      type: 'scenario',
      question: 'You are designing a programme for someone who has been training for 3 years, trains 5 days per week, and wants to improve their bench press for a charity event in 10 weeks. What approach makes the most sense?',
      scenario: 'They currently bench 90 kg for 3 reps and want to hit 100 kg on the day.',
      options: [
        'A linear periodisation plan moving from volume to intensity with a taper in weeks 9–10',
        'Random training with no structure',
        'Only training bench press every day',
        'Switching to a full-body programme with no bench pressing',
      ],
      correctAnswer: 0,
      explanation: 'A structured linear periodisation with progressive intensity increases and a taper into the event is the textbook approach for peaking a specific lift over a defined timeline.',
    },
    {
      type: 'scenario',
      question: 'A lifter reports that their shoulders are growing well but their back is lagging despite training both equally. What programming adjustment is most appropriate?',
      scenario: 'They currently train back and shoulders in the same session with equal sets.',
      options: [
        'Remove all shoulder work entirely',
        'Prioritise back by training it first in the session and adding 2–3 extra weekly sets while slightly reducing shoulder volume',
        'Do nothing and hope it resolves itself',
        'Add a second daily session just for back',
      ],
      correctAnswer: 1,
      explanation: 'Prioritising the lagging muscle group earlier in the session and allocating additional volume — while slightly reducing the dominant group — is the most balanced approach.',
    },
  ],
};
