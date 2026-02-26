// Premium coaching data for exercises - detailed movement cues, phases, and coaching notes

export type ExerciseType = 'primary_lift' | 'accessory' | 'assistance' | 'conditioning' | 'mobility';

export interface ExerciseCoachingData {
  exerciseType?: ExerciseType;
  purpose?: string;
  phases: {
    name: string;
    description: string;
    cues: string[];
  }[];
  breathing: {
    inhale: string;
    exhale: string;
    brace?: string;
  };
  commonMistakes: {
    mistake: string;
    correction: string;
  }[];
  musclesTargeted: {
    primary: string[];
    secondary: string[];
  };
  tempoGuide: string;
  coachingNotes: string;
  loadGuidelines?: {
    technique: string;
    hypertrophy: string;
    strength: string;
  };
  regressions?: string[];
  progressions?: string[];
  safetyNotes?: string[];
  loggingInstructions?: string[];
}

// Comprehensive coaching data for key exercises
export const EXERCISE_COACHING_DATA: Record<string, ExerciseCoachingData> = {
  // =====================
  // CHEST EXERCISES
  // =====================
  'flat-barbell-bench-press': {
    exerciseType: 'primary_lift',
    purpose: 'The flat barbell bench press develops horizontal pressing strength, chest mass, and upper-body power. It is a foundational movement for building maximal pressing capacity and is typically used for strength, hypertrophy, and athletic performance.',
    phases: [
      {
        name: 'Setup',
        description: 'Position yourself on the bench with optimal alignment',
        cues: [
          'Lie flat with eyes directly under the bar',
          'Feet flat on floor, creating a stable base',
          'Retract and depress shoulder blades - squeeze them together and down',
          'Create a slight arch in lower back while keeping glutes on bench',
          'Grip bar slightly wider than shoulder width'
        ]
      },
      {
        name: 'Unrack',
        description: 'Safely lift the bar to the starting position',
        cues: [
          'Take a deep breath and brace your core',
          'Press bar up and forward to clear the hooks',
          'Lock elbows with bar directly over shoulders',
          'Reset your shoulder blade position if needed'
        ]
      },
      {
        name: 'Eccentric (Lowering)',
        description: 'Control the bar down to your chest',
        cues: [
          'Inhale deeply as you begin the descent',
          'Lower bar in a slight diagonal path toward lower chest',
          'Keep elbows at 45-75 degrees from torso - not flared',
          'Touch bar to chest at nipple line or slightly below',
          'Maintain tension - don\'t bounce off chest'
        ]
      },
      {
        name: 'Concentric (Pressing)',
        description: 'Drive the bar back to the starting position',
        cues: [
          'Drive feet into floor for leg drive',
          'Push bar up and slightly back toward face',
          'Exhale forcefully through the sticking point',
          'Lock out elbows at top without losing shoulder position',
          'Keep chest high throughout the press'
        ]
      }
    ],
    breathing: {
      inhale: 'Deep breath at the top, hold during descent',
      exhale: 'Forceful exhale as you press through the sticking point',
      brace: 'Brace core before unracking and maintain throughout the set'
    },
    commonMistakes: [
      { mistake: 'Flaring elbows to 90 degrees', correction: 'Keep elbows tucked at 45-75 degrees to protect shoulders' },
      { mistake: 'Bouncing bar off chest', correction: 'Touch and pause briefly, then press with control' },
      { mistake: 'Lifting hips off bench', correction: 'Keep glutes pinned down - use leg drive through heels instead' },
      { mistake: 'Losing shoulder blade position', correction: 'Maintain retraction throughout - squeeze shoulder blades together' },
      { mistake: 'Bar path straight up and down', correction: 'Press in a slight arc - back toward face at lockout' }
    ],
    musclesTargeted: {
      primary: ['Pectoralis Major', 'Anterior Deltoids', 'Triceps'],
      secondary: ['Serratus Anterior', 'Core Stabilizers']
    },
    tempoGuide: '3-1-1-0 (3 sec down, 1 sec pause, 1 sec up, no pause at top)',
    coachingNotes: 'The bench press is a skill that requires practice. Focus on bar path, leg drive, and maintaining upper back tightness. Progressive overload with proper form will build serious pressing power.',
    loadGuidelines: {
      technique: 'Light-moderate load, slow tempo, focus on bar path and shoulder blade position',
      hypertrophy: 'Moderate load, controlled reps 8-12, full range of motion',
      strength: 'Heavy load 3-6 reps, full rest periods (3-5 mins)'
    },
    regressions: ['Dumbbell Bench Press', 'Machine Chest Press', 'Push Ups'],
    progressions: ['Paused Bench Press', 'Tempo Bench Press (4-1-1)', 'Close Grip Bench Press'],
    safetyNotes: [
      'Always use a spotter or safety bars when training heavy',
      'Reduce load if experiencing sharp shoulder or elbow pain',
      'Ensure wrists stay stacked over elbows to avoid wrist strain'
    ],
    loggingInstructions: [
      'Log barbell weight in kg',
      'Log total sets and reps completed',
      'Note RPE per set',
      'Record any shoulder or wrist discomfort'
    ]
  },

  'incline-barbell-bench-press': {
    phases: [
      {
        name: 'Setup',
        description: 'Set bench angle and position for upper chest emphasis',
        cues: [
          'Set bench to 30-45 degrees - lower angle for more chest, higher for shoulders',
          'Feet flat on floor for stability',
          'Retract shoulder blades into the bench',
          'Grip slightly narrower than flat bench'
        ]
      },
      {
        name: 'Eccentric (Lowering)',
        description: 'Control bar to upper chest',
        cues: [
          'Lower bar to upper chest/clavicle area',
          'Keep elbows at 45-60 degrees',
          'Maintain constant tension on upper pecs',
          'Control the descent - don\'t rush'
        ]
      },
      {
        name: 'Concentric (Pressing)',
        description: 'Drive bar upward with upper chest focus',
        cues: [
          'Press straight up over upper chest',
          'Focus on squeezing upper pecs together',
          'Lock out without excessive shoulder elevation',
          'Keep chest lifted throughout'
        ]
      }
    ],
    breathing: {
      inhale: 'Breath in at the top position',
      exhale: 'Exhale as you press the weight up'
    },
    commonMistakes: [
      { mistake: 'Bench angle too steep (60-90°)', correction: 'Use 30-45° to keep emphasis on upper chest, not front delts' },
      { mistake: 'Bar path to mid-chest', correction: 'Touch to upper chest/collarbone area for proper incline targeting' },
      { mistake: 'Excessive arch', correction: 'Keep moderate arch - too much turns it into a flat press' }
    ],
    musclesTargeted: {
      primary: ['Clavicular Pectoralis (Upper Chest)', 'Anterior Deltoids'],
      secondary: ['Triceps', 'Serratus Anterior']
    },
    tempoGuide: '2-1-1-0 (controlled descent, brief pause, press, repeat)',
    coachingNotes: 'The incline press builds the upper chest shelf that creates that "armour plate" look. Use a moderate angle to keep the focus on pecs rather than turning it into a shoulder press.'
  },

  'conventional-deadlift': {
    exerciseType: 'primary_lift',
    purpose: 'The conventional deadlift develops full-body pulling strength, posterior chain power, and grip endurance. It is a cornerstone movement for building raw strength and functional capacity, used in strength, powerlifting, and general fitness programming.',
    phases: [
      {
        name: 'Setup',
        description: 'Establish your strongest pulling position',
        cues: [
          'Feet hip-width apart, toes slightly out',
          'Bar over mid-foot - about 1 inch from shins',
          'Bend at hips first, then knees to reach bar',
          'Grip just outside knees - double overhand or mixed',
          'Shoulders slightly in front of bar'
        ]
      },
      {
        name: 'The Brace',
        description: 'Create full-body tension before the pull',
        cues: [
          'Take a huge breath into your belly',
          'Brace core like expecting a punch',
          'Pull slack out of bar - engage lats',
          'Chest up, back flat - "proud chest" position',
          'Weight in mid-foot to heels'
        ]
      },
      {
        name: 'The Pull',
        description: 'Execute the lift with coordinated hip and knee extension',
        cues: [
          'Push the floor away with your legs',
          'Keep bar dragging up legs - close contact',
          'Hips and shoulders rise at the same rate',
          'Once bar passes knees, drive hips forward',
          'Squeeze glutes hard at lockout'
        ]
      },
      {
        name: 'Lockout',
        description: 'Complete the lift with proper position',
        cues: [
          'Stand tall - hips fully extended',
          'Shoulders back, chest proud',
          'Don\'t hyperextend lower back',
          'Hold lockout for a beat before descent'
        ]
      },
      {
        name: 'The Descent',
        description: 'Return the bar safely to the floor',
        cues: [
          'Hinge at hips first, pushing them back',
          'Bend knees once bar passes them',
          'Maintain tension and back position',
          'Control but don\'t lower slowly - preserve energy'
        ]
      }
    ],
    breathing: {
      inhale: 'Massive breath before initiating the pull - hold throughout',
      exhale: 'Exhale at lockout or after bar returns to floor',
      brace: 'Full 360-degree core brace before every rep - reset at top'
    },
    commonMistakes: [
      { mistake: 'Rounding lower back', correction: 'Engage lats, brace core, and maintain neutral spine - "chest up"' },
      { mistake: 'Bar drifting forward', correction: 'Keep bar in contact with legs throughout the pull' },
      { mistake: 'Hips rising first', correction: 'Drive through legs first - hips and shoulders rise together' },
      { mistake: 'Hyperextending at lockout', correction: 'Stand tall and squeeze glutes - don\'t lean back excessively' },
      { mistake: 'Starting with hips too low', correction: 'This isn\'t a squat - hips start higher, shoulders over the bar' }
    ],
    musclesTargeted: {
      primary: ['Erector Spinae', 'Glutes', 'Hamstrings'],
      secondary: ['Quadriceps', 'Lats', 'Traps', 'Forearms', 'Core']
    },
    tempoGuide: 'Controlled setup, explosive pull, controlled descent',
    coachingNotes: 'The deadlift is the ultimate test of full-body strength. Master the hip hinge pattern, prioritize position over weight, and build an unbreakable posterior chain. Every rep should look identical.',
    loadGuidelines: {
      technique: 'Light load, focus on hip hinge pattern and maintaining flat back',
      hypertrophy: 'Moderate load, 6-10 reps, controlled tempo on eccentric',
      strength: 'Heavy load, 1-5 reps, full reset between reps'
    },
    regressions: ['Trap Bar Deadlift', 'Romanian Deadlift', 'Block Pulls (elevated start)'],
    progressions: ['Deficit Deadlift', 'Paused Deadlift (pause below knee)', 'Snatch Grip Deadlift'],
    safetyNotes: [
      'Stop immediately if you feel sharp lower back pain',
      'Use a belt for heavy sets (85%+ 1RM) if desired',
      'Avoid rounding under load - reduce weight if form breaks'
    ],
    loggingInstructions: [
      'Log barbell weight in kg',
      'Log total sets and reps completed',
      'Note RPE per set',
      'Record any lower back tightness or grip issues'
    ]
  },

  'barbell-back-squat': {
    exerciseType: 'primary_lift',
    purpose: 'The barbell back squat develops lower-body strength, trunk stability, and full-body coordination. It is a cornerstone movement for building maximal strength and transferable athletic capacity, used across strength, hypertrophy, and conditioning programmes.',
    phases: [
      {
        name: 'Setup',
        description: 'Position bar and establish stance',
        cues: [
          'Bar on upper traps (high bar) or rear delts (low bar)',
          'Hands as narrow as mobility allows for tight upper back',
          'Feet shoulder width or slightly wider, toes 15-30° out',
          'Step back with minimal steps - 2-3 max',
          'Take your stance and own it'
        ]
      },
      {
        name: 'The Brace',
        description: 'Create intra-abdominal pressure',
        cues: [
          'Big breath into belly, not chest',
          'Brace 360° around your midsection',
          'Squeeze glutes to set pelvis',
          'Screw feet into floor - external rotation torque'
        ]
      },
      {
        name: 'Eccentric (Descent)',
        description: 'Control the descent with proper mechanics',
        cues: [
          'Initiate by breaking at hips AND knees together',
          'Knees track over toes - push them out',
          'Keep chest up and back tight',
          'Descend to at least parallel - crease of hip below knee',
          'Maintain weight over mid-foot'
        ]
      },
      {
        name: 'The Hole',
        description: 'Transition from down to up',
        cues: [
          'Use the stretch reflex - don\'t pause too long',
          'Stay tight - no relaxing at bottom',
          'Prepare for explosive drive upward'
        ]
      },
      {
        name: 'Concentric (Ascent)',
        description: 'Drive out of the hole with power',
        cues: [
          'Drive through whole foot - push the floor away',
          'Lead with chest, not hips',
          'Keep knees pushed out',
          'Exhale through the sticking point',
          'Stand tall and squeeze glutes at top'
        ]
      }
    ],
    breathing: {
      inhale: 'Deep breath and brace at the top before descending',
      exhale: 'Exhale forcefully as you drive through the sticking point',
      brace: 'Full belly brace before every rep - reset at the top'
    },
    commonMistakes: [
      { mistake: 'Knees caving inward', correction: 'Actively push knees out over toes - strengthen glutes' },
      { mistake: 'Forward lean/good morning squat', correction: 'Keep chest up, lead with chest out of the hole' },
      { mistake: 'Heels rising', correction: 'Weight stays mid-foot, work on ankle mobility' },
      { mistake: 'Butt wink at bottom', correction: 'Descend only as low as you can maintain neutral spine' },
      { mistake: 'Not hitting depth', correction: 'Work mobility and reduce weight until you can hit parallel' }
    ],
    musclesTargeted: {
      primary: ['Quadriceps', 'Glutes'],
      secondary: ['Hamstrings', 'Erector Spinae', 'Core', 'Adductors']
    },
    tempoGuide: '2-0-1-0 (controlled descent, no pause, explosive up)',
    coachingNotes: 'The king of lower body exercises. Own your depth, own your stance. A great squat is built on mobility, stability, and confidence. Never sacrifice form for weight.',
    loadGuidelines: {
      technique: 'Light load, slow tempo, focus on depth and bracing',
      hypertrophy: 'Moderate load, 8-12 reps, controlled descent',
      strength: 'Heavy load, 1-5 reps, full rest periods (3-5 mins)'
    },
    regressions: ['Goblet Squat', 'Box Squat', 'Leg Press'],
    progressions: ['Paused Squat (3-sec hold at bottom)', 'Tempo Squat (4-0-1)', 'Front Squat'],
    safetyNotes: [
      'Reduce load if experiencing sharp knee or lower back pain',
      'Maintain neutral spine throughout - avoid excessive butt wink',
      'Use safety bars or a spotter when training near maximal loads'
    ],
    loggingInstructions: [
      'Log barbell weight in kg',
      'Log total sets and reps completed',
      'Note RPE per set',
      'Record depth achieved and any knee or hip discomfort'
    ]
  },

  'overhead-press': {
    exerciseType: 'primary_lift',
    purpose: 'The overhead press develops vertical pressing strength, shoulder stability, and upper-body power. It builds functional pressing capacity that transfers to sport and daily life, and is used for strength and hypertrophy development of the shoulders and triceps.',
    phases: [
      {
        name: 'Setup',
        description: 'Position bar in the front rack',
        cues: [
          'Bar rests on front delts, not in fingers',
          'Elbows slightly in front of bar',
          'Grip just outside shoulder width',
          'Feet hip to shoulder width apart',
          'Stand tall, slight lean back is OK'
        ]
      },
      {
        name: 'The Brace',
        description: 'Create a solid foundation',
        cues: [
          'Squeeze glutes hard',
          'Brace core - ribs down',
          'Take a big breath',
          'Create tension from floor to shoulders'
        ]
      },
      {
        name: 'The Press',
        description: 'Drive bar overhead with efficient path',
        cues: [
          'Press straight up - bar path is a J-curve',
          'Move your face out of the way, not the bar',
          'As bar clears head, push forward under it',
          'Lock out with bar over mid-foot',
          'Shrug shoulders up at lockout'
        ]
      },
      {
        name: 'Lockout',
        description: 'Stabilize overhead',
        cues: [
          'Arms fully extended',
          'Bar stacked over shoulders, hips, ankles',
          'Active shoulders - push up into the bar',
          'Hold position before lowering'
        ]
      },
      {
        name: 'The Lower',
        description: 'Return to front rack safely',
        cues: [
          'Pull bar back to front rack position',
          'Move head back as bar descends',
          'Absorb weight with legs slightly',
          'Reset for next rep'
        ]
      }
    ],
    breathing: {
      inhale: 'Big breath before pressing',
      exhale: 'Exhale through the sticking point or at lockout',
      brace: 'Squeeze glutes and brace core before each rep'
    },
    commonMistakes: [
      { mistake: 'Pressing in front of face', correction: 'Press straight up, move head back, then push through' },
      { mistake: 'Excessive back arch', correction: 'Squeeze glutes and brace core to keep torso vertical' },
      { mistake: 'Elbows flaring wide', correction: 'Keep elbows slightly in front of bar at start' },
      { mistake: 'Not fully locking out', correction: 'Shrug shoulders and fully extend arms at top' }
    ],
    musclesTargeted: {
      primary: ['Anterior Deltoids', 'Lateral Deltoids', 'Triceps'],
      secondary: ['Upper Chest', 'Traps', 'Core Stabilizers']
    },
    tempoGuide: 'Explosive press, controlled lower',
    coachingNotes: 'The strict press builds real overhead strength and shoulder stability. Keep it strict - no leg drive. This is a humbling movement that separates pretenders from true strength.',
    loadGuidelines: {
      technique: 'Light load, focus on bar path and overhead position',
      hypertrophy: 'Moderate load, 8-12 reps, controlled eccentric',
      strength: 'Heavy load, 3-6 reps, full rest periods (3-5 mins)'
    },
    regressions: ['Seated Dumbbell Press', 'Landmine Press', 'Pike Push Ups'],
    progressions: ['Push Press (with leg drive)', 'Z-Press (seated on floor)', 'Single Arm Dumbbell Press'],
    safetyNotes: [
      'Stop if you feel sharp shoulder impingement or pinching',
      'Avoid excessive lower back arch under load',
      'Ensure adequate shoulder mobility before loading heavy'
    ],
    loggingInstructions: [
      'Log barbell weight in kg',
      'Log total sets and reps completed',
      'Note RPE per set',
      'Record any shoulder impingement or discomfort'
    ]
  },

  'barbell-bent-over-row': {
    exerciseType: 'primary_lift',
    purpose: 'The barbell bent-over row develops back thickness, posterior chain stability, and pulling strength. It is a foundational horizontal pull used to balance pressing volume and build a strong, resilient upper back for both performance and posture.',
    phases: [
      {
        name: 'Setup',
        description: 'Establish the hinged position',
        cues: [
          'Feet hip-width apart',
          'Hinge at hips until torso is 45-70° to floor',
          'Slight knee bend for comfort',
          'Grip just outside knees',
          'Let arms hang straight down'
        ]
      },
      {
        name: 'The Brace',
        description: 'Lock in your position',
        cues: [
          'Flat back - no rounding',
          'Brace core hard',
          'Pack shoulders - down and back',
          'Eyes looking 6-8 feet ahead'
        ]
      },
      {
        name: 'The Pull',
        description: 'Row to the body with power',
        cues: [
          'Lead with elbows, not hands',
          'Drive elbows back and up',
          'Pull to lower chest/upper abs',
          'Squeeze shoulder blades together at top',
          'Keep torso angle constant - no standing up'
        ]
      },
      {
        name: 'The Lower',
        description: 'Control the eccentric',
        cues: [
          'Lower under control',
          'Feel the stretch in lats',
          'Arms fully extended at bottom',
          'Maintain back position throughout'
        ]
      }
    ],
    breathing: {
      inhale: 'At the bottom with arms extended',
      exhale: 'As you pull the bar to your body',
      brace: 'Maintain core brace throughout to protect lower back'
    },
    commonMistakes: [
      { mistake: 'Using momentum/standing up', correction: 'Maintain torso angle - the body should be still' },
      { mistake: 'Rounding lower back', correction: 'Keep chest up and core braced throughout' },
      { mistake: 'Shrugging shoulders', correction: 'Keep shoulders packed down - focus on lats and mid-back' },
      { mistake: 'Pulling too high (to chest)', correction: 'Pull to lower sternum/upper abs for better lat engagement' }
    ],
    musclesTargeted: {
      primary: ['Latissimus Dorsi', 'Rhomboids', 'Rear Deltoids'],
      secondary: ['Biceps', 'Erector Spinae', 'Core']
    },
    tempoGuide: '1-1-2-0 (explosive pull, squeeze, controlled lower)',
    coachingNotes: 'The bent-over row builds a thick, powerful back. The key is maintaining position while pulling heavy. If you\'re swinging and standing up, the weight is too heavy.',
    loadGuidelines: {
      technique: 'Light load, focus on torso angle and lat engagement',
      hypertrophy: 'Moderate load, 8-12 reps, squeeze at contraction',
      strength: 'Heavy load, 5-8 reps, controlled but powerful pulls'
    },
    regressions: ['Single Arm Dumbbell Row', 'Chest-Supported Row', 'Inverted Row'],
    progressions: ['Pendlay Row (reset on floor each rep)', 'Tempo Row (3-sec eccentric)', 'Deficit Bent-Over Row'],
    safetyNotes: [
      'Reduce load if lower back fatigues before upper back',
      'Maintain neutral spine throughout - avoid rounding',
      'Those with lower back issues should consider chest-supported alternatives'
    ],
    loggingInstructions: [
      'Log barbell weight in kg',
      'Log total sets and reps completed',
      'Note RPE per set',
      'Record any lower back fatigue or grip issues'
    ]
  },

  'pull-ups': {
    phases: [
      {
        name: 'Setup',
        description: 'Establish your grip and hang',
        cues: [
          'Grip bar slightly wider than shoulder width',
          'Full hang with arms extended',
          'Shoulders engaged - not passive hanging',
          'Core tight, legs together or slightly crossed'
        ]
      },
      {
        name: 'Initiation',
        description: 'Start the pull correctly',
        cues: [
          'Depress shoulders first - pull them down',
          'Engage lats before bending arms',
          'Think "elbows to hips"',
          'Chest up, slight lean back'
        ]
      },
      {
        name: 'The Pull',
        description: 'Drive yourself up to the bar',
        cues: [
          'Pull elbows down and back',
          'Lead with the chest',
          'Chin clears the bar',
          'Squeeze lats hard at the top'
        ]
      },
      {
        name: 'The Lower',
        description: 'Control the descent',
        cues: [
          'Lower under control - 2-3 seconds',
          'Full extension at bottom',
          'Keep shoulders engaged',
          'Reset before next rep'
        ]
      }
    ],
    breathing: {
      inhale: 'At the bottom in the dead hang',
      exhale: 'As you pull yourself up'
    },
    commonMistakes: [
      { mistake: 'Kipping/swinging', correction: 'Keep body still - use strict form to build strength' },
      { mistake: 'Partial reps', correction: 'Full range - dead hang to chin over bar' },
      { mistake: 'Shrugging during pull', correction: 'Keep shoulders down and back - focus on lats' },
      { mistake: 'Not engaging at bottom', correction: 'Active hang - shoulders engaged even at full extension' }
    ],
    musclesTargeted: {
      primary: ['Latissimus Dorsi', 'Biceps', 'Brachialis'],
      secondary: ['Rhomboids', 'Rear Deltoids', 'Core', 'Forearms']
    },
    tempoGuide: 'Explosive up, 2-3 second controlled lower',
    coachingNotes: 'The pull-up is the gold standard for upper body pulling strength. Master strict form before adding weight. Quality reps build quality backs.'
  },

  'romanian-deadlift': {
    phases: [
      {
        name: 'Setup',
        description: 'Start from the top position',
        cues: [
          'Stand tall with bar at hips',
          'Feet hip-width, slight knee bend',
          'Grip just outside thighs',
          'Shoulders back, chest proud'
        ]
      },
      {
        name: 'The Hinge',
        description: 'Initiate the hip hinge pattern',
        cues: [
          'Push hips BACK, not down',
          'Maintain slight knee bend - don\'t increase it',
          'Bar stays close to legs',
          'Feel stretch in hamstrings'
        ]
      },
      {
        name: 'The Stretch',
        description: 'Reach end range with control',
        cues: [
          'Descend until you feel strong hamstring stretch',
          'Stop before back starts rounding',
          'Bar around knee to mid-shin level',
          'Keep shoulders over or in front of bar'
        ]
      },
      {
        name: 'The Drive',
        description: 'Return to standing',
        cues: [
          'Drive hips forward to stand',
          'Squeeze glutes at the top',
          'Think "hips to bar" not "bar to hips"',
          'Full hip extension at top'
        ]
      }
    ],
    breathing: {
      inhale: 'At the top, brace before descending',
      exhale: 'As you drive hips forward to stand'
    },
    commonMistakes: [
      { mistake: 'Squatting the movement', correction: 'Maintain knee angle - this is a hip hinge, not a squat' },
      { mistake: 'Rounding lower back', correction: 'Stop descent before back rounds - work on hamstring flexibility' },
      { mistake: 'Bar drifting forward', correction: 'Keep bar in contact with legs throughout' },
      { mistake: 'Not feeling hamstrings', correction: 'Push hips BACK more, reduce knee bend' }
    ],
    musclesTargeted: {
      primary: ['Hamstrings', 'Glutes'],
      secondary: ['Erector Spinae', 'Lats', 'Forearms']
    },
    tempoGuide: '3-1-1-1 (3 sec lower, pause, drive up, squeeze at top)',
    coachingNotes: 'The RDL is the ultimate hamstring builder. It\'s about the stretch, not the depth. Stop when you feel the hamstrings fully loaded, not when the bar reaches a certain point.'
  },

  'dumbbell-lateral-raise': {
    phases: [
      {
        name: 'Setup',
        description: 'Position for optimal shoulder targeting',
        cues: [
          'Stand tall or slight forward lean',
          'Dumbbells at sides, palms facing in',
          'Slight bend in elbows',
          'Shoulders down, core engaged'
        ]
      },
      {
        name: 'The Raise',
        description: 'Lift with lateral delts',
        cues: [
          'Lead with elbows, not hands',
          'Raise to shoulder height or slightly above',
          'Think "pouring water" - pinkies slightly up',
          'Control the movement - no swinging'
        ]
      },
      {
        name: 'The Peak',
        description: 'Maximize contraction at top',
        cues: [
          'Pause briefly at the top',
          'Squeeze lateral delts',
          'Elbows at or slightly above shoulder height',
          'Keep traps relaxed - no shrugging'
        ]
      },
      {
        name: 'The Lower',
        description: 'Control the eccentric',
        cues: [
          'Lower slowly - 2-3 seconds',
          'Don\'t let dumbbells crash down',
          'Stop just before touching thighs',
          'Maintain tension throughout'
        ]
      }
    ],
    breathing: {
      inhale: 'At the bottom',
      exhale: 'As you raise the dumbbells'
    },
    commonMistakes: [
      { mistake: 'Using momentum/swinging', correction: 'Control the weight - use lighter dumbbells if needed' },
      { mistake: 'Shrugging shoulders', correction: 'Keep shoulders depressed - lead with elbows' },
      { mistake: 'Arms too straight', correction: 'Maintain slight elbow bend throughout' },
      { mistake: 'Raising too high', correction: 'Stop at shoulder level - higher shifts to traps' }
    ],
    musclesTargeted: {
      primary: ['Lateral Deltoids'],
      secondary: ['Anterior Deltoids', 'Traps', 'Supraspinatus']
    },
    tempoGuide: '2-1-3-0 (controlled raise, pause, slow lower)',
    coachingNotes: 'Leave your ego at the door. Light weight, perfect form, high reps. The lateral delts respond to time under tension, not heavy weight with bad form.'
  },

  'barbell-curl': {
    phases: [
      {
        name: 'Setup',
        description: 'Establish proper grip and posture',
        cues: [
          'Stand tall, feet hip-width',
          'Grip shoulder-width or slightly wider',
          'Arms fully extended, elbows at sides',
          'Shoulders back, core braced'
        ]
      },
      {
        name: 'The Curl',
        description: 'Contract the biceps to curl the weight',
        cues: [
          'Keep elbows pinned to sides',
          'Curl weight up in an arc',
          'Focus on squeezing biceps, not lifting weight',
          'Wrists stay neutral - don\'t flex them'
        ]
      },
      {
        name: 'Peak Contraction',
        description: 'Maximize bicep engagement at top',
        cues: [
          'Squeeze biceps hard at the top',
          'Brief pause at peak contraction',
          'Don\'t let elbows drift forward'
        ]
      },
      {
        name: 'The Lower',
        description: 'Control the negative',
        cues: [
          'Lower slowly - 2-3 seconds',
          'Fight the weight down',
          'Full extension at bottom',
          'Don\'t relax at bottom - maintain tension'
        ]
      }
    ],
    breathing: {
      inhale: 'At the bottom or during the lower',
      exhale: 'As you curl the weight up'
    },
    commonMistakes: [
      { mistake: 'Swinging/using momentum', correction: 'Keep torso still - if you\'re swinging, weight is too heavy' },
      { mistake: 'Elbows moving forward', correction: 'Pin elbows to sides throughout the movement' },
      { mistake: 'Partial range of motion', correction: 'Full extension at bottom, full curl at top' },
      { mistake: 'Too fast on the negative', correction: 'Slow, controlled lowering for maximum growth' }
    ],
    musclesTargeted: {
      primary: ['Biceps Brachii', 'Brachialis'],
      secondary: ['Brachioradialis', 'Forearms']
    },
    tempoGuide: '2-1-3-0 (curl up, squeeze, slow lower)',
    coachingNotes: 'Strict curls build bigger biceps than cheat curls. Control every rep, squeeze at the top, and don\'t be afraid to go light. The biceps don\'t know how much weight is on the bar.'
  },

  'tricep-pushdown': {
    phases: [
      {
        name: 'Setup',
        description: 'Position at cable station',
        cues: [
          'Stand facing cable machine',
          'Slight forward lean from hips',
          'Elbows pinned to sides',
          'Grip rope/bar at chest height'
        ]
      },
      {
        name: 'The Pushdown',
        description: 'Extend arms with tricep focus',
        cues: [
          'Keep elbows stationary - only forearms move',
          'Push down until arms fully extended',
          'Spread rope at bottom (if using rope)',
          'Squeeze triceps hard at lockout'
        ]
      },
      {
        name: 'The Return',
        description: 'Control the weight back',
        cues: [
          'Allow weight to pull hands back up',
          'Stop at 90-degree elbow angle',
          'Keep tension on triceps',
          'Don\'t let elbows drift up'
        ]
      }
    ],
    breathing: {
      inhale: 'As weight returns to starting position',
      exhale: 'As you push down'
    },
    commonMistakes: [
      { mistake: 'Elbows flaring or moving', correction: 'Pin elbows to sides - only forearms should move' },
      { mistake: 'Leaning forward excessively', correction: 'Slight lean is OK, but torso should stay mostly upright' },
      { mistake: 'Using shoulders', correction: 'Isolate the triceps - if shoulders engage, reduce weight' },
      { mistake: 'Partial extension', correction: 'Fully lock out elbows at bottom for complete contraction' }
    ],
    musclesTargeted: {
      primary: ['Triceps (all three heads)'],
      secondary: ['Anconeus']
    },
    tempoGuide: '1-1-2-0 (push down, squeeze, controlled return)',
    coachingNotes: 'A staple tricep builder. The key is keeping elbows locked in place. If they move, the exercise becomes a pushdown with shoulder assist, not a tricep isolation.'
  },

  'plank': {
    phases: [
      {
        name: 'Setup',
        description: 'Get into the plank position',
        cues: [
          'Forearms on floor, elbows under shoulders',
          'Toes tucked under, feet hip-width',
          'Form a straight line from head to heels',
          'Look at the floor to keep neck neutral'
        ]
      },
      {
        name: 'The Hold',
        description: 'Maintain position with full body tension',
        cues: [
          'Squeeze glutes hard',
          'Brace core - draw belly button to spine',
          'Push floor away with forearms',
          'Keep hips level - no sagging or piking',
          'Breathe steadily throughout'
        ]
      }
    ],
    breathing: {
      inhale: 'Steady breath in through nose',
      exhale: 'Controlled exhale while maintaining brace'
    },
    commonMistakes: [
      { mistake: 'Hips sagging', correction: 'Squeeze glutes and brace core harder' },
      { mistake: 'Hips too high (piking)', correction: 'Lower hips to form straight line' },
      { mistake: 'Holding breath', correction: 'Breathe steadily while maintaining tension' },
      { mistake: 'Looking up', correction: 'Keep neck neutral, eyes on floor' }
    ],
    musclesTargeted: {
      primary: ['Rectus Abdominis', 'Transverse Abdominis'],
      secondary: ['Obliques', 'Glutes', 'Shoulders', 'Quads']
    },
    tempoGuide: 'Hold for prescribed time with perfect form',
    coachingNotes: 'A perfect 30-second plank beats a sloppy 2-minute hold. Focus on full-body tension and proper alignment. Quality over duration.'
  },

  'leg-press': {
    phases: [
      {
        name: 'Setup',
        description: 'Position in the machine',
        cues: [
          'Sit with back and head firmly against pad',
          'Feet shoulder-width on platform',
          'Toes slightly turned out',
          'Knees in line with toes'
        ]
      },
      {
        name: 'Unrack',
        description: 'Release the safety handles',
        cues: [
          'Press up slightly to disengage safety',
          'Control the weight at full extension',
          'Don\'t lock out knees completely'
        ]
      },
      {
        name: 'Eccentric (Lowering)',
        description: 'Lower the weight under control',
        cues: [
          'Lower slowly - 2-3 seconds',
          'Knees track over toes',
          'Stop when knees at 90 degrees or deeper',
          'Keep lower back pressed into pad',
          'Don\'t let hips roll up'
        ]
      },
      {
        name: 'Concentric (Pressing)',
        description: 'Drive the weight back up',
        cues: [
          'Push through whole foot - heels and balls',
          'Drive up powerfully',
          'Stop just before lockout',
          'Squeeze quads at top'
        ]
      }
    ],
    breathing: {
      inhale: 'During the lowering phase',
      exhale: 'As you press the weight up'
    },
    commonMistakes: [
      { mistake: 'Lowering too fast', correction: 'Control the eccentric - 2-3 seconds down' },
      { mistake: 'Locking knees at top', correction: 'Stop just short of full lockout to keep tension on muscles' },
      { mistake: 'Hips coming off pad', correction: 'Don\'t go so deep that lower back rounds' },
      { mistake: 'Knees caving in', correction: 'Push knees out to track over toes' }
    ],
    musclesTargeted: {
      primary: ['Quadriceps', 'Glutes'],
      secondary: ['Hamstrings', 'Adductors', 'Calves']
    },
    tempoGuide: '2-0-1-0 (controlled lower, explosive press)',
    coachingNotes: 'The leg press allows you to load the legs heavily without the stability demands of squats. Use it to build quad size, but never replace squats entirely.'
  },

  'dumbbell-bench-press': {
    phases: [
      {
        name: 'Setup',
        description: 'Get dumbbells into position',
        cues: [
          'Sit on bench with dumbbells on thighs',
          'Kick dumbbells up as you lie back',
          'Position dumbbells at chest level',
          'Retract and depress shoulder blades',
          'Feet flat on floor, back arched slightly'
        ]
      },
      {
        name: 'Eccentric (Lowering)',
        description: 'Lower dumbbells with control',
        cues: [
          'Lower dumbbells to chest level',
          'Elbows at 45-75 degrees',
          'Feel stretch in chest',
          'Keep wrists stacked over elbows'
        ]
      },
      {
        name: 'Concentric (Pressing)',
        description: 'Press dumbbells up',
        cues: [
          'Press up and slightly in (arc motion)',
          'Squeeze chest at top',
          'Don\'t clang dumbbells together',
          'Full lockout with chest contraction'
        ]
      }
    ],
    breathing: {
      inhale: 'During the lowering phase',
      exhale: 'As you press the dumbbells up'
    },
    commonMistakes: [
      { mistake: 'Dumbbells drifting too wide', correction: 'Keep arc motion controlled - not flyes' },
      { mistake: 'Wrists bent back', correction: 'Keep wrists neutral, stacked over elbows' },
      { mistake: 'Pressing straight up', correction: 'Press in a slight arc for better chest contraction' }
    ],
    musclesTargeted: {
      primary: ['Pectoralis Major', 'Anterior Deltoids', 'Triceps'],
      secondary: ['Serratus Anterior', 'Core Stabilizers']
    },
    tempoGuide: '2-1-1-0 (controlled lower, brief pause, press)',
    coachingNotes: 'Dumbbells allow greater range of motion and unilateral work. Use them to build a balanced, well-developed chest.'
  },

  // =====================
  // CHEST - ADDITIONAL
  // =====================
  'machine-chest-press': {
    exerciseType: 'accessory',
    purpose: 'The machine chest press provides a guided horizontal push for chest development. Ideal for beginners learning pressing mechanics, for post-fatigue sets, or when a spotter is unavailable. Removes stabilisation demands so the chest can be worked to true failure safely.',
    phases: [
      {
        name: 'Setup',
        description: 'Adjust the machine to fit your body',
        cues: [
          'Adjust seat so handles are at mid-chest height',
          'Sit with back firmly against pad',
          'Grip handles with full hand, wrists neutral',
          'Feet flat on floor, shoulder blades retracted'
        ]
      },
      {
        name: 'Concentric (Pressing)',
        description: 'Press handles forward with chest focus',
        cues: [
          'Drive handles forward through the heel of your palm',
          'Focus on squeezing the chest together',
          'Full extension without locking elbows',
          'Maintain back contact with pad throughout'
        ]
      },
      {
        name: 'Eccentric (Lowering)',
        description: 'Control the weight back',
        cues: [
          'Let handles return slowly — 2-3 seconds',
          'Feel a deep stretch across the chest',
          'Stop when hands are level with chest — dont over-stretch',
          'Keep shoulders down and back'
        ]
      }
    ],
    breathing: {
      inhale: 'During the lowering/return phase',
      exhale: 'As you press the handles forward'
    },
    commonMistakes: [
      { mistake: 'Seat too high or low', correction: 'Handles should be at nipple line — adjust seat height' },
      { mistake: 'Shoulders shrugging up', correction: 'Depress shoulder blades before pressing' },
      { mistake: 'Bouncing at the bottom', correction: 'Pause briefly at the stretched position for full control' },
      { mistake: 'Locking elbows hard', correction: 'Stop just short of lockout to keep tension on chest' }
    ],
    musclesTargeted: {
      primary: ['Pectoralis Major', 'Anterior Deltoids', 'Triceps'],
      secondary: ['Serratus Anterior']
    },
    tempoGuide: '2-1-1-0 (lower controlled, brief pause, press, repeat)',
    coachingNotes: 'A machine press is not a lesser exercise — it is a tool. Use it for high-rep burnouts, drop sets, or when training alone. The fixed path lets you push safely to failure.',
    loadGuidelines: {
      technique: 'Light load, slow tempo, learn the path and stretch',
      hypertrophy: 'Moderate load, 10-15 reps, squeeze at contraction',
      strength: 'Heavier load, 6-8 reps, focus on chest drive'
    },
    regressions: ['Push Ups', 'Incline Push Ups'],
    progressions: ['Flat Barbell Bench Press', 'Dumbbell Bench Press'],
    safetyNotes: [
      'Adjust seat to avoid shoulder impingement',
      'Reduce load if you feel shoulder clicking or pinching',
      'Keep wrists neutral to avoid strain'
    ],
    loggingInstructions: [
      'Log machine weight/plate load in kg',
      'Log total sets and reps completed',
      'Note RPE per set'
    ]
  },

  'cable-crossover': {
    exerciseType: 'accessory',
    purpose: 'Cable crossovers provide constant tension through the full range of chest fly motion. They emphasise the inner chest and pec squeeze at peak contraction, making them ideal for hypertrophy and as a finishing movement.',
    phases: [
      {
        name: 'Setup',
        description: 'Position between cable columns',
        cues: [
          'Set pulleys to high position for upper-to-lower arc',
          'Step forward into a split stance for stability',
          'Slight forward lean from hips',
          'Arms extended out to sides, slight elbow bend'
        ]
      },
      {
        name: 'The Squeeze',
        description: 'Bring handles together with chest focus',
        cues: [
          'Lead with pinkies and inner forearms',
          'Bring hands together in front of lower chest',
          'Squeeze chest hard at the meeting point',
          'Maintain the same elbow bend throughout'
        ]
      },
      {
        name: 'The Return',
        description: 'Control back to stretched position',
        cues: [
          'Let arms return slowly under tension',
          'Feel the stretch across the chest',
          'Stop when arms are level with torso — dont over-stretch shoulders',
          'Maintain slight forward lean throughout'
        ]
      }
    ],
    breathing: {
      inhale: 'As arms return to the stretched position',
      exhale: 'As you squeeze handles together'
    },
    commonMistakes: [
      { mistake: 'Bending elbows too much', correction: 'Maintain a fixed slight bend — this is a fly, not a press' },
      { mistake: 'Using too much weight and pressing', correction: 'Reduce load, focus on the squeeze and stretch' },
      { mistake: 'Losing body position', correction: 'Stay anchored in split stance, dont rock forward and back' },
      { mistake: 'Arms dropping too low', correction: 'Hands should meet at chest level, not waist level' }
    ],
    musclesTargeted: {
      primary: ['Pectoralis Major (sternal)', 'Inner Chest'],
      secondary: ['Anterior Deltoids', 'Biceps (stabilising)']
    },
    tempoGuide: '2-2-2-0 (controlled sweep, squeeze 2 sec, controlled return)',
    coachingNotes: 'Cables keep tension on the chest throughout the entire arc. Use moderate weight and really focus on the squeeze at the midline. This is about feel, not load.'
  },

  'pec-deck-machine': {
    exerciseType: 'accessory',
    purpose: 'The pec deck provides a fixed-arc chest fly for isolated chest contraction. It removes stabiliser demands, allowing full focus on the pec squeeze. Ideal for beginners, rehab, and high-rep chest finishers.',
    phases: [
      {
        name: 'Setup',
        description: 'Adjust and position in the machine',
        cues: [
          'Adjust seat so handles are at chest height',
          'Back flat against pad',
          'Forearms against pads or grip handles',
          'Start with arms out at chest level'
        ]
      },
      {
        name: 'The Squeeze',
        description: 'Bring pads together with chest contraction',
        cues: [
          'Drive arms together using chest — not arms',
          'Squeeze hard when pads nearly touch',
          'Hold the contraction for 1-2 seconds',
          'Keep shoulders down and back'
        ]
      },
      {
        name: 'The Return',
        description: 'Controlled eccentric to stretch',
        cues: [
          'Return slowly — 2-3 seconds',
          'Feel the stretch across the chest',
          'Stop when arms are level with torso',
          'Dont let weights crash'
        ]
      }
    ],
    breathing: {
      inhale: 'As arms return to the open position',
      exhale: 'As you squeeze the pads together'
    },
    commonMistakes: [
      { mistake: 'Using momentum to swing', correction: 'Slow controlled motion — if swinging, reduce the weight' },
      { mistake: 'Shrugging shoulders up', correction: 'Depress shoulders before starting — keep them down' },
      { mistake: 'Going too far back', correction: 'Stop when arms are level with torso to protect shoulders' }
    ],
    musclesTargeted: {
      primary: ['Pectoralis Major'],
      secondary: ['Anterior Deltoids']
    },
    tempoGuide: '2-2-2-0 (controlled close, hold squeeze, controlled open)',
    coachingNotes: 'The pec deck is a chest isolation staple. Focus entirely on the squeeze and stretch. Use it after compounds to finish the chest off completely.'
  },

  'chest-dips': {
    exerciseType: 'accessory',
    purpose: 'Chest dips develop lower chest and pressing strength using bodyweight. The forward lean shifts emphasis from triceps to pecs. A powerful compound movement for chest mass and functional push strength.',
    phases: [
      {
        name: 'Setup',
        description: 'Mount the dip station',
        cues: [
          'Grip bars with straight arms, body lifted',
          'Lean forward approximately 30 degrees',
          'Cross legs behind you or keep them straight',
          'Wider grip if available for more chest'
        ]
      },
      {
        name: 'Eccentric (Lowering)',
        description: 'Control the descent for chest stretch',
        cues: [
          'Lower slowly — 2-3 seconds',
          'Allow elbows to flare slightly',
          'Descend until deep stretch in chest',
          'Maintain forward lean throughout'
        ]
      },
      {
        name: 'Concentric (Pressing)',
        description: 'Drive back up with chest engagement',
        cues: [
          'Press through palms to push up',
          'Maintain forward lean — dont go upright',
          'Squeeze chest at the top',
          'Full lockout without losing lean'
        ]
      }
    ],
    breathing: {
      inhale: 'During the descent',
      exhale: 'As you press back up'
    },
    commonMistakes: [
      { mistake: 'Too upright — tricep dominant', correction: 'Lean forward 30° to shift to chest' },
      { mistake: 'Going too deep — shoulder pain', correction: 'Stop at comfortable depth, build range gradually' },
      { mistake: 'Swinging or kipping', correction: 'Controlled movement — if you cant control it, use assisted machine' }
    ],
    musclesTargeted: {
      primary: ['Lower Pectoralis Major', 'Anterior Deltoids', 'Triceps'],
      secondary: ['Serratus Anterior', 'Core']
    },
    tempoGuide: '2-1-1-0 (controlled lower, pause, press, repeat)',
    coachingNotes: 'The dip is one of the most underrated chest builders. Master bodyweight form before adding weight. The forward lean is what makes it a chest exercise.',
    regressions: ['Machine Assisted Dip', 'Bench Dips', 'Push Ups'],
    progressions: ['Weighted Dips (belt + plates)', 'Ring Dips'],
    safetyNotes: [
      'Avoid if you have shoulder impingement or instability',
      'Dont force depth — build range over time',
      'Use assisted machine if unable to control bodyweight'
    ]
  },

  'standard-push-ups': {
    exerciseType: 'assistance',
    purpose: 'The push-up develops horizontal pressing strength, core stability, and shoulder health using bodyweight. It is the most fundamental upper-body pressing pattern and an essential movement skill for all fitness levels.',
    phases: [
      {
        name: 'Setup',
        description: 'Establish the plank-press position',
        cues: [
          'Hands slightly wider than shoulder width',
          'Fingers spread, middle fingers pointing forward',
          'Body in a rigid straight line — head to heels',
          'Core braced, glutes squeezed'
        ]
      },
      {
        name: 'Eccentric (Lowering)',
        description: 'Lower with full-body control',
        cues: [
          'Bend elbows to 45 degrees from torso',
          'Lower chest to floor — full range',
          'Keep body rigid — dont sag or pike',
          'Shoulders move down with the body, not ahead of it'
        ]
      },
      {
        name: 'Concentric (Pressing)',
        description: 'Drive back up to plank',
        cues: [
          'Push the floor away from you',
          'Extend arms fully at the top',
          'Maintain rigid body line throughout',
          'Protract shoulder blades slightly at top'
        ]
      }
    ],
    breathing: {
      inhale: 'During the lowering phase',
      exhale: 'As you push back up'
    },
    commonMistakes: [
      { mistake: 'Hips sagging', correction: 'Squeeze glutes and brace core harder — body stays rigid' },
      { mistake: 'Elbows flaring to 90°', correction: 'Keep elbows at 45° to protect shoulders' },
      { mistake: 'Partial reps — not touching chest to floor', correction: 'Full range of motion or regress to incline/knee push-ups' },
      { mistake: 'Head dropping or poking forward', correction: 'Keep neck neutral — eyes look slightly ahead of hands' }
    ],
    musclesTargeted: {
      primary: ['Pectoralis Major', 'Anterior Deltoids', 'Triceps'],
      secondary: ['Core', 'Serratus Anterior']
    },
    tempoGuide: '2-0-1-0 (controlled lower, press up, repeat)',
    coachingNotes: 'The push-up is the exercise everyone does and almost nobody does well. A perfect push-up with full range beats 50 sloppy half-reps. Master it.',
    regressions: ['Incline Push Ups (hands on bench)', 'Knee Push Ups'],
    progressions: ['Decline Push Ups', 'Diamond Push Ups', 'Plyometric Push Ups']
  },

  // =====================
  // BACK - ADDITIONAL
  // =====================
  'lat-pulldown': {
    exerciseType: 'accessory',
    purpose: 'The lat pulldown develops vertical pulling strength and lat width. It is the primary machine-based alternative to pull-ups, making it accessible to all fitness levels while still providing excellent lat development.',
    phases: [
      {
        name: 'Setup',
        description: 'Position on the machine',
        cues: [
          'Adjust thigh pad to lock legs in place',
          'Grip bar slightly wider than shoulder width',
          'Sit tall, slight lean back (10-15°)',
          'Chest up, shoulders down and back'
        ]
      },
      {
        name: 'The Pull',
        description: 'Drive bar to upper chest',
        cues: [
          'Initiate by depressing shoulder blades',
          'Drive elbows down and back',
          'Pull bar to upper chest / collarbone area',
          'Squeeze lats hard at the bottom',
          'Keep chest lifted toward the bar'
        ]
      },
      {
        name: 'The Return',
        description: 'Control bar back to start',
        cues: [
          'Extend arms fully under control — 2-3 seconds',
          'Feel the stretch in lats at top',
          'Keep shoulders engaged — dont go passive',
          'Reset before next rep'
        ]
      }
    ],
    breathing: {
      inhale: 'At the top with arms extended',
      exhale: 'As you pull the bar down'
    },
    commonMistakes: [
      { mistake: 'Pulling behind the neck', correction: 'Always pull to the front — behind neck stresses shoulders' },
      { mistake: 'Leaning too far back', correction: 'Slight lean only (10-15°) — this isnt a row' },
      { mistake: 'Using momentum/swinging', correction: 'Control every rep — reduce weight if swinging' },
      { mistake: 'Gripping too hard with hands', correction: 'Think of hands as hooks — drive with elbows, not biceps' }
    ],
    musclesTargeted: {
      primary: ['Latissimus Dorsi', 'Teres Major'],
      secondary: ['Biceps', 'Rhomboids', 'Rear Deltoids', 'Forearms']
    },
    tempoGuide: '1-1-3-0 (pull down, squeeze, slow return)',
    coachingNotes: 'The lat pulldown is the gateway to pull-ups. Master the lat engagement pattern here — elbows down and back, not just arms bending.',
    regressions: ['Assisted Pull-Up Machine', 'Band-Assisted Pull-Ups'],
    progressions: ['Pull-Ups', 'Weighted Pull-Ups'],
    safetyNotes: [
      'Never pull behind the neck',
      'If shoulder clicks during the pull, adjust grip width',
      'Use straps if grip fails before lats fatigue'
    ]
  },

  'seated-cable-row': {
    exerciseType: 'accessory',
    purpose: 'The seated cable row develops back thickness, rhomboid engagement, and postural strength. Constant cable tension makes it excellent for mind-muscle connection and hypertrophy of the mid-back.',
    phases: [
      {
        name: 'Setup',
        description: 'Position on the row station',
        cues: [
          'Sit with feet on platforms, slight knee bend',
          'Grip handle — close grip V-bar or wide bar',
          'Sit tall, chest up, slight forward lean to stretch',
          'Shoulders protracted at start for full range'
        ]
      },
      {
        name: 'The Pull',
        description: 'Row handle to body',
        cues: [
          'Initiate by retracting shoulder blades',
          'Drive elbows back past torso',
          'Pull to lower sternum/upper abs',
          'Squeeze shoulder blades together at peak',
          'Chest stays lifted throughout'
        ]
      },
      {
        name: 'The Return',
        description: 'Controlled eccentric to stretched position',
        cues: [
          'Let arms extend forward slowly',
          'Allow slight shoulder protraction for stretch',
          'Dont round the lower back',
          'Maintain upright torso angle'
        ]
      }
    ],
    breathing: {
      inhale: 'At the stretched position with arms extended',
      exhale: 'As you pull the handle toward you'
    },
    commonMistakes: [
      { mistake: 'Excessive body swing', correction: 'Keep torso angle stable — dont rock back and forth' },
      { mistake: 'Pulling with biceps', correction: 'Lead with elbows, think about pulling shoulder blades together' },
      { mistake: 'Rounding lower back', correction: 'Maintain neutral spine — brace core throughout' },
      { mistake: 'Shrugging shoulders', correction: 'Keep shoulders depressed — down and back' }
    ],
    musclesTargeted: {
      primary: ['Latissimus Dorsi', 'Rhomboids', 'Middle Trapezius'],
      secondary: ['Biceps', 'Erector Spinae', 'Rear Deltoids']
    },
    tempoGuide: '1-2-2-0 (pull, squeeze 2 sec, controlled return)',
    coachingNotes: 'The seated row is your back thickness builder. The 2-second squeeze at peak contraction is where the magic happens. If you cant hold the squeeze, the weight is too heavy.'
  },

  'face-pulls': {
    exerciseType: 'accessory',
    purpose: 'Face pulls develop rear deltoid, rotator cuff, and scapular health. They are arguably the most important accessory for shoulder longevity and posture, counteracting the effects of pressing and modern desk posture.',
    phases: [
      {
        name: 'Setup',
        description: 'Set up the cable',
        cues: [
          'Cable at upper chest to face height',
          'Rope attachment — grip at the knots',
          'Step back to create tension',
          'Tall posture, core braced'
        ]
      },
      {
        name: 'The Pull',
        description: 'Pull rope toward face with external rotation',
        cues: [
          'Pull toward your forehead/ears',
          'Split the rope wide — hands end beside ears',
          'Externally rotate as you pull — thumbs pointing back',
          'Squeeze rear delts and between shoulder blades',
          'Hold the end position for 1-2 seconds'
        ]
      },
      {
        name: 'The Return',
        description: 'Controlled return to start',
        cues: [
          'Let arms extend slowly under control',
          'Maintain upright posture',
          'Dont let the weight pull you forward',
          'Reset before next rep'
        ]
      }
    ],
    breathing: {
      inhale: 'At the starting position with arms extended',
      exhale: 'As you pull toward your face'
    },
    commonMistakes: [
      { mistake: 'Pulling to chest instead of face', correction: 'Pull high — hands should end at ear level' },
      { mistake: 'No external rotation', correction: 'Rotate thumbs back as you pull — this is the key movement' },
      { mistake: 'Using too much weight and leaning back', correction: 'Light weight, perfect form — this is rehab-grade work' },
      { mistake: 'Rushing reps', correction: 'Hold the contraction for 1-2 seconds every rep' }
    ],
    musclesTargeted: {
      primary: ['Rear Deltoids', 'Infraspinatus', 'Teres Minor'],
      secondary: ['Rhomboids', 'Middle Trapezius', 'External Rotators']
    },
    tempoGuide: '2-2-2-0 (pull, hold squeeze 2 sec, controlled return)',
    coachingNotes: 'If you only do one shoulder health exercise, make it face pulls. Do them every upper body session. Light weight, high reps, perfect squeeze. Your shoulders will thank you.',
    regressions: ['Band Pull-Aparts', 'Prone Y-Raises'],
    progressions: ['Weighted Face Pulls', 'Slow Eccentric Face Pulls (5-sec return)']
  },

  // =====================
  // SHOULDERS - ADDITIONAL
  // =====================
  'dumbbell-shoulder-press': {
    exerciseType: 'accessory',
    purpose: 'The dumbbell shoulder press develops overhead pressing strength with unilateral loading and greater range of motion than barbell. It builds shoulder mass, stability, and addresses imbalances between sides.',
    phases: [
      {
        name: 'Setup',
        description: 'Get dumbbells into pressing position',
        cues: [
          'Seated or standing — seated removes leg drive',
          'Dumbbells at shoulder height, palms forward or neutral',
          'Elbows under wrists, forearms vertical',
          'Core braced, slight natural arch if standing'
        ]
      },
      {
        name: 'The Press',
        description: 'Drive dumbbells overhead',
        cues: [
          'Press straight up and slightly inward',
          'Dumbbells nearly touch at the top',
          'Full lockout with active shoulders',
          'Dont let wrists bend backward'
        ]
      },
      {
        name: 'The Lower',
        description: 'Control back to starting position',
        cues: [
          'Lower slowly — 2-3 seconds',
          'Bring dumbbells to shoulder height',
          'Elbows track slightly in front of torso',
          'Maintain upright posture — dont lean back'
        ]
      }
    ],
    breathing: {
      inhale: 'At the bottom/shoulder position',
      exhale: 'As you press overhead'
    },
    commonMistakes: [
      { mistake: 'Excessive back arch', correction: 'Brace core, squeeze glutes, keep torso vertical' },
      { mistake: 'Elbows flaring too wide', correction: 'Keep elbows slightly in front of torso — not directly to sides' },
      { mistake: 'Pressing forward instead of up', correction: 'Bar path should be straight vertical, not an arc forward' },
      { mistake: 'Not reaching full lockout', correction: 'Fully extend arms and shrug shoulders up slightly at top' }
    ],
    musclesTargeted: {
      primary: ['Anterior Deltoids', 'Lateral Deltoids', 'Triceps'],
      secondary: ['Upper Chest', 'Traps', 'Serratus Anterior']
    },
    tempoGuide: '2-0-1-1 (lower controlled, press up, brief hold at top)',
    coachingNotes: 'Dumbbells force each arm to work independently. If one side is weaker, match reps to the weaker side and let it catch up. Unilateral strength is real-world strength.'
  },

  'cable-lateral-raise': {
    exerciseType: 'accessory',
    purpose: 'Cable lateral raises provide constant tension on the lateral deltoid throughout the full range of motion — unlike dumbbells which lose tension at the bottom. This makes cables superior for lateral delt hypertrophy.',
    phases: [
      {
        name: 'Setup',
        description: 'Position at the cable',
        cues: [
          'Low pulley, single handle',
          'Stand side-on, cable behind you or in front',
          'Handle in far hand, slight lean away from cable',
          'Slight elbow bend, core braced'
        ]
      },
      {
        name: 'The Raise',
        description: 'Lift with lateral delt focus',
        cues: [
          'Lead with the elbow, not the hand',
          'Raise to shoulder height — no higher',
          'Think of pouring water from a jug',
          'Keep shoulder down — dont shrug'
        ]
      },
      {
        name: 'The Lower',
        description: 'Control the eccentric',
        cues: [
          'Lower slowly — fight the cable tension',
          'Dont let arm crash back to start',
          'Maintain slight lean for full tension',
          'Stop before tension is completely lost'
        ]
      }
    ],
    breathing: {
      inhale: 'At the bottom position',
      exhale: 'As you raise the handle'
    },
    commonMistakes: [
      { mistake: 'Raising too high — traps take over', correction: 'Stop at shoulder height, focus on lateral delt' },
      { mistake: 'Using momentum', correction: 'Slow controlled reps — if swinging, reduce weight' },
      { mistake: 'Standing too close to cable', correction: 'Step away so there is tension even at the bottom' }
    ],
    musclesTargeted: {
      primary: ['Lateral Deltoids'],
      secondary: ['Anterior Deltoids', 'Supraspinatus', 'Upper Traps']
    },
    tempoGuide: '2-1-3-0 (raise, pause, slow 3-sec lower)',
    coachingNotes: 'Cables are the superior tool for lateral delts. The constant tension means every inch of the range is loaded. Go lighter than you think and feel every rep.'
  },

  'reverse-pec-deck': {
    exerciseType: 'accessory',
    purpose: 'The reverse pec deck isolates the rear deltoids and upper back with a guided arc. It is the most accessible rear delt exercise and essential for balanced shoulder development and posture.',
    phases: [
      {
        name: 'Setup',
        description: 'Position facing the machine',
        cues: [
          'Face the pad — chest against it',
          'Grip handles with arms extended forward',
          'Handles at shoulder height',
          'Slight bend in elbows, feet flat'
        ]
      },
      {
        name: 'The Fly',
        description: 'Drive arms back in an arc',
        cues: [
          'Lead with elbows, not hands',
          'Squeeze shoulder blades together',
          'Drive arms as far back as range allows',
          'Hold the contraction for 1-2 seconds'
        ]
      },
      {
        name: 'The Return',
        description: 'Controlled return to start',
        cues: [
          'Let arms come forward slowly — 2-3 seconds',
          'Maintain the elbow bend',
          'Dont let weights crash',
          'Keep chest against pad throughout'
        ]
      }
    ],
    breathing: {
      inhale: 'Arms forward at start',
      exhale: 'As you drive arms back'
    },
    commonMistakes: [
      { mistake: 'Arms too straight', correction: 'Maintain slight elbow bend — straight arms stress joints' },
      { mistake: 'Using momentum', correction: 'Slow controlled reps, hold the squeeze' },
      { mistake: 'Sitting too far from pad', correction: 'Chest firmly against pad for proper leverage' }
    ],
    musclesTargeted: {
      primary: ['Rear Deltoids', 'Rhomboids'],
      secondary: ['Middle Trapezius', 'Infraspinatus']
    },
    tempoGuide: '2-2-2-0 (drive back, hold 2 sec, controlled return)',
    coachingNotes: 'Most people are weak in the rear delts. This machine makes it easy to target them with perfect form. Use it frequently and with moderate reps.'
  },

  // =====================
  // LEGS - ADDITIONAL
  // =====================
  'barbell-front-squat': {
    exerciseType: 'primary_lift',
    purpose: 'The front squat develops quad-dominant strength with a more upright torso than the back squat. It builds trunk stability, teaches proper bracing, and has tremendous carryover to Olympic lifts and athletic performance.',
    phases: [
      {
        name: 'Setup',
        description: 'Establish front rack position',
        cues: [
          'Bar sits on front deltoids — NOT in the hands',
          'Elbows high — upper arms parallel to floor',
          'Two to three fingers under bar, or cross-arm grip',
          'Feet shoulder-width, toes out 15-30°'
        ]
      },
      {
        name: 'The Brace',
        description: 'Create stability for an upright descent',
        cues: [
          'Huge breath into belly',
          'Brace 360° — ribs down, core locked',
          'Elbows UP — this is your cue all movement long',
          'Screw feet into floor'
        ]
      },
      {
        name: 'Eccentric (Descent)',
        description: 'Controlled squat to depth',
        cues: [
          'Break at knees and hips together',
          'Knees track over toes — push them out',
          'Maintain upright torso — ELBOWS UP',
          'Descend to full depth — below parallel',
          'Weight stays in mid-foot'
        ]
      },
      {
        name: 'Concentric (Ascent)',
        description: 'Drive out of the hole',
        cues: [
          'Drive through whole foot',
          'Lead with elbows — elbows up out of the hole',
          'Keep chest high, dont dump forward',
          'Exhale through sticking point',
          'Full lockout with glute squeeze'
        ]
      }
    ],
    breathing: {
      inhale: 'Deep breath and brace at the top',
      exhale: 'Forceful exhale through the sticking point',
      brace: 'Full belly brace every rep — reset at top'
    },
    commonMistakes: [
      { mistake: 'Elbows dropping — bar rolling forward', correction: 'ELBOWS UP is the #1 cue — keep upper arms parallel to floor' },
      { mistake: 'Forward lean like a back squat', correction: 'Front squat demands upright torso — if you lean, reduce weight' },
      { mistake: 'Wrist pain in rack position', correction: 'Use cross-arm grip or work on wrist/lat mobility' },
      { mistake: 'Cutting depth short', correction: 'Front squat rewards depth — go below parallel' }
    ],
    musclesTargeted: {
      primary: ['Quadriceps', 'Glutes'],
      secondary: ['Core', 'Upper Back', 'Erector Spinae']
    },
    tempoGuide: '3-0-1-0 (controlled descent, explosive drive up)',
    coachingNotes: 'The front squat is the most honest squat — you cannot cheat depth or torso angle. If your elbows drop, the bar falls. It will expose and fix every weakness in your squat.',
    loadGuidelines: {
      technique: 'Light load, focus on rack position and elbow height',
      hypertrophy: 'Moderate load, 8-10 reps, full depth',
      strength: 'Heavy load, 3-5 reps, belt optional'
    },
    regressions: ['Goblet Squat', 'Leg Press'],
    progressions: ['Paused Front Squat (3-sec hold)', 'Tempo Front Squat (4-0-1)'],
    safetyNotes: [
      'Use safety bars in squat rack',
      'If elbows drop during a rep, rerack and reset',
      'Wrist pain means mobility issue — work lat and wrist flexibility'
    ]
  },

  'hack-squat-machine': {
    exerciseType: 'accessory',
    purpose: 'The hack squat machine provides heavy quad loading with back support. It removes spinal load while still allowing deep, heavy squatting. Ideal for quad hypertrophy, training around lower back fatigue, or as a squat accessory.',
    phases: [
      {
        name: 'Setup',
        description: 'Position on the machine',
        cues: [
          'Back and shoulders flat against pad',
          'Feet shoulder-width on platform, mid to low position',
          'Toes slightly turned out',
          'Shoulder pads secure on top of shoulders'
        ]
      },
      {
        name: 'Eccentric (Lowering)',
        description: 'Controlled descent',
        cues: [
          'Release safety handles',
          'Lower slowly — 2-3 seconds',
          'Knees track over toes',
          'Descend to at least 90° — deeper for more quad stretch',
          'Keep back pressed firmly against pad'
        ]
      },
      {
        name: 'Concentric (Pressing)',
        description: 'Drive up through the legs',
        cues: [
          'Drive through whole foot',
          'Push the platform away from you',
          'Squeeze quads at the top',
          'Dont fully lock knees'
        ]
      }
    ],
    breathing: {
      inhale: 'During the lowering phase',
      exhale: 'As you drive the weight up'
    },
    commonMistakes: [
      { mistake: 'Feet too high — becomes leg press', correction: 'Keep feet mid to low on platform for quad emphasis' },
      { mistake: 'Heels lifting', correction: 'Drive through whole foot — if heels lift, elevate them on plates' },
      { mistake: 'Knees caving', correction: 'Actively push knees out over toes' },
      { mistake: 'Back coming off pad', correction: 'Stay pinned to pad — if back lifts, reduce depth or weight' }
    ],
    musclesTargeted: {
      primary: ['Quadriceps'],
      secondary: ['Glutes', 'Hamstrings', 'Adductors']
    },
    tempoGuide: '3-0-1-0 (slow lower, explosive drive up)',
    coachingNotes: 'The hack squat is a quad-building weapon. Low foot placement hammers the quads, high foot placement shifts to glutes. Use it to build size after your main squat work.'
  },

  'leg-extension-machine': {
    exerciseType: 'accessory',
    purpose: 'The leg extension isolates the quadriceps through full knee extension. It is the primary quad isolation exercise, used for hypertrophy, pre-exhaustion, rehab, and as a finisher after compound leg work.',
    phases: [
      {
        name: 'Setup',
        description: 'Adjust the machine',
        cues: [
          'Adjust backrest so back of knees sits at seat edge',
          'Ankle pad sits on lower shin just above ankle',
          'Hold side handles for stability',
          'Sit upright, core engaged'
        ]
      },
      {
        name: 'The Extension',
        description: 'Extend knees to full contraction',
        cues: [
          'Extend legs fully — dont stop short',
          'Squeeze quads hard at full extension',
          'Hold the contraction for 1-2 seconds',
          'Drive through the top of the foot, not the toes'
        ]
      },
      {
        name: 'The Lower',
        description: 'Controlled eccentric back to start',
        cues: [
          'Lower slowly — 3 seconds minimum',
          'Resist gravity throughout the range',
          'Stop at 90° knee bend — dont go past',
          'Maintain upright posture'
        ]
      }
    ],
    breathing: {
      inhale: 'During the lowering phase',
      exhale: 'As you extend the legs'
    },
    commonMistakes: [
      { mistake: 'Using momentum to swing', correction: 'Slow controlled reps — if swinging, reduce the weight' },
      { mistake: 'Not reaching full extension', correction: 'Extend fully and squeeze — thats where quads contract hardest' },
      { mistake: 'Lifting hips off seat', correction: 'Stay seated — hold the handles to anchor yourself' },
      { mistake: 'Going too heavy with partial reps', correction: 'Full range with moderate weight beats heavy partials' }
    ],
    musclesTargeted: {
      primary: ['Quadriceps (all four heads)'],
      secondary: ['Tibialis Anterior']
    },
    tempoGuide: '1-2-3-0 (extend, hold 2 sec, slow 3-sec lower)',
    coachingNotes: 'The leg extension is a pure quad isolation tool. The slow eccentric is where the growth stimulus happens. Dont ego lift — use controlled reps and really squeeze at the top.'
  },

  'seated-leg-curl-machine': {
    exerciseType: 'accessory',
    purpose: 'The seated leg curl isolates the hamstrings through knee flexion. Seated position provides consistent tension and is generally more comfortable than lying variations. Essential for hamstring balance against quad-dominant training.',
    phases: [
      {
        name: 'Setup',
        description: 'Adjust the machine',
        cues: [
          'Back against pad, hips at seat crease',
          'Thigh pad snug against lower quads',
          'Ankle pad behind lower calves',
          'Hold handles at sides'
        ]
      },
      {
        name: 'The Curl',
        description: 'Flex knees to contract hamstrings',
        cues: [
          'Curl heels toward glutes',
          'Squeeze hamstrings hard at the end range',
          'Dont let hips lift off the seat',
          'Drive through heels, not toes'
        ]
      },
      {
        name: 'The Return',
        description: 'Controlled extension back to start',
        cues: [
          'Extend legs slowly — 3 seconds',
          'Resist the weight throughout',
          'Stop just short of full extension to keep tension',
          'Maintain upright posture'
        ]
      }
    ],
    breathing: {
      inhale: 'During the extension/return phase',
      exhale: 'As you curl the weight'
    },
    commonMistakes: [
      { mistake: 'Using momentum', correction: 'Slow controlled reps — squeeze at peak contraction' },
      { mistake: 'Hips lifting off seat', correction: 'Stay seated and hold the handles' },
      { mistake: 'Partial range of motion', correction: 'Full curl to end range then slow extension' },
      { mistake: 'Pointing toes', correction: 'Keep feet dorsiflexed (toes up) for better hamstring engagement' }
    ],
    musclesTargeted: {
      primary: ['Hamstrings (biceps femoris, semimembranosus, semitendinosus)'],
      secondary: ['Gastrocnemius', 'Popliteus']
    },
    tempoGuide: '1-2-3-0 (curl, hold 2 sec, slow 3-sec return)',
    coachingNotes: 'Hamstring curls are non-negotiable for knee health and hamstring development. The squeeze at peak contraction and the slow eccentric are where the magic happens.'
  },

  'standing-calf-raise-machine': {
    exerciseType: 'accessory',
    purpose: 'Standing calf raises target the gastrocnemius through full plantarflexion under load. The straight-leg position maximally loads the gastrocnemius. Essential for calf development and ankle health.',
    phases: [
      {
        name: 'Setup',
        description: 'Position under the machine',
        cues: [
          'Balls of feet on platform edge, heels hanging off',
          'Shoulder pads comfortable on shoulders',
          'Stand tall, knees straight but not locked',
          'Core engaged, neutral spine'
        ]
      },
      {
        name: 'The Stretch',
        description: 'Lower heels for full calf stretch',
        cues: [
          'Drop heels as low as possible',
          'Feel deep stretch through calves',
          'Hold stretch for 1-2 seconds',
          'Keep movement at the ankle only'
        ]
      },
      {
        name: 'The Raise',
        description: 'Drive up onto toes',
        cues: [
          'Push through balls of feet',
          'Rise as high as possible',
          'Squeeze calves hard at the top',
          'Hold for 1-2 seconds at peak'
        ]
      }
    ],
    breathing: {
      inhale: 'At the bottom stretch',
      exhale: 'As you rise up'
    },
    commonMistakes: [
      { mistake: 'Bouncing at the bottom', correction: 'Pause at the stretch — controlled reps, no bouncing' },
      { mistake: 'Partial range of motion', correction: 'Full stretch at bottom, full rise at top — range is everything for calves' },
      { mistake: 'Bending knees', correction: 'Keep legs straight — bent knees shift to soleus' },
      { mistake: 'Going too fast', correction: 'Slow, controlled reps with holds at top and bottom' }
    ],
    musclesTargeted: {
      primary: ['Gastrocnemius'],
      secondary: ['Soleus', 'Tibialis Posterior']
    },
    tempoGuide: '1-2-1-2 (raise 1 sec, hold 2, lower 1 sec, hold stretch 2)',
    coachingNotes: 'Calves respond to high reps, full range, and time under tension. Every rep needs a full stretch at the bottom and a hard squeeze at the top. No bouncing, no half reps.'
  },

  'cable-pull-through': {
    exerciseType: 'accessory',
    purpose: 'The cable pull-through teaches and loads the hip hinge pattern with constant cable tension. It is an excellent hamstring and glute builder that also serves as a technique primer for deadlifts and RDLs.',
    phases: [
      {
        name: 'Setup',
        description: 'Position facing away from cable',
        cues: [
          'Low cable with rope attachment',
          'Stand facing away, step forward to create tension',
          'Feet shoulder-width or slightly wider',
          'Reach through legs to grip rope'
        ]
      },
      {
        name: 'The Hinge',
        description: 'Hip hinge to stretched position',
        cues: [
          'Push hips back — not down',
          'Slight knee bend, shins vertical',
          'Let cable pull hands back between legs',
          'Feel stretch in hamstrings and glutes',
          'Back stays flat — chest up'
        ]
      },
      {
        name: 'The Drive',
        description: 'Drive hips forward to standing',
        cues: [
          'Squeeze glutes to drive hips forward',
          'Stand tall at top — full hip extension',
          'Arms are just hooks — dont pull with arms',
          'Hold the squeeze for 1 second'
        ]
      }
    ],
    breathing: {
      inhale: 'During the hip hinge backward',
      exhale: 'As you drive hips forward'
    },
    commonMistakes: [
      { mistake: 'Squatting instead of hinging', correction: 'Push hips BACK, keep shins vertical — this is a hinge' },
      { mistake: 'Pulling with arms', correction: 'Arms are passive — all the work comes from hips and glutes' },
      { mistake: 'Rounding lower back', correction: 'Keep chest up, back flat throughout' },
      { mistake: 'Not squeezing at top', correction: 'Full hip extension with a hard glute squeeze at the top' }
    ],
    musclesTargeted: {
      primary: ['Glutes', 'Hamstrings'],
      secondary: ['Erector Spinae', 'Core']
    },
    tempoGuide: '2-0-1-1 (hinge back 2 sec, drive forward, squeeze 1 sec)',
    coachingNotes: 'The pull-through is the best hip hinge teacher in the gym. If someone struggles with deadlift or RDL form, start here. The cable provides constant feedback on hip position.'
  },

  // =====================
  // ARMS - ADDITIONAL
  // =====================
  'cable-bicep-curl': {
    exerciseType: 'accessory',
    purpose: 'Cable bicep curls provide constant tension throughout the full range of motion. Unlike dumbbells which lose tension at the top and bottom, cables keep the bicep under load for the entire rep.',
    phases: [
      {
        name: 'Setup',
        description: 'Position at the cable',
        cues: [
          'Low pulley, straight bar or EZ attachment',
          'Stand tall, elbows pinned at sides',
          'Grip shoulder-width, palms up',
          'Slight lean back for counterbalance'
        ]
      },
      {
        name: 'The Curl',
        description: 'Flex the biceps against cable tension',
        cues: [
          'Curl bar up in arc toward shoulders',
          'Keep elbows pinned — only forearms move',
          'Squeeze biceps hard at the top',
          'Dont swing or use momentum'
        ]
      },
      {
        name: 'The Lower',
        description: 'Control the eccentric',
        cues: [
          'Lower slowly — fight the cable tension',
          'Full extension at bottom',
          'Keep tension on biceps throughout',
          'Dont let arms snap straight'
        ]
      }
    ],
    breathing: {
      inhale: 'During the lowering phase',
      exhale: 'As you curl up'
    },
    commonMistakes: [
      { mistake: 'Elbows drifting forward', correction: 'Pin elbows to sides throughout' },
      { mistake: 'Using body swing', correction: 'Stay still — if swinging, reduce weight' },
      { mistake: 'Letting weight drop on eccentric', correction: 'Control every inch of the lowering phase' }
    ],
    musclesTargeted: {
      primary: ['Biceps Brachii', 'Brachialis'],
      secondary: ['Brachioradialis', 'Forearms']
    },
    tempoGuide: '2-1-3-0 (curl 2 sec, squeeze, slow 3-sec lower)',
    coachingNotes: 'Cable curls are superior to dumbbell curls for constant tension. The slow eccentric on cables is where real bicep growth happens.'
  },

  'cable-tricep-pushdown': {
    exerciseType: 'accessory',
    purpose: 'The cable tricep pushdown isolates all three tricep heads with constant cable tension. It is the most popular tricep isolation exercise and is effective for building arm size and pressing lockout strength.',
    phases: [
      {
        name: 'Setup',
        description: 'Position at the high cable',
        cues: [
          'High cable, straight bar or V-bar attachment',
          'Stand with slight forward lean',
          'Elbows pinned to sides at 90°',
          'Core braced, feet hip-width'
        ]
      },
      {
        name: 'The Pushdown',
        description: 'Extend arms to full lockout',
        cues: [
          'Push bar straight down — only forearms move',
          'Full lockout at the bottom',
          'Squeeze triceps hard at extension',
          'Keep elbows absolutely still'
        ]
      },
      {
        name: 'The Return',
        description: 'Controlled flex back to 90°',
        cues: [
          'Allow bar to rise slowly — 2-3 seconds',
          'Stop at approximately 90° elbow angle',
          'Keep tension on triceps throughout',
          'Dont let elbows drift up or forward'
        ]
      }
    ],
    breathing: {
      inhale: 'During the return phase',
      exhale: 'As you push down'
    },
    commonMistakes: [
      { mistake: 'Elbows moving/flaring', correction: 'Glue elbows to your sides — only forearms should move' },
      { mistake: 'Leaning too far forward', correction: 'Slight lean is fine — dont turn it into a chest exercise' },
      { mistake: 'Partial lockout', correction: 'Fully extend elbows — thats where peak tricep contraction occurs' },
      { mistake: 'Too heavy — using body weight', correction: 'Reduce weight, isolate the triceps with strict form' }
    ],
    musclesTargeted: {
      primary: ['Triceps (lateral, medial, long head)'],
      secondary: ['Anconeus']
    },
    tempoGuide: '1-1-2-0 (push down, squeeze, controlled return)',
    coachingNotes: 'The pushdown is a tricep staple. The key differentiator between good and great pushdowns is elbow position. If your elbows move, the exercise becomes worthless. Pin them and isolate.'
  },

  'cable-overhead-tricep-extension': {
    exerciseType: 'accessory',
    purpose: 'The cable overhead extension targets the long head of the triceps with a full stretch under tension. The long head is the largest tricep head and responds best to overhead/stretched position exercises.',
    phases: [
      {
        name: 'Setup',
        description: 'Position facing away from low cable',
        cues: [
          'Low cable with rope attachment',
          'Face away, step into split stance',
          'Rope behind head, elbows by ears',
          'Lean forward slightly for balance'
        ]
      },
      {
        name: 'The Extension',
        description: 'Extend arms overhead',
        cues: [
          'Press rope forward and up to full arm extension',
          'Keep elbows close to ears — dont flare',
          'Squeeze triceps hard at lockout',
          'Only forearms should move'
        ]
      },
      {
        name: 'The Stretch',
        description: 'Return to stretched position',
        cues: [
          'Allow rope to pull hands back behind head',
          'Feel deep stretch in tricep long head',
          'Control the movement — dont rush',
          'Elbows stay pointing forward'
        ]
      }
    ],
    breathing: {
      inhale: 'During the stretch/return phase',
      exhale: 'As you extend the arms'
    },
    commonMistakes: [
      { mistake: 'Elbows flaring wide', correction: 'Keep elbows close to ears throughout' },
      { mistake: 'Moving from the shoulders', correction: 'Only forearms should move — upper arms are locked in position' },
      { mistake: 'Not getting full stretch', correction: 'Let the rope pull hands deep behind head for long head stretch' }
    ],
    musclesTargeted: {
      primary: ['Triceps (especially long head)'],
      secondary: ['Anconeus']
    },
    tempoGuide: '1-1-3-0 (extend, squeeze, slow 3-sec stretch)',
    coachingNotes: 'The overhead position is essential for complete tricep development. The long head can only be fully stretched when the arm is overhead. This exercise fills that gap that pushdowns miss.'
  },

  // =====================
  // CORE - ADDITIONAL
  // =====================
  'cable-crunch': {
    exerciseType: 'accessory',
    purpose: 'Cable crunches allow progressive overload of the rectus abdominis — something bodyweight crunches cannot provide past a point. The cable provides constant tension throughout the crunch arc.',
    phases: [
      {
        name: 'Setup',
        description: 'Position at the high cable',
        cues: [
          'Kneel facing the cable machine',
          'Rope attachment behind head, held at temples',
          'Knees and hips stay fixed throughout',
          'Start position: upright torso, core engaged'
        ]
      },
      {
        name: 'The Crunch',
        description: 'Flex the spine to contract abs',
        cues: [
          'Curl ribs toward hips — think about folding in half',
          'Drive elbows toward knees',
          'Squeeze abs hard at the bottom',
          'Dont pull with your arms — they just hold the rope'
        ]
      },
      {
        name: 'The Return',
        description: 'Controlled extension back to start',
        cues: [
          'Rise slowly — 2-3 seconds',
          'Maintain ab tension throughout the return',
          'Stop before fully upright to keep constant tension',
          'Hips stay fixed — dont sit back on heels'
        ]
      }
    ],
    breathing: {
      inhale: 'At the top/start position',
      exhale: 'Forcefully as you crunch down'
    },
    commonMistakes: [
      { mistake: 'Pulling with arms', correction: 'Hands hold the rope at temples — all movement is from the core' },
      { mistake: 'Hinging at hips instead of spine', correction: 'Flex the spine — ribs to hips, not hips to floor' },
      { mistake: 'Going too heavy and using momentum', correction: 'Moderate weight, controlled reps with full squeeze' },
      { mistake: 'Sitting back on heels', correction: 'Hips stay stacked over knees — dont shift backward' }
    ],
    musclesTargeted: {
      primary: ['Rectus Abdominis'],
      secondary: ['Obliques', 'Hip Flexors']
    },
    tempoGuide: '1-2-2-0 (crunch, hold squeeze 2 sec, controlled return)',
    coachingNotes: 'Cable crunches are the best way to progressively overload your abs. The cue is spine flexion, not hip flexion. If your hips are moving, youre doing a hip flexor exercise, not an ab exercise.'
  },

  'cable-woodchop': {
    exerciseType: 'accessory',
    purpose: 'Cable woodchops develop rotational core power and oblique strength. They train the core in the transverse plane — a plane most exercises ignore. Essential for athletic performance and functional core strength.',
    phases: [
      {
        name: 'Setup',
        description: 'Position perpendicular to cable',
        cues: [
          'Cable at high or low position (high-to-low or low-to-high)',
          'Stand sideways, feet wider than shoulders',
          'Both hands on handle, arms extended',
          'Core braced, knees slightly bent'
        ]
      },
      {
        name: 'The Chop',
        description: 'Rotate through the core',
        cues: [
          'Rotate from core and hips — arms follow',
          'Pivot back foot as you rotate',
          'Drive through in a diagonal arc',
          'Keep arms mostly straight — this is a core exercise, not an arm pull'
        ]
      },
      {
        name: 'The Return',
        description: 'Controlled rotation back to start',
        cues: [
          'Return slowly under control — 2-3 seconds',
          'Resist the cable pulling you back',
          'Maintain stance and posture',
          'Reset before next rep'
        ]
      }
    ],
    breathing: {
      inhale: 'At the starting position',
      exhale: 'Forcefully during the chop/rotation'
    },
    commonMistakes: [
      { mistake: 'Pulling with arms', correction: 'Arms stay straight — all rotation comes from the core and hips' },
      { mistake: 'Not pivoting feet', correction: 'Allow the back foot to pivot to enable full rotation' },
      { mistake: 'Too much weight — losing control', correction: 'Moderate weight, controlled reps, quality rotation' }
    ],
    musclesTargeted: {
      primary: ['Obliques', 'Transverse Abdominis'],
      secondary: ['Rectus Abdominis', 'Hip Rotators', 'Shoulders']
    },
    tempoGuide: '1-1-2-0 (chop, brief hold, controlled return)',
    coachingNotes: 'Woodchops train the core in the way it actually works in real life — through rotation and anti-rotation. If you only do crunches and planks, youre missing a whole plane of movement.'
  },

  'cable-pallof-press': {
    exerciseType: 'accessory',
    purpose: 'The Pallof press is an anti-rotation exercise that trains deep core stability. It teaches the core to resist rotational forces, which is fundamental for injury prevention, posture, and athletic performance.',
    phases: [
      {
        name: 'Setup',
        description: 'Position perpendicular to cable',
        cues: [
          'Cable at chest height, single handle',
          'Stand sideways to cable',
          'Hold handle at chest with both hands',
          'Feet shoulder-width, knees slightly bent',
          'Core braced, shoulders down'
        ]
      },
      {
        name: 'The Press',
        description: 'Extend arms away from chest',
        cues: [
          'Press handle straight forward from chest',
          'Resist the cables pull to rotate you',
          'Arms fully extended — hold for 2-3 seconds',
          'Keep hips and shoulders square — no rotation'
        ]
      },
      {
        name: 'The Return',
        description: 'Bring handle back to chest',
        cues: [
          'Pull handle back to chest slowly',
          'Maintain anti-rotation throughout',
          'Stay square and braced',
          'Reset and press again'
        ]
      }
    ],
    breathing: {
      inhale: 'As handle returns to chest',
      exhale: 'As you press and hold'
    },
    commonMistakes: [
      { mistake: 'Rotating toward cable', correction: 'Stay square — the whole point is resisting rotation' },
      { mistake: 'Standing too close to cable', correction: 'Step away enough to create meaningful tension' },
      { mistake: 'Rushing the hold', correction: 'Hold the extended position for 2-3 seconds each rep' },
      { mistake: 'Using too much weight', correction: 'This is a stability exercise — moderate weight, perfect form' }
    ],
    musclesTargeted: {
      primary: ['Transverse Abdominis', 'Obliques', 'Deep Core Stabilisers'],
      secondary: ['Rectus Abdominis', 'Glutes', 'Shoulders']
    },
    tempoGuide: '2-3-2-0 (press 2 sec, hold 3 sec, return 2 sec)',
    coachingNotes: 'The Pallof press is the most underrated core exercise. It trains what the core actually does — resist forces, not create them. If youre not doing anti-rotation work, youre leaving core strength on the table.'
  },

  'hanging-leg-raises': {
    exerciseType: 'accessory',
    purpose: 'Hanging leg raises develop lower ab strength and hip flexor control through full-range spinal flexion. They are one of the most effective ab exercises when performed with proper spinal curling mechanics.',
    phases: [
      {
        name: 'Setup',
        description: 'Hang from pull-up bar',
        cues: [
          'Shoulder-width overhand grip',
          'Full hang with shoulders engaged — not passive',
          'Core pre-engaged before moving',
          'Legs together, toes pointed'
        ]
      },
      {
        name: 'The Raise',
        description: 'Curl legs up with spinal flexion',
        cues: [
          'Lead with pelvis — posterior tilt first',
          'Curl legs up by rolling pelvis under you',
          'Dont just hip flex — curl the spine',
          'Raise to parallel or above for maximum ab engagement'
        ]
      },
      {
        name: 'The Lower',
        description: 'Control the descent',
        cues: [
          'Lower legs slowly — 3 seconds',
          'Resist swinging at all costs',
          'Maintain core engagement throughout',
          'Full extension at bottom before next rep'
        ]
      }
    ],
    breathing: {
      inhale: 'At the bottom hang',
      exhale: 'Forcefully as you raise the legs'
    },
    commonMistakes: [
      { mistake: 'Swinging/using momentum', correction: 'Dead stop at bottom before each rep — no kipping' },
      { mistake: 'Just hip flexing — no spinal curl', correction: 'Roll pelvis under you — the curl is what works the abs' },
      { mistake: 'Dropping legs fast', correction: 'Slow controlled lower — this is where the abs work hardest' }
    ],
    musclesTargeted: {
      primary: ['Rectus Abdominis (lower)', 'Hip Flexors'],
      secondary: ['Obliques', 'Forearms (grip)', 'Lats']
    },
    tempoGuide: '2-1-3-0 (raise 2 sec, hold, slow 3-sec lower)',
    coachingNotes: 'Most people do hanging leg raises wrong. If you dont feel your abs burning, you are hip flexing, not curling. The cue is posterior pelvic tilt — roll the pelvis under you.',
    regressions: ['Hanging Knee Raises', 'Lying Leg Raises'],
    progressions: ['Toes to Bar', 'Weighted Hanging Leg Raises']
  },

  // =====================
  // GLUTES - ADDITIONAL
  // =====================
  'barbell-hip-thrust-glutes': {
    exerciseType: 'primary_lift',
    purpose: 'The hip thrust is the single most effective exercise for glute maximus development. It provides peak contraction at full hip extension where the glutes are maximally shortened — something squats and deadlifts cannot achieve.',
    phases: [
      {
        name: 'Setup',
        description: 'Position against bench with barbell',
        cues: [
          'Upper back (bottom of shoulder blades) against bench edge',
          'Barbell across hip crease — use a pad for comfort',
          'Feet flat, shoulder-width, shins vertical at the top',
          'Chin slightly tucked to maintain neutral spine'
        ]
      },
      {
        name: 'The Brace',
        description: 'Engage before driving',
        cues: [
          'Brace core, squeeze glutes',
          'Drive through whole foot',
          'Press back into bench'
        ]
      },
      {
        name: 'The Drive',
        description: 'Extend hips to full lockout',
        cues: [
          'Drive hips straight up toward ceiling',
          'Squeeze glutes as hard as possible at top',
          'Full hip extension — create a tabletop with torso and thighs',
          'Hold for 1-2 seconds at peak',
          'Chin stays tucked — dont hyperextend neck'
        ]
      },
      {
        name: 'The Lower',
        description: 'Controlled descent',
        cues: [
          'Lower hips slowly — 2-3 seconds',
          'Maintain glute tension throughout',
          'Dont fully relax at bottom',
          'Touch-and-go or brief pause'
        ]
      }
    ],
    breathing: {
      inhale: 'At the bottom position',
      exhale: 'Forcefully as you drive hips up'
    },
    commonMistakes: [
      { mistake: 'Hyperextending the lower back', correction: 'Tuck chin, brace core — the arch should come from hips, not spine' },
      { mistake: 'Feet too close — quads take over', correction: 'At the top, shins should be vertical. Adjust foot position.' },
      { mistake: 'Not reaching full extension', correction: 'Drive all the way up until torso is horizontal — full glute squeeze' },
      { mistake: 'Pushing through toes', correction: 'Drive through heels and mid-foot for maximum glute engagement' }
    ],
    musclesTargeted: {
      primary: ['Gluteus Maximus'],
      secondary: ['Hamstrings', 'Quadriceps', 'Core']
    },
    tempoGuide: '1-2-2-0 (drive up, hold 2 sec, controlled 2-sec lower)',
    coachingNotes: 'The hip thrust is the king of glute exercises. The 2-second hold at the top is non-negotiable — thats where the magic happens. If you cant hold the squeeze, the weight is too heavy.',
    loadGuidelines: {
      technique: 'Light load, master the lockout squeeze and hip position',
      hypertrophy: 'Moderate-heavy load, 8-12 reps, hold at top',
      strength: 'Heavy load, 5-8 reps, focus on peak contraction'
    },
    regressions: ['Bodyweight Glute Bridge', 'Dumbbell Hip Thrust'],
    progressions: ['Banded Hip Thrust', 'Single Leg Hip Thrust', 'Paused Hip Thrust (3-sec hold)'],
    safetyNotes: [
      'Use a barbell pad to protect hip bones',
      'Maintain neutral spine — dont hyperextend',
      'Stop if you feel lower back instead of glutes'
    ]
  },

  'hip-thrust-machine': {
    exerciseType: 'accessory',
    purpose: 'The hip thrust machine provides all the benefits of barbell hip thrusts without the setup hassle. No barbell rolling, no pad positioning — just load and thrust. Ideal for focused glute training.',
    phases: [
      {
        name: 'Setup',
        description: 'Position in the machine',
        cues: [
          'Back against pad at shoulder blade level',
          'Feet flat on platform, shoulder-width',
          'Pad sits across hip crease',
          'Grip handles for stability'
        ]
      },
      {
        name: 'The Drive',
        description: 'Extend hips fully',
        cues: [
          'Drive through heels to push platform',
          'Full hip extension at the top',
          'Squeeze glutes hard — hold 1-2 seconds',
          'Chin tucked, dont hyperextend spine'
        ]
      },
      {
        name: 'The Lower',
        description: 'Control the return',
        cues: [
          'Lower slowly — 2-3 seconds',
          'Dont fully rest at bottom',
          'Maintain glute engagement',
          'Touch and go or brief pause'
        ]
      }
    ],
    breathing: {
      inhale: 'At the bottom',
      exhale: 'As you drive hips up'
    },
    commonMistakes: [
      { mistake: 'Not reaching full extension', correction: 'Drive all the way up — full hip extension every rep' },
      { mistake: 'Pushing through toes', correction: 'Drive through heels for glute emphasis' },
      { mistake: 'Rushing reps', correction: 'Hold the squeeze at top, slow the eccentric' }
    ],
    musclesTargeted: {
      primary: ['Gluteus Maximus'],
      secondary: ['Hamstrings', 'Quadriceps']
    },
    tempoGuide: '1-2-2-0 (drive up, hold 2 sec, controlled 2-sec lower)',
    coachingNotes: 'Same principles as the barbell hip thrust — full extension, hard squeeze, controlled eccentric. The machine just removes the setup friction so you can focus on the glutes.'
  },

  'cable-kickback-glutes': {
    exerciseType: 'accessory',
    purpose: 'Cable glute kickbacks isolate the glute max through hip extension with constant cable tension. They are a targeted isolation tool for glute shaping and activation, best used as an accessory after heavy compounds.',
    phases: [
      {
        name: 'Setup',
        description: 'Attach ankle strap',
        cues: [
          'Low cable, ankle strap attached',
          'Face the cable machine',
          'Hold handles for balance',
          'Slight forward lean from hips',
          'Standing leg slightly bent'
        ]
      },
      {
        name: 'The Kickback',
        description: 'Extend hip to drive leg back',
        cues: [
          'Drive heel straight back and up',
          'Squeeze glute hard at full extension',
          'Dont arch the lower back',
          'Keep the movement at the hip — no knee bend'
        ]
      },
      {
        name: 'The Return',
        description: 'Controlled return to start',
        cues: [
          'Bring leg forward slowly',
          'Resist the cable throughout',
          'Dont let foot swing through',
          'Maintain balance on standing leg'
        ]
      }
    ],
    breathing: {
      inhale: 'As leg returns to start',
      exhale: 'As you kick back'
    },
    commonMistakes: [
      { mistake: 'Arching lower back', correction: 'Brace core, slight forward lean — movement is at the hip only' },
      { mistake: 'Using momentum/swinging', correction: 'Slow controlled reps — squeeze at peak extension' },
      { mistake: 'Bending the working knee', correction: 'Keep leg mostly straight — bend reduces glute engagement' }
    ],
    musclesTargeted: {
      primary: ['Gluteus Maximus'],
      secondary: ['Hamstrings', 'Core (stabilising)']
    },
    tempoGuide: '2-2-2-0 (kick back, hold squeeze 2 sec, controlled return)',
    coachingNotes: 'Cable kickbacks are a feel exercise. Go light, squeeze hard, and really focus on the glute contraction. If you cant feel your glute working, adjust your position or reduce the weight.'
  },

  // =====================
  // COMPOUND LIFTS - ADDITIONAL
  // =====================
  'goblet-squat': {
    exerciseType: 'assistance',
    purpose: 'The goblet squat teaches perfect squat mechanics with a counterbalance at the chest. It is the best squat variation for beginners and a valuable warm-up tool for advanced lifters. The front-loaded position naturally enforces an upright torso.',
    phases: [
      {
        name: 'Setup',
        description: 'Hold dumbbell at chest',
        cues: [
          'Cup the top of a dumbbell with both hands at chest',
          'Elbows pointing down, close to body',
          'Feet shoulder-width or slightly wider, toes out 15-30°',
          'Stand tall, core braced'
        ]
      },
      {
        name: 'The Descent',
        description: 'Squat between your legs',
        cues: [
          'Break at hips and knees together',
          'Elbows track inside knees — push them apart',
          'Keep chest up and dumbbell close to body',
          'Descend to full depth — elbows inside knees',
          'Weight stays in mid-foot'
        ]
      },
      {
        name: 'The Ascent',
        description: 'Drive back to standing',
        cues: [
          'Push the floor away with whole foot',
          'Lead with the chest — stand tall',
          'Keep the dumbbell close to body throughout',
          'Full lockout with glute squeeze'
        ]
      }
    ],
    breathing: {
      inhale: 'At the top before descending',
      exhale: 'As you drive up out of the squat'
    },
    commonMistakes: [
      { mistake: 'Elbows flaring out', correction: 'Elbows stay down and inside knees — they act as knee pushers' },
      { mistake: 'Forward lean', correction: 'The counterbalance should keep you upright — hold the weight higher if leaning' },
      { mistake: 'Knees caving', correction: 'Actively push knees out over toes — elbows help with this' },
      { mistake: 'Not going deep enough', correction: 'The goblet squat rewards depth — go as deep as you can with good form' }
    ],
    musclesTargeted: {
      primary: ['Quadriceps', 'Glutes'],
      secondary: ['Core', 'Upper Back (holding position)', 'Adductors']
    },
    tempoGuide: '2-1-1-0 (controlled lower, brief pause, drive up)',
    coachingNotes: 'If you can only do one squat variation, the goblet squat is the answer. It teaches depth, upright posture, and knee tracking all at once. Every lifter should be able to goblet squat perfectly.',
    regressions: ['Bodyweight Squat', 'Box Squat'],
    progressions: ['Barbell Front Squat', 'Barbell Back Squat']
  },

  'dumbbell-bulgarian-split-squat': {
    exerciseType: 'accessory',
    purpose: 'The Bulgarian split squat is the king of single-leg exercises. It develops unilateral leg strength, hip stability, and addresses imbalances between legs. The rear-foot elevation increases range of motion and quad/glute demand.',
    phases: [
      {
        name: 'Setup',
        description: 'Position with rear foot elevated',
        cues: [
          'Back foot on bench — laces down',
          'Front foot 2-3 feet ahead of bench',
          'Dumbbells at sides or one at chest (goblet style)',
          'Upright torso, core braced'
        ]
      },
      {
        name: 'The Descent',
        description: 'Lower into the split squat',
        cues: [
          'Drop straight down — dont lunge forward',
          'Front knee tracks over toes',
          'Rear knee approaches floor without touching',
          'Keep torso upright throughout',
          'Weight stays in front foot mid-foot to heel'
        ]
      },
      {
        name: 'The Drive',
        description: 'Press back to standing',
        cues: [
          'Drive through front foot heel',
          'Push the floor away',
          'Full extension at the top',
          'Squeeze front leg glute at lockout'
        ]
      }
    ],
    breathing: {
      inhale: 'During the descent',
      exhale: 'As you drive back up'
    },
    commonMistakes: [
      { mistake: 'Front foot too close to bench', correction: 'Step further forward — at the bottom, front shin should be near vertical' },
      { mistake: 'Leaning forward excessively', correction: 'Stay upright — slight lean is OK, but chest stays up' },
      { mistake: 'Pushing off back foot', correction: 'All drive comes from the front leg — back foot is just for balance' },
      { mistake: 'Knee caving on front leg', correction: 'Actively push knee out over toes' }
    ],
    musclesTargeted: {
      primary: ['Quadriceps', 'Glutes'],
      secondary: ['Hamstrings', 'Adductors', 'Core (stabilising)']
    },
    tempoGuide: '2-1-1-0 (lower 2 sec, brief pause, drive up)',
    coachingNotes: 'The Bulgarian split squat is humbling and effective. If your legs are different strengths, this will expose it and fix it. Start with bodyweight to master balance, then add load progressively.',
    regressions: ['Static Lunges', 'Step Ups'],
    progressions: ['Barbell Bulgarian Split Squat', 'Deficit Bulgarian Split Squat']
  },

  'barbell-romanian-deadlift': {
    exerciseType: 'primary_lift',
    purpose: 'The barbell Romanian deadlift is the primary hip hinge for hamstring and glute development. Unlike the conventional deadlift which starts from the floor, the RDL starts from standing and emphasises the eccentric stretch of the hamstrings.',
    phases: [
      {
        name: 'Setup',
        description: 'Start from standing with barbell',
        cues: [
          'Stand tall, bar at hips with overhand grip',
          'Feet hip-width apart',
          'Slight knee bend — maintain this angle throughout',
          'Shoulders back, chest proud, core braced'
        ]
      },
      {
        name: 'The Hinge',
        description: 'Push hips back to stretch hamstrings',
        cues: [
          'Push hips BACK — imagine touching a wall behind you',
          'Bar stays close to legs — dragging down thighs',
          'Maintain flat back — no rounding',
          'Feel deep stretch in hamstrings',
          'Stop when you reach your hamstring flexibility limit'
        ]
      },
      {
        name: 'The Drive',
        description: 'Drive hips forward to standing',
        cues: [
          'Drive hips forward — dont pull with back',
          'Squeeze glutes hard at the top',
          'Stand fully tall — full hip extension',
          'Bar returns close to body throughout'
        ]
      }
    ],
    breathing: {
      inhale: 'At the top before hinging',
      exhale: 'As you drive hips forward to stand',
      brace: 'Full core brace before each rep'
    },
    commonMistakes: [
      { mistake: 'Squatting instead of hinging', correction: 'Keep knee angle fixed — push hips BACK not DOWN' },
      { mistake: 'Rounding the lower back', correction: 'Stop the descent before back rounds — work on hamstring flexibility' },
      { mistake: 'Bar drifting away from body', correction: 'Bar should drag along thighs — keep it close' },
      { mistake: 'Not feeling hamstrings', correction: 'More hip pushback, less knee bend — you should feel a deep hamstring stretch' }
    ],
    musclesTargeted: {
      primary: ['Hamstrings', 'Glutes'],
      secondary: ['Erector Spinae', 'Lats', 'Forearms']
    },
    tempoGuide: '3-1-1-1 (3-sec lower, pause, drive up, squeeze at top)',
    coachingNotes: 'The RDL is about the stretch, not the depth. Your hamstring flexibility determines the range — not an arbitrary bar height. If you dont feel your hamstrings, youre doing it wrong.',
    loadGuidelines: {
      technique: 'Light load, focus on hip hinge pattern and hamstring stretch',
      hypertrophy: 'Moderate load, 8-12 reps, slow eccentric',
      strength: 'Heavy load, 5-8 reps, controlled but powerful'
    },
    regressions: ['Dumbbell RDL', 'Cable Pull Through', 'Good Mornings'],
    progressions: ['Deficit RDL (standing on plates)', 'Single Leg RDL', 'Snatch Grip RDL'],
    safetyNotes: [
      'Stop if you feel sharp lower back pain',
      'Reduce range if lower back rounds before hamstrings stretch',
      'Use straps if grip fails before hamstrings fatigue'
    ]
  },

  // =====================================================
  // REMAINING CHEST EXERCISES
  // =====================================================
  'decline-barbell-bench-press': {
    exerciseType: 'accessory',
    purpose: 'The decline bench press shifts emphasis to the lower pectoralis major and sternal fibres. It allows heavier loads than flat pressing for many lifters due to a shorter range of motion and stronger pressing angle.',
    phases: [
      { name: 'Setup', description: 'Position on decline bench', cues: ['Secure feet under pads', 'Decline angle 15-30°', 'Retract shoulder blades', 'Grip slightly wider than shoulders'] },
      { name: 'Eccentric', description: 'Lower bar to lower chest', cues: ['Lower to lower sternum/upper abs area', 'Elbows at 45-60°', 'Controlled 2-3 second descent', 'Maintain shoulder blade retraction'] },
      { name: 'Concentric', description: 'Press bar back to lockout', cues: ['Drive through heels of palms', 'Press up and slightly back', 'Full lockout without losing position', 'Squeeze chest at top'] }
    ],
    breathing: { inhale: 'During the descent', exhale: 'As you press up through the sticking point' },
    commonMistakes: [
      { mistake: 'Bar touching too high on chest', correction: 'Touch lower sternum — the angle changes the contact point' },
      { mistake: 'Excessive decline angle', correction: '15-30° is sufficient — steeper sends blood to head and reduces chest emphasis' },
      { mistake: 'Bouncing off chest', correction: 'Light touch or brief pause at the chest' }
    ],
    musclesTargeted: { primary: ['Lower Pectoralis Major', 'Triceps'], secondary: ['Anterior Deltoids', 'Serratus Anterior'] },
    tempoGuide: '2-1-1-0',
    coachingNotes: 'The decline press is underrated for lower chest development. Many lifters can press more on decline than flat. Use it as a primary or secondary pressing movement.'
  },

  'close-grip-barbell-bench': {
    exerciseType: 'accessory',
    purpose: 'Close grip bench press emphasises the triceps and inner chest while reducing shoulder stress. It is the primary barbell movement for tricep mass and pressing lockout strength.',
    phases: [
      { name: 'Setup', description: 'Narrow grip position', cues: ['Hands shoulder-width apart on bar', 'Retract shoulder blades', 'Slight arch, feet flat', 'Elbows will naturally tuck more than wide grip'] },
      { name: 'Eccentric', description: 'Lower with elbows tucked', cues: ['Lower to lower chest/sternum', 'Keep elbows at 30-45° from torso', 'Controlled descent — 2 seconds', 'Feel triceps loading'] },
      { name: 'Concentric', description: 'Press with tricep emphasis', cues: ['Drive through triceps to lockout', 'Full elbow extension at top', 'Keep elbows from flaring', 'Chest stays lifted'] }
    ],
    breathing: { inhale: 'At top before descent', exhale: 'Through the press' },
    commonMistakes: [
      { mistake: 'Grip too narrow — wrist pain', correction: 'Shoulder width is close enough — dont go narrower' },
      { mistake: 'Elbows flaring like regular bench', correction: 'Keep elbows tucked at 30-45°' },
      { mistake: 'Partial lockout', correction: 'Full extension is where tricep peak contraction occurs' }
    ],
    musclesTargeted: { primary: ['Triceps', 'Inner Chest'], secondary: ['Anterior Deltoids'] },
    tempoGuide: '2-1-1-0',
    coachingNotes: 'Close grip bench is the best compound tricep builder. Shoulder-width grip — not thumbs-touching. The triceps do the heavy lifting here.'
  },

  'barbell-floor-press': {
    exerciseType: 'accessory',
    purpose: 'The floor press eliminates leg drive and limits range of motion to build lockout strength. It is excellent for tricep development, bench press sticking points, and shoulder-friendly pressing.',
    phases: [
      { name: 'Setup', description: 'Lie on floor under bar or roll dumbbells into position', cues: ['Lie flat on floor, legs straight or bent', 'Grip slightly wider than shoulders', 'Shoulder blades retracted into floor'] },
      { name: 'Eccentric', description: 'Lower until upper arms touch floor', cues: ['Lower under control', 'Upper arms rest briefly on floor', 'Dont relax — maintain tension', 'Elbows at 45°'] },
      { name: 'Concentric', description: 'Press from dead stop', cues: ['Explode off the floor — no bounce', 'Drive through triceps', 'Full lockout at top'] }
    ],
    breathing: { inhale: 'Before the press from the floor', exhale: 'As you drive up' },
    commonMistakes: [
      { mistake: 'Bouncing arms off floor', correction: 'Brief pause — dead stop, then press' },
      { mistake: 'Relaxing at the bottom', correction: 'Keep upper back tight even when arms are on floor' }
    ],
    musclesTargeted: { primary: ['Triceps', 'Pectoralis Major'], secondary: ['Anterior Deltoids'] },
    tempoGuide: '2-1-1-0 (lower, pause on floor, press)',
    coachingNotes: 'The floor press removes the stretch reflex and leg drive. If your bench press stalls at lockout, this is your fix.'
  },

  'flat-dumbbell-bench-press': {
    exerciseType: 'accessory',
    purpose: 'Dumbbell bench press provides independent arm action, greater range of motion, and addresses strength imbalances. The free movement path allows more natural pressing mechanics.',
    phases: [
      { name: 'Setup', description: 'Get dumbbells into position', cues: ['Sit with dumbbells on thighs', 'Kick up as you lie back', 'Retract shoulder blades', 'Feet flat, slight arch'] },
      { name: 'Eccentric', description: 'Lower with control', cues: ['Lower to chest level — deeper than barbell', 'Elbows at 45-75°', 'Feel deep chest stretch', 'Wrists stacked over elbows'] },
      { name: 'Concentric', description: 'Press up in arc', cues: ['Press up and slightly inward', 'Squeeze chest at top', 'Dont clang dumbbells', 'Full lockout'] }
    ],
    breathing: { inhale: 'During lowering', exhale: 'As you press up' },
    commonMistakes: [
      { mistake: 'Dumbbells too wide at bottom', correction: 'Keep arc controlled — this is a press, not a fly' },
      { mistake: 'Uneven pressing', correction: 'Focus on weaker arm — match reps to it' },
      { mistake: 'Poor setup — dumbbells wobbling', correction: 'Practice the kick-up technique until its second nature' }
    ],
    musclesTargeted: { primary: ['Pectoralis Major', 'Anterior Deltoids', 'Triceps'], secondary: ['Core Stabilisers', 'Serratus Anterior'] },
    tempoGuide: '2-1-1-0',
    coachingNotes: 'Dumbbells are superior to barbells for chest development if you have imbalances. The extra range of motion means more stretch and more growth stimulus.'
  },

  'incline-dumbbell-bench-press': {
    exerciseType: 'accessory',
    purpose: 'Incline dumbbell press targets the upper chest with independent arm movement and greater range of motion than the barbell variant.',
    phases: [
      { name: 'Setup', description: 'Set bench to 30-45°', cues: ['Bench at 30-45°', 'Dumbbells at shoulder height', 'Retract shoulder blades', 'Feet flat on floor'] },
      { name: 'Eccentric', description: 'Lower to upper chest', cues: ['Lower to upper chest level', 'Deep stretch at bottom', 'Elbows at 45-60°'] },
      { name: 'Concentric', description: 'Press up and inward', cues: ['Press up and slightly together', 'Squeeze upper chest', 'Full extension without losing blade retraction'] }
    ],
    breathing: { inhale: 'During lowering', exhale: 'During press' },
    commonMistakes: [
      { mistake: 'Bench too steep', correction: '30-45° keeps the emphasis on upper chest, not shoulders' },
      { mistake: 'Dumbbells drifting forward', correction: 'Press straight up from upper chest position' }
    ],
    musclesTargeted: { primary: ['Upper Pectoralis Major', 'Anterior Deltoids'], secondary: ['Triceps', 'Serratus Anterior'] },
    tempoGuide: '2-1-1-0',
    coachingNotes: 'The incline dumbbell press builds the upper chest shelf. Use a moderate angle and focus on the mind-muscle connection with the clavicular pec fibres.'
  },

  'dumbbell-flyes-flat': {
    exerciseType: 'accessory',
    purpose: 'Flat dumbbell flyes isolate the chest through a stretching arc motion. They target the sternal fibres with minimal tricep involvement, making them ideal for chest hypertrophy.',
    phases: [
      { name: 'Setup', description: 'Dumbbells above chest', cues: ['Lie flat, dumbbells pressed above chest', 'Slight bend in elbows — lock this angle', 'Palms facing each other'] },
      { name: 'The Arc', description: 'Open arms in wide arc', cues: ['Lower in wide arc to chest level', 'Maintain elbow bend — dont straighten arms', 'Feel deep chest stretch', 'Stop when arms are level with torso'] },
      { name: 'The Squeeze', description: 'Bring dumbbells back together', cues: ['Squeeze chest to bring arms back', 'Same arc path in reverse', 'Touch dumbbells at top with chest squeeze'] }
    ],
    breathing: { inhale: 'As arms open', exhale: 'As you squeeze back together' },
    commonMistakes: [
      { mistake: 'Straightening arms — turns into a press', correction: 'Lock a slight elbow bend and maintain it throughout' },
      { mistake: 'Going too deep — shoulder pain', correction: 'Stop at chest level — dont force past comfortable range' },
      { mistake: 'Too heavy — cant control the arc', correction: 'Light to moderate weight — this is a feel exercise' }
    ],
    musclesTargeted: { primary: ['Pectoralis Major (sternal)'], secondary: ['Anterior Deltoids'] },
    tempoGuide: '2-1-2-0 (open, pause at stretch, squeeze back)',
    coachingNotes: 'Flyes are about the stretch and squeeze, not the load. Light weight, full range, and a hard contraction at the top will build a better chest than heavy partial flyes.'
  },

  'dumbbell-flyes-incline': {
    exerciseType: 'accessory',
    purpose: 'Incline flyes target the upper chest through a stretching arc with minimal tricep involvement. They complement pressing movements for complete upper chest development.',
    phases: [
      { name: 'Setup', description: 'Bench at 30°, dumbbells above', cues: ['Bench at 30°', 'Dumbbells above upper chest', 'Slight elbow bend locked in'] },
      { name: 'The Arc', description: 'Open arms wide', cues: ['Lower in wide arc', 'Feel upper chest stretch', 'Arms level with torso at bottom'] },
      { name: 'The Squeeze', description: 'Contract upper chest', cues: ['Squeeze upper chest fibres', 'Bring dumbbells back to start', 'Hold contraction briefly'] }
    ],
    breathing: { inhale: 'During the opening arc', exhale: 'During the squeeze' },
    commonMistakes: [
      { mistake: 'Bench too steep', correction: '30° angle — steeper becomes a shoulder fly' },
      { mistake: 'Turning it into a press', correction: 'Maintain the fixed elbow bend throughout' }
    ],
    musclesTargeted: { primary: ['Upper Pectoralis Major (clavicular)'], secondary: ['Anterior Deltoids'] },
    tempoGuide: '2-1-2-0',
    coachingNotes: 'Incline flyes are the best upper chest isolation exercise. Pair them with incline pressing for a complete upper chest workout.'
  },

  'incline-machine-press': {
    exerciseType: 'accessory',
    purpose: 'Incline machine press provides guided upper chest pressing without stabilisation demands. Ideal for isolating the upper pecs, post-fatigue work, or training to failure safely.',
    phases: [
      { name: 'Setup', description: 'Adjust for upper chest', cues: ['Adjust seat so handles align with upper chest', 'Back against pad', 'Grip handles, shoulders down'] },
      { name: 'Concentric', description: 'Press handles forward', cues: ['Drive handles forward and up', 'Squeeze upper chest', 'Full extension without lockout'] },
      { name: 'Eccentric', description: 'Controlled return', cues: ['Return slowly — 2-3 seconds', 'Feel stretch across upper chest', 'Dont let weights crash'] }
    ],
    breathing: { inhale: 'During return', exhale: 'During press' },
    commonMistakes: [
      { mistake: 'Seat too low — becomes flat press', correction: 'Handles should align with upper chest/collarbone' },
      { mistake: 'Shrugging shoulders', correction: 'Keep shoulders depressed throughout' }
    ],
    musclesTargeted: { primary: ['Upper Pectoralis Major', 'Anterior Deltoids'], secondary: ['Triceps'] },
    tempoGuide: '2-1-1-0',
    coachingNotes: 'Machine incline press is perfect for burnout sets after free weight incline work. The guided path lets you push safely to failure.'
  },

  'smith-machine-bench-press': {
    exerciseType: 'accessory',
    purpose: 'Smith machine bench press provides a fixed bar path for pressing without a spotter. It allows heavy chest loading with built-in safety catches.',
    phases: [
      { name: 'Setup', description: 'Position bench under Smith bar', cues: ['Position bench so bar touches mid-chest', 'Retract shoulder blades', 'Grip slightly wider than shoulders', 'Feet flat on floor'] },
      { name: 'Eccentric', description: 'Lower bar to chest', cues: ['Rotate hooks to unrack', 'Lower to mid-chest — 2-3 seconds', 'Elbows at 45-60°'] },
      { name: 'Concentric', description: 'Press to lockout', cues: ['Drive bar up along fixed track', 'Full lockout', 'Maintain chest contact with pad'] }
    ],
    breathing: { inhale: 'During lowering', exhale: 'During press' },
    commonMistakes: [
      { mistake: 'Bench positioned wrong — bar misses chest', correction: 'Position bench so bar path crosses mid-chest naturally' },
      { mistake: 'Forgetting to set safety catches', correction: 'Always set catches just below chest level' }
    ],
    musclesTargeted: { primary: ['Pectoralis Major', 'Triceps'], secondary: ['Anterior Deltoids'] },
    tempoGuide: '2-1-1-0',
    coachingNotes: 'The Smith machine removes the stabilisation component. Use it strategically for overloading the chest, not as your only pressing movement.'
  },

  'low-to-high-cable-flyes': {
    exerciseType: 'accessory',
    purpose: 'Low-to-high cable flyes target the upper chest fibres through an upward arc with constant cable tension throughout the entire range of motion.',
    phases: [
      { name: 'Setup', description: 'Pulleys at lowest position', cues: ['Both pulleys at bottom', 'Step forward into split stance', 'Arms low and out to sides', 'Slight elbow bend'] },
      { name: 'The Arc', description: 'Sweep handles upward', cues: ['Arc arms upward and inward', 'Hands meet at face/chin height', 'Squeeze upper chest at top', 'Control throughout'] },
      { name: 'Return', description: 'Lower back to start', cues: ['Let arms return along same arc — 2-3 seconds', 'Feel stretch in upper chest', 'Maintain split stance stability'] }
    ],
    breathing: { inhale: 'During return', exhale: 'During the upward arc' },
    commonMistakes: [
      { mistake: 'Using too much weight', correction: 'This is an isolation movement — moderate weight, perfect form' },
      { mistake: 'Pressing instead of arcing', correction: 'Keep elbow bend fixed — this is a fly, not a press' }
    ],
    musclesTargeted: { primary: ['Upper Pectoralis Major (clavicular)'], secondary: ['Anterior Deltoids'] },
    tempoGuide: '2-1-2-0',
    coachingNotes: 'Low-to-high cables are the best isolation for upper chest. The constant tension and upward arc perfectly align with upper pec fibre direction.'
  },

  'high-to-low-cable-flyes': {
    exerciseType: 'accessory',
    purpose: 'High-to-low cable flyes emphasise the lower and sternal chest fibres with a downward sweeping arc under constant cable tension.',
    phases: [
      { name: 'Setup', description: 'Pulleys at highest position', cues: ['Both pulleys at top', 'Step forward, slight forward lean', 'Arms up and out to sides'] },
      { name: 'The Arc', description: 'Sweep handles downward and together', cues: ['Arc arms down and inward', 'Hands meet at lower chest/waist level', 'Squeeze inner chest', 'Cross hands slightly for peak contraction'] },
      { name: 'Return', description: 'Controlled return to start', cues: ['Let arms return slowly', 'Feel stretch across chest', 'Maintain stance and lean'] }
    ],
    breathing: { inhale: 'During return', exhale: 'During the downward arc' },
    commonMistakes: [
      { mistake: 'Standing too upright', correction: 'Slight forward lean to align with cable resistance angle' },
      { mistake: 'Bending elbows too much', correction: 'Fixed slight bend — this is a fly motion' }
    ],
    musclesTargeted: { primary: ['Lower/Sternal Pectoralis Major'], secondary: ['Anterior Deltoids'] },
    tempoGuide: '2-1-2-0',
    coachingNotes: 'High-to-low flyes target the lower chest line. Cross hands slightly at the bottom for an extra squeeze.'
  },

  'assisted-dip-machine': {
    exerciseType: 'assistance',
    purpose: 'The assisted dip machine makes dips accessible for beginners by providing counterbalance. It allows progressive reduction of assistance until full bodyweight dips are achievable.',
    phases: [
      { name: 'Setup', description: 'Mount the machine', cues: ['Select counterweight — more weight = more help', 'Kneel on pad or stand on platform', 'Grip handles, lean forward for chest'] },
      { name: 'Eccentric', description: 'Lower slowly', cues: ['Lower until deep stretch — 2-3 seconds', 'Elbows behind you', 'Maintain forward lean for chest emphasis'] },
      { name: 'Concentric', description: 'Press back up', cues: ['Drive through palms', 'Full lockout at top', 'Squeeze chest'] }
    ],
    breathing: { inhale: 'During descent', exhale: 'During press' },
    commonMistakes: [
      { mistake: 'Too much assistance — too easy', correction: 'Gradually reduce counterweight over weeks' },
      { mistake: 'Too upright — becomes tricep dominant', correction: 'Lean forward 30° for chest emphasis' }
    ],
    musclesTargeted: { primary: ['Pectoralis Major', 'Triceps'], secondary: ['Anterior Deltoids'] },
    tempoGuide: '2-1-1-0',
    coachingNotes: 'The goal is to reduce the assistance over time until you can dip with bodyweight. Track your assistance weight and aim to lower it each week.'
  },

  // =====================================================
  // REMAINING BACK EXERCISES
  // =====================================================
  'sumo-deadlift': {
    exerciseType: 'primary_lift',
    purpose: 'The sumo deadlift uses a wide stance and narrow grip to emphasise the quads, adductors, and glutes while reducing lower back stress compared to conventional pulls.',
    phases: [
      { name: 'Setup', description: 'Establish wide stance', cues: ['Feet wide — toes pointed out 30-45°', 'Grip inside knees', 'Hips close to bar', 'Chest up, back flat'] },
      { name: 'The Pull', description: 'Drive through legs', cues: ['Push floor apart with feet', 'Knees track over toes', 'Hips drive forward as bar rises', 'Bar stays close to body'] },
      { name: 'Lockout', description: 'Complete the lift', cues: ['Full hip extension', 'Squeeze glutes', 'Stand tall', 'Dont hyperextend'] }
    ],
    breathing: { inhale: 'Before pull', exhale: 'At lockout', brace: 'Full 360° brace before every rep' },
    commonMistakes: [
      { mistake: 'Hips rising first — chest drops', correction: 'Push floor away with legs, keep chest up' },
      { mistake: 'Knees caving in', correction: 'Actively push knees out over toes throughout' },
      { mistake: 'Hips too far from bar', correction: 'Get hips as close to bar as possible in setup' }
    ],
    musclesTargeted: { primary: ['Quadriceps', 'Glutes', 'Adductors'], secondary: ['Hamstrings', 'Erector Spinae', 'Traps'] },
    tempoGuide: 'Controlled setup, powerful pull, controlled lower',
    coachingNotes: 'Sumo suits lifters with longer legs and limited lower back tolerance. The technique is about "spreading the floor" — external rotation torque is everything.'
  },

  'pendlay-row': {
    exerciseType: 'primary_lift',
    purpose: 'The Pendlay row is an explosive row from the floor with torso parallel. Each rep starts from a dead stop, building explosive pulling power and strict back strength.',
    phases: [
      { name: 'Setup', description: 'Bar on floor, torso parallel', cues: ['Stance like deadlift — hip width', 'Torso parallel to floor', 'Grip outside knees', 'Core braced, back flat'] },
      { name: 'The Pull', description: 'Explosive row to chest', cues: ['Explosively drive elbows back', 'Pull to lower sternum', 'Squeeze shoulder blades hard', 'Torso stays STILL — no standing up'] },
      { name: 'The Return', description: 'Reset on floor', cues: ['Lower bar back to floor', 'Let it settle briefly', 'Reset position for next rep'] }
    ],
    breathing: { inhale: 'At the floor before pull', exhale: 'During the pull' },
    commonMistakes: [
      { mistake: 'Using body english — torso rising', correction: 'Torso stays parallel — if it moves, weight is too heavy' },
      { mistake: 'Pulling to belly', correction: 'Pull to lower sternum for proper lat engagement' }
    ],
    musclesTargeted: { primary: ['Latissimus Dorsi', 'Rhomboids', 'Rear Deltoids'], secondary: ['Biceps', 'Erector Spinae'] },
    tempoGuide: 'Dead stop, explosive pull, controlled return',
    coachingNotes: 'The Pendlay row builds explosive pulling strength. Every rep is from a dead stop — no stretch reflex, no momentum. Pure power.'
  },

  'single-arm-dumbbell-row': {
    exerciseType: 'accessory',
    purpose: 'The single-arm dumbbell row develops unilateral back strength, addresses imbalances, and allows heavy loading with lower back support from the bench.',
    phases: [
      { name: 'Setup', description: 'Support position on bench', cues: ['One hand and knee on bench', 'Opposite foot on floor, wide base', 'Flat back, core engaged', 'Arm hangs straight down with dumbbell'] },
      { name: 'The Pull', description: 'Row to hip', cues: ['Drive elbow up and back', 'Pull toward hip — not shoulder', 'Squeeze lat and rhomboid at top', 'Keep torso square — no rotation'] },
      { name: 'The Lower', description: 'Full stretch at bottom', cues: ['Lower under control — 2 seconds', 'Full arm extension at bottom', 'Feel lat stretch', 'Dont just drop the weight'] }
    ],
    breathing: { inhale: 'At the bottom', exhale: 'As you row up' },
    commonMistakes: [
      { mistake: 'Rotating torso to heave weight', correction: 'Stay square — if you rotate, reduce the weight' },
      { mistake: 'Pulling to shoulder instead of hip', correction: 'Drive elbow toward hip for better lat engagement' },
      { mistake: 'Partial reps', correction: 'Full hang at bottom, full squeeze at top' }
    ],
    musclesTargeted: { primary: ['Latissimus Dorsi', 'Rhomboids'], secondary: ['Biceps', 'Rear Deltoids', 'Core'] },
    tempoGuide: '1-1-2-0 (pull, squeeze, controlled lower)',
    coachingNotes: 'The single-arm row is the best unilateral back builder. Heavy, strict form, full range. Match the weaker side first.'
  },

  'chest-supported-dumbbell-row': {
    exerciseType: 'accessory',
    purpose: 'Chest-supported rows eliminate lower back involvement entirely, allowing pure upper back focus. Ideal for those with lower back fatigue or for high-volume back training.',
    phases: [
      { name: 'Setup', description: 'Chest on incline bench', cues: ['Set bench to 30-45° incline', 'Lie face-down, chest on pad', 'Arms hang straight down with dumbbells', 'Feet on floor for stability'] },
      { name: 'The Pull', description: 'Row both dumbbells', cues: ['Drive elbows back and up', 'Squeeze shoulder blades together', 'Pull to lower chest level', 'Hold contraction 1 second'] },
      { name: 'The Lower', description: 'Full stretch', cues: ['Lower slowly — 2-3 seconds', 'Full extension at bottom', 'Feel lats stretch'] }
    ],
    breathing: { inhale: 'At bottom stretch', exhale: 'During the row' },
    commonMistakes: [
      { mistake: 'Lifting chest off pad', correction: 'Stay pinned to bench — the whole point is chest support' },
      { mistake: 'Shrugging instead of rowing', correction: 'Keep shoulders down — lead with elbows, not traps' }
    ],
    musclesTargeted: { primary: ['Rhomboids', 'Middle Trapezius', 'Lats'], secondary: ['Biceps', 'Rear Deltoids'] },
    tempoGuide: '1-1-2-0',
    coachingNotes: 'The chest-supported row removes all cheating potential. Use it when your lower back is fatigued from deadlifts but your upper back still needs work.'
  },

  'inverted-rows': {
    exerciseType: 'assistance',
    purpose: 'Inverted rows are a bodyweight horizontal pull that builds back strength and teaches pulling mechanics. They are the horizontal pull equivalent of push-ups.',
    phases: [
      { name: 'Setup', description: 'Under a bar or rings', cues: ['Bar at hip to chest height', 'Hang underneath with straight body', 'Overhand or underhand grip', 'Body rigid — head to heels'] },
      { name: 'The Pull', description: 'Pull chest to bar', cues: ['Drive elbows back', 'Pull chest to bar', 'Squeeze shoulder blades', 'Keep body straight throughout'] },
      { name: 'The Lower', description: 'Control back to hang', cues: ['Lower slowly — 2-3 seconds', 'Full extension at bottom', 'Maintain rigid body'] }
    ],
    breathing: { inhale: 'At bottom', exhale: 'During pull' },
    commonMistakes: [
      { mistake: 'Hips sagging', correction: 'Squeeze glutes and brace core — body stays rigid' },
      { mistake: 'Partial reps', correction: 'Full extension at bottom, chest to bar at top' }
    ],
    musclesTargeted: { primary: ['Rhomboids', 'Lats', 'Rear Deltoids'], secondary: ['Biceps', 'Core'] },
    tempoGuide: '1-1-2-0',
    coachingNotes: 'Inverted rows are one of the best back exercises for beginners. Adjust difficulty by changing body angle — more upright is easier.'
  },

  'close-grip-lat-pulldown': {
    exerciseType: 'accessory',
    purpose: 'Close grip pulldown targets the lower lats and increases bicep involvement. The neutral or narrow grip allows a longer range of motion and deeper contraction.',
    phases: [
      { name: 'Setup', description: 'V-handle or narrow grip', cues: ['V-handle or close grip bar', 'Thigh pad locked', 'Slight lean back — 10-15°', 'Arms fully extended above'] },
      { name: 'The Pull', description: 'Pull to sternum', cues: ['Depress shoulders first', 'Drive elbows down to sides', 'Pull to mid-sternum', 'Squeeze lats hard at bottom'] },
      { name: 'The Return', description: 'Controlled extension', cues: ['Extend arms slowly — 2-3 seconds', 'Feel lat stretch at top', 'Dont let weight pull you forward'] }
    ],
    breathing: { inhale: 'At top/stretch', exhale: 'During pull' },
    commonMistakes: [
      { mistake: 'Pulling behind head', correction: 'Pull to front of chest/sternum' },
      { mistake: 'Using too much lean', correction: 'Slight lean only — dont turn it into a row' }
    ],
    musclesTargeted: { primary: ['Lower Latissimus Dorsi', 'Biceps'], secondary: ['Rhomboids', 'Teres Major'] },
    tempoGuide: '1-1-2-0',
    coachingNotes: 'Close grip pulldowns hit the lower lats differently than wide grip. Alternate between both for complete lat development.'
  },

  'straight-arm-pulldown': {
    exerciseType: 'accessory',
    purpose: 'Straight arm pulldowns isolate the lats without bicep involvement. They teach lat engagement for pull-ups and develop the mind-muscle connection with the lats.',
    phases: [
      { name: 'Setup', description: 'Face cable, arms overhead', cues: ['High cable, straight bar or rope', 'Step back for tension', 'Arms extended overhead, slight bend', 'Slight forward lean'] },
      { name: 'The Pull', description: 'Arc bar to thighs', cues: ['Pull bar down in arc to thighs', 'Keep arms mostly straight', 'Squeeze lats hard at bottom', 'Hold contraction 1-2 seconds'] },
      { name: 'The Return', description: 'Controlled stretch', cues: ['Let arms return overhead slowly', 'Feel full lat stretch', 'Dont shrug at top'] }
    ],
    breathing: { inhale: 'During return/stretch', exhale: 'During pulldown' },
    commonMistakes: [
      { mistake: 'Bending arms — turning into pushdown', correction: 'Arms stay nearly straight — slight bend only' },
      { mistake: 'Using momentum', correction: 'Slow controlled reps — this is a feel exercise' }
    ],
    musclesTargeted: { primary: ['Latissimus Dorsi'], secondary: ['Teres Major', 'Long Head Tricep', 'Posterior Deltoid'] },
    tempoGuide: '2-2-2-0',
    coachingNotes: 'The straight arm pulldown is the best lat isolation exercise. Use it as a primer before compounds or as a finisher. If you cant feel your lats in pull-ups, master this first.'
  },

  'machine-row': {
    exerciseType: 'accessory',
    purpose: 'Machine rows provide strict horizontal pulling with chest support, allowing full focus on back contraction without lower back fatigue.',
    phases: [
      { name: 'Setup', description: 'Adjust and position', cues: ['Chest against pad', 'Select grip — wide or neutral', 'Arms fully extended at start', 'Feet on foot platform'] },
      { name: 'The Pull', description: 'Row to body', cues: ['Drive elbows back', 'Squeeze shoulder blades together', 'Hold peak contraction 1-2 seconds', 'Chest stays on pad'] },
      { name: 'The Return', description: 'Full stretch', cues: ['Extend arms slowly', 'Feel lat stretch', 'Dont let weights crash'] }
    ],
    breathing: { inhale: 'At stretch', exhale: 'During row' },
    commonMistakes: [
      { mistake: 'Pulling with arms not back', correction: 'Lead with elbows, focus on squeezing shoulder blades' },
      { mistake: 'Lifting chest off pad', correction: 'Stay pinned — the support is the advantage of the machine' }
    ],
    musclesTargeted: { primary: ['Latissimus Dorsi', 'Rhomboids', 'Middle Trapezius'], secondary: ['Biceps', 'Rear Deltoids'] },
    tempoGuide: '1-2-2-0',
    coachingNotes: 'Machine rows let you focus entirely on the squeeze. Use them for high-rep back volume without worrying about lower back fatigue.'
  },

  'assisted-pull-up-machine': {
    exerciseType: 'assistance',
    purpose: 'The assisted pull-up machine makes pull-ups accessible for those who cannot yet do bodyweight reps. Progressive reduction of assistance builds toward unassisted pull-ups.',
    phases: [
      { name: 'Setup', description: 'Select counterweight', cues: ['More weight = more assistance', 'Kneel on pad', 'Wide or narrow grip on handles', 'Start from full hang'] },
      { name: 'The Pull', description: 'Pull chin over handles', cues: ['Depress shoulders first', 'Drive elbows down', 'Pull to upper chest', 'Squeeze lats at top'] },
      { name: 'The Lower', description: 'Controlled descent', cues: ['Lower slowly — 3 seconds', 'Full extension at bottom', 'Reset before next rep'] }
    ],
    breathing: { inhale: 'At bottom', exhale: 'During pull' },
    commonMistakes: [
      { mistake: 'Too much assistance', correction: 'Challenge yourself — you should struggle by the last 2-3 reps' },
      { mistake: 'Partial reps', correction: 'Full range — dead hang to chin over handles' }
    ],
    musclesTargeted: { primary: ['Latissimus Dorsi', 'Biceps'], secondary: ['Rhomboids', 'Rear Deltoids'] },
    tempoGuide: '1-0-3-0 (pull up, controlled 3-sec lower)',
    coachingNotes: 'Track your assistance weight and aim to reduce it every 1-2 weeks. The goal is bodyweight pull-ups. Slow negatives build strength fastest.'
  },

  't-bar-row': {
    exerciseType: 'accessory',
    purpose: 'T-bar rows build mid-back thickness with a neutral grip and supported position. The close grip angle targets the lower lats and rhomboids effectively.',
    phases: [
      { name: 'Setup', description: 'Straddle the bar', cues: ['Stand over bar, feet either side', 'Close neutral grip handle', 'Hinge at hips — flat back', 'Chest up, core braced'] },
      { name: 'The Pull', description: 'Row to chest', cues: ['Drive elbows up and back', 'Pull handle to lower chest', 'Squeeze back at top', 'Keep torso angle fixed'] },
      { name: 'The Lower', description: 'Controlled descent', cues: ['Lower slowly — 2 seconds', 'Full extension at bottom', 'Feel lat stretch'] }
    ],
    breathing: { inhale: 'At bottom', exhale: 'During pull' },
    commonMistakes: [
      { mistake: 'Standing up too much', correction: 'Maintain hip hinge — torso stays still' },
      { mistake: 'Heaving with body', correction: 'Strict form — back does the work, not momentum' }
    ],
    musclesTargeted: { primary: ['Latissimus Dorsi', 'Rhomboids', 'Middle Trapezius'], secondary: ['Biceps', 'Erector Spinae'] },
    tempoGuide: '1-1-2-0',
    coachingNotes: 'T-bar rows are a back thickness classic. The neutral grip and angle let you pull heavy with less shoulder stress.'
  },

  'barbell-shrugs': {
    exerciseType: 'accessory',
    purpose: 'Barbell shrugs isolate the upper trapezius for yoke development. Simple movement with high loading potential for building trap size and neck thickness.',
    phases: [
      { name: 'Setup', description: 'Stand with barbell', cues: ['Grip just outside thighs', 'Arms straight, shoulders down', 'Stand tall, core braced'] },
      { name: 'The Shrug', description: 'Elevate shoulders', cues: ['Shrug straight UP toward ears', 'Hold peak for 1-2 seconds', 'Dont roll shoulders — straight up and down', 'Squeeze traps hard'] },
      { name: 'The Lower', description: 'Return to start', cues: ['Lower slowly — 2 seconds', 'Full depress at bottom', 'Maintain control'] }
    ],
    breathing: { inhale: 'Before the shrug', exhale: 'At the top' },
    commonMistakes: [
      { mistake: 'Rolling shoulders forward/backward', correction: 'Straight up and down only — rolling adds no benefit and risks injury' },
      { mistake: 'Using arm bend', correction: 'Arms stay straight — no bicep curl component' },
      { mistake: 'Too heavy with partial range', correction: 'Full range > heavy partials for trap development' }
    ],
    musclesTargeted: { primary: ['Upper Trapezius'], secondary: ['Levator Scapulae', 'Rhomboids'] },
    tempoGuide: '1-2-2-0 (shrug, hold 2 sec, lower 2 sec)',
    coachingNotes: 'Shrugs respond to holds. Squeeze at the top for 1-2 seconds every rep. Straight up and down — no rolling.'
  },

  'barbell-good-mornings': {
    exerciseType: 'accessory',
    purpose: 'Good mornings develop posterior chain strength through a loaded hip hinge with the bar on the back. They strengthen the erectors, hamstrings, and glutes while teaching proper hinge mechanics.',
    phases: [
      { name: 'Setup', description: 'Bar on upper back', cues: ['Bar on upper traps like a squat', 'Feet hip to shoulder width', 'Slight knee bend', 'Core braced, chest proud'] },
      { name: 'The Hinge', description: 'Bow forward', cues: ['Push hips back — dont squat', 'Lower torso until near parallel', 'Bar stays on back', 'Feel hamstring stretch'] },
      { name: 'The Return', description: 'Drive back to standing', cues: ['Drive hips forward', 'Lead with chest', 'Squeeze glutes at top', 'Full standing position'] }
    ],
    breathing: { inhale: 'Before hinging', exhale: 'As you return to standing', brace: 'Full brace maintained throughout' },
    commonMistakes: [
      { mistake: 'Rounding lower back', correction: 'Maintain flat back — stop descent if back starts to round' },
      { mistake: 'Bending knees too much', correction: 'Slight bend only — more knee bend = less hamstring stretch' },
      { mistake: 'Going too heavy', correction: 'This is a moderate load exercise — form > weight' }
    ],
    musclesTargeted: { primary: ['Erector Spinae', 'Hamstrings', 'Glutes'], secondary: ['Core', 'Upper Back'] },
    tempoGuide: '3-0-1-0 (slow hinge, drive up)',
    coachingNotes: 'Good mornings build an unbreakable lower back. Start light, master the hinge, then gradually increase load. Your squat and deadlift will thank you.',
    safetyNotes: ['Start very light — this exercise is humbling', 'Stop if you feel sharp lower back pain', 'Do NOT go heavy until form is perfect']
  },

  // =====================================================
  // REMAINING SHOULDER EXERCISES
  // =====================================================
  'arnold-press': {
    exerciseType: 'accessory',
    purpose: 'The Arnold press adds a rotation component to the dumbbell press, hitting all three delt heads through one fluid motion. Named after Arnold Schwarzenegger.',
    phases: [
      { name: 'Start', description: 'Dumbbells at chin, palms facing you', cues: ['Seated or standing', 'Dumbbells at chin height, palms facing you', 'Elbows in front of body', 'Core braced'] },
      { name: 'Rotate and Press', description: 'Rotate palms out as you press overhead', cues: ['Open elbows to sides while pressing up', 'Rotate palms to face forward', 'Full lockout overhead', 'Smooth continuous motion'] },
      { name: 'Return', description: 'Reverse the motion', cues: ['Lower while rotating palms back toward you', 'Elbows come back in front', 'Return to start position'] }
    ],
    breathing: { inhale: 'At the bottom', exhale: 'As you press and rotate' },
    commonMistakes: [
      { mistake: 'Separating the rotation from the press', correction: 'One fluid motion — rotate AS you press, not before' },
      { mistake: 'Not completing the rotation', correction: 'Start palms in, finish palms out — full rotation' }
    ],
    musclesTargeted: { primary: ['Anterior Deltoids', 'Lateral Deltoids', 'Triceps'], secondary: ['Posterior Deltoids', 'Upper Chest'] },
    tempoGuide: '2-0-1-1',
    coachingNotes: 'The Arnold press hits all three delt heads in one movement. The rotation adds time under tension and recruits fibres that standard presses miss.'
  },

  'machine-shoulder-press': {
    exerciseType: 'accessory',
    purpose: 'Machine shoulder press provides guided overhead pressing without stabilisation demands. Safe for solo training and allows pressing to failure.',
    phases: [
      { name: 'Setup', description: 'Adjust seat height', cues: ['Handles at shoulder height', 'Back against pad', 'Grip handles, feet flat'] },
      { name: 'Press', description: 'Drive handles overhead', cues: ['Press straight up to full extension', 'Dont let head push forward', 'Squeeze delts at top'] },
      { name: 'Lower', description: 'Controlled return', cues: ['Lower slowly — 2-3 seconds', 'Stop at shoulder level', 'Dont let weights crash'] }
    ],
    breathing: { inhale: 'At bottom', exhale: 'During press' },
    commonMistakes: [
      { mistake: 'Seat too high — limited range', correction: 'Handles should start at shoulder height' },
      { mistake: 'Arching back off pad', correction: 'Keep back flat against pad throughout' }
    ],
    musclesTargeted: { primary: ['Anterior Deltoids', 'Lateral Deltoids', 'Triceps'], secondary: ['Upper Trapezius'] },
    tempoGuide: '2-0-1-0',
    coachingNotes: 'Machine press is perfect for drop sets, high-rep burnouts, or when training alone. The fixed path means safe failure.'
  },

  'dumbbell-rear-delt-flyes': {
    exerciseType: 'accessory',
    purpose: 'Rear delt flyes isolate the posterior deltoids and upper back muscles. They are essential for balanced shoulder development and posture.',
    phases: [
      { name: 'Setup', description: 'Bent over position', cues: ['Seated bent over or standing hinged', 'Dumbbells hanging below chest', 'Slight elbow bend', 'Chest up, back flat'] },
      { name: 'The Fly', description: 'Raise arms to sides', cues: ['Lead with elbows', 'Raise arms out to sides to shoulder height', 'Squeeze rear delts and upper back', 'Hold 1 second at top'] },
      { name: 'Lower', description: 'Controlled return', cues: ['Lower slowly — 2-3 seconds', 'Dont swing or use momentum', 'Reset at bottom'] }
    ],
    breathing: { inhale: 'At bottom', exhale: 'As you raise arms' },
    commonMistakes: [
      { mistake: 'Swinging body for momentum', correction: 'Stay still — if you need momentum, go lighter' },
      { mistake: 'Raising too high — traps take over', correction: 'Stop at shoulder height' }
    ],
    musclesTargeted: { primary: ['Posterior Deltoids'], secondary: ['Rhomboids', 'Middle Trapezius'] },
    tempoGuide: '2-1-2-0',
    coachingNotes: 'Most people have weak rear delts. Train them 2-3x per week with light weight and high reps. Your shoulders and posture will improve dramatically.'
  },

  'landmine-press': {
    exerciseType: 'accessory',
    purpose: 'The landmine press provides a shoulder-friendly pressing angle between horizontal and vertical. It builds shoulder strength while accommodating those with overhead mobility limitations.',
    phases: [
      { name: 'Setup', description: 'Bar end at shoulder', cues: ['One end in landmine or corner', 'Hold other end at shoulder height', 'Half-kneeling or standing', 'Core braced'] },
      { name: 'Press', description: 'Press up and away', cues: ['Press bar up and forward', 'Full arm extension', 'Dont rotate torso', 'Squeeze shoulder at lockout'] },
      { name: 'Lower', description: 'Return to shoulder', cues: ['Lower slowly to shoulder', 'Control the arc', 'Reset and repeat'] }
    ],
    breathing: { inhale: 'At shoulder', exhale: 'During press' },
    commonMistakes: [
      { mistake: 'Rotating torso to press', correction: 'Stay square — anti-rotation is part of the benefit' },
      { mistake: 'Not reaching full extension', correction: 'Press until arm is fully locked out' }
    ],
    musclesTargeted: { primary: ['Anterior Deltoids', 'Upper Chest'], secondary: ['Triceps', 'Core', 'Serratus Anterior'] },
    tempoGuide: '2-0-1-0',
    coachingNotes: 'The landmine press is the best pressing option for those with shoulder impingement. The angled path avoids the problematic overhead position while still building strength.'
  },

  // =====================================================
  // REMAINING LEG EXERCISES
  // =====================================================
  'barbell-lunges': {
    exerciseType: 'accessory',
    purpose: 'Barbell lunges develop unilateral leg strength, balance, and hip stability under heavy load. The barbell allows more loading than dumbbells.',
    phases: [
      { name: 'Setup', description: 'Bar on upper back', cues: ['Bar positioned like a squat', 'Stand tall, core braced', 'Feet hip-width'] },
      { name: 'The Step', description: 'Forward lunge', cues: ['Step forward with one leg — big step', 'Lower until both knees at 90°', 'Front knee tracks over toes', 'Rear knee approaches floor'] },
      { name: 'The Drive', description: 'Return to standing', cues: ['Drive through front heel', 'Push back to start position', 'Full standing before next rep'] }
    ],
    breathing: { inhale: 'During the step/descent', exhale: 'As you drive back up' },
    commonMistakes: [
      { mistake: 'Step too short — knee over toes', correction: 'Big step forward so front shin stays near vertical at bottom' },
      { mistake: 'Leaning forward excessively', correction: 'Stay upright — chest proud throughout' },
      { mistake: 'Wobbly balance', correction: 'Take a wider stance laterally — feet dont need to be in a line' }
    ],
    musclesTargeted: { primary: ['Quadriceps', 'Glutes'], secondary: ['Hamstrings', 'Core', 'Adductors'] },
    tempoGuide: '2-0-1-0',
    coachingNotes: 'Lunges expose and fix leg imbalances. If one leg is weaker, youll feel it immediately. Start with bodyweight to master balance.'
  },

  'dumbbell-romanian-deadlift': {
    exerciseType: 'accessory',
    purpose: 'The dumbbell RDL develops the hamstring-glute connection with independent loading and natural arm path. Excellent for beginners learning the hip hinge.',
    phases: [
      { name: 'Setup', description: 'Dumbbells at sides', cues: ['Stand tall, dumbbells at sides or front', 'Feet hip-width', 'Slight knee bend', 'Shoulders back'] },
      { name: 'The Hinge', description: 'Push hips back', cues: ['Hinge at hips — push them BACK', 'Dumbbells slide down thighs', 'Maintain flat back', 'Feel hamstring stretch'] },
      { name: 'The Drive', description: 'Return to standing', cues: ['Drive hips forward', 'Squeeze glutes at top', 'Full standing position'] }
    ],
    breathing: { inhale: 'Before hinging', exhale: 'As you stand up' },
    commonMistakes: [
      { mistake: 'Squatting the movement', correction: 'Push hips BACK — this is a hinge, not a squat' },
      { mistake: 'Dumbbells drifting forward', correction: 'Keep weights close to legs throughout' }
    ],
    musclesTargeted: { primary: ['Hamstrings', 'Glutes'], secondary: ['Erector Spinae', 'Forearms'] },
    tempoGuide: '3-1-1-0',
    coachingNotes: 'Dumbbell RDLs are the best way to learn the hip hinge before progressing to barbell. Focus on the stretch, not the depth.'
  },

  'dumbbell-lunges': {
    exerciseType: 'accessory',
    purpose: 'Dumbbell lunges develop unilateral leg strength and balance. Holding dumbbells at the sides provides a lower centre of gravity than barbell lunges, making them more accessible.',
    phases: [
      { name: 'Setup', description: 'Dumbbells at sides', cues: ['Dumbbells at sides, arms straight', 'Stand tall, core braced', 'Feet hip-width'] },
      { name: 'The Lunge', description: 'Step and lower', cues: ['Step forward — big stride', 'Lower until both knees at 90°', 'Keep torso upright', 'Front knee over toes'] },
      { name: 'The Return', description: 'Drive back', cues: ['Push through front heel', 'Return to start', 'Alternate legs'] }
    ],
    breathing: { inhale: 'During descent', exhale: 'During drive back' },
    commonMistakes: [
      { mistake: 'Short steps', correction: 'Longer stride keeps shin vertical and reduces knee stress' },
      { mistake: 'Leaning forward with dumbbells', correction: 'Stay upright — chest proud' }
    ],
    musclesTargeted: { primary: ['Quadriceps', 'Glutes'], secondary: ['Hamstrings', 'Core'] },
    tempoGuide: '2-0-1-0',
    coachingNotes: 'Dumbbell lunges are the most versatile single-leg exercise. Walk, reverse, or stay stationary — all work. Pick the version that suits your space and goals.'
  },

  'lying-leg-curl-machine': {
    exerciseType: 'accessory',
    purpose: 'Lying leg curls isolate the hamstrings through knee flexion in a prone position. The stretched hip position allows greater hamstring engagement than seated curls.',
    phases: [
      { name: 'Setup', description: 'Lie face down on machine', cues: ['Hips flat on pad', 'Ankle pad just above heels', 'Grip handles for stability', 'Legs fully extended'] },
      { name: 'The Curl', description: 'Curl heels to glutes', cues: ['Curl heels toward glutes', 'Squeeze hamstrings hard at peak', 'Dont lift hips off pad', 'Hold contraction 1 second'] },
      { name: 'The Lower', description: 'Controlled eccentric', cues: ['Lower slowly — 3 seconds', 'Full extension at bottom', 'Dont let weight crash'] }
    ],
    breathing: { inhale: 'During lowering', exhale: 'During curl' },
    commonMistakes: [
      { mistake: 'Hips lifting off pad', correction: 'Stay flat — if hips lift, reduce weight' },
      { mistake: 'Using momentum', correction: 'Slow controlled reps — squeeze at top' }
    ],
    musclesTargeted: { primary: ['Hamstrings'], secondary: ['Gastrocnemius'] },
    tempoGuide: '1-1-3-0 (curl, squeeze, slow 3-sec lower)',
    coachingNotes: 'Lying curls hit the hamstrings in a stretched hip position. The slow eccentric is where growth happens — dont rush the lowering phase.'
  },

  'seated-calf-raise-machine': {
    exerciseType: 'accessory',
    purpose: 'Seated calf raises target the soleus muscle (deeper calf) which is best trained with bent knees. The soleus adds thickness to the lower calf.',
    phases: [
      { name: 'Setup', description: 'Position in machine', cues: ['Sit with knees under pads', 'Balls of feet on platform edge', 'Release safety'] },
      { name: 'The Raise', description: 'Rise up on toes', cues: ['Push through balls of feet', 'Rise to full contraction', 'Squeeze 1-2 seconds at top'] },
      { name: 'The Stretch', description: 'Lower into stretch', cues: ['Lower heels below platform level', 'Feel deep stretch in calves', 'Hold stretch 1-2 seconds'] }
    ],
    breathing: { inhale: 'At the stretch', exhale: 'As you rise' },
    commonMistakes: [
      { mistake: 'Bouncing', correction: 'Pause at both the top and bottom' },
      { mistake: 'Partial range', correction: 'Full stretch at bottom, full rise at top' }
    ],
    musclesTargeted: { primary: ['Soleus'], secondary: ['Gastrocnemius (reduced due to bent knee)'] },
    tempoGuide: '1-2-1-2',
    coachingNotes: 'Calves need both seated AND standing raises. Standing targets the gastrocnemius, seated targets the soleus. You need both for complete calf development.'
  },

  'smith-machine-squat': {
    exerciseType: 'accessory',
    purpose: 'Smith machine squats provide a guided bar path for squatting. They allow focus on quad loading without balance demands and are safer for solo training.',
    phases: [
      { name: 'Setup', description: 'Position under Smith bar', cues: ['Feet slightly forward of bar for quad emphasis', 'Bar on upper traps', 'Shoulder-width stance or wider', 'Core braced'] },
      { name: 'Descent', description: 'Squat down along track', cues: ['Break at hips and knees together', 'Descend to at least parallel', 'Keep weight in mid-foot', 'Chest up'] },
      { name: 'Ascent', description: 'Drive up', cues: ['Push floor away', 'Drive up along track', 'Full lockout with glute squeeze'] }
    ],
    breathing: { inhale: 'Before descent', exhale: 'Through sticking point' },
    commonMistakes: [
      { mistake: 'Feet directly under bar — like free squat', correction: 'Feet slightly forward to accommodate the fixed track' },
      { mistake: 'Forgetting safety catches', correction: 'Always set safeties at appropriate depth' }
    ],
    musclesTargeted: { primary: ['Quadriceps', 'Glutes'], secondary: ['Hamstrings', 'Core'] },
    tempoGuide: '2-0-1-0',
    coachingNotes: 'The Smith squat is a tool — not a crutch. Use it for overloading quads, for training alone safely, or for foot placement variations that free weights dont allow.'
  },

  'nordic-curls': {
    exerciseType: 'accessory',
    purpose: 'Nordic curls are the gold standard for eccentric hamstring training. They dramatically reduce hamstring injury risk and build exceptional hamstring strength through the lengthened position.',
    phases: [
      { name: 'Setup', description: 'Kneel with feet anchored', cues: ['Kneel on pad, feet anchored under something solid', 'Upright starting position', 'Arms ready to catch yourself'] },
      { name: 'Eccentric', description: 'Lower slowly', cues: ['Lean forward from knees — dont bend at hips', 'Control the descent as long as possible', 'Use hamstrings to resist gravity', '3-5 second lowering phase'] },
      { name: 'Concentric', description: 'Return to start', cues: ['Catch yourself at bottom if needed', 'Push back up with hands or pull with hamstrings', 'Return to upright kneeling'] }
    ],
    breathing: { inhale: 'At top before lowering', exhale: 'During the controlled descent' },
    commonMistakes: [
      { mistake: 'Bending at hips — not using hamstrings', correction: 'Stay straight from knee to head — pivot only at the knee' },
      { mistake: 'Dropping too fast', correction: 'The slow eccentric IS the exercise — if you cant control it, use band assistance' }
    ],
    musclesTargeted: { primary: ['Hamstrings (biceps femoris, especially)'], secondary: ['Gastrocnemius'] },
    tempoGuide: '0-0-5-0 (5 second eccentric is the goal)',
    coachingNotes: 'Nordic curls are the #1 exercise for hamstring injury prevention. Research shows they reduce hamstring injuries by up to 51%. Start with partial range and build up.',
    regressions: ['Band-Assisted Nordics', 'Eccentric-Only (catch at bottom)'],
    progressions: ['Full Nordic Curls', 'Weighted Nordic Curls'],
    safetyNotes: ['Progress gradually — these are intense', 'DOMS is normal for the first few sessions']
  },

  // =====================================================
  // REMAINING ARM EXERCISES
  // =====================================================
  'ez-bar-curl': {
    exerciseType: 'accessory',
    purpose: 'The EZ bar curl provides a wrist-friendly grip angle for bicep training. The angled grip reduces wrist and forearm strain compared to straight bar curls.',
    phases: [
      { name: 'Setup', description: 'Grip EZ bar', cues: ['Grip on inner or outer angle', 'Stand tall, elbows at sides', 'Shoulders back'] },
      { name: 'Curl', description: 'Curl with biceps', cues: ['Curl bar up to shoulder level', 'Elbows pinned at sides', 'Squeeze biceps at top', 'Wrists stay neutral'] },
      { name: 'Lower', description: 'Controlled negative', cues: ['Lower slowly — 2-3 seconds', 'Full extension at bottom', 'Maintain tension'] }
    ],
    breathing: { inhale: 'During lowering', exhale: 'During curl' },
    commonMistakes: [
      { mistake: 'Swinging body', correction: 'Stand still — if swinging, go lighter' },
      { mistake: 'Elbows drifting forward', correction: 'Pin elbows to sides throughout' }
    ],
    musclesTargeted: { primary: ['Biceps Brachii', 'Brachialis'], secondary: ['Brachioradialis'] },
    tempoGuide: '2-1-3-0',
    coachingNotes: 'The EZ bar is the best straight-bar alternative if you get wrist pain from barbell curls. Same principles — strict form, controlled negatives.'
  },

  'dumbbell-hammer-curls': {
    exerciseType: 'accessory',
    purpose: 'Hammer curls target the brachialis and brachioradialis with a neutral grip. They build forearm thickness and contribute to overall arm size that bicep curls alone miss.',
    phases: [
      { name: 'Setup', description: 'Neutral grip at sides', cues: ['Dumbbells at sides, thumbs up (neutral)', 'Stand tall, elbows at sides', 'Core braced'] },
      { name: 'Curl', description: 'Hammer curl up', cues: ['Curl with thumbs staying up', 'Elbows pinned to sides', 'Squeeze at the top', 'Alternating or simultaneous'] },
      { name: 'Lower', description: 'Controlled descent', cues: ['Lower slowly — 2-3 seconds', 'Full extension', 'Maintain neutral grip'] }
    ],
    breathing: { inhale: 'During lowering', exhale: 'During curl' },
    commonMistakes: [
      { mistake: 'Rotating wrist during curl', correction: 'Keep neutral grip throughout — thumbs always up' },
      { mistake: 'Swinging dumbbells', correction: 'Strict form — body stays still' }
    ],
    musclesTargeted: { primary: ['Brachialis', 'Brachioradialis'], secondary: ['Biceps Brachii'] },
    tempoGuide: '2-1-2-0',
    coachingNotes: 'The brachialis sits underneath the bicep and pushes it up when developed. Hammer curls build arm thickness that curls alone cannot.'
  },

  'barbell-skull-crushers': {
    exerciseType: 'accessory',
    purpose: 'Skull crushers are the primary barbell tricep isolation exercise. They load the long head of the triceps through a full stretch under tension.',
    phases: [
      { name: 'Setup', description: 'Lying with bar overhead', cues: ['Lie on flat bench', 'EZ bar or straight bar pressed above chest', 'Hands shoulder-width or narrower', 'Elbows pointing at ceiling'] },
      { name: 'Eccentric', description: 'Lower to forehead/behind head', cues: ['Bend elbows — lower bar toward forehead', 'Or lower behind head for more stretch', 'Elbows stay pointing up — dont flare', '2-3 second lowering'] },
      { name: 'Concentric', description: 'Extend back to start', cues: ['Press bar back up with triceps', 'Full lockout', 'Squeeze triceps at top'] }
    ],
    breathing: { inhale: 'During lowering', exhale: 'During extension' },
    commonMistakes: [
      { mistake: 'Elbows flaring out', correction: 'Keep elbows shoulder-width and pointing at ceiling' },
      { mistake: 'Moving from shoulders', correction: 'Only forearms move — upper arms are locked in position' },
      { mistake: 'Too heavy — compromising form', correction: 'Moderate weight, perfect form — this is an isolation exercise' }
    ],
    musclesTargeted: { primary: ['Triceps (all three heads, emphasis on long head)'], secondary: ['Anconeus'] },
    tempoGuide: '1-0-3-0 (extend, lower 3 sec)',
    coachingNotes: 'Skull crushers are the best barbell tricep exercise. Lower behind the head for more long head stretch, to the forehead for more lateral head work.',
    safetyNotes: ['Use EZ bar for wrist comfort', 'Dont go too heavy — elbow safety is paramount']
  },

  'dumbbell-bicep-curl': {
    exerciseType: 'accessory',
    purpose: 'Dumbbell bicep curls allow supination (wrist rotation) during the curl, which fully activates the bicep short head. Independent arms address imbalances.',
    phases: [
      { name: 'Setup', description: 'Dumbbells at sides', cues: ['Stand or sit', 'Dumbbells at sides, palms in', 'Elbows at sides'] },
      { name: 'Curl', description: 'Curl with supination', cues: ['Curl up while rotating palms to face you', 'Squeeze biceps at top', 'Elbows pinned to sides'] },
      { name: 'Lower', description: 'Controlled negative', cues: ['Lower slowly — 2-3 seconds', 'Rotate palms back to neutral at bottom', 'Full extension'] }
    ],
    breathing: { inhale: 'During lowering', exhale: 'During curl' },
    commonMistakes: [
      { mistake: 'No supination — missing the rotation', correction: 'Rotate from palms neutral to palms up during the curl' },
      { mistake: 'Swinging body', correction: 'Stand still — body english means weight is too heavy' }
    ],
    musclesTargeted: { primary: ['Biceps Brachii (especially short head)'], secondary: ['Brachialis', 'Forearms'] },
    tempoGuide: '2-1-3-0',
    coachingNotes: 'The dumbbell curl with supination is the most complete bicep exercise. The rotation activates fibres that straight bar curls miss.'
  },

  'cable-rope-hammer-curl': {
    exerciseType: 'accessory',
    purpose: 'Cable rope hammer curls combine the constant tension of cables with the neutral grip of hammer curls, targeting the brachialis and brachioradialis with no dead spots.',
    phases: [
      { name: 'Setup', description: 'Low cable, rope', cues: ['Rope attachment on low pulley', 'Stand facing cable', 'Neutral grip on rope ends', 'Elbows at sides'] },
      { name: 'Curl', description: 'Hammer curl with rope', cues: ['Curl rope up, keep thumbs up', 'Split rope at top', 'Squeeze', 'Elbows pinned'] },
      { name: 'Lower', description: 'Controlled return', cues: ['Lower slowly — fight cable tension', 'Full extension', 'Maintain neutral grip'] }
    ],
    breathing: { inhale: 'During lowering', exhale: 'During curl' },
    commonMistakes: [
      { mistake: 'Pulling with shoulders', correction: 'Only forearms move — upper arms stay still' },
      { mistake: 'Not splitting rope at top', correction: 'Split the rope for better brachialis contraction' }
    ],
    musclesTargeted: { primary: ['Brachialis', 'Brachioradialis'], secondary: ['Biceps Brachii'] },
    tempoGuide: '2-1-2-0',
    coachingNotes: 'Cable hammer curls are superior to dumbbell hammers for constant tension. The rope allows a natural wrist position and the cable provides resistance throughout.'
  },

  'cable-rope-pushdown': {
    exerciseType: 'accessory',
    purpose: 'Rope pushdowns emphasise the lateral head of the triceps through the pronation at lockout. The rope allows natural wrist movement and a wider extension at the bottom.',
    phases: [
      { name: 'Setup', description: 'High cable, rope', cues: ['Rope on high pulley', 'Grip at the knots', 'Elbows pinned to sides', 'Slight forward lean'] },
      { name: 'Pushdown', description: 'Extend and split', cues: ['Push rope down to full extension', 'Split rope apart at bottom', 'Pronate wrists (turn thumbs out)', 'Squeeze triceps hard'] },
      { name: 'Return', description: 'Controlled return', cues: ['Let rope rise to 90° elbow angle', 'Resist the cable', 'Elbows stay pinned'] }
    ],
    breathing: { inhale: 'During return', exhale: 'During pushdown' },
    commonMistakes: [
      { mistake: 'Not splitting rope at bottom', correction: 'The split is what differentiates rope from bar pushdowns — do it every rep' },
      { mistake: 'Elbows moving', correction: 'Glue elbows to ribs — only forearms move' }
    ],
    musclesTargeted: { primary: ['Triceps (lateral and medial heads)'], secondary: ['Anconeus'] },
    tempoGuide: '1-1-2-0',
    coachingNotes: 'Rope pushdowns with the split at the bottom maximise lateral head contraction. This is how you build the horseshoe tricep shape.'
  },

  // =====================================================
  // REMAINING CORE EXERCISES
  // =====================================================
  'dead-bug': {
    exerciseType: 'assistance',
    purpose: 'The dead bug trains anti-extension core stability. It teaches the core to resist lower back arching while moving the limbs — a fundamental movement pattern for injury prevention.',
    phases: [
      { name: 'Setup', description: 'Lie on back', cues: ['On your back, arms pointing at ceiling', 'Knees at 90° directly above hips', 'Lower back pressed into floor — this is the KEY', 'Core braced'] },
      { name: 'The Movement', description: 'Extend opposite limbs', cues: ['Lower one arm overhead while extending opposite leg', 'Keep lower back glued to floor', 'Move slowly — 2-3 seconds each way', 'Return to start and switch sides'] }
    ],
    breathing: { inhale: 'At the start position', exhale: 'As you extend the limbs' },
    commonMistakes: [
      { mistake: 'Lower back arching off floor', correction: 'Press lower back into floor HARD — if it lifts, reduce range of motion' },
      { mistake: 'Moving too fast', correction: 'Slow controlled reps — speed defeats the purpose' }
    ],
    musclesTargeted: { primary: ['Transverse Abdominis', 'Rectus Abdominis'], secondary: ['Hip Flexors', 'Obliques'] },
    tempoGuide: '2-0-2-0 (2 sec extend, 2 sec return)',
    coachingNotes: 'The dead bug is the most underrated core exercise. If your lower back arches when you extend your limbs, your core stability needs work. This exercise fixes that.'
  },

  'side-plank': {
    exerciseType: 'assistance',
    purpose: 'Side planks develop lateral core stability and oblique endurance. They train the core to resist lateral flexion — essential for spinal health and athletic performance.',
    phases: [
      { name: 'Setup', description: 'Side-lying position', cues: ['Forearm on floor, elbow under shoulder', 'Feet stacked or staggered', 'Lift hips to create straight line', 'Top arm on hip or extended'] },
      { name: 'The Hold', description: 'Maintain position', cues: ['Keep hips high — dont let them sag', 'Straight line from head to feet', 'Squeeze obliques and glutes', 'Breathe steadily'] }
    ],
    breathing: { inhale: 'Steady through nose', exhale: 'Controlled while maintaining brace' },
    commonMistakes: [
      { mistake: 'Hips dropping', correction: 'Squeeze glutes and obliques harder — shorter hold with perfect form is better' },
      { mistake: 'Rolling forward or backward', correction: 'Stack shoulders and hips — stay in the frontal plane' }
    ],
    musclesTargeted: { primary: ['Obliques', 'Quadratus Lumborum'], secondary: ['Glutes', 'Transverse Abdominis', 'Shoulders'] },
    tempoGuide: 'Hold for prescribed time with perfect form',
    coachingNotes: 'The side plank trains what most core exercises miss — lateral stability. If you only train sagittal plane (crunches, planks), youre leaving gaps in your core armour.'
  },

  'farmers-walk': {
    exerciseType: 'accessory',
    purpose: 'Farmers walks build total-body stability, grip strength, and loaded carry capacity. They train the core anti-laterally, develop traps, and build mental toughness under load.',
    phases: [
      { name: 'Setup', description: 'Pick up heavy weights', cues: ['Heavy dumbbells or farmers handles', 'Deadlift them up with good form', 'Stand tall, shoulders back', 'Core braced, eyes ahead'] },
      { name: 'The Walk', description: 'Walk with control', cues: ['Short quick steps', 'Stay tall — dont lean or bend', 'Shoulders back and down', 'Grip hard — dont let them slip', 'Walk for distance or time'] }
    ],
    breathing: { inhale: 'Steady breathing throughout', exhale: 'Controlled — dont hold breath' },
    commonMistakes: [
      { mistake: 'Leaning to one side', correction: 'Stay perfectly upright — core engagement is the key' },
      { mistake: 'Taking big steps', correction: 'Short quick steps for stability' },
      { mistake: 'Looking down', correction: 'Eyes ahead, chest up' }
    ],
    musclesTargeted: { primary: ['Core', 'Trapezius', 'Forearms'], secondary: ['Shoulders', 'Quadriceps', 'Glutes', 'Erectors'] },
    tempoGuide: 'Walk for 30-60 seconds or 40-60m per set',
    coachingNotes: 'Farmers walks train everything at once. Grip, core, traps, posture, mental toughness. If you had to pick one exercise for real-world strength, this might be it.'
  },

  'hollow-body-hold': {
    exerciseType: 'assistance',
    purpose: 'The hollow body hold is a gymnastic core exercise that builds total anterior chain tension. It teaches global body tension and anti-extension — the foundation of gymnastics strength.',
    phases: [
      { name: 'Setup', description: 'Lie on back', cues: ['On your back, lower back pressed to floor', 'Arms overhead, biceps by ears', 'Legs straight, toes pointed', 'Press everything together'] },
      { name: 'The Hold', description: 'Create the hollow shape', cues: ['Lift shoulders and legs off floor slightly', 'Lower back stays glued to floor', 'Body forms a shallow dish shape', 'Squeeze everything — abs, quads, glutes'] }
    ],
    breathing: { inhale: 'Short controlled breaths', exhale: 'While maintaining tension' },
    commonMistakes: [
      { mistake: 'Lower back arching', correction: 'Press lower back into floor — if it lifts, bring arms/legs higher' },
      { mistake: 'Holding breath', correction: 'Breathe while maintaining tension — thats the skill' }
    ],
    musclesTargeted: { primary: ['Rectus Abdominis', 'Transverse Abdominis'], secondary: ['Hip Flexors', 'Quads', 'Obliques'] },
    tempoGuide: 'Hold for 20-60 seconds',
    coachingNotes: 'The hollow hold is arguably the most important core position. It transfers to every gymnastic movement and teaches total body tension. Master this and every other core exercise becomes easier.'
  },

  'mountain-climbers': {
    exerciseType: 'conditioning',
    purpose: 'Mountain climbers combine core stability with cardio conditioning. They train anti-extension under dynamic load while elevating heart rate.',
    phases: [
      { name: 'Setup', description: 'Push-up position', cues: ['Hands under shoulders', 'Body straight — plank position', 'Core braced'] },
      { name: 'The Climb', description: 'Alternate knee drives', cues: ['Drive one knee toward chest', 'Quick switch — opposite knee in', 'Hips stay level — dont pike up', 'Fast pace for conditioning'] }
    ],
    breathing: { inhale: 'Every 2-3 strides', exhale: 'Every 2-3 strides' },
    commonMistakes: [
      { mistake: 'Hips bouncing up and down', correction: 'Keep hips level with shoulders — plank position maintained' },
      { mistake: 'Hands creeping forward', correction: 'Hands stay under shoulders' }
    ],
    musclesTargeted: { primary: ['Core', 'Hip Flexors'], secondary: ['Shoulders', 'Quadriceps', 'Cardiovascular System'] },
    tempoGuide: 'Fast pace for 20-40 seconds per set',
    coachingNotes: 'Mountain climbers are a core exercise disguised as cardio. If your hips are bouncing, slow down and own the plank position first.'
  },

  'v-ups': {
    exerciseType: 'accessory',
    purpose: 'V-ups are an advanced ab exercise that simultaneously targets upper and lower rectus abdominis. The full-body crunch creates peak contraction at the V shape meeting point.',
    phases: [
      { name: 'Setup', description: 'Flat on back', cues: ['Lie flat, arms overhead, legs extended', 'Everything touching floor at start'] },
      { name: 'The V', description: 'Fold body in half', cues: ['Simultaneously raise arms and legs', 'Touch fingers to toes at the top', 'Form a V shape at peak', 'Keep arms and legs straight'] },
      { name: 'The Return', description: 'Lower back to start', cues: ['Lower both halves slowly', 'Dont let shoulders or feet crash down', 'Control throughout'] }
    ],
    breathing: { inhale: 'At the flat start position', exhale: 'As you fold into the V' },
    commonMistakes: [
      { mistake: 'Bending knees', correction: 'Legs stay straight — if too hard, do tuck-ups instead' },
      { mistake: 'Using momentum', correction: 'Control both the up and down — no bouncing' }
    ],
    musclesTargeted: { primary: ['Rectus Abdominis'], secondary: ['Hip Flexors', 'Obliques'] },
    tempoGuide: '1-0-2-0 (fold up, controlled 2-sec lower)',
    coachingNotes: 'V-ups are a challenging progression from standard crunches. If you cant do them with straight legs, start with tucked knees and gradually extend.'
  },

  'ab-crunch-machine': {
    exerciseType: 'accessory',
    purpose: 'The ab crunch machine provides loaded spinal flexion with back support. It allows progressive overload of the abs in a safe, guided movement.',
    phases: [
      { name: 'Setup', description: 'Adjust machine', cues: ['Adjust chest pad position', 'Grip handles or place forearms on pads', 'Feet on floor or foot pads', 'Upright start position'] },
      { name: 'The Crunch', description: 'Flex through the abs', cues: ['Curl ribs toward hips — spine flexion', 'Lead with abs, not arms', 'Squeeze at full contraction', 'Hold 1 second'] },
      { name: 'Return', description: 'Controlled extension', cues: ['Return slowly — 2 seconds', 'Dont fully release tension', 'Stop before fully upright'] }
    ],
    breathing: { inhale: 'At start position', exhale: 'During the crunch' },
    commonMistakes: [
      { mistake: 'Using hip flexors — hinging at hips', correction: 'Flex the SPINE — ribs to hips, not hips to thighs' },
      { mistake: 'Going too heavy', correction: 'Moderate weight, controlled reps, full squeeze' }
    ],
    musclesTargeted: { primary: ['Rectus Abdominis'], secondary: ['Obliques'] },
    tempoGuide: '1-1-2-0',
    coachingNotes: 'The ab machine is simple and effective for progressive overload. Just make sure youre flexing the spine, not hinging at the hips.'
  },

  // =====================================================
  // REMAINING GLUTE EXERCISES
  // =====================================================
  'cable-hip-abduction': {
    exerciseType: 'accessory',
    purpose: 'Cable hip abduction targets the gluteus medius and minimus — the muscles responsible for hip stability. Weak hip abductors cause knee caving, poor balance, and increased injury risk.',
    phases: [
      { name: 'Setup', description: 'Ankle strap on low cable', cues: ['Ankle strap on far leg', 'Stand sideways to cable', 'Hold machine for balance', 'Standing leg slightly bent'] },
      { name: 'The Abduction', description: 'Lead leg outward', cues: ['Drive leg outward away from cable', 'Lead with heel', 'Keep hips square — dont lean away', 'Squeeze glute med at peak'] },
      { name: 'Return', description: 'Controlled return', cues: ['Return leg slowly', 'Resist cable throughout', 'Dont let foot swing back'] }
    ],
    breathing: { inhale: 'During return', exhale: 'During abduction' },
    commonMistakes: [
      { mistake: 'Leaning away from cable', correction: 'Stay upright — the glute med does the work, not momentum' },
      { mistake: 'Rotating the hip', correction: 'Keep hips square — pure abduction, no rotation' }
    ],
    musclesTargeted: { primary: ['Gluteus Medius', 'Gluteus Minimus'], secondary: ['Tensor Fasciae Latae'] },
    tempoGuide: '2-1-2-0',
    coachingNotes: 'Hip abduction strength is essential for knee health and athletic performance. If your knees cave during squats, these need to be in your programme.'
  },

  'machine-hip-abduction': {
    exerciseType: 'accessory',
    purpose: 'The machine hip abduction isolates the gluteus medius and hip abductors with a fixed path. Simple to use and effective for building hip stability and glute shaping.',
    phases: [
      { name: 'Setup', description: 'Sit in machine', cues: ['Sit with back against pad', 'Legs inside pads, feet on footrests', 'Start with legs together'] },
      { name: 'Abduction', description: 'Push legs apart', cues: ['Press legs outward against pads', 'Squeeze glutes at widest point', 'Hold 1-2 seconds', 'Controlled movement'] },
      { name: 'Return', description: 'Controlled return', cues: ['Let legs come back slowly', 'Resist the pads', 'Dont let weights crash'] }
    ],
    breathing: { inhale: 'As legs return', exhale: 'As you push apart' },
    commonMistakes: [
      { mistake: 'Using momentum — bouncing', correction: 'Slow controlled reps with a hold at peak' },
      { mistake: 'Leaning forward', correction: 'Stay upright against back pad' }
    ],
    musclesTargeted: { primary: ['Gluteus Medius', 'Gluteus Minimus'], secondary: ['Tensor Fasciae Latae', 'Piriformis'] },
    tempoGuide: '1-2-2-0',
    coachingNotes: 'The hip abduction machine is simple and effective. Use higher reps (15-25) and focus on the squeeze. Your glutes should burn.'
  },

  'machine-glute-kickback': {
    exerciseType: 'accessory',
    purpose: 'The machine glute kickback provides a guided hip extension for isolated glute max work. The fixed path allows focus on the contraction without balance concerns.',
    phases: [
      { name: 'Setup', description: 'Position on machine', cues: ['Stand on platform, grip handles', 'Place foot on kick pad', 'Slight forward lean'] },
      { name: 'Kickback', description: 'Drive leg back', cues: ['Press foot pad back through hip extension', 'Squeeze glute hard at full extension', 'Dont hyperextend lower back', 'Hold contraction 1 second'] },
      { name: 'Return', description: 'Controlled return', cues: ['Bring leg forward slowly', 'Maintain glute tension', 'Dont let weight crash'] }
    ],
    breathing: { inhale: 'During return', exhale: 'During kickback' },
    commonMistakes: [
      { mistake: 'Hyperextending lower back', correction: 'Movement is at the hip — keep spine neutral' },
      { mistake: 'Using momentum', correction: 'Slow controlled reps with squeeze at top' }
    ],
    musclesTargeted: { primary: ['Gluteus Maximus'], secondary: ['Hamstrings'] },
    tempoGuide: '2-2-2-0',
    coachingNotes: 'Machine kickbacks are a targeted glute finisher. Use moderate weight, slow reps, and really squeeze at peak contraction. If you cant feel your glute, the weight is too heavy.'
  },

  'donkey-kicks': {
    exerciseType: 'assistance',
    purpose: 'Donkey kicks are a bodyweight glute activation exercise. They target the gluteus maximus through hip extension from a quadruped position.',
    phases: [
      { name: 'Setup', description: 'On all fours', cues: ['Hands under shoulders, knees under hips', 'Core braced, back flat', 'Knee at 90°'] },
      { name: 'The Kick', description: 'Drive heel to ceiling', cues: ['Keep knee at 90°', 'Drive foot toward ceiling', 'Squeeze glute at top', 'Dont arch lower back'] },
      { name: 'Return', description: 'Lower back to start', cues: ['Lower slowly', 'Knee returns to start position', 'Dont touch floor — hover and repeat'] }
    ],
    breathing: { inhale: 'During return', exhale: 'During kick' },
    commonMistakes: [
      { mistake: 'Arching the back', correction: 'Keep core braced — movement is ONLY at the hip' },
      { mistake: 'Rushing reps', correction: 'Squeeze at the top of each rep — feel the glute working' }
    ],
    musclesTargeted: { primary: ['Gluteus Maximus'], secondary: ['Hamstrings', 'Core'] },
    tempoGuide: '1-2-1-0 (kick, squeeze 2 sec, lower)',
    coachingNotes: 'Donkey kicks are a simple but effective glute activation exercise. Perfect for warm-ups or high-rep burnouts. Quality over quantity — squeeze every rep.'
  },

  'clamshells': {
    exerciseType: 'assistance',
    purpose: 'Clamshells target the gluteus medius and external rotators of the hip. They are a foundational exercise for hip stability, knee health, and glute activation.',
    phases: [
      { name: 'Setup', description: 'Side-lying position', cues: ['Lie on side, knees bent at 45°', 'Feet together, hips stacked', 'Head resting on bottom arm', 'Core engaged'] },
      { name: 'The Open', description: 'Rotate top knee upward', cues: ['Keep feet together', 'Lift top knee as high as possible', 'Dont let hips roll back', 'Squeeze glute at top'] },
      { name: 'Return', description: 'Lower slowly', cues: ['Lower knee slowly — 2 seconds', 'Maintain hip stack', 'Dont collapse'] }
    ],
    breathing: { inhale: 'During lowering', exhale: 'During opening' },
    commonMistakes: [
      { mistake: 'Rolling hips backward', correction: 'Stack hips directly on top of each other — no rolling' },
      { mistake: 'Moving too fast', correction: 'Slow controlled reps — squeeze at top' }
    ],
    musclesTargeted: { primary: ['Gluteus Medius', 'External Rotators'], secondary: ['Gluteus Minimus', 'Piriformis'] },
    tempoGuide: '1-2-2-0',
    coachingNotes: 'Clamshells are essential rehab and prehab. Physiotherapists prescribe them for a reason — they fix the root cause of knee caving and hip instability. Add a band for progression.'
  },

  // =====================================================
  // ADDITIONAL COMPOUND MOVEMENTS
  // =====================================================
  'dumbbell-step-ups': {
    exerciseType: 'accessory',
    purpose: 'Step-ups develop unilateral leg strength, balance, and power. They closely mimic real-world activities like climbing and have excellent transfer to athletic performance.',
    phases: [
      { name: 'Setup', description: 'Face a box or bench', cues: ['Dumbbells at sides', 'One foot flat on box — entire foot', 'Box height at knee level or below', 'Stand tall'] },
      { name: 'The Step', description: 'Drive up through front foot', cues: ['Push through front heel — dont push off back foot', 'Stand fully on top of box', 'Full hip extension at top', 'Controlled and deliberate'] },
      { name: 'The Lower', description: 'Step back down', cues: ['Lower slowly with front leg', 'Control the descent', 'Touch back foot to floor lightly', 'Maintain balance'] }
    ],
    breathing: { inhale: 'Before stepping up', exhale: 'As you drive up' },
    commonMistakes: [
      { mistake: 'Pushing off the back foot', correction: 'All drive comes from the elevated foot — the back foot just lifts' },
      { mistake: 'Box too high — cant control', correction: 'Start at knee height or lower and progress' }
    ],
    musclesTargeted: { primary: ['Quadriceps', 'Glutes'], secondary: ['Hamstrings', 'Core'] },
    tempoGuide: '1-0-2-0 (drive up, controlled 2-sec lower)',
    coachingNotes: 'Step-ups are one of the most functional exercises. The key is not pushing off the back foot — make the front leg do all the work.'
  },

  'pike-push-ups': {
    exerciseType: 'assistance',
    purpose: 'Pike push-ups are a bodyweight overhead pressing progression. They develop shoulder strength and prepare the body for handstand push-ups.',
    phases: [
      { name: 'Setup', description: 'Downward dog position', cues: ['Hands on floor, hips high — inverted V', 'Feet close to hands for steeper angle', 'Arms shoulder-width', 'Head between arms'] },
      { name: 'Lower', description: 'Lower head toward floor', cues: ['Bend elbows — lower head toward floor', 'Head goes slightly in front of hands', 'Elbows at 45°', 'Lower until head nearly touches'] },
      { name: 'Press', description: 'Push back up', cues: ['Press back to start', 'Full elbow extension', 'Return to inverted V'] }
    ],
    breathing: { inhale: 'During lowering', exhale: 'During press' },
    commonMistakes: [
      { mistake: 'Hips too low — becomes push-up', correction: 'Keep hips HIGH — the more vertical you are, the more shoulder work' },
      { mistake: 'Head going straight down', correction: 'Head goes slightly forward, then back — like a J-curve' }
    ],
    musclesTargeted: { primary: ['Anterior Deltoids', 'Lateral Deltoids', 'Triceps'], secondary: ['Upper Chest', 'Core'] },
    tempoGuide: '2-0-1-0',
    coachingNotes: 'Pike push-ups bridge the gap between push-ups and handstand push-ups. Elevate feet on a box to increase difficulty.'
  },

  'push-press': {
    exerciseType: 'primary_lift',
    purpose: 'The push press uses leg drive to get heavier loads overhead. It develops explosive power transfer from legs through the core to the shoulders and builds heavy overhead lockout strength.',
    phases: [
      { name: 'Setup', description: 'Front rack position', cues: ['Bar on front delts', 'Feet hip-width', 'Elbows slightly in front', 'Core braced'] },
      { name: 'The Dip', description: 'Quick knee bend', cues: ['Quick dip — bend knees 3-4 inches', 'Torso stays vertical — dont lean forward', 'Weight stays mid-foot'] },
      { name: 'The Drive', description: 'Explosive leg drive to press', cues: ['Explosively extend legs', 'Transfer momentum into the bar', 'Press through to full lockout', 'Lock out with bar over mid-foot'] }
    ],
    breathing: { inhale: 'Before the dip', exhale: 'During the drive and press', brace: 'Full brace before the dip' },
    commonMistakes: [
      { mistake: 'Dipping forward', correction: 'Vertical dip — knees forward, torso stays upright' },
      { mistake: 'Dip too deep — becomes a thruster', correction: '3-4 inches is enough — quick and explosive' },
      { mistake: 'No lockout', correction: 'Full overhead lockout with active shoulders' }
    ],
    musclesTargeted: { primary: ['Anterior Deltoids', 'Triceps', 'Quadriceps'], secondary: ['Upper Chest', 'Core', 'Glutes'] },
    tempoGuide: 'Quick dip, explosive drive, controlled lower',
    coachingNotes: 'The push press lets you handle 20-30% more weight than strict press. The skill is the timing of the dip-drive — practice it with light weight until its automatic.'
  },

  'machine-preacher-curl': {
    exerciseType: 'accessory',
    purpose: 'Machine preacher curls provide strict bicep isolation with a fixed path. The pad eliminates cheating, making every rep a pure bicep contraction.',
    phases: [
      { name: 'Setup', description: 'Adjust seat and pad', cues: ['Armpits rest on top of pad', 'Arms fully extended at start', 'Grip handles', 'Back straight'] },
      { name: 'Curl', description: 'Curl to full contraction', cues: ['Curl handles toward face', 'Squeeze biceps hard at top', 'Hold 1 second', 'Elbows stay on pad'] },
      { name: 'Lower', description: 'Slow eccentric', cues: ['Lower slowly — 3 seconds', 'Full extension at bottom', 'Dont let weights crash'] }
    ],
    breathing: { inhale: 'During lowering', exhale: 'During curl' },
    commonMistakes: [
      { mistake: 'Lifting elbows off pad', correction: 'Elbows stay pinned — thats the whole point of the preacher position' },
      { mistake: 'Partial reps', correction: 'Full extension at bottom, full curl at top' }
    ],
    musclesTargeted: { primary: ['Biceps Brachii (especially short head)'], secondary: ['Brachialis'] },
    tempoGuide: '2-1-3-0',
    coachingNotes: 'The preacher machine is the strictest bicep exercise. No swinging, no cheating. Use moderate weight and chase the burn.'
  },

  'barbell-pullover': {
    exerciseType: 'accessory',
    purpose: 'The barbell pullover stretches the chest and lats through a massive overhead arc. It\'s an old-school movement that expands the ribcage and develops both the chest and the lats depending on arm bend. Slight bend = more chest, straighter arms = more lats.',
    phases: [
      { name: 'Setup', description: 'Lie across or along a flat bench', cues: ['Lie flat or across bench with upper back supported', 'Hold barbell with narrow grip above chest', 'Slight bend in elbows — lock this angle', 'Feet flat on floor, core engaged'] },
      { name: 'The Arc (Lowering)', description: 'Lower bar behind head in a controlled arc', cues: ['Lower bar behind head in a sweeping arc', 'Feel deep stretch through chest and lats', 'Stop when arms are roughly in line with ears', 'Maintain the elbow bend — don\'t straighten'] },
      { name: 'The Pull (Return)', description: 'Pull bar back over chest', cues: ['Pull bar back over chest using the same arc', 'Squeeze the chest as bar returns to start', 'Control throughout — no swinging', 'Don\'t let bar go past chest level at top'] }
    ],
    breathing: { inhale: 'As bar goes behind your head — big rib-expanding breath', exhale: 'As you pull the bar back over your chest' },
    commonMistakes: [
      { mistake: 'Going too deep — shoulder strain', correction: 'Only go as far as comfortable — build range over time' },
      { mistake: 'Straightening arms — turns into lat focus', correction: 'Maintain slight elbow bend for chest emphasis' },
      { mistake: 'Using too much weight', correction: 'This is a stretch and squeeze exercise — moderate weight, full range' },
      { mistake: 'Lifting hips off bench', correction: 'Keep hips down if lying flat, or brace core if lying across bench' }
    ],
    musclesTargeted: { primary: ['Pectoralis Major', 'Latissimus Dorsi'], secondary: ['Serratus Anterior', 'Triceps (long head)'] },
    tempoGuide: '3-1-2-0 (slow arc back, brief stretch, controlled return)',
    coachingNotes: 'The pullover is a classic chest expander that Arnold swore by. It stretches the ribcage and hits muscles other pressing movements can\'t reach. Give it a go at the end of your chest session.',
    loadGuidelines: { technique: 'Light load, focus on the stretch and breathing', hypertrophy: 'Moderate load, 10-15 reps, full stretch', strength: 'Not typically used for maximal strength work' },
    regressions: ['Dumbbell Pullover', 'Cable Pullover'],
    progressions: ['Straight Arm Pullover (more lat focus)', 'Decline Barbell Pullover'],
    safetyNotes: ['Start light to assess shoulder flexibility', 'Stop if sharp shoulder pain occurs', 'Control the bar at all times — it\'s behind your head'],
    loggingInstructions: ['Log barbell weight in kg', 'Log total sets and reps', 'Note RPE and any shoulder discomfort']
  },

  'decline-dumbbell-bench-press': {
    exerciseType: 'accessory',
    purpose: 'The decline dumbbell press targets the lower chest with the added benefit of independent arm movement. Dumbbells allow a deeper stretch and natural wrist rotation compared to the barbell version.',
    phases: [
      { name: 'Setup', description: 'Position on decline bench with dumbbells', cues: ['Hook feet under pads securely', 'Start with dumbbells pressed above lower chest', 'Palms facing forward or slightly rotated', 'Shoulder blades retracted'] },
      { name: 'Eccentric (Lowering)', description: 'Lower to deep chest stretch', cues: ['Lower dumbbells to outer lower chest', 'Elbows at 45-60° from torso', 'Control the descent — 2-3 seconds', 'Feel the lower chest stretch'] },
      { name: 'Concentric (Pressing)', description: 'Press back to start', cues: ['Drive dumbbells up and slightly inward', 'Squeeze chest at top', 'Don\'t clang dumbbells together', 'Full lockout'] }
    ],
    breathing: { inhale: 'During the lowering phase', exhale: 'As you press up' },
    commonMistakes: [
      { mistake: 'Feet not secured — sliding', correction: 'Lock feet under pads before getting dumbbells in position' },
      { mistake: 'Not going deep enough', correction: 'Use the extra range dumbbells allow — deeper stretch means more growth' },
      { mistake: 'Arms flaring too wide', correction: 'Keep elbows at 45-60° for safe, effective pressing' }
    ],
    musclesTargeted: { primary: ['Lower Pectoralis Major', 'Triceps'], secondary: ['Anterior Deltoids'] },
    tempoGuide: '2-1-1-0',
    coachingNotes: 'Decline dumbbells give you the lower chest focus of decline bench with the freedom of dumbbells. Use them when you want extra stretch at the bottom of each rep.',
    loadGuidelines: { technique: 'Light load, learn the decline position with dumbbells', hypertrophy: '8-12 reps, moderate load', strength: '6-8 reps, heavier dumbbells' },
    regressions: ['High-to-Low Cable Flyes', 'Machine Chest Press'],
    progressions: ['Decline Barbell Bench Press', 'Weighted Dips'],
    safetyNotes: ['Secure feet before handling dumbbells', 'Have a spotter help hand you the dumbbells if heavy', 'Sit up between sets to avoid blood rush'],
    loggingInstructions: ['Log dumbbell weight in kg (per hand)', 'Log total sets and reps', 'Note RPE per set']
  },

  'dumbbell-squeeze-press': {
    exerciseType: 'accessory',
    purpose: 'The squeeze press keeps the dumbbells pressed together throughout the movement, creating constant inner chest tension. It\'s a class hypertrophy tool for building the chest line and inner pec thickness. Dead simple, brutally effective.',
    phases: [
      { name: 'Setup', description: 'Dumbbells pressed together above chest', cues: ['Lie flat on bench', 'Dumbbells touching with palms facing each other (neutral grip)', 'Press dumbbells hard into each other — maintain this force throughout', 'Shoulder blades retracted'] },
      { name: 'Eccentric (Lowering)', description: 'Lower while maintaining squeeze', cues: ['Lower dumbbells to chest while pressing them together', 'Elbows stay relatively close to body', '2-3 second controlled descent', 'The squeeze pressure never stops'] },
      { name: 'Concentric (Pressing)', description: 'Press up, still squeezing', cues: ['Press dumbbells back up while maintaining the squeeze', 'Full lockout at top', 'Inner chest should be burning', 'Keep the inward force constant'] }
    ],
    breathing: { inhale: 'During the lowering phase', exhale: 'As you press up' },
    commonMistakes: [
      { mistake: 'Losing the squeeze — dumbbells separate', correction: 'The whole point is pressing them together. If they separate, you\'re missing the exercise' },
      { mistake: 'Going too heavy', correction: 'This is about constant tension, not load. Moderate weight with a fierce squeeze' },
      { mistake: 'Turning it into a regular press', correction: 'Keep the inward force — think about crushing the dumbbells together' }
    ],
    musclesTargeted: { primary: ['Pectoralis Major (inner/sternal)', 'Triceps'], secondary: ['Anterior Deltoids'] },
    tempoGuide: '2-1-1-0',
    coachingNotes: 'The squeeze press is one of the best inner chest exercises going. Keep those dumbbells pressed into each other like your life depends on it. You\'ll feel every fibre working.',
    loadGuidelines: { technique: 'Light load, master the constant squeeze', hypertrophy: '10-15 reps, moderate load, constant tension', strength: 'Not typically used for max strength' },
    regressions: ['Cable Crossover', 'Pec Deck Machine'],
    progressions: ['Squeeze Press with pause at bottom', 'Incline Squeeze Press'],
    safetyNotes: ['Keep wrists neutral to avoid strain', 'Stop if inner chest or shoulder feels wrong'],
    loggingInstructions: ['Log dumbbell weight in kg (per hand)', 'Log total sets and reps', 'Note RPE per set']
  },

  'single-arm-dumbbell-press': {
    exerciseType: 'accessory',
    purpose: 'The single-arm dumbbell press develops unilateral pressing strength and serious core anti-rotation stability. Pressing one arm at a time exposes and fixes imbalances between sides. Your core has to work overtime to stop you rolling off the bench.',
    phases: [
      { name: 'Setup', description: 'One dumbbell, one arm', cues: ['Lie flat on bench, one dumbbell pressed above chest', 'Other hand grips bench edge or rests on body', 'Feet wide on floor for stability', 'Core braced hard — resist the rotation'] },
      { name: 'Eccentric (Lowering)', description: 'Lower with anti-rotation', cues: ['Lower dumbbell to chest — 2-3 seconds', 'Fight the rotation — don\'t let your body twist', 'Elbow at 45° from torso', 'Keep hips and shoulders level'] },
      { name: 'Concentric (Pressing)', description: 'Press with full-body stability', cues: ['Press dumbbell back to start', 'Maintain level shoulders and hips', 'Full lockout', 'Control throughout'] }
    ],
    breathing: { inhale: 'During the lowering phase', exhale: 'As you press up' },
    commonMistakes: [
      { mistake: 'Rotating toward the working side', correction: 'Stay level — the anti-rotation is half the exercise' },
      { mistake: 'Not bracing the core', correction: 'Brace hard before every rep. No brace, no stability' },
      { mistake: 'Going too heavy too soon', correction: 'Start lighter than you think — the stability demand is real' }
    ],
    musclesTargeted: { primary: ['Pectoralis Major', 'Anterior Deltoids', 'Triceps'], secondary: ['Core (anti-rotation)', 'Obliques'] },
    tempoGuide: '2-1-1-0',
    coachingNotes: 'Single-arm pressing is brilliant for finding weak links. If one side is noticeably weaker, use this to bring it up. Always start with your weaker side.',
    loadGuidelines: { technique: 'Light load, master the anti-rotation', hypertrophy: '8-12 reps each side, moderate load', strength: '5-8 reps each side' },
    regressions: ['Flat Dumbbell Bench Press (both arms)', 'Push Ups'],
    progressions: ['Single Arm Floor Press', 'Alternating Dumbbell Press'],
    safetyNotes: ['Use a weight you can fully control', 'Wide foot base is essential for stability', 'Stop if lower back compensates'],
    loggingInstructions: ['Log dumbbell weight in kg', 'Log total sets and reps per side', 'Note any side-to-side imbalance']
  },

  'wide-push-ups': {
    exerciseType: 'assistance',
    purpose: 'Wide push-ups shift the emphasis from triceps to the outer chest by increasing the stretch at the bottom. The wider hand placement forces the pecs to work harder through a longer lever arm. Simple, effective, no equipment needed.',
    phases: [
      { name: 'Setup', description: 'Wide hand placement', cues: ['Hands 1.5x shoulder width apart', 'Body in a rigid straight line', 'Core braced, glutes squeezed', 'Fingers spread, pointing forward'] },
      { name: 'Eccentric (Lowering)', description: 'Lower chest to floor', cues: ['Lower slowly — chest toward the floor', 'Feel the chest stretch at the bottom', 'Elbows bend outward naturally', 'Full depth — chest nearly touches floor'] },
      { name: 'Concentric (Pressing)', description: 'Push back to start', cues: ['Push the floor away', 'Squeeze chest at the top', 'Full arm extension', 'Maintain rigid body line'] }
    ],
    breathing: { inhale: 'During the lowering', exhale: 'As you push up' },
    commonMistakes: [
      { mistake: 'Hands too wide — shoulder pain', correction: 'About 1.5x shoulder width is enough. Ultra-wide stresses shoulders' },
      { mistake: 'Hips sagging', correction: 'Squeeze glutes and brace core — body stays straight' },
      { mistake: 'Partial reps', correction: 'Full depth. If you can\'t go all the way down, elevate your hands' }
    ],
    musclesTargeted: { primary: ['Pectoralis Major (outer/sternal)', 'Anterior Deltoids'], secondary: ['Triceps', 'Core'] },
    tempoGuide: '2-0-1-0',
    coachingNotes: 'Wide push-ups are dead simple but effective for targeting the outer chest. If standard push-ups feel too tricep-heavy, widen the stance and feel the pecs work.',
    regressions: ['Standard Push Ups', 'Incline Wide Push Ups'],
    progressions: ['Weighted Wide Push Ups (plate on back)', 'Archer Push Ups'],
    safetyNotes: ['Don\'t go ultra-wide — find the point where you feel chest stretch without shoulder pinching'],
    loggingInstructions: ['Log total sets and reps', 'Note RPE per set']
  },

  'decline-push-ups': {
    exerciseType: 'assistance',
    purpose: 'Decline push-ups elevate the feet to shift more load onto the upper chest and shoulders. It\'s the bodyweight equivalent of an incline press — no bench required. Brilliant for home training or as a finisher.',
    phases: [
      { name: 'Setup', description: 'Feet elevated on bench or box', cues: ['Hands on floor, shoulder-width', 'Feet on a bench, box, or step', 'Body in straight line from heels to head', 'Core braced, glutes tight'] },
      { name: 'Eccentric (Lowering)', description: 'Lower with control', cues: ['Lower chest toward the floor', 'Elbows at 45° from torso', 'Full depth — nose nearly touches floor', 'Controlled 2-second descent'] },
      { name: 'Concentric (Pressing)', description: 'Push back up', cues: ['Drive through palms', 'Full lockout', 'Maintain body line throughout', 'Don\'t pike at the hips'] }
    ],
    breathing: { inhale: 'During the lowering', exhale: 'As you press up' },
    commonMistakes: [
      { mistake: 'Hips piking up', correction: 'Keep body in a straight line — if piking, the height might be too much' },
      { mistake: 'Not going deep enough', correction: 'Full range of motion — nose to floor' },
      { mistake: 'Box too high for ability level', correction: 'Start with a low step and progress height over time' }
    ],
    musclesTargeted: { primary: ['Upper Pectoralis Major', 'Anterior Deltoids', 'Triceps'], secondary: ['Core', 'Serratus Anterior'] },
    tempoGuide: '2-0-1-0',
    coachingNotes: 'Higher feet = more upper chest and shoulder work. Start with a low box and progress. These are a proper upper chest builder when done right.',
    regressions: ['Standard Push Ups', 'Incline Dumbbell Press'],
    progressions: ['Feet on stability ball', 'Deficit Decline Push Ups (hands on plates)'],
    safetyNotes: ['Ensure the surface under your feet is stable', 'Progress height gradually'],
    loggingInstructions: ['Log total sets and reps', 'Note elevation height', 'Note RPE']
  },

  'incline-push-ups': {
    exerciseType: 'assistance',
    purpose: 'Incline push-ups elevate the hands to make the push-up easier, making it the ideal regression for beginners. It also shifts emphasis slightly toward the lower chest. Start here and progress to floor push-ups as you get stronger.',
    phases: [
      { name: 'Setup', description: 'Hands elevated on bench, box, or wall', cues: ['Hands on elevated surface, shoulder-width', 'Body in straight line from head to heels', 'Core braced, glutes tight', 'The higher the surface, the easier it is'] },
      { name: 'Eccentric (Lowering)', description: 'Lower chest to surface', cues: ['Lower chest toward the elevated surface', 'Elbows at 45° from torso', 'Full depth — chest touches or nearly touches', 'Controlled descent'] },
      { name: 'Concentric (Pressing)', description: 'Push back to start', cues: ['Press through palms', 'Full lockout at top', 'Maintain straight body line', 'Squeeze chest at top'] }
    ],
    breathing: { inhale: 'During the lowering', exhale: 'As you press up' },
    commonMistakes: [
      { mistake: 'Hips sagging', correction: 'Squeeze glutes and core — body stays rigid even on the incline' },
      { mistake: 'Partial reps', correction: 'Full range — chest to surface on every rep' },
      { mistake: 'Picking a surface that\'s too easy', correction: 'Progress to lower surfaces as you get stronger — the goal is eventually the floor' }
    ],
    musclesTargeted: { primary: ['Pectoralis Major', 'Triceps'], secondary: ['Anterior Deltoids', 'Core'] },
    tempoGuide: '2-0-1-0',
    coachingNotes: 'Incline push-ups are the starting point for pressing strength. No shame in starting high — even on a wall. Lower the surface progressively until you own the floor.',
    regressions: ['Wall Push Ups'],
    progressions: ['Standard Push Ups', 'Decline Push Ups'],
    safetyNotes: ['Use a stable surface that won\'t slide', 'Progress surface height gradually'],
    loggingInstructions: ['Log total sets and reps', 'Note surface height', 'Note RPE']
  },

  'diamond-push-ups': {
    exerciseType: 'assistance',
    purpose: 'Diamond push-ups bring the hands close together to create a triangle shape, shifting the emphasis heavily to the triceps and inner chest. One of the most effective bodyweight tricep exercises going — tougher than most people expect.',
    phases: [
      { name: 'Setup', description: 'Hands together forming diamond/triangle', cues: ['Hands together under chest — thumbs and index fingers touching', 'Body in rigid straight line', 'Core braced, glutes tight', 'Elbows close to body'] },
      { name: 'Eccentric (Lowering)', description: 'Lower chest to hands', cues: ['Lower chest toward your hands', 'Elbows stay close to body — tuck tight', 'Full depth — chest touches hands', 'Controlled 2-second descent'] },
      { name: 'Concentric (Pressing)', description: 'Press back up', cues: ['Press through palms and triceps', 'Full lockout at top', 'Squeeze triceps and inner chest', 'Maintain body position'] }
    ],
    breathing: { inhale: 'During lowering', exhale: 'As you press up' },
    commonMistakes: [
      { mistake: 'Elbows flaring wide', correction: 'Keep elbows tucked tight to your body throughout' },
      { mistake: 'Partial reps because it\'s hard', correction: 'Full range or regress to standard push-ups first' },
      { mistake: 'Hands too far forward', correction: 'Hands should be under the chest, not under the face' }
    ],
    musclesTargeted: { primary: ['Triceps', 'Inner Pectoralis Major'], secondary: ['Anterior Deltoids', 'Core'] },
    tempoGuide: '2-0-1-0',
    coachingNotes: 'Diamond push-ups are a class tricep exercise. If you can bang out 15 perfect diamond push-ups, your pressing muscles are in good nick. Start with standard push-ups if these are too tough.',
    regressions: ['Standard Push Ups', 'Close Grip Bench Press'],
    progressions: ['Weighted Diamond Push Ups', 'Archer Push Ups'],
    safetyNotes: ['Stop if wrists feel strained — the position can stress some people\'s wrists'],
    loggingInstructions: ['Log total sets and reps', 'Note RPE per set']
  },

  'archer-push-ups': {
    exerciseType: 'assistance',
    purpose: 'Archer push-ups are an advanced unilateral push-up variation where you shift your weight to one arm while the other extends out straight for support. It\'s a stepping stone to one-arm push-ups and builds serious unilateral pressing strength. Proper hard work.',
    phases: [
      { name: 'Setup', description: 'Extra-wide hand placement', cues: ['Hands very wide — about 2x shoulder width', 'Body in straight line', 'Core braced hard', 'Fingers can point outward slightly'] },
      { name: 'Eccentric (Shifting and Lowering)', description: 'Shift weight and lower', cues: ['Shift bodyweight toward one hand', 'Lower yourself on the working arm', 'Supporting arm extends straight — light contact only', 'Chest lowers toward the working hand'] },
      { name: 'Concentric (Pressing)', description: 'Push back up from one side', cues: ['Press up through the working arm', 'Supporting arm stays straight', 'Return to centre before switching sides', 'Full lockout'] }
    ],
    breathing: { inhale: 'As you lower toward one side', exhale: 'As you press back up' },
    commonMistakes: [
      { mistake: 'Not shifting enough weight to the working arm', correction: 'The supporting arm should barely be touching — almost all load on the working side' },
      { mistake: 'Rotating the torso', correction: 'Keep shoulders and hips square throughout' },
      { mistake: 'Rushing through reps', correction: 'Slow controlled reps — this is advanced work' }
    ],
    musclesTargeted: { primary: ['Pectoralis Major', 'Triceps', 'Anterior Deltoids'], secondary: ['Core (anti-rotation)', 'Obliques'] },
    tempoGuide: '2-1-1-0',
    coachingNotes: 'Archer push-ups are for people who\'ve mastered standard push-ups and need more challenge. If you can\'t do 15 clean standard push-ups, don\'t attempt these yet.',
    regressions: ['Standard Push Ups', 'Wide Push Ups'],
    progressions: ['One Arm Push Up', 'Typewriter Push Ups'],
    safetyNotes: ['Requires good shoulder stability', 'Build up slowly — wrist and shoulder demands are high'],
    loggingInstructions: ['Log total sets and reps per side', 'Note RPE']
  },

  'plyometric-push-ups': {
    exerciseType: 'conditioning',
    purpose: 'Plyometric push-ups develop explosive pressing power by launching off the ground. They train fast-twitch muscle fibres in the chest, shoulders, and triceps. Essential for athletes who need explosive upper-body power — and they look well impressive.',
    phases: [
      { name: 'Setup', description: 'Standard push-up position', cues: ['Hands shoulder-width', 'Body in rigid line', 'Core braced, glutes tight', 'Start from the top position'] },
      { name: 'Eccentric (Lowering)', description: 'Quick controlled descent', cues: ['Lower quickly but under control', 'Elbows at 45°', 'Load the chest and triceps like a spring'] },
      { name: 'Explosive Press', description: 'Launch off the floor', cues: ['Explode up — push so hard your hands leave the floor', 'Clap if you can (optional)', 'Keep body rigid in the air', 'Land softly with slight elbow bend'] }
    ],
    breathing: { inhale: 'During the lowering', exhale: 'Forcefully during the explosive push' },
    commonMistakes: [
      { mistake: 'Landing with locked elbows', correction: 'Absorb landing with slight elbow bend — protect your joints' },
      { mistake: 'Hips piking in the air', correction: 'Body stays in a straight line throughout — even in the air' },
      { mistake: 'Attempting before mastering standard push-ups', correction: 'You need solid push-up strength first. 20+ clean reps minimum before trying these' }
    ],
    musclesTargeted: { primary: ['Pectoralis Major', 'Triceps', 'Anterior Deltoids'], secondary: ['Core', 'Serratus Anterior'] },
    tempoGuide: 'Quick controlled lower, maximum explosive push, soft landing',
    coachingNotes: 'Plyo push-ups are about power, not volume. Low reps (5-8), maximum effort each rep. If you can\'t get your hands off the floor, you\'re not ready yet. Go back to standard push-ups.',
    regressions: ['Standard Push Ups', 'Kneeling Plyo Push Ups'],
    progressions: ['Clap Push Ups', 'Superman Push Ups (hands and feet leave floor)'],
    safetyNotes: ['Land softly with bent elbows', 'Not recommended for those with wrist issues', 'Master standard push-ups first — 20+ clean reps'],
    loggingInstructions: ['Log total sets and reps', 'Note quality of each rep', 'Note RPE']
  }
};

