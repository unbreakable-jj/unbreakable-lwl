import type { UnitAssessment } from '../types';

export const level3Unit1Assessment: UnitAssessment = {
  unitNumber: 1,
  title: 'Advanced Nutrition — Unit Assessment',
  passMarkPercent: 80,
  questions: [
    // ─── CH1: Macro Periodisation ───
    {
      type: 'multiple_choice',
      question: 'During a hypertrophy phase, which macronutrient ratio shift is most appropriate?',
      options: ['Higher fat, lower carbs', 'Higher carbs, moderate protein', 'Equal across all three', 'Protein only, minimal carbs and fat'],
      correctAnswer: 1,
      explanation: 'Hypertrophy phases benefit from higher carbohydrate intake to fuel intense training volume while maintaining moderate protein for muscle repair.',
    },
    {
      type: 'multiple_choice',
      question: 'What is the primary purpose of adjusting macros between training phases?',
      options: ['To keep meals interesting', 'To match energy and nutrient demands to training goals', 'To reduce food costs', 'To eliminate the need for supplements'],
      correctAnswer: 1,
      explanation: 'Macro periodisation ensures your nutrition supports the specific demands of each training phase — whether building, maintaining, or cutting.',
    },
    {
      type: 'multiple_choice',
      question: 'In a fat-loss phase, what typically happens to protein intake relative to other macros?',
      options: ['It decreases proportionally', 'It stays the same or increases', 'It is replaced by fats', 'It becomes irrelevant'],
      correctAnswer: 1,
      explanation: 'Protein is kept high (or increased) during a deficit to preserve lean mass while carbs and fats are reduced.',
    },
    // ─── CH2: Nutrient Timing ───
    {
      type: 'multiple_choice',
      question: 'What is the "anabolic window" in current evidence-based thinking?',
      options: ['A strict 30-minute post-workout period', 'A broader 3–5 hour period around training', 'Only applies to elite athletes', 'A debunked myth with no basis'],
      correctAnswer: 1,
      explanation: 'Modern research shows the post-exercise nutritional window is much wider than the 30-minute claim — spanning several hours either side of training.',
    },
    {
      type: 'multiple_choice',
      question: 'Why might carbohydrates be beneficial before a high-intensity session?',
      options: ['They slow digestion', 'They top up glycogen stores for fuel', 'They increase fat oxidation', 'They reduce the need for warm-ups'],
      correctAnswer: 1,
      explanation: 'Carbohydrates are the primary fuel for high-intensity exercise, and pre-workout carbs help ensure glycogen stores are adequate.',
    },
    {
      type: 'multiple_choice',
      question: 'Intra-workout nutrition is most relevant for sessions lasting longer than:',
      options: ['20 minutes', '45 minutes', '90 minutes', 'Any duration'],
      correctAnswer: 2,
      explanation: 'For most people, intra-workout nutrition only becomes meaningfully beneficial during prolonged sessions exceeding 90 minutes.',
    },
    // ─── CH3: Supplementation ───
    {
      type: 'multiple_choice',
      question: 'Which supplement has the strongest evidence base for improving strength performance?',
      options: ['BCAAs', 'Creatine monohydrate', 'Glutamine', 'CLA'],
      correctAnswer: 1,
      explanation: 'Creatine monohydrate is the most researched and consistently supported ergogenic supplement for strength and power.',
    },
    {
      type: 'multiple_choice',
      question: 'What does "evidence-based supplementation" mean in practice?',
      options: ['Following influencer recommendations', 'Using only supplements with robust peer-reviewed research', 'Taking everything available just in case', 'Avoiding all supplements entirely'],
      correctAnswer: 1,
      explanation: 'Evidence-based supplementation means choosing products backed by high-quality, peer-reviewed studies rather than marketing claims.',
    },
    // ─── CH4: Body Composition ───
    {
      type: 'multiple_choice',
      question: 'Body recomposition refers to:',
      options: ['Losing weight as fast as possible', 'Simultaneously gaining muscle and losing fat', 'Bulking followed by cutting', 'Maintaining the same body weight indefinitely'],
      correctAnswer: 1,
      explanation: 'Recomposition is the process of gaining lean muscle while losing body fat, often achieved at maintenance or a slight deficit with high protein.',
    },
    {
      type: 'multiple_choice',
      question: 'Which method of measuring body composition is considered the most accessible and repeatable for general use?',
      options: ['DEXA scan', 'Skinfold callipers with consistent technique', 'Visual estimation', 'BMI calculation'],
      correctAnswer: 1,
      explanation: 'While DEXA is highly accurate, consistent skinfold measurements are the most practical repeatable method for tracking changes over time.',
    },
    // ─── CH5: Metabolic Adaptation ───
    {
      type: 'multiple_choice',
      question: 'Adaptive thermogenesis describes:',
      options: ['Your body burning more calories over time', 'A reduction in energy expenditure beyond what weight loss alone predicts', 'Increased appetite after exercise', 'Higher metabolism from eating more protein'],
      correctAnswer: 1,
      explanation: 'Adaptive thermogenesis is the body\'s defence mechanism — reducing metabolic rate beyond the expected drop from reduced body mass during prolonged dieting.',
    },
    {
      type: 'multiple_choice',
      question: 'A diet break typically involves:',
      options: ['Eating whatever you want for a week', 'Returning to maintenance calories for 1–2 weeks', 'Fasting for 48 hours', 'Doubling protein intake temporarily'],
      correctAnswer: 1,
      explanation: 'A structured diet break raises calories to estimated maintenance for a planned period to help mitigate metabolic adaptation and psychological fatigue.',
    },
    {
      type: 'multiple_choice',
      question: 'Reverse dieting is the process of:',
      options: ['Eating meals in reverse order', 'Gradually increasing calories after a deficit phase', 'Cutting calories as fast as possible', 'Eliminating carbs entirely'],
      correctAnswer: 1,
      explanation: 'Reverse dieting slowly increases caloric intake post-diet to rebuild metabolic rate while minimising excessive fat regain.',
    },
    // ─── CH6: Calorie Cycling ───
    {
      type: 'multiple_choice',
      question: 'A refeed day is best described as:',
      options: ['A cheat day with no limits', 'A planned higher-calorie day emphasising carbohydrates', 'Skipping meals to save calories', 'Doubling fat intake for hormonal support'],
      correctAnswer: 1,
      explanation: 'Refeeds are structured increases in calorie intake — primarily through carbohydrates — to support leptin, thyroid function, and training performance.',
    },
    {
      type: 'multiple_choice',
      question: 'Calorie cycling is most useful for people who are:',
      options: ['Complete beginners with no training history', 'In a prolonged calorie deficit', 'Already at maintenance with no goals', 'Only training once per week'],
      correctAnswer: 1,
      explanation: 'Calorie cycling provides the greatest benefit during extended fat-loss phases, helping manage hormonal and psychological downsides of sustained restriction.',
    },
    // ─── CH7: Gut Health ───
    {
      type: 'multiple_choice',
      question: 'Which dietary factor has the greatest positive impact on gut microbiome diversity?',
      options: ['High protein intake', 'High fibre intake from varied plant sources', 'Low carbohydrate dieting', 'Frequent use of antibiotics'],
      correctAnswer: 1,
      explanation: 'A diverse range of plant fibres feeds different bacterial species, promoting a healthy and resilient gut microbiome.',
    },
    {
      type: 'multiple_choice',
      question: 'A food intolerance differs from a food allergy in that:',
      options: ['They are the same thing', 'Intolerances involve digestive discomfort, not immune-mediated reactions', 'Intolerances are always more severe', 'Allergies only affect children'],
      correctAnswer: 1,
      explanation: 'Food intolerances cause digestive symptoms (bloating, gas, discomfort) but do not involve the immune system the way true allergies do.',
    },
    // ─── CH8: Goal-Specific Nutrition ───
    {
      type: 'multiple_choice',
      question: 'During a structured bulk, a caloric surplus of what range is generally recommended to minimise excess fat gain?',
      options: ['100–200 kcal', '200–500 kcal', '500–1000 kcal', '1000+ kcal'],
      correctAnswer: 1,
      explanation: 'A moderate surplus of 200–500 kcal supports muscle growth while limiting unnecessary fat accumulation — often called a "lean bulk".',
    },
    {
      type: 'multiple_choice',
      question: 'When fuelling for endurance performance, which macronutrient takes priority?',
      options: ['Protein', 'Fat', 'Carbohydrates', 'Fibre'],
      correctAnswer: 2,
      explanation: 'Endurance activities rely heavily on glycogen stores, making carbohydrates the primary fuel source for sustained performance.',
    },
    {
      type: 'scenario',
      question: 'A lifter has been in a deficit for 16 weeks and has stalled. Their energy is low, sleep is poor, and gym performance has dropped. What is the most appropriate next step?',
      scenario: 'They are reluctant to increase calories because they fear regaining fat.',
      options: [
        'Cut calories further to push through the plateau',
        'Implement a structured diet break at maintenance for 1–2 weeks',
        'Switch to a ketogenic diet immediately',
        'Add two hours of daily cardio',
      ],
      correctAnswer: 1,
      explanation: 'After 16 weeks of dieting, metabolic adaptation and fatigue are likely significant. A diet break restores metabolic rate and psychological readiness without abandoning the overall goal.',
    },
  ],
};
