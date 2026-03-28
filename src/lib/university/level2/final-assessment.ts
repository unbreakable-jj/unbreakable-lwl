import type { UnitAssessment } from '../types';

export const level2FinalAssessment: UnitAssessment = {
  unitNumber: 0,
  title: 'Level 2 Final Assessment',
  passMarkPercent: 80,
  pickCount: 80,
  questions: [
    // ═══════════════════════════════════════════════════════════════
    //  UNIT 1 — UNDERSTANDING THE BODY (Q1–Q20)
    // ═══════════════════════════════════════════════════════════════

    // ── Anatomy & Planes of Movement ──
    {
      type: 'multiple_choice',
      question: 'A woodchop exercise involves rotating your torso while moving a weight diagonally across your body. Which plane of movement is dominant?',
      options: ['Sagittal plane', 'Frontal plane', 'Transverse plane', 'Coronal plane'],
      correctAnswer: 2,
      explanation: 'The woodchop involves torso rotation, which is a transverse plane movement. While there is some sagittal plane contribution from the diagonal path, the primary movement pattern is rotational.',
    },
    {
      type: 'multiple_choice',
      question: 'What does the anatomical term "inferior" mean?',
      options: ['Towards the front of the body', 'Towards the back of the body', 'Below or towards the feet', 'Above or towards the head'],
      correctAnswer: 2,
      explanation: 'Inferior means below or towards the feet. For example, the knee is inferior to the hip. The opposite term is "superior" (above or towards the head).',
    },
    {
      type: 'scenario',
      question: 'Which plane of movement are you primarily working in?',
      scenario: 'You perform a cable fly, starting with your arms wide and bringing them together in front of your chest, keeping your elbows slightly bent throughout.',
      options: ['Sagittal plane', 'Transverse plane', 'Frontal plane', 'All three equally'],
      correctAnswer: 1,
      explanation: 'Horizontal adduction at the shoulder (bringing the arms together at chest height) occurs in the transverse plane. This is distinct from a frontal plane movement like a lateral raise.',
    },

    // ── Skeletal System ──
    {
      type: 'multiple_choice',
      question: 'Which type of synovial joint allows rotation around a single axis, such as turning your head to look over your shoulder?',
      options: ['Hinge joint', 'Ball-and-socket joint', 'Pivot joint', 'Gliding joint'],
      correctAnswer: 2,
      explanation: 'The pivot joint (such as the atlantoaxial joint at the top of the spine) allows rotation around a single axis. This is what enables you to turn your head left and right.',
    },
    {
      type: 'multiple_choice',
      question: 'Ligaments connect which two structures?',
      options: ['Muscle to bone', 'Bone to bone', 'Muscle to muscle', 'Skin to muscle'],
      correctAnswer: 1,
      explanation: 'Ligaments connect bone to bone, providing joint stability. Tendons connect muscle to bone. Understanding this distinction is important for recognising different injury types.',
    },
    {
      type: 'scenario',
      question: 'What is the most likely explanation?',
      scenario: 'You twisted your ankle while running. The area around the outside of the ankle is swollen and painful, but you can still bear weight. An X-ray shows no fracture.',
      options: [
        'You have torn a tendon',
        'You have likely sprained the lateral ligaments of the ankle',
        'You have fractured a bone that the X-ray missed',
        'You have dislocated the ankle joint',
      ],
      correctAnswer: 1,
      explanation: 'A lateral ankle sprain involves damage to the ligaments on the outside of the ankle — most commonly the anterior talofibular ligament. Swelling and pain without fracture after an inversion injury is a classic presentation.',
    },

    // ── Muscular System ──
    {
      type: 'multiple_choice',
      question: 'During a plank hold, your abdominal muscles maintain tension without changing length. What type of contraction is this?',
      options: ['Concentric', 'Eccentric', 'Isometric', 'Isokinetic'],
      correctAnswer: 2,
      explanation: 'An isometric contraction occurs when a muscle produces force without changing length. During a plank, the core muscles contract isometrically to maintain a rigid body position.',
    },
    {
      type: 'multiple_choice',
      question: 'Which muscle acts as the synergist during a bench press?',
      options: ['Biceps brachii', 'Latissimus dorsi', 'Anterior deltoid', 'Rectus abdominis'],
      correctAnswer: 2,
      explanation: 'During a bench press, the pectoralis major is the agonist and the anterior deltoid is the synergist — it assists the primary mover. The triceps also act as synergists, extending the elbow.',
    },
    {
      type: 'scenario',
      question: 'Which muscle fibre type is predominantly being recruited?',
      scenario: 'You are performing a set of 20 bodyweight squats at a controlled tempo with no added load. The effort feels moderate and sustainable.',
      options: ['Type IIx (fast-twitch glycolytic)', 'Type IIa (intermediate)', 'Type I (slow-twitch oxidative)', 'Equal recruitment of all fibre types'],
      correctAnswer: 2,
      explanation: 'Low-intensity, sustained efforts primarily recruit Type I (slow-twitch) muscle fibres. These fibres are fatigue-resistant and rely on aerobic metabolism, making them suited to endurance-type work.',
    },
    {
      type: 'multiple_choice',
      question: 'What is a muscle\'s "origin"?',
      options: [
        'The point where the muscle attaches to the moving bone',
        'The point where the muscle attaches to the stationary bone',
        'The thickest part of the muscle belly',
        'The point where the nerve enters the muscle',
      ],
      correctAnswer: 1,
      explanation: 'The origin is the attachment point on the stationary (or less mobile) bone. The insertion is the attachment on the moving bone. During contraction, the insertion moves towards the origin.',
    },

    // ── Cardiovascular System ──
    {
      type: 'multiple_choice',
      question: 'What is the function of the pulmonary artery?',
      options: [
        'To carry oxygenated blood from the lungs to the heart',
        'To carry deoxygenated blood from the heart to the lungs',
        'To carry oxygenated blood from the heart to the body',
        'To carry deoxygenated blood from the body to the heart',
      ],
      correctAnswer: 1,
      explanation: 'The pulmonary artery carries deoxygenated blood from the right ventricle to the lungs for gas exchange. It is the only artery in the body that carries deoxygenated blood.',
    },
    {
      type: 'scenario',
      question: 'What acute cardiovascular response explains this?',
      scenario: 'You begin a set of heavy barbell squats. Within the first few reps, your heart rate increases rapidly from 70 bpm to 140 bpm, your breathing rate increases, and you feel your face flush.',
      options: [
        'Your blood pressure has dropped dangerously',
        'Sympathetic nervous system activation increases heart rate and cardiac output to deliver oxygen to working muscles',
        'Your cardiovascular system is failing to cope with the load',
        'Your body temperature is causing heat stroke',
      ],
      correctAnswer: 1,
      explanation: 'The sympathetic nervous system triggers an acute cardiovascular response to exercise: increased heart rate, stroke volume, cardiac output, blood pressure, and vasodilation to working muscles. This is a normal, healthy response.',
    },

    // ── Energy Systems ──
    {
      type: 'multiple_choice',
      question: 'Which energy system does NOT require oxygen to produce ATP?',
      options: ['Aerobic system', 'Both ATP-PC and anaerobic glycolysis', 'Only the aerobic system', 'All three require oxygen'],
      correctAnswer: 1,
      explanation: 'Both the ATP-PC system and anaerobic glycolysis produce ATP without oxygen (anaerobically). The aerobic system requires oxygen to metabolise fats and carbohydrates for sustained energy production.',
    },
    {
      type: 'scenario',
      question: 'Which energy systems are contributing and in what order of dominance?',
      scenario: 'You perform a 45-second all-out assault bike sprint. During the first 10 seconds you feel powerful, then between 10–40 seconds your legs begin to burn intensely, and by 45 seconds you are gasping for breath.',
      options: [
        'Aerobic system throughout',
        'ATP-PC dominant first (0–10s), then anaerobic glycolysis dominant (10–40s), with aerobic contribution increasing towards the end',
        'Anaerobic glycolysis throughout the entire 45 seconds',
        'ATP-PC system for the full 45 seconds',
      ],
      correctAnswer: 1,
      explanation: 'The ATP-PC system fuels the initial powerful burst (0–10s), anaerobic glycolysis becomes dominant as phosphocreatine depletes (10–40s, causing the burning sensation from lactate), and aerobic contribution increases towards the end as the body tries to meet oxygen demands.',
    },

    // ── Cross-Unit 1 Applied ──
    {
      type: 'scenario',
      question: 'Using your knowledge of anatomy and energy systems, what is the best explanation?',
      scenario: 'You notice that your deadlift performance declines significantly after the third rep of a heavy set of 5. Your lower back rounds and you cannot maintain a neutral spine. Your legs feel fine.',
      options: [
        'Your hamstrings are too weak to complete the set',
        'Your erector spinae (spinal stabilisers) are fatiguing faster than your prime movers, and the ATP-PC system is depleting',
        'Your cardiovascular system cannot supply enough oxygen',
        'You need to stretch your lower back before deadlifting',
      ],
      correctAnswer: 1,
      explanation: 'The erector spinae muscles act as stabilisers during a deadlift. They often fatigue before the larger prime movers (glutes, hamstrings). Combined with ATP-PC depletion during heavy sets, this results in technique breakdown — specifically loss of spinal neutrality.',
    },
    {
      type: 'multiple_choice',
      question: 'During exercise, blood is redistributed away from non-essential organs and towards working muscles. What is this process called?',
      options: ['Vasoconstriction only', 'Vasodilation only', 'Blood shunting (vascular shunt mechanism)', 'Cardiac hypertrophy'],
      correctAnswer: 2,
      explanation: 'The vascular shunt mechanism redirects blood flow during exercise: vasodilation increases blood flow to working muscles while vasoconstriction reduces blood flow to non-essential organs (digestive system, kidneys). This ensures working muscles receive adequate oxygen and nutrients.',
    },
    {
      type: 'multiple_choice',
      question: 'What is VO₂ max?',
      options: [
        'The maximum heart rate a person can achieve',
        'The maximum amount of oxygen the body can utilise during intense exercise',
        'The maximum weight a person can lift',
        'The maximum number of reps before failure',
      ],
      correctAnswer: 1,
      explanation: 'VO₂ max represents the maximum rate at which the body can consume and utilise oxygen during exercise. It is widely considered the gold standard measure of cardiovascular fitness.',
    },
    {
      type: 'multiple_choice',
      question: 'Which type of muscle contraction causes the most delayed-onset muscle soreness (DOMS)?',
      options: ['Concentric', 'Isometric', 'Eccentric', 'All equally'],
      correctAnswer: 2,
      explanation: 'Eccentric contractions (lengthening under load) cause the most microstructural damage to muscle fibres, resulting in the greatest DOMS. This is why lowering phases of exercises often cause more soreness than lifting phases.',
    },
    {
      type: 'scenario',
      question: 'Why does this happen?',
      scenario: 'After 8 weeks of consistent cardiovascular training, you notice that a pace that used to feel very hard (RPE 8) now feels moderate (RPE 5). Your resting heart rate has also dropped from 72 bpm to 64 bpm.',
      options: [
        'Your muscles have grown significantly larger',
        'Your cardiovascular system has adapted — increased stroke volume, greater cardiac efficiency, improved oxygen delivery',
        'You have lost body weight, making the exercise easier',
        'Your perception of effort has changed but no physiological adaptation has occurred',
      ],
      correctAnswer: 1,
      explanation: 'Chronic cardiovascular adaptations include increased stroke volume, cardiac output, capillary density, and mitochondrial function. These improvements mean the heart pumps more blood per beat (lowering resting HR) and working muscles extract oxygen more efficiently (reducing RPE at the same pace).',
    },

    // ═══════════════════════════════════════════════════════════════
    //  UNIT 2 — PRINCIPLES OF NUTRITION (Q21–Q40)
    // ═══════════════════════════════════════════════════════════════

    // ── Macronutrients ──
    {
      type: 'multiple_choice',
      question: 'How many calories does one gram of fat provide?',
      options: ['4 calories', '7 calories', '9 calories', '12 calories'],
      correctAnswer: 2,
      explanation: 'Fat provides 9 calories per gram — more than double that of protein or carbohydrates (both 4 cal/g). This is why fat is the most energy-dense macronutrient.',
    },
    {
      type: 'scenario',
      question: 'What is the most likely nutritional explanation?',
      scenario: 'You have been eating 1,800 calories per day with 180g carbohydrates, 180g protein, and 20g fat. After 6 weeks, you notice dry skin, brittle nails, low energy, and hormonal disruption.',
      options: [
        'Your carbohydrate intake is too high',
        'Your protein intake is excessive',
        'Your fat intake is too low — dietary fat is essential for hormone production, cell membranes, and vitamin absorption',
        'You need more fibre',
      ],
      correctAnswer: 2,
      explanation: 'At only 20g of fat per day, essential fatty acid intake is critically low. Dietary fat is required for hormone production (including testosterone and oestrogen), cell membrane integrity, fat-soluble vitamin absorption, and skin health. A minimum of 0.5–0.7g per kg bodyweight is recommended.',
    },
    {
      type: 'multiple_choice',
      question: 'What is a "complete" protein source?',
      options: [
        'Any food that contains protein',
        'A protein source that contains all 9 essential amino acids in adequate amounts',
        'A protein source with more than 30g per serving',
        'Any animal-based protein',
      ],
      correctAnswer: 1,
      explanation: 'A complete protein contains all 9 essential amino acids in sufficient quantities. Most animal sources are complete. Plant sources can be combined (e.g., rice and beans) to form complete amino acid profiles.',
    },

    // ── Micronutrients ──
    {
      type: 'multiple_choice',
      question: 'Why is Vitamin D particularly important for people who train regularly?',
      options: [
        'It increases appetite',
        'It supports bone health, immune function, and muscle function',
        'It prevents all forms of illness',
        'It directly builds muscle tissue',
      ],
      correctAnswer: 1,
      explanation: 'Vitamin D supports calcium absorption for bone health, immune system function, and muscle contraction efficiency. Deficiency is associated with increased injury risk, impaired recovery, and reduced strength — particularly concerning for active individuals.',
    },
    {
      type: 'scenario',
      question: 'What is the most practical approach to addressing this?',
      scenario: 'You follow a strict vegan diet and are concerned about getting adequate B12, iron, and omega-3 fatty acids. You have read that these are harder to obtain from plant sources.',
      options: [
        'Switch to an omnivorous diet — vegans cannot get adequate nutrition',
        'Supplement B12 (not available from plants), include iron-rich plants with Vitamin C for absorption, and consider an algae-based omega-3 supplement',
        'Eat more fruit to cover all nutritional needs',
        'Only supplement B12 — the others are not important',
      ],
      correctAnswer: 1,
      explanation: 'B12 supplementation is essential on a vegan diet as it is not available from plant foods. Plant-based iron (non-haem) is less bioavailable but absorption improves with Vitamin C. Algae-based omega-3 provides EPA/DHA without fish oil.',
    },

    // ── Hydration ──
    {
      type: 'multiple_choice',
      question: 'What is hyponatraemia and what causes it?',
      options: [
        'High blood sodium from eating too much salt',
        'Dangerously low blood sodium levels, typically from drinking excessive water without electrolytes',
        'A type of muscle cramp caused by dehydration',
        'Low blood sugar from insufficient carbohydrate intake',
      ],
      correctAnswer: 1,
      explanation: 'Hyponatraemia occurs when blood sodium levels drop dangerously low, usually from drinking excessive amounts of plain water (especially during prolonged exercise). It can cause confusion, seizures, and in severe cases, death. Balanced electrolyte intake during long sessions prevents this.',
    },
    {
      type: 'multiple_choice',
      question: 'During exercise lasting longer than 60 minutes, what should you consume alongside water?',
      options: ['Caffeine only', 'Electrolytes (primarily sodium)', 'Protein shakes', 'Nothing — water is sufficient for all durations'],
      correctAnswer: 1,
      explanation: 'During exercise exceeding 60 minutes, electrolyte replacement (particularly sodium) is important to maintain fluid balance, prevent cramping, and avoid hyponatraemia. Carbohydrates may also be beneficial depending on intensity.',
    },

    // ── Energy Balance ──
    {
      type: 'scenario',
      question: 'What is the most appropriate advice?',
      scenario: 'You weigh yourself daily. On Monday you weigh 80.2 kg, Tuesday 81.0 kg, Wednesday 79.8 kg, and Thursday 80.5 kg. You are frustrated and considering abandoning your nutrition plan.',
      options: [
        'The plan is not working — you should reduce calories immediately',
        'Daily weight fluctuations of 1–2 kg are normal and driven by hydration, food volume, and hormonal shifts. Use weekly averages instead.',
        'Your scale is broken — buy a new one',
        'You are gaining muscle and losing fat simultaneously every day',
      ],
      correctAnswer: 1,
      explanation: 'Daily bodyweight can fluctuate 1–2 kg due to water retention, food volume in the digestive tract, sodium intake, and hormonal changes. Weekly averages over 3–4 weeks reveal the true trend and should guide decisions.',
    },
    {
      type: 'multiple_choice',
      question: 'What is metabolic adaptation (adaptive thermogenesis)?',
      options: [
        'The body burning more calories as you lose weight',
        'The body reducing energy expenditure in response to prolonged caloric restriction',
        'A condition that prevents all fat loss',
        'The body adapting to burn only fat for fuel',
      ],
      correctAnswer: 1,
      explanation: 'Metabolic adaptation is the body\'s reduction in total energy expenditure during prolonged caloric restriction. BMR decreases, NEAT decreases subconsciously, and hormonal changes (reduced leptin, thyroid output) make continued fat loss harder. This is why aggressive deficits are unsustainable.',
    },

    // ── Food Labels ──
    {
      type: 'scenario',
      question: 'Which product is higher in protein per serving and which has less sugar?',
      scenario: 'You are comparing two protein bars. Bar A: per 60g serving — 250 cal, 20g protein, 28g carbs (15g sugar), 8g fat. Bar B: per 45g serving — 180 cal, 15g protein, 16g carbs (4g sugar), 7g fat.',
      options: [
        'Bar A is better in every way because it has more protein',
        'Bar B is better because it has fewer calories',
        'Bar A has more protein per serving (20g vs 15g), but Bar B has significantly less sugar (4g vs 15g). Per 100g comparison would give a fairer assessment.',
        'Both bars are identical nutritionally',
      ],
      correctAnswer: 2,
      explanation: 'Comparing per serving can be misleading due to different serving sizes (60g vs 45g). Bar A has more absolute protein but also far more sugar. Per 100g: Bar A has 33g protein and 25g sugar; Bar B has 33g protein and 9g sugar — making Bar B the better choice for a lower-sugar option with equivalent protein density.',
    },
    {
      type: 'multiple_choice',
      question: 'On a UK food label, what does a "red" traffic light indicator for saturated fat mean?',
      options: [
        'The product is extremely dangerous and should never be consumed',
        'The product is high in saturated fat (more than 5g per 100g) — consume in moderation',
        'The product contains no saturated fat',
        'The product has been recalled for safety reasons',
      ],
      correctAnswer: 1,
      explanation: 'The UK traffic light system uses red to indicate high levels: >5g saturated fat, >22.5g sugar, or >1.5g salt per 100g. Red does not mean "never eat" — it means be aware and moderate your intake.',
    },

    // ── Nutrient Timing ──
    {
      type: 'multiple_choice',
      question: 'What is the most important factor in nutrition for body composition — regardless of timing?',
      options: ['Pre-workout supplementation', 'Total daily calorie and macronutrient intake', 'Eating within 30 minutes of training', 'Intermittent fasting schedule'],
      correctAnswer: 1,
      explanation: 'Total daily intake of calories and macronutrients is the most important determinant of body composition. Nutrient timing is a secondary optimisation that matters far less than getting the fundamentals right.',
    },
    {
      type: 'scenario',
      question: 'What would you recommend?',
      scenario: 'You train at 7pm after work. You eat your last meal at 1pm (lunch). By the time you train, you feel sluggish, weak, and cannot complete your usual weights.',
      options: [
        'Skip the afternoon entirely and eat a large post-workout meal',
        'Have a balanced snack 2–3 hours before training (around 4–5pm) containing carbohydrates and protein',
        'Drink a large coffee to replace the need for food',
        'Train harder to push through the fatigue',
      ],
      correctAnswer: 1,
      explanation: 'A 6-hour gap between your last meal and training leaves glycogen partially depleted and blood sugar low. A balanced snack 2–3 hours pre-training provides fuel without digestive discomfort, improving energy and performance.',
    },

    // ── Practical Nutrition ──
    {
      type: 'scenario',
      question: 'What is the priority order for improving this person\'s nutrition?',
      scenario: 'You eat irregularly — sometimes one large meal, sometimes three small ones. Your protein intake averages 50g per day (you weigh 75kg). You rarely drink water. However, you have spent £200 on supplements including BCAAs, fat burners, and pre-workout.',
      options: [
        'Continue with supplements — they will compensate for the poor diet',
        'Priority 1: Increase protein to 120–150g/day. Priority 2: Establish consistent meal patterns. Priority 3: Increase water intake. Supplements are irrelevant until basics are fixed.',
        'Add more supplements to cover the nutritional gaps',
        'Focus solely on increasing water intake — everything else will follow',
      ],
      correctAnswer: 1,
      explanation: 'The fundamentals hierarchy is: adequate total calories → sufficient protein → consistent eating patterns → hydration → food quality → then (and only then) supplementation. Spending on supplements while neglecting the basics is the most common nutritional mistake.',
    },
    {
      type: 'multiple_choice',
      question: 'How much protein per kilogram of bodyweight is generally recommended for someone who trains regularly?',
      options: ['0.5–0.8g per kg', '1.6–2.2g per kg', '3.0–4.0g per kg', '5.0+ g per kg'],
      correctAnswer: 1,
      explanation: 'Current evidence supports 1.6–2.2g of protein per kg of bodyweight for individuals who train regularly. This range supports muscle protein synthesis, recovery, and body composition goals.',
    },

    // ── Cross-Unit 2 Applied ──
    {
      type: 'scenario',
      question: 'What is the single most impactful change you should make?',
      scenario: 'You want to lose body fat. You currently eat 2,500 calories per day with 80g protein, 350g carbohydrates, and 80g fat. Your estimated maintenance is 2,400 calories. You train 4 times per week.',
      options: [
        'Cut carbohydrates to zero',
        'Reduce total intake to 1,900–2,100 calories while increasing protein to 130–160g per day to preserve muscle mass',
        'Add two more training sessions per week while keeping calories the same',
        'Switch to a "detox" diet for rapid results',
      ],
      correctAnswer: 1,
      explanation: 'A moderate deficit (300–500 below maintenance) combined with increased protein intake is the evidence-based approach to fat loss. Higher protein preserves lean mass during a deficit, improves satiety, and has the highest thermic effect.',
    },
    {
      type: 'multiple_choice',
      question: 'Which of the following statements about alcohol and fitness is correct?',
      options: [
        'Alcohol has no effect on body composition',
        'Alcohol provides 7 calories per gram, impairs protein synthesis, disrupts sleep quality, and can reduce testosterone levels',
        'Red wine is beneficial for muscle growth',
        'Alcohol only affects performance if consumed during training',
      ],
      correctAnswer: 1,
      explanation: 'Alcohol provides 7 calories per gram with no nutritional benefit. It impairs muscle protein synthesis by up to 37%, disrupts sleep architecture (particularly deep sleep), increases cortisol, and can reduce testosterone. Moderation and timing are key considerations.',
    },

    // ═══════════════════════════════════════════════════════════════
    //  UNIT 3 — INTRODUCTION TO EXERCISE (Q41–Q60)
    // ═══════════════════════════════════════════════════════════════

    // ── Types of Training ──
    {
      type: 'scenario',
      question: 'Which combination of training types would best address your goals?',
      scenario: 'You want to improve cardiovascular health, build lean muscle, and reduce your risk of injury. You have 5 days per week available.',
      options: [
        'Five HIIT sessions per week',
        '3 resistance sessions, 1–2 cardio sessions (mix of steady-state and interval), plus regular flexibility work',
        'Five steady-state cardio sessions',
        '5 resistance sessions with no cardio or flexibility work',
      ],
      correctAnswer: 1,
      explanation: 'A balanced approach addresses all three goals: resistance training builds muscle, cardiovascular training improves heart health, and flexibility/mobility work reduces injury risk. Five days allows adequate recovery between resistance sessions.',
    },
    {
      type: 'multiple_choice',
      question: 'What is the primary difference between muscular strength and muscular endurance?',
      options: [
        'There is no difference',
        'Strength is maximal force production; endurance is the ability to sustain repeated contractions over time',
        'Endurance requires heavier weights than strength',
        'Strength only applies to upper body muscles',
      ],
      correctAnswer: 1,
      explanation: 'Muscular strength is the maximum force a muscle can produce in a single effort. Muscular endurance is the ability to perform repeated contractions or sustain a contraction over time without fatiguing.',
    },

    // ── Warm-Up & Cool-Down ──
    {
      type: 'multiple_choice',
      question: 'What does the "M" in the RAMP warm-up protocol stand for?',
      options: ['Maximise', 'Mobilise', 'Motivate', 'Monitor'],
      correctAnswer: 1,
      explanation: 'M stands for Mobilise — this phase targets joint-specific mobility, taking key joints through their required ranges of motion for the upcoming session (e.g., hip circles, thoracic rotations, ankle mobility).',
    },
    {
      type: 'scenario',
      question: 'What is the most effective warm-up approach?',
      scenario: 'You arrive at the gym for an upper-body session focused on bench press and overhead press. You have 10 minutes for your warm-up.',
      options: [
        '10 minutes of leg stretches',
        'RAMP: 3 min rowing (Raise), band pull-aparts and face pulls (Activate), shoulder circles and thoracic rotations (Mobilise), empty bar presses ramping to working weight (Potentiate)',
        '10 minutes of static chest stretches',
        'Skip the warm-up to save time for more working sets',
      ],
      correctAnswer: 1,
      explanation: 'An effective warm-up is specific to the session. RAMP ensures elevated heart rate, activated stabilisers, mobilised working joints, and progressive loading to the session\'s demands — all within 10 minutes.',
    },

    // ── Resistance Training ──
    {
      type: 'multiple_choice',
      question: 'What rest period is most appropriate for hypertrophy training (6–12 reps)?',
      options: ['15–30 seconds', '60–90 seconds', '3–5 minutes', '10+ minutes'],
      correctAnswer: 1,
      explanation: 'Hypertrophy training benefits from 60–90 second rest periods, which balance sufficient recovery for performance with enough metabolic stress to promote muscle growth.',
    },
    {
      type: 'scenario',
      question: 'What does this indicate and what should you do?',
      scenario: 'You target 4 sets of 8 reps on Romanian deadlift. Set 1: 8 reps. Set 2: 8 reps. Set 3: 6 reps. Set 4: 4 reps. You used the same weight throughout.',
      options: [
        'This is normal and expected — performance always declines across sets',
        'The weight may be appropriate but rest periods are likely too short, OR the weight is slightly too heavy for 4 × 8. Increase rest time or reduce weight slightly.',
        'You should increase the weight for the remaining sets',
        'You should stop training that exercise immediately',
      ],
      correctAnswer: 1,
      explanation: 'A significant rep drop-off (from 8 to 4) suggests either insufficient rest between sets or that the weight is at the upper limit for this rep range. Increasing rest periods to 90–120 seconds or a small weight reduction would allow more consistent rep performance across all sets.',
    },

    // ── Cardiovascular Training ──
    {
      type: 'multiple_choice',
      question: 'Using the formula 220 − age, what is the estimated maximum heart rate for a 30-year-old?',
      options: ['180 bpm', '190 bpm', '200 bpm', '210 bpm'],
      correctAnswer: 1,
      explanation: '220 − 30 = 190 bpm. While this formula has limitations and individual variation exists, it provides a practical starting point for calculating heart rate training zones.',
    },
    {
      type: 'multiple_choice',
      question: 'Which intensity method is the most accessible and requires no equipment?',
      options: ['Heart rate monitor', 'Rate of Perceived Exertion (RPE)', 'Lactate threshold testing', 'VO₂ max testing'],
      correctAnswer: 1,
      explanation: 'RPE (Rate of Perceived Exertion) uses a simple 1–10 scale based on how you feel. It requires no equipment, accounts for daily variations in fatigue, and is accessible to all fitness levels.',
    },

    // ── Flexibility & Mobility ──
    {
      type: 'scenario',
      question: 'Which type of stretching is most appropriate BEFORE a heavy deadlift session?',
      scenario: 'You are about to perform heavy deadlifts and want to prepare your hamstrings and hips without compromising force production.',
      options: [
        'Hold static hamstring stretches for 60 seconds each leg',
        'Dynamic stretches (leg swings, hip circles, inchworms) combined with progressive loading',
        'PNF stretching for maximum range of motion',
        'No stretching — just start lifting heavy immediately',
      ],
      correctAnswer: 1,
      explanation: 'Dynamic stretching increases blood flow, ROM, and neuromuscular readiness without the temporary force-reduction effects associated with prolonged static stretching before heavy lifting.',
    },
    {
      type: 'multiple_choice',
      question: 'What is the difference between active and passive flexibility?',
      options: [
        'There is no difference',
        'Active flexibility is ROM achieved using your own muscle strength; passive flexibility uses external force (gravity, a partner)',
        'Active flexibility only applies to athletes',
        'Passive flexibility is more important than active flexibility for gym training',
      ],
      correctAnswer: 1,
      explanation: 'Active flexibility is the range you can achieve through your own muscular effort (e.g., lifting your leg unassisted). Passive flexibility uses external force (e.g., someone pushing your leg). For functional training, active flexibility is generally more important.',
    },

    // ── Exercise Selection ──
    {
      type: 'multiple_choice',
      question: 'Which of the following is an isolation exercise?',
      options: ['Deadlift', 'Pull-up', 'Overhead press', 'Bicep curl'],
      correctAnswer: 3,
      explanation: 'A bicep curl is an isolation exercise — it involves movement at a single joint (elbow) and primarily targets one muscle group (biceps). Deadlifts, pull-ups, and overhead presses are all compound (multi-joint) exercises.',
    },
    {
      type: 'scenario',
      question: 'What should you add to balance this programme?',
      scenario: 'Your current programme includes bench press, overhead press, and lateral raises (all pushing movements). You notice your shoulders are rounding forward and you have upper back tension.',
      options: [
        'More chest exercises',
        'Pulling movements: rows, face pulls, rear delt work to balance anterior-dominant programming',
        'More shoulder pressing volume',
        'Static stretches for the chest only',
      ],
      correctAnswer: 1,
      explanation: 'Push-dominant programming without adequate pulling creates muscular imbalances — tight pectorals and anterior deltoids pull the shoulders forward. Adding horizontal pulls (rows) and rear delt work restores balance and improves posture.',
    },

    // ── Recovery & Adaptation ──
    {
      type: 'multiple_choice',
      question: 'What is the principle of progressive overload?',
      options: [
        'Training at maximum intensity every session',
        'Gradually increasing training demands over time to force continued adaptation',
        'Changing exercises every session to "shock" the muscles',
        'Performing the same workout indefinitely for consistency',
      ],
      correctAnswer: 1,
      explanation: 'Progressive overload is the systematic increase in training demands (weight, reps, sets, density) over time. Without progressive overload, the body has no reason to adapt beyond its current level.',
    },
    {
      type: 'scenario',
      question: 'What is the most appropriate intervention?',
      scenario: 'You have been training consistently for 5 weeks. Your performance peaked in week 3 but has declined in weeks 4 and 5. You feel heavy, unmotivated, and your sleep has worsened.',
      options: [
        'Push harder — you are just being lazy',
        'Programme a deload week: reduce volume by 40–60%, maintain movement quality, prioritise sleep and recovery',
        'Stop training entirely for a month',
        'Switch to a completely different programme immediately',
      ],
      correctAnswer: 1,
      explanation: 'Performance decline after weeks of progressive training, combined with fatigue and sleep disturbance, indicates accumulated fatigue. A deload week allows the body to recover and supercompensate, typically resulting in a performance rebound in the following week.',
    },

    // ── Special Populations / Individual Differences ──
    {
      type: 'multiple_choice',
      question: 'What is osteoporosis, and which type of training helps prevent it?',
      options: [
        'Loss of muscle mass — cardiovascular training',
        'Loss of bone density — weight-bearing and resistance training',
        'Loss of flexibility — stretching only',
        'Loss of cardiovascular fitness — HIIT only',
      ],
      correctAnswer: 1,
      explanation: 'Osteoporosis is the progressive loss of bone mineral density. Weight-bearing exercises and resistance training stimulate osteoblast activity (bone-building cells), maintaining and improving bone density. This is particularly important for post-menopausal women.',
    },
    {
      type: 'scenario',
      question: 'What is the most important consideration?',
      scenario: 'You are 60 years old and returning to the gym after a 10-year break. You used to bench press 100 kg in your 30s and want to return to that level.',
      options: [
        'Start where you left off — muscle memory will bring it back quickly',
        'Begin with a conservative programme, focus on movement quality, allow longer recovery between sessions, and progress gradually. Previous strength levels may not be realistic or necessary.',
        'Only use machines — free weights are too dangerous at 60',
        'Focus exclusively on cardio — resistance training is not suitable for older adults',
      ],
      correctAnswer: 1,
      explanation: 'After a long break, especially with age-related changes (reduced muscle mass, bone density, recovery capacity), a conservative starting point is essential. While muscle memory aids progress, joint health, connective tissue adaptation, and realistic goal-setting are priorities.',
    },

    // ── Cross-Unit 3 Applied ──
    {
      type: 'scenario',
      question: 'Rank these programme components from most to least important.',
      scenario: 'You are designing your first training programme and can only focus on three things initially. Rank: (A) perfecting nutrient timing around workouts, (B) consistent training 3–4 days per week with progressive overload, (C) adequate sleep and recovery, (D) using advanced techniques like drop sets and supersets.',
      options: [
        'A → D → B → C',
        'B → C → A → D (Consistent training with progressive overload, then recovery, then timing, then advanced techniques)',
        'D → A → C → B',
        'C → A → D → B',
      ],
      correctAnswer: 1,
      explanation: 'The hierarchy of priorities: (1) Consistent training with progressive overload is the foundation. (2) Adequate recovery (sleep, nutrition) allows adaptation. (3) Nutrient timing is a secondary optimisation. (4) Advanced techniques are for experienced trainees who have mastered the basics.',
    },
    {
      type: 'multiple_choice',
      question: 'What does the reversibility principle state?',
      options: [
        'All training adaptations are permanent',
        'Training effects are lost if the training stimulus is removed — "use it or lose it"',
        'You can reverse the effects of ageing through training',
        'Reversing the order of exercises improves results',
      ],
      correctAnswer: 1,
      explanation: 'The reversibility principle states that training adaptations are not permanent — they decline if the training stimulus is removed. Cardiovascular fitness can decline noticeably within 2–3 weeks of inactivity; strength losses become significant after 3–4 weeks.',
    },

    // ═══════════════════════════════════════════════════════════════
    //  UNIT 4 — BUILDING YOUR FOUNDATION (Q61–Q80)
    // ═══════════════════════════════════════════════════════════════

    // ── SMART Goals ──
    {
      type: 'scenario',
      question: 'Rewrite this as a SMART goal.',
      scenario: 'You say: "I want to be fitter." You have no specific target, no timeline, and no way to measure progress.',
      options: [
        '"I want to be really fit by next year"',
        '"I will complete a 5K run in under 30 minutes within 12 weeks, training 3 times per week"',
        '"I will try to exercise more often"',
        '"I want to go to the gym"',
      ],
      correctAnswer: 1,
      explanation: 'A SMART goal is Specific (5K run), Measurable (under 30 minutes), Achievable (realistic for most beginners in 12 weeks), Relevant (directly addresses "being fitter"), and Time-bound (12-week deadline).',
    },
    {
      type: 'multiple_choice',
      question: 'What is the difference between an outcome goal and a process goal?',
      options: [
        'They are the same thing',
        'An outcome goal is the end result you want to achieve; a process goal is the daily/weekly action required to get there',
        'Process goals are more important because outcomes do not matter',
        'Outcome goals are only for professional athletes',
      ],
      correctAnswer: 1,
      explanation: 'Outcome goals define WHAT you want to achieve (e.g., lose 5 kg). Process goals define HOW you will get there (e.g., train 4 times per week, eat 150g protein daily). Both are necessary — processes drive outcomes.',
    },

    // ── Training Frequency ──
    {
      type: 'scenario',
      question: 'What is the most appropriate training split?',
      scenario: 'You are a beginner who can train 3 days per week (Monday, Wednesday, Friday). You want to build overall strength and muscle.',
      options: [
        'Chest on Monday, back on Wednesday, legs on Friday (body-part split)',
        'Full-body sessions all 3 days, training each major movement pattern each session',
        'Push on Monday, pull on Wednesday, legs on Friday',
        'Upper body all 3 days — legs do not need training for general fitness',
      ],
      correctAnswer: 1,
      explanation: 'Full-body training 3 days per week is optimal for beginners: it provides high training frequency per muscle group (3× per week), maximises motor learning through repetition, and matches the beginner\'s lower recovery demands.',
    },
    {
      type: 'multiple_choice',
      question: 'What does "training frequency" refer to?',
      options: [
        'The number of exercises in a session',
        'The number of training sessions per week (or per muscle group per week)',
        'The speed of each repetition',
        'The total weight lifted in a session',
      ],
      correctAnswer: 1,
      explanation: 'Training frequency refers to how often you train — either total sessions per week or how often each muscle group is trained per week. Higher frequency is generally better for beginners; intermediate trainees can vary based on split choice.',
    },

    // ── Programme Structure ──
    {
      type: 'multiple_choice',
      question: 'What is the typical duration of a macrocycle?',
      options: ['1 week', '4–6 weeks', '3–12 months (or an entire training year)', '1 training session'],
      correctAnswer: 2,
      explanation: 'A macrocycle is the longest planning period, typically spanning 3–12 months or an entire competitive season. It is composed of multiple mesocycles (4–6 week blocks) which contain microcycles (individual weeks).',
    },
    {
      type: 'scenario',
      question: 'Which periodisation approach is most appropriate?',
      scenario: 'You are an intermediate trainee who enjoys variety and wants to maintain both strength and hypertrophy year-round. You become bored easily with repetitive programming.',
      options: [
        'Linear periodisation — stick to one rep range for 12 weeks',
        'Undulating periodisation — vary intensity and rep ranges within each week (e.g., heavy Monday, moderate Wednesday, light Friday)',
        'No periodisation — just train instinctively',
        'Only train for strength — hypertrophy is not important',
      ],
      correctAnswer: 1,
      explanation: 'Undulating (or non-linear) periodisation provides daily variety in rep ranges and intensity while developing multiple qualities simultaneously. It suits individuals who thrive on variety and is well-supported by research for intermediate trainees.',
    },

    // ── Exercise Order & Session Design ──
    {
      type: 'scenario',
      question: 'What is the correct exercise order for this session?',
      scenario: 'Your session includes: barbell back squat, leg curl, walking lunge, leg extension, and calf raise. You want to maximise performance on the compound movements.',
      options: [
        'Leg curl → leg extension → calf raise → squat → lunge',
        'Barbell back squat → walking lunge → leg curl → leg extension → calf raise',
        'Calf raise → leg extension → leg curl → lunge → squat',
        'Any order — it does not matter',
      ],
      correctAnswer: 1,
      explanation: 'Compound exercises (squat, lunge) should be performed first when you are freshest, followed by isolation exercises (leg curl, leg extension) and finishing with smaller muscle groups (calf raise). This order maximises performance on the most demanding movements.',
    },
    {
      type: 'multiple_choice',
      question: 'What is a superset?',
      options: [
        'Performing one set of an exercise with very long rest',
        'Performing two exercises back-to-back with minimal rest between them',
        'Performing the same exercise twice in one session',
        'A set performed above your maximum capacity',
      ],
      correctAnswer: 1,
      explanation: 'A superset involves performing two exercises consecutively with minimal rest between them, typically pairing opposing muscle groups (e.g., bicep curl + tricep extension) or unrelated movements to increase training density.',
    },

    // ── Tracking Progress ──
    {
      type: 'scenario',
      question: 'Is progress actually stalling?',
      scenario: 'After 6 weeks of training, your bench press has gone from 40 kg × 10 to 50 kg × 8. Your body weight is unchanged. You feel stronger but are disappointed that the reps dropped when the weight increased.',
      options: [
        'Yes — reps decreased so you are getting weaker',
        'No — you have increased your estimated 1RM from ~53 kg to ~63 kg. Strength has improved significantly despite lower reps at the heavier weight.',
        'You should go back to 40 kg and build to 15 reps before increasing weight',
        'Body weight not changing means the programme is failing',
      ],
      correctAnswer: 1,
      explanation: 'Estimated 1RM (weight × reps × 0.0333 + weight) shows clear progression: ~53 kg → ~63 kg. Fewer reps at a heavier weight does not mean regression — it means you are training at a higher intensity. This is excellent progress for 6 weeks.',
    },
    {
      type: 'multiple_choice',
      question: 'Which combination of tracking methods gives the most complete picture of progress?',
      options: [
        'Scale weight only',
        'Training log (strength progression) + body measurements + progress photos + weekly weight averages',
        'Mirror only',
        'How your clothes fit only',
      ],
      correctAnswer: 1,
      explanation: 'No single metric captures the full picture. Combining training log data (objective strength), body measurements (circumferences), progress photos (visual changes), and weekly weight averages provides a comprehensive and accurate assessment of progress.',
    },

    // ── Sleep & Recovery ──
    {
      type: 'multiple_choice',
      question: 'Which hormone is primarily released during deep sleep that is critical for muscle repair?',
      options: ['Cortisol', 'Adrenaline', 'Growth hormone', 'Insulin'],
      correctAnswer: 2,
      explanation: 'Growth hormone is released in large pulses during Stage 3 (deep/slow-wave) sleep. It drives muscle repair, tissue recovery, and immune function. Poor sleep directly impairs recovery from training.',
    },
    {
      type: 'scenario',
      question: 'What are the likely consequences for your training?',
      scenario: 'You consistently sleep only 5 hours per night due to late-night screen use and irregular sleep times. You train 5 days per week.',
      options: [
        'No impact — sleep is overrated for fitness',
        'Impaired muscle recovery, increased cortisol, reduced testosterone, decreased strength and endurance, increased injury risk, and higher body fat storage',
        'Slightly slower progress but no significant impact',
        'Only mental performance is affected — physical performance is unaffected',
      ],
      correctAnswer: 1,
      explanation: 'Chronic sleep deprivation (below 7 hours) has wide-ranging negative effects: reduced growth hormone release, elevated cortisol, impaired protein synthesis, decreased reaction time, increased injury risk, and reduced motivation. No training programme can overcome consistently poor sleep.',
    },

    // ── Lifestyle & Adherence ──
    {
      type: 'scenario',
      question: 'What is the most effective strategy?',
      scenario: 'You have started and stopped training programmes 5 times in the last 2 years. Each time you follow an intense 6-day plan from social media, feel great for 3 weeks, then burn out and quit.',
      options: [
        'Find an even more intense programme to stay motivated',
        'Start with a sustainable 3-day programme, build the habit of consistency first, and increase gradually. Consistency beats intensity.',
        'Accept that training is not for you',
        'Hire a personal trainer to force accountability',
      ],
      correctAnswer: 1,
      explanation: 'The pattern of intense start → burnout → quit is caused by unsustainable programming. Starting with a manageable commitment (3 days) builds the habit of consistency. Once training is an established part of your life, volume and intensity can be gradually increased.',
    },
    {
      type: 'multiple_choice',
      question: 'What is "environment design" in the context of habit formation?',
      options: [
        'Choosing which gym to join',
        'Structuring your physical environment to make desired behaviours easier and undesired behaviours harder',
        'Designing a training programme',
        'Choosing the right workout clothes',
      ],
      correctAnswer: 1,
      explanation: 'Environment design involves reducing friction for good habits and increasing friction for bad ones. Examples: keeping a gym bag packed by the door, preparing meals in advance, removing junk food from the house, setting a phone curfew for better sleep.',
    },

    // ── Building Your Programme ──
    {
      type: 'scenario',
      question: 'What fundamental error is in this programme?',
      scenario: 'You create a 4-day programme: Monday — chest and triceps, Tuesday — shoulders, Wednesday — arms, Thursday — chest again. You do no lower body, no pulling, and no core work.',
      options: [
        'The programme is well balanced',
        'The programme is critically imbalanced — no lower body, no pulling movements, excessive anterior (front) focus, and no core work. This will lead to muscular imbalances, postural issues, and potential injury.',
        'You just need to add one more chest day',
        'The programme would be fine if you added bicep curls on Thursday',
      ],
      correctAnswer: 1,
      explanation: 'A balanced programme must include all fundamental movement patterns (push, pull, squat, hinge, lunge, carry) and train the entire body. This programme trains only anterior upper body — creating severe imbalances that will cause postural problems and increase injury risk.',
    },
    {
      type: 'multiple_choice',
      question: 'When should a beginner consider changing to a more advanced programme?',
      options: [
        'After the first week',
        'When linear progression (adding weight each session or each week) consistently stalls despite adequate recovery, nutrition, and sleep',
        'When they feel bored of the current exercises',
        'After exactly 12 weeks regardless of progress',
      ],
      correctAnswer: 1,
      explanation: 'Beginners should ride linear progression for as long as possible — it is the most efficient period of strength gain. Moving to intermediate programming is only warranted when linear progress genuinely stalls despite adequate recovery, not simply due to boredom or arbitrary time limits.',
    },

    // ── Cross-Unit 4 Applied ──
    {
      type: 'scenario',
      question: 'What is the single most important thing you should focus on?',
      scenario: 'You are about to start your fitness journey. You have read extensively about optimal training splits, nutrient timing, supplementation protocols, and periodisation models. You feel overwhelmed and have not yet started.',
      options: [
        'Research more until you find the perfect programme',
        'Start with a simple, sustainable programme (3 days per week, full-body, basic compound movements) and refine as you gain experience. Starting imperfectly is better than not starting at all.',
        'Wait until you can afford a full supplement stack',
        'Follow the most complex programme available to maximise results from day one',
      ],
      correctAnswer: 1,
      explanation: 'Analysis paralysis is one of the biggest barriers to starting. A simple programme executed consistently will always outperform a "perfect" programme that never begins. Start simple, learn from experience, and refine over time.',
    },
    {
      type: 'scenario',
      question: 'Putting it all together — what does a well-structured training week look like for a beginner?',
      scenario: 'You are a beginner with 3 days per week available (Monday, Wednesday, Friday). Your goals are to build overall strength, improve body composition, and establish a sustainable training habit.',
      options: [
        'Mon: chest/triceps, Wed: back/biceps, Fri: legs — each muscle trained once per week',
        'Mon/Wed/Fri: Full-body sessions with compound movements (squat, bench, row, overhead press, deadlift variation), 3 sets × 8–12 reps, progressive overload, RAMP warm-up, and cool-down. Track everything.',
        'Mon: 90 min HIIT, Wed: 90 min HIIT, Fri: 90 min HIIT',
        'Mon: arms only, Wed: cardio only, Fri: abs only',
      ],
      correctAnswer: 1,
      explanation: 'This combines every key principle from the course: full-body training for frequency, compound movements for efficiency, appropriate rep range for hypertrophy, progressive overload for continued adaptation, RAMP warm-up for injury prevention, cool-down for recovery, and logging for accountability. This is the complete foundation.',
    },
  ],
};