/**
 * Get comprehensive coaching data for an exercise
 */
export function getExerciseCoachingData(exerciseId: string): ExerciseCoachingData | undefined {
  return EXERCISE_COACHING_DATA[exerciseId];
}

/**
 * Find coaching data by exercise name using fuzzy matching
 */
export function findCoachingDataByName(name: string): ExerciseCoachingData | undefined {
  const normalizedName = name.toLowerCase().trim();
  
  // Direct ID match first
  if (EXERCISE_COACHING_DATA[normalizedName]) {
    return EXERCISE_COACHING_DATA[normalizedName];
  }
  
  // Try converting name to ID format
  const idFormat = normalizedName.replace(/\s+/g, '-');
  if (EXERCISE_COACHING_DATA[idFormat]) {
    return EXERCISE_COACHING_DATA[idFormat];
  }
  
  // Fuzzy match on exercise patterns
  const patterns: Record<string, string> = {
    'bench press': 'flat-barbell-bench-press',
    'flat bench': 'flat-barbell-bench-press',
    'barbell bench': 'flat-barbell-bench-press',
    'incline bench': 'incline-barbell-bench-press',
    'incline press': 'incline-barbell-bench-press',
    'deadlift': 'conventional-deadlift',
    'squat': 'barbell-back-squat',
    'back squat': 'barbell-back-squat',
    'front squat': 'barbell-front-squat',
    'overhead press': 'overhead-press',
    'ohp': 'overhead-press',
    'military press': 'overhead-press',
    'shoulder press': 'dumbbell-shoulder-press',
    'dumbbell shoulder': 'dumbbell-shoulder-press',
    'bent over row': 'barbell-bent-over-row',
    'barbell row': 'barbell-bent-over-row',
    'pendlay row': 'barbell-bent-over-row',
    'pull up': 'pull-ups',
    'pullup': 'pull-ups',
    'chin up': 'pull-ups',
    'rdl': 'barbell-romanian-deadlift',
    'romanian deadlift': 'barbell-romanian-deadlift',
    'romanian': 'barbell-romanian-deadlift',
    'stiff leg': 'barbell-romanian-deadlift',
    'lateral raise': 'dumbbell-lateral-raise',
    'side raise': 'dumbbell-lateral-raise',
    'lateral': 'dumbbell-lateral-raise',
    'cable lateral': 'cable-lateral-raise',
    'barbell curl': 'barbell-curl',
    'curl': 'barbell-curl',
    'bicep curl': 'cable-bicep-curl',
    'cable curl': 'cable-bicep-curl',
    'pushdown': 'cable-tricep-pushdown',
    'tricep pushdown': 'cable-tricep-pushdown',
    'rope pushdown': 'cable-tricep-pushdown',
    'overhead extension': 'cable-overhead-tricep-extension',
    'tricep extension': 'cable-overhead-tricep-extension',
    'plank': 'plank',
    'front plank': 'plank',
    'leg press': 'leg-press',
    'hack squat': 'hack-squat-machine',
    'leg extension': 'leg-extension-machine',
    'leg curl': 'seated-leg-curl-machine',
    'hamstring curl': 'seated-leg-curl-machine',
    'calf raise': 'standing-calf-raise-machine',
    'standing calf': 'standing-calf-raise-machine',
    'pull through': 'cable-pull-through',
    'cable crunch': 'cable-crunch',
    'woodchop': 'cable-woodchop',
    'pallof': 'cable-pallof-press',
    'anti rotation': 'cable-pallof-press',
    'hanging leg raise': 'hanging-leg-raises',
    'leg raise': 'hanging-leg-raises',
    'hip thrust': 'barbell-hip-thrust-glutes',
    'glute bridge': 'barbell-hip-thrust-glutes',
    'cable kickback': 'cable-kickback-glutes',
    'glute kickback': 'cable-kickback-glutes',
    'dumbbell press': 'dumbbell-bench-press',
    'db press': 'dumbbell-bench-press',
    'flat dumbbell': 'dumbbell-bench-press',
    'machine press': 'machine-chest-press',
    'chest press': 'machine-chest-press',
    'cable crossover': 'cable-crossover',
    'pec deck': 'pec-deck-machine',
    'chest fly': 'pec-deck-machine',
    'face pull': 'face-pulls',
    'lat pulldown': 'lat-pulldown',
    'pulldown': 'lat-pulldown',
    'seated row': 'seated-cable-row',
    'cable row': 'seated-cable-row',
    'reverse fly': 'reverse-pec-deck',
    'rear delt': 'reverse-pec-deck',
    'goblet squat': 'goblet-squat',
    'goblet': 'goblet-squat',
    'bulgarian': 'dumbbell-bulgarian-split-squat',
    'split squat': 'dumbbell-bulgarian-split-squat',
    'push up': 'standard-push-ups',
    'pushup': 'standard-push-ups',
    'dip': 'chest-dips',
    'chest dip': 'chest-dips',
    'decline bench': 'decline-barbell-bench-press',
    'close grip bench': 'close-grip-barbell-bench',
    'close grip': 'close-grip-barbell-bench',
    'floor press': 'barbell-floor-press',
    'dumbbell fly': 'dumbbell-flyes-flat',
    'flat fly': 'dumbbell-flyes-flat',
    'incline fly': 'dumbbell-flyes-incline',
    'incline machine': 'incline-machine-press',
    'smith bench': 'smith-machine-bench-press',
    'smith press': 'smith-machine-bench-press',
    'low cable fly': 'low-to-high-cable-flyes',
    'high cable fly': 'high-to-low-cable-flyes',
    'assisted dip': 'assisted-dip-machine',
    'sumo deadlift': 'sumo-deadlift',
    'sumo': 'sumo-deadlift',
    'pendlay': 'pendlay-row',
    'dumbbell row': 'single-arm-dumbbell-row',
    'single arm row': 'single-arm-dumbbell-row',
    'chest supported row': 'chest-supported-dumbbell-row',
    'inverted row': 'inverted-rows',
    'close grip pulldown': 'close-grip-lat-pulldown',
    'straight arm': 'straight-arm-pulldown',
    'machine row': 'machine-row',
    'assisted pull': 'assisted-pull-up-machine',
    't-bar': 't-bar-row',
    't bar': 't-bar-row',
    'shrug': 'barbell-shrugs',
    'good morning': 'barbell-good-mornings',
    'arnold': 'arnold-press',
    'machine shoulder': 'machine-shoulder-press',
    'rear delt fly': 'dumbbell-rear-delt-flyes',
    'rear fly': 'dumbbell-rear-delt-flyes',
    'landmine': 'landmine-press',
    'lunge': 'barbell-lunges',
    'dumbbell rdl': 'dumbbell-romanian-deadlift',
    'db rdl': 'dumbbell-romanian-deadlift',
    'lying curl': 'lying-leg-curl-machine',
    'lying leg curl': 'lying-leg-curl-machine',
    'seated calf': 'seated-calf-raise-machine',
    'smith squat': 'smith-machine-squat',
    'nordic': 'nordic-curls',
    'nordic curl': 'nordic-curls',
    'ez curl': 'ez-bar-curl',
    'ez bar': 'ez-bar-curl',
    'hammer curl': 'dumbbell-hammer-curls',
    'hammer': 'dumbbell-hammer-curls',
    'skull crusher': 'barbell-skull-crushers',
    'skullcrusher': 'barbell-skull-crushers',
    'dumbbell curl': 'dumbbell-bicep-curl',
    'db curl': 'dumbbell-bicep-curl',
    'rope curl': 'cable-rope-hammer-curl',
    'dead bug': 'dead-bug',
    'side plank': 'side-plank',
    'farmer': 'farmers-walk',
    'farmers': 'farmers-walk',
    'carry': 'farmers-walk',
    'hollow': 'hollow-body-hold',
    'hollow body': 'hollow-body-hold',
    'mountain climber': 'mountain-climbers',
    'v up': 'v-ups',
    'v-up': 'v-ups',
    'ab machine': 'ab-crunch-machine',
    'crunch machine': 'ab-crunch-machine',
    'hip abduction': 'machine-hip-abduction',
    'abduction': 'machine-hip-abduction',
    'machine kickback': 'machine-glute-kickback',
    'donkey kick': 'donkey-kicks',
    'clamshell': 'clamshells',
    'step up': 'dumbbell-step-ups',
    'step-up': 'dumbbell-step-ups',
    'pike': 'pike-push-ups',
    'pike push': 'pike-push-ups',
    'push press': 'push-press',
    'preacher curl': 'machine-preacher-curl',
    'preacher': 'machine-preacher-curl',
  };
  
  for (const [pattern, id] of Object.entries(patterns)) {
    if (normalizedName.includes(pattern)) {
      return EXERCISE_COACHING_DATA[id];
    }
  }
  
  return undefined;
}
