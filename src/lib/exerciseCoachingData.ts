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
    'overhead press': 'overhead-press',
    'ohp': 'overhead-press',
    'military press': 'overhead-press',
    'shoulder press': 'overhead-press',
    'bent over row': 'barbell-bent-over-row',
    'barbell row': 'barbell-bent-over-row',
    'pendlay row': 'barbell-bent-over-row',
    'pull up': 'pull-ups',
    'pullup': 'pull-ups',
    'chin up': 'pull-ups',
    'rdl': 'romanian-deadlift',
    'romanian': 'romanian-deadlift',
    'stiff leg': 'romanian-deadlift',
    'lateral raise': 'dumbbell-lateral-raise',
    'side raise': 'dumbbell-lateral-raise',
    'lateral': 'dumbbell-lateral-raise',
    'barbell curl': 'barbell-curl',
    'curl': 'barbell-curl',
    'bicep curl': 'barbell-curl',
    'pushdown': 'tricep-pushdown',
    'tricep pushdown': 'tricep-pushdown',
    'rope pushdown': 'tricep-pushdown',
    'plank': 'plank',
    'front plank': 'plank',
    'leg press': 'leg-press',
    'dumbbell press': 'dumbbell-bench-press',
    'db press': 'dumbbell-bench-press',
    'flat dumbbell': 'dumbbell-bench-press',
  };
  
  for (const [pattern, id] of Object.entries(patterns)) {
    if (normalizedName.includes(pattern)) {
      return EXERCISE_COACHING_DATA[id];
    }
  }
  
  return undefined;
}
