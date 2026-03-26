import type { Unit } from '../types';
import ch1AnatomicalPlanes from '@/assets/university/ch1-anatomical-planes.png';
import ch2JointTypes from '@/assets/university/ch2-joint-types.png';
import ch3MuscleGroups from '@/assets/university/ch3-muscle-groups.png';
import ch5EnergySystems from '@/assets/university/ch5-energy-systems.png';

export const level2Unit1: Unit = {
  number: 1,
  title: 'Understanding the Body',
  description: 'Learn the fundamental anatomy and physiology that underpins all training. Understand how your body moves, adapts, and produces energy.',
  chapters: [
    {
      number: 1,
      title: 'Basic Anatomy for Training',
      learningOutcome: 'Understand the basic anatomical terminology and body planes used in exercise science, and identify how they relate to common gym movements.',
      assessmentCriteria: [
        'Define the three anatomical planes of movement (sagittal, frontal, transverse)',
        'Use correct anatomical directional terms (anterior, posterior, medial, lateral, superior, inferior)',
        'Identify at least three gym exercises and classify them by movement plane',
      ],
      content: [
        {
          heading: 'Why Anatomy Matters',
          paragraphs: [
            'You don\'t need a medical degree to train effectively — but you do need to understand the basics. Knowing how your body is structured helps you select the right exercises, understand why certain movements feel different, and communicate clearly about what you\'re training.',
            'Think of anatomy as the instruction manual for your body. Without it, you\'re guessing.',
          ],
        },
        {
          heading: 'The Three Planes of Movement',
          paragraphs: [
            'Every movement your body makes can be classified into one of three planes:',
          ],
          bullets: [
            'Sagittal Plane — divides the body into left and right. Movements in this plane go forwards and backwards. Examples: squats, bicep curls, lunges, running.',
            'Frontal Plane — divides the body into front and back. Movements go side to side. Examples: lateral raises, side lunges, star jumps.',
            'Transverse Plane — divides the body into top and bottom. Movements involve rotation. Examples: cable woodchops, Russian twists, throwing a punch.',
          ],
          imageUrl: ch1AnatomicalPlanes,
          imageAlt: 'Diagram showing the three anatomical planes on a human figure with example exercises labelled for each plane',
        },
        {
          heading: 'Directional Terms',
          paragraphs: [
            'When describing the body in exercise science, we use specific terms to avoid confusion:',
          ],
          bullets: [
            'Anterior — the front of the body (e.g., your quads are anterior)',
            'Posterior — the back of the body (e.g., your hamstrings are posterior)',
            'Medial — towards the midline (e.g., the inner thigh)',
            'Lateral — away from the midline (e.g., the outer thigh)',
            'Superior — towards the head (e.g., the shoulders are superior to the hips)',
            'Inferior — towards the feet (e.g., the ankles are inferior to the knees)',
          ],
        },
        {
          heading: 'Applying This in the Gym',
          paragraphs: [
            'When someone says "this exercise targets the anterior deltoid", they mean the front of the shoulder. When a programme says "lateral movement", it means side-to-side work in the frontal plane.',
            'Understanding these terms means you\'ll never be confused by programme instructions, coaching cues, or exercise descriptions again.',
          ],
        },
      ],
      unbreakableInsight: 'Most people train only in the sagittal plane — forward and back. That\'s why they end up stiff, imbalanced, and eventually injured. Train in all three planes or pay the price.',
      coachNote: 'You don\'t need to memorise every Latin term. Focus on understanding the three planes and the six directional terms listed above. If you can classify your exercises by plane and describe where a muscle is, you\'re ahead of 90% of gym users.',
      practicalTask: {
        title: 'Movement Plane Audit',
        instructions: 'Review your last three training sessions. For each exercise you performed, identify which plane of movement it primarily works in. Count how many exercises fall into each plane.',
        reflectionQuestions: [
          'Which plane of movement dominates your training?',
          'Are there any planes you\'re neglecting entirely?',
          'Can you identify one exercise to add that fills a gap?',
        ],
      },
    },
    {
      number: 2,
      title: 'The Skeletal System',
      learningOutcome: 'Understand the role of the skeletal system in movement and exercise, including the main types of joints and their relevance to training.',
      assessmentCriteria: [
        'Describe at least three functions of the skeletal system',
        'Identify the main types of synovial joints and provide a gym-based example for each',
        'Explain the importance of joint health for long-term training',
      ],
      content: [
        {
          heading: 'What the Skeleton Does',
          paragraphs: [
            'Your skeleton isn\'t just scaffolding. It serves several critical functions that directly affect your training:',
          ],
          bullets: [
            'Support — provides the rigid framework that holds your body upright and gives muscles something to pull against',
            'Protection — shields vital organs (ribs protect the lungs, skull protects the brain)',
            'Movement — bones act as levers that muscles pull on to create motion',
            'Mineral storage — bones store calcium and phosphorus, releasing them when needed',
            'Blood cell production — red and white blood cells are produced in bone marrow',
          ],
        },
        {
          heading: 'Types of Joints',
          paragraphs: [
            'Joints are where two or more bones meet. The joints most relevant to gym training are synovial joints — freely movable joints surrounded by a fluid-filled capsule:',
          ],
          bullets: [
            'Hinge joints — move in one direction, like a door. Examples: elbow (bicep curls), knee (leg extensions)',
            'Ball-and-socket joints — allow movement in all directions. Examples: shoulder (overhead press), hip (squats)',
            'Pivot joints — allow rotation around a single axis. Example: the neck turning side to side',
            'Gliding joints — allow sliding movements. Example: wrist movements during pressing',
          ],
          imageUrl: ch2JointTypes,
          imageAlt: 'Labelled diagram showing hinge, ball-and-socket, pivot, and gliding joints with their gym exercise equivalents',
        },
        {
          heading: 'Joint Health and Training',
          paragraphs: [
            'Every time you lift a weight, your joints are under load. Joint health is not optional — it\'s the foundation of a long training career.',
            'Synovial fluid lubricates joints and reduces friction. Warming up before training increases synovial fluid production, which is why cold joints feel stiff and creaky.',
            'Cartilage covers the ends of bones at joints. It doesn\'t have its own blood supply, so it relies on movement to receive nutrients. Sedentary lifestyles lead to cartilage deterioration. Regular training — with proper technique — actually improves joint health over time.',
          ],
        },
      ],
      unbreakableInsight: 'Your muscles will recover in days. A damaged joint can take months — or never fully heal. Respect your joints. Warm up properly. Use full range of motion. Ego lifting destroys joints.',
      coachNote: 'You don\'t need to know every bone in the body. Focus on understanding that bones are levers, joints are pivot points, and both need to be looked after. A proper warm-up is not a suggestion — it\'s joint maintenance.',
      practicalTask: {
        title: 'Joint Awareness Check',
        instructions: 'During your next training session, pay attention to every joint involved in each exercise. Note which joints feel smooth and which feel tight or restricted. Record your observations.',
        reflectionQuestions: [
          'Which joints felt the most restricted?',
          'Did your warm-up adequately prepare those joints?',
          'What could you change about your warm-up to improve joint readiness?',
        ],
      },
    },
    {
      number: 3,
      title: 'The Muscular System',
      learningOutcome: 'Understand the structure and function of skeletal muscles, including how muscles contract and the major muscle groups used in resistance training.',
      assessmentCriteria: [
        'Describe the three types of muscle contraction (concentric, eccentric, isometric)',
        'Identify the major muscle groups and their primary functions',
        'Explain the concept of agonist and antagonist muscle pairs',
      ],
      content: [
        {
          heading: 'How Muscles Work',
          paragraphs: [
            'Skeletal muscles are the engines of movement. They attach to bones via tendons and contract to produce force. Understanding how muscles contract is fundamental to effective training.',
          ],
        },
        {
          heading: 'Types of Muscle Contraction',
          paragraphs: [
            'Every rep you perform involves one or more types of contraction:',
          ],
          bullets: [
            'Concentric — the muscle shortens under load. This is the "lifting" phase. Example: curling a dumbbell upward.',
            'Eccentric — the muscle lengthens under load. This is the "lowering" phase. Example: slowly lowering a dumbbell back down. Eccentric contractions cause the most muscle damage and are crucial for growth.',
            'Isometric — the muscle produces force without changing length. Example: holding a plank, pausing at the bottom of a squat.',
          ],
        },
        {
          heading: 'Major Muscle Groups',
          paragraphs: [
            'You need to know where the main muscles are and what they do:',
          ],
          bullets: [
            'Chest (Pectoralis Major) — pushes things away from you. Bench press, press-ups.',
            'Back (Latissimus Dorsi, Trapezius, Rhomboids) — pulls things towards you. Rows, pull-ups, deadlifts.',
            'Shoulders (Deltoids — anterior, medial, posterior) — lifts the arm in all directions. Overhead press, lateral raises.',
            'Arms — Biceps (front, elbow flexion), Triceps (back, elbow extension).',
            'Core (Rectus Abdominis, Obliques, Transverse Abdominis, Erector Spinae) — stabilises the trunk. Planks, anti-rotation work.',
            'Legs — Quadriceps (front of thigh, knee extension), Hamstrings (back of thigh, knee flexion and hip extension), Glutes (hip extension, the strongest muscle group), Calves (ankle plantar flexion).',
          ],
          imageUrl: ch3MuscleGroups,
          imageAlt: 'Labelled diagram of major muscle groups from front and rear view of the human body',
        },
        {
          heading: 'Agonist and Antagonist Pairs',
          paragraphs: [
            'Muscles work in pairs. When one muscle contracts (the agonist), the opposing muscle relaxes (the antagonist):',
          ],
          bullets: [
            'Biceps and Triceps — when you curl, biceps contract and triceps relax',
            'Quadriceps and Hamstrings — when you extend the knee, quads contract and hamstrings relax',
            'Chest and Back — when you push, chest contracts and back relaxes',
          ],
        },
        {
          paragraphs: [
            'Understanding this pairing helps you build balanced programmes. If you only train one side of a pair, you create muscular imbalances that lead to poor posture and injury.',
          ],
        },
      ],
      unbreakableInsight: 'Everyone wants to train the muscles they can see in the mirror. The muscles you can\'t see — your back, rear delts, hamstrings, glutes — are the ones that keep you strong and injury-free. Train what you can\'t see, twice as hard.',
      coachNote: 'Learn the major muscle groups and what they do. When you read a programme that says "horizontal push", you should immediately think "chest". When it says "hip hinge", think "hamstrings and glutes". This fluency makes you a better, more self-sufficient trainee.',
      practicalTask: {
        title: 'Muscle Map Exercise',
        instructions: 'Take your current programme and, for each exercise, write down the primary muscle (agonist) and its opposing muscle (antagonist). Check whether your programme has roughly equal volume for each pair.',
        reflectionQuestions: [
          'Are any muscle pairs significantly imbalanced in your programme?',
          'Which antagonist muscles are you neglecting?',
          'How could you adjust your programme to improve balance?',
        ],
      },
    },
    {
      number: 4,
      title: 'The Cardiovascular System',
      learningOutcome: 'Understand the structure and function of the cardiovascular system and how it responds to exercise, including the acute and chronic adaptations that improve fitness.',
      assessmentCriteria: [
        'Describe the basic structure of the cardiovascular system (heart, blood vessels, blood)',
        'Explain the acute responses of the cardiovascular system during exercise',
        'Identify at least three chronic adaptations from regular cardiovascular training',
      ],
      content: [
        {
          heading: 'The Cardiovascular System Overview',
          paragraphs: [
            'The cardiovascular system is your body\'s transport network. It delivers oxygen and nutrients to working muscles and removes waste products like carbon dioxide and lactic acid.',
            'It consists of three main components: the heart (the pump), blood vessels (the pipes), and blood (the delivery fluid).',
          ],
        },
        {
          heading: 'The Heart',
          paragraphs: [
            'The heart is a muscular pump with four chambers. The right side pumps deoxygenated blood to the lungs. The left side pumps oxygenated blood to the rest of the body.',
            'Your resting heart rate is a reliable indicator of cardiovascular fitness. Trained individuals typically have lower resting heart rates because their hearts pump more blood per beat (higher stroke volume).',
          ],
        },
        {
          heading: 'Acute Responses to Exercise',
          paragraphs: [
            'When you start training, your cardiovascular system responds immediately:',
          ],
          bullets: [
            'Heart rate increases — to pump more blood to working muscles',
            'Stroke volume increases — each beat pushes out more blood',
            'Blood pressure rises temporarily — to force blood through vessels faster',
            'Blood is redistributed — away from the digestive system and towards muscles',
            'Breathing rate increases — to take in more oxygen and expel more carbon dioxide',
          ],
        },
        {
          heading: 'Chronic Adaptations',
          paragraphs: [
            'Over weeks and months of consistent training, your cardiovascular system physically changes:',
          ],
          bullets: [
            'Cardiac hypertrophy — the heart muscle wall thickens, making each contraction stronger',
            'Increased stroke volume — more blood pumped per beat, meaning a lower resting heart rate',
            'Greater capillary density — more tiny blood vessels grow around muscles, improving oxygen delivery',
            'Improved VO2 max — your body becomes more efficient at using oxygen during exercise',
            'Lower resting blood pressure — blood vessels become more elastic and efficient',
          ],
        },
      ],
      unbreakableInsight: 'You can have all the muscle in the world, but if your heart can\'t deliver oxygen efficiently, you\'ll gas out in every session. Cardiovascular fitness isn\'t optional — it\'s the foundation everything else sits on.',
      coachNote: 'You don\'t need to become a marathon runner. But 2-3 sessions of moderate cardiovascular work per week — even brisk walking — will improve recovery between sets, between sessions, and between training blocks. It makes everything else work better.',
      practicalTask: {
        title: 'Resting Heart Rate Baseline',
        instructions: 'Measure your resting heart rate first thing in the morning for five consecutive days. Record each reading. Calculate the average. This is your cardiovascular fitness baseline.',
        reflectionQuestions: [
          'What was your average resting heart rate?',
          'How does this compare to the general population ranges (60-100bpm for adults, under 60 for trained individuals)?',
          'What cardiovascular training could you add to your routine to improve this number?',
        ],
      },
    },
    {
      number: 5,
      title: 'Energy Systems',
      learningOutcome: 'Understand the three energy systems the body uses during exercise, and how they relate to different types of training intensity and duration.',
      assessmentCriteria: [
        'Name and describe the three energy systems (ATP-PC, anaerobic glycolysis, aerobic)',
        'Explain when each system is predominantly used during exercise',
        'Apply energy system knowledge to justify the structure of different training methods',
      ],
      content: [
        {
          heading: 'Where Energy Comes From',
          paragraphs: [
            'Every muscle contraction requires energy. That energy comes from a molecule called ATP (adenosine triphosphate). Your body has three systems for producing ATP, and which one dominates depends on the intensity and duration of the exercise.',
          ],
        },
        {
          heading: 'The Three Energy Systems',
          bullets: [
            'ATP-PC (Phosphocreatine) System — immediate energy, lasts 8-12 seconds. Used for maximal effort: a heavy single on deadlift, a 40m sprint. No oxygen needed. Recovers in 2-5 minutes.',
            'Anaerobic Glycolysis — short-duration energy, lasts 30 seconds to 2 minutes. Breaks down glucose without oxygen. Produces lactic acid as a by-product. Used for high-rep sets, 400m sprints, circuit training.',
            'Aerobic System — long-duration energy, used for anything lasting more than 2-3 minutes. Uses oxygen to break down carbohydrates and fats. Used for steady-state cardio, long walks, extended training sessions.',
          ],
          imageUrl: ch5EnergySystems,
          imageAlt: 'Chart showing the three energy systems with duration on the x-axis and contribution percentage on the y-axis, with example activities marked',
        },
        {
          heading: 'How They Work Together',
          paragraphs: [
            'All three systems work simultaneously — but one always dominates depending on intensity and duration. A heavy set of 3 reps uses mostly the ATP-PC system. A set of 15 reps relies more on anaerobic glycolysis. A 30-minute jog is primarily aerobic.',
            'Understanding this helps you structure rest periods correctly. Heavy strength work needs 2-5 minutes of rest to replenish phosphocreatine. Hypertrophy sets need 60-90 seconds. Endurance work can use shorter rests or continuous effort.',
          ],
        },
        {
          heading: 'Practical Implications',
          bullets: [
            'Training for strength (1-5 reps) — primarily ATP-PC, needs long rest (3-5 minutes)',
            'Training for hypertrophy (6-12 reps) — mix of ATP-PC and anaerobic glycolysis, moderate rest (60-120 seconds)',
            'Training for endurance (15+ reps or cardio) — primarily aerobic/anaerobic glycolysis, short rest (30-60 seconds)',
            'Creatine supplementation works because it helps replenish the ATP-PC system faster',
          ],
        },
      ],
      unbreakableInsight: 'If you\'re resting 30 seconds between heavy deadlift sets and wondering why you can\'t hit your numbers — now you know. You haven\'t given your ATP-PC system time to reload. Rest properly or fail repeatedly. Your choice.',
      coachNote: 'This is one of the most practical chapters in the entire course. Once you understand energy systems, your rest periods, set structures, and even your supplement choices suddenly make sense. Come back to this chapter whenever you\'re designing or adjusting a programme.',
      practicalTask: {
        title: 'Energy System Session Analysis',
        instructions: 'Take one strength session and one cardio session from your recent training. For each exercise or activity, identify which energy system is primarily being used and whether your rest periods match the recommendations.',
        reflectionQuestions: [
          'Were your rest periods appropriate for the energy system being used?',
          'Did you notice any exercises where fatigue was unusually high — could this be an energy system mismatch?',
          'How would you adjust your rest periods based on what you\'ve learnt?',
        ],
      },
    },
  ],
};
