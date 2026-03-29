import type { Unit } from '../types';
import ch1CarbMetabolism from '@/assets/university/nutl3-u1-ch1-carb-metabolism.png';
import ch2ProteinSynthesis from '@/assets/university/nutl3-u1-ch2-protein-synthesis.png';
import ch3DietaryFats from '@/assets/university/nutl3-u1-ch3-dietary-fats.png';
import ch4MetabolicAdaptation from '@/assets/university/nutl3-u1-ch4-metabolic-adaptation.png';
import ch5NutrientTiming from '@/assets/university/nutl3-u1-ch5-nutrient-timing.png';
import ch6AlcoholEffects from '@/assets/university/nutl3-u1-ch6-alcohol-effects.png';

export const nutritionL3Unit1: Unit = {
  number: 1,
  title: 'Advanced Macronutrients & Energy Systems',
  description: 'Deepen your understanding of how carbohydrates, proteins, and fats are metabolised, how energy systems fuel different activities, and how to manipulate macronutrient ratios for specific goals.',
  chapters: [
    {
      number: 1,
      title: 'Carbohydrate Metabolism',
      learningOutcome: 'Understand the biochemical pathways of carbohydrate metabolism and their practical implications for energy management.',
      assessmentCriteria: [
        'Describe glycolysis and its role in energy production',
        'Explain the difference between aerobic and anaerobic carbohydrate metabolism',
        'Discuss the role of glycogen storage and its limitations',
      ],
      content: [
        {
          heading: 'From Food to Fuel',
          paragraphs: [
            'When you eat carbohydrates, your body breaks them down into glucose — the primary fuel for your brain and muscles. But the journey from a bowl of porridge to usable energy involves several metabolic steps, each with practical implications for your performance and body composition.',
            'Understanding these pathways helps you make informed decisions about carbohydrate timing, quantity, and type — rather than following generic advice.',
          ],
          imageUrl: ch1CarbMetabolism,
          imageAlt: 'Carbohydrate digestion and ATP production flowchart',
        },
        {
          heading: 'Glycolysis — The First Step',
          paragraphs: [
            'Glycolysis is the metabolic pathway that converts glucose into pyruvate, releasing a small amount of energy (ATP) in the process. It occurs in the cytoplasm of cells and does not require oxygen — making it the primary energy source during high-intensity, short-duration efforts like sprinting or heavy lifting.',
            'Each molecule of glucose yields two molecules of ATP through glycolysis alone. While this seems modest, the speed of this pathway makes it invaluable during intense activity when oxygen delivery cannot keep up with energy demand.',
          ],
        },
        {
          heading: 'Aerobic vs Anaerobic Pathways',
          paragraphs: [
            'When oxygen is available, pyruvate enters the mitochondria and is further broken down through the Krebs cycle and electron transport chain — yielding up to 36 additional ATP molecules. This is aerobic metabolism, and it dominates during low-to-moderate intensity activities like walking, jogging, or steady cycling.',
            'When oxygen is insufficient — during a heavy set of squats or an all-out sprint — pyruvate is converted to lactate instead. This anaerobic pathway is fast but produces far less total energy and contributes to the burning sensation and fatigue you feel during maximal efforts.',
          ],
          bullets: [
            'Aerobic metabolism — Slow but efficient, producing up to 38 ATP per glucose molecule. Dominates during steady-state activity',
            'Anaerobic metabolism — Fast but limited, producing only 2 ATP per glucose molecule. Dominates during high-intensity bursts',
            'In reality, both systems work simultaneously — the ratio shifts based on exercise intensity and duration',
          ],
        },
        {
          heading: 'Glycogen — Your Stored Fuel',
          paragraphs: [
            'Your body stores glucose as glycogen in your muscles (approximately 300–500 grams) and liver (approximately 80–120 grams). Muscle glycogen fuels local muscular work, while liver glycogen maintains blood glucose levels — critical for brain function and sustained energy.',
            'Glycogen stores are finite. During prolonged or intense exercise, depletion leads to fatigue, reduced performance, and the sensation athletes describe as "hitting the wall." This is why carbohydrate timing and loading strategies exist — they aim to maximise glycogen stores before and replenish them after demanding training.',
          ],
        },
      ],
      unbreakableInsight: 'Your body does not care whether carbohydrates come from sweet potato or white rice — it breaks them all down to glucose. Context, timing, and total quantity matter far more than food snobbery.',
      coachNote: 'If you are training intensely more than four times per week, low-carb approaches will eventually cost you performance. Match your carbohydrate intake to your training demands — not to a trend.',
      practicalTask: {
        title: 'Map Your Energy Systems',
        instructions: 'Review your last three training sessions. For each, identify the dominant energy system (aerobic or anaerobic) based on the intensity and duration. Then assess whether your pre-workout carbohydrate intake was appropriate for that energy demand.',
        reflectionQuestions: [
          'Did you have sufficient energy throughout each session, or did you fatigue prematurely?',
          'How might adjusting carbohydrate timing improve your performance?',
          'What signs would indicate your glycogen stores were depleted?',
        ],
      },
    },
    {
      number: 2,
      title: 'Protein Synthesis & Turnover',
      learningOutcome: 'Understand muscle protein synthesis, breakdown, and net protein balance — and how dietary protein influences these processes.',
      assessmentCriteria: [
        'Define muscle protein synthesis (MPS) and muscle protein breakdown (MPB)',
        'Explain the leucine threshold and its practical significance',
        'Discuss optimal protein distribution throughout the day',
      ],
      content: [
        {
          heading: 'The Protein Turnover Cycle',
          paragraphs: [
            'Your muscles are in a constant state of remodelling. Old or damaged proteins are broken down (muscle protein breakdown — MPB) while new proteins are built (muscle protein synthesis — MPS). Your net muscle protein balance — the difference between MPS and MPB — determines whether you gain, maintain, or lose muscle tissue over time.',
            'Resistance training stimulates MPS for 24–72 hours after a session. Consuming adequate dietary protein provides the amino acid building blocks needed to maximise this elevated MPS response.',
          ],
          imageUrl: ch2ProteinSynthesis,
          imageAlt: 'Muscle protein synthesis and breakdown diagram',
        },
        {
          heading: 'The Leucine Threshold',
          paragraphs: [
            'Not all protein servings are created equal when it comes to triggering MPS. Research consistently shows that a threshold dose of the amino acid leucine — approximately 2.5 to 3 grams — is needed to maximally stimulate MPS. This is sometimes called the "leucine trigger."',
            'In practical terms, this means consuming approximately 25–40 grams of high-quality protein per meal, depending on the source. Animal proteins (whey, eggs, chicken, beef, fish) typically contain more leucine per gram than plant proteins, which is why plant-based eaters may need slightly larger servings or strategic combinations.',
          ],
          bullets: [
            'Whey protein — Approximately 25g provides the leucine threshold. Fast-digesting, ideal post-training',
            'Chicken breast — Approximately 30g serving reaches the leucine threshold',
            'Lentils — Approximately 45–50g of protein needed due to lower leucine content per gram',
            'Combining plant sources (e.g., rice and beans) can improve the overall amino acid profile',
          ],
        },
        {
          heading: 'Protein Distribution Matters',
          paragraphs: [
            'Eating 120 grams of protein in two large meals is not equivalent to spreading it across four meals. Research suggests that distributing protein intake evenly — hitting the leucine threshold at each feeding — maximises the total MPS response over 24 hours.',
            'A practical target is 3–5 protein-rich meals per day, each containing 25–40 grams of protein, spaced approximately 3–5 hours apart. This approach is more effective than the common pattern of a low-protein breakfast, moderate lunch, and protein-heavy dinner.',
          ],
        },
        {
          heading: 'The Anabolic Window — Reality Check',
          paragraphs: [
            'The idea that you must consume protein within 30 minutes of training or "lose your gains" has been significantly overblown. While post-exercise protein intake is beneficial, the so-called anabolic window is measured in hours, not minutes.',
            'If you trained fasted, eating protein sooner is more important. If you had a protein-rich meal 2–3 hours before training, the urgency is much lower. Focus on hitting your daily protein target with good distribution rather than obsessing over post-workout shakes.',
          ],
        },
      ],
      unbreakableInsight: 'The anabolic window is not a 30-minute deadline — it is a 24-hour opportunity. Stop panicking about post-workout timing and start caring about your total daily intake and distribution.',
      coachNote: 'If you struggle to hit your protein target, front-load it. A high-protein breakfast sets the tone for the entire day and makes hitting 3–4 leucine-threshold meals much more manageable.',
      practicalTask: {
        title: 'Protein Distribution Audit',
        instructions: 'Track your protein intake for one full day, noting the grams consumed at each meal and the time of each meal. Calculate whether you hit the leucine threshold (approximately 25–40g) at each feeding.',
        reflectionQuestions: [
          'How many of your meals reached the leucine threshold?',
          'Was your protein intake front-loaded, back-loaded, or evenly distributed?',
          'What one change would most improve your protein distribution?',
        ],
      },
    },
    {
      number: 3,
      title: 'Dietary Fats — Advanced Roles',
      learningOutcome: 'Understand the advanced roles of dietary fats beyond energy provision, including hormonal regulation, inflammation, and cell membrane integrity.',
      assessmentCriteria: [
        'Explain the role of dietary fat in hormone production',
        'Differentiate between omega-3 and omega-6 fatty acids and their effects on inflammation',
        'Discuss why extremely low-fat diets can be harmful',
      ],
      content: [
        {
          heading: 'Fat as a Regulatory Nutrient',
          paragraphs: [
            'At Level 2, you learned that fats provide energy, insulation, and help absorb fat-soluble vitamins. At Level 3, we go deeper — dietary fat plays critical roles in hormone production, cell membrane structure, brain function, and inflammatory regulation.',
            'Cholesterol, which is synthesised from dietary fat, is the precursor to steroid hormones including testosterone, oestrogen, and cortisol. Chronically low fat intake can suppress hormone production, particularly testosterone, which affects both men and women — impacting energy, mood, recovery, and body composition.',
          ],
          imageUrl: ch3DietaryFats,
          imageAlt: 'Dietary fat roles in the body diagram',
        },
        {
          heading: 'Omega-3 vs Omega-6 — The Inflammatory Balance',
          paragraphs: [
            'Both omega-3 and omega-6 fatty acids are essential — your body cannot produce them, so they must come from food. However, they have opposing effects on inflammation.',
            'Omega-6 fatty acids (found in vegetable oils, processed foods, and some nuts) tend to promote inflammatory pathways. Omega-3 fatty acids (found in oily fish, flaxseeds, and walnuts) promote anti-inflammatory pathways. The modern Western diet typically provides an omega-6 to omega-3 ratio of 15:1 or higher — far from the ideal range of 2:1 to 4:1.',
          ],
          bullets: [
            'Omega-3 sources — Salmon, mackerel, sardines, flaxseeds, chia seeds, walnuts',
            'Omega-6 sources — Sunflower oil, soybean oil, corn oil, many processed and fried foods',
            'EPA and DHA (from oily fish) are the most bioactive forms of omega-3. Plant-based ALA converts poorly — approximately 5–10%',
            'Chronic inflammation from omega-6 excess is linked to joint pain, poor recovery, cardiovascular risk, and impaired immune function',
          ],
        },
        {
          heading: 'Trans Fats and Industrial Processing',
          paragraphs: [
            'Trans fats are unsaturated fats that have been chemically altered through partial hydrogenation — a process that extends shelf life but creates a molecular structure your body struggles to process. They raise LDL cholesterol, lower HDL cholesterol, and increase cardiovascular disease risk.',
            'While naturally occurring trans fats exist in small amounts in dairy and meat (and appear to be harmless in those quantities), industrial trans fats found in some margarines, baked goods, and fried foods should be minimised or eliminated entirely.',
          ],
        },
        {
          heading: 'Practical Fat Intake Guidelines',
          paragraphs: [
            'For most active individuals, fat should comprise 20–35% of total daily calories. Going below 20% risks hormonal disruption and poor fat-soluble vitamin absorption. Going above 40% makes it difficult to consume sufficient carbohydrates for performance.',
            'Prioritise monounsaturated fats (olive oil, avocado, nuts) and omega-3 rich sources. Limit omega-6-heavy vegetable oils and eliminate industrial trans fats. Beyond these principles, the specific fat sources matter less than the overall balance and total quantity.',
          ],
        },
      ],
      unbreakableInsight: 'Fat is not the enemy of fat loss — hormonal disruption from under-eating fat is. Your body needs dietary fat to produce the hormones that regulate metabolism, mood, and recovery.',
      coachNote: 'If you have been on a very low-fat diet and notice low energy, poor mood, or stalled progress, increasing your fat intake to at least 0.7 grams per kilogram of body weight is a sensible first step.',
      practicalTask: {
        title: 'Fat Source Audit',
        instructions: 'List every fat source you consumed over the past three days. Categorise each as predominantly saturated, monounsaturated, omega-3, or omega-6. Assess your overall balance.',
        reflectionQuestions: [
          'Is your omega-6 to omega-3 ratio likely skewed toward omega-6?',
          'Are you consuming oily fish at least twice per week?',
          'What one swap could improve your fat quality without changing total intake?',
        ],
      },
    },
    {
      number: 4,
      title: 'Energy Balance & Metabolic Adaptation',
      learningOutcome: 'Understand the nuances of energy balance, including adaptive thermogenesis, non-exercise activity thermogenesis (NEAT), and metabolic adaptation during dieting.',
      assessmentCriteria: [
        'Explain the components of total daily energy expenditure (TDEE)',
        'Describe adaptive thermogenesis and its impact on prolonged dieting',
        'Discuss strategies to mitigate metabolic adaptation',
      ],
      content: [
        {
          heading: 'Total Daily Energy Expenditure — The Full Picture',
          paragraphs: [
            'At Level 2, you learned that energy balance determines weight change. At Level 3, you need to understand the components of your total daily energy expenditure (TDEE) — and why they are not fixed values.',
          ],
          imageUrl: ch4MetabolicAdaptation,
          imageAlt: 'TDEE components breakdown chart',
          bullets: [
            'Basal Metabolic Rate (BMR) — The energy your body uses at complete rest to maintain vital functions. Accounts for approximately 60–70% of TDEE',
            'Non-Exercise Activity Thermogenesis (NEAT) — Energy expended through daily movement that is not deliberate exercise — fidgeting, walking, standing, housework. Accounts for approximately 15–30% and varies enormously between individuals',
            'Thermic Effect of Food (TEF) — Energy used to digest, absorb, and process nutrients. Approximately 10% of total intake. Protein has the highest TEF (20–30%), then carbohydrates (5–10%), then fats (0–3%)',
            'Exercise Activity Thermogenesis (EAT) — Energy burned during deliberate exercise. Typically only 5–10% of TDEE for most people, despite feeling like the most important component',
          ],
        },
        {
          heading: 'NEAT — The Overlooked Variable',
          paragraphs: [
            'NEAT is the single most variable component of TDEE and explains why some people seem to "eat whatever they want" without gaining weight. High-NEAT individuals unconsciously move more — they pace, fidget, take stairs, and generally maintain higher levels of spontaneous physical activity.',
            'Critically, NEAT decreases significantly during caloric restriction. Your body unconsciously reduces spontaneous movement to conserve energy. This can account for a 200–400 calorie reduction in daily expenditure that most people never notice — and it is one of the primary reasons fat loss stalls.',
          ],
        },
        {
          heading: 'Adaptive Thermogenesis — Your Body Fights Back',
          paragraphs: [
            'When you maintain a caloric deficit, your body adapts to conserve energy. BMR decreases beyond what would be predicted by the loss of body mass alone. Hormones shift — thyroid output decreases, cortisol increases, and hunger hormones (ghrelin) rise while satiety hormones (leptin) fall.',
            'This is adaptive thermogenesis — an evolutionary survival mechanism that makes prolonged dieting progressively harder. It is not "metabolic damage" (a term with no scientific basis), but it is a real physiological response that must be managed intelligently.',
          ],
          bullets: [
            'BMR reduction — Can decrease by 10–15% beyond what weight loss alone would predict',
            'Hormonal shifts — Decreased thyroid hormones (T3), increased cortisol, decreased leptin, increased ghrelin',
            'NEAT suppression — Unconscious reduction in daily movement of 200–400 calories',
            'These adaptations partially reverse when calories are restored — but the timeline varies',
          ],
        },
        {
          heading: 'Managing Metabolic Adaptation',
          paragraphs: [
            'Several strategies can mitigate metabolic adaptation during prolonged fat loss phases. Diet breaks — planned periods of 1–2 weeks at maintenance calories — can partially restore leptin levels and reduce the psychological burden of dieting. Refeed days — single days of higher carbohydrate intake — provide a smaller but more frequent metabolic stimulus.',
            'Maintaining high protein intake (2.0–2.4g per kilogram of body weight) during a deficit helps preserve muscle mass, which in turn protects BMR. Resistance training serves the same purpose — it signals to your body that muscle tissue is essential and should not be sacrificed for energy.',
          ],
        },
      ],
      unbreakableInsight: 'Your metabolism is not broken — it is adapted. The plateau you hit after weeks of dieting is not a mystery; it is your body doing exactly what evolution designed it to do. Work with it, not against it.',
      coachNote: 'If fat loss has stalled after 8–12 weeks of consistent dieting, a planned 1–2 week diet break at maintenance calories is almost always more effective than eating less or training more.',
      practicalTask: {
        title: 'TDEE Component Estimate',
        instructions: 'Estimate your own TDEE by calculating each component separately. Use an online BMR calculator, estimate your NEAT based on your daily step count and occupation, calculate TEF from your average daily intake, and add your exercise energy expenditure.',
        reflectionQuestions: [
          'Which component of your TDEE is likely the most variable day-to-day?',
          'How might your NEAT change if you started a caloric deficit?',
          'What strategies could you use to maintain NEAT during a fat loss phase?',
        ],
      },
    },
    {
      number: 5,
      title: 'Nutrient Timing & Periodisation',
      learningOutcome: 'Understand how to strategically time nutrient intake around training and periodise nutrition across training phases.',
      assessmentCriteria: [
        'Explain the rationale for nutrient timing around training sessions',
        'Describe carbohydrate periodisation strategies',
        'Discuss the concept of nutrition periodisation across training blocks',
      ],
      content: [
        {
          heading: 'Pre-Training Nutrition',
          paragraphs: [
            'What you eat before training directly affects performance — but the optimal approach depends on the type, intensity, and duration of the session, as well as how recently you last ate.',
            'For most resistance training sessions lasting 60–90 minutes, a balanced meal containing 25–40g protein and 40–80g carbohydrates consumed 2–3 hours beforehand provides adequate fuel. If training within 60 minutes of eating, opt for a smaller, easily digested snack — a banana with a protein shake, for example.',
          ],
          imageUrl: ch5NutrientTiming,
          imageAlt: 'Nutrient timing around training diagram',
        },
        {
          heading: 'Intra-Training Nutrition',
          paragraphs: [
            'For sessions lasting under 60 minutes at moderate intensity, intra-training nutrition is unnecessary — water alone is sufficient. However, for sessions exceeding 90 minutes, high-intensity interval work, or multiple daily sessions, consuming fast-digesting carbohydrates (30–60g per hour) can maintain performance.',
            'Endurance athletes and those performing very high-volume training may benefit from intra-training carbohydrate drinks or gels. For the average gym-goer performing a standard resistance training session, this is not needed.',
          ],
        },
        {
          heading: 'Post-Training Nutrition',
          paragraphs: [
            'Post-training nutrition serves two primary purposes: replenishing glycogen stores and providing amino acids for muscle protein synthesis. A meal containing protein (25–40g) and carbohydrates (0.5–1.0g per kilogram body weight) within 1–2 hours of training is ideal.',
            'The urgency of post-training nutrition depends on your next session. If you train once daily, you have ample time to replenish through normal meals. If you train twice daily or compete on consecutive days, aggressive post-training refuelling becomes critical.',
          ],
        },
        {
          heading: 'Carbohydrate Periodisation',
          paragraphs: [
            'Carbohydrate periodisation means matching your carbohydrate intake to your training demands on a day-by-day basis. On heavy training days, you eat more carbohydrates to fuel performance and recovery. On rest days or light sessions, you eat fewer carbohydrates because the demand is lower.',
            'This is not the same as "carb cycling" for fat loss (which has limited evidence). Rather, it is a practical approach that ensures you fuel when needed and avoid excess when you do not.',
          ],
          bullets: [
            'Heavy training day — 4–7g carbohydrate per kilogram body weight',
            'Moderate training day — 3–5g per kilogram',
            'Rest day — 2–3g per kilogram',
            'Protein and fat intake remain relatively constant regardless of training day',
          ],
        },
      ],
      unbreakableInsight: 'Nutrient timing is the icing on the cake — not the cake itself. If your total daily intake is wrong, no amount of strategic timing will compensate. Get the fundamentals right first.',
      coachNote: 'A simple rule: eat a balanced meal 2–3 hours before training, and eat a protein-rich meal within 2 hours after. For 90% of people, that is all the "timing" you will ever need.',
      practicalTask: {
        title: 'Training Day vs Rest Day Comparison',
        instructions: 'Plan two full days of eating: one for a heavy training day and one for a rest day. Adjust carbohydrate intake according to the periodisation guidelines while keeping protein consistent.',
        reflectionQuestions: [
          'How did your carbohydrate intake differ between the two days?',
          'Did you find it difficult to reduce carbohydrates on the rest day?',
          'How might this approach help with body composition over time?',
        ],
      },
    },
    {
      number: 6,
      title: 'Alcohol & Its Effects on Nutrition',
      learningOutcome: 'Understand how alcohol affects metabolism, body composition, recovery, and nutritional status.',
      assessmentCriteria: [
        'Explain how alcohol is metabolised and its caloric contribution',
        'Describe the effects of alcohol on muscle protein synthesis and recovery',
        'Discuss practical strategies for managing alcohol intake within nutritional goals',
      ],
      content: [
        {
          heading: 'Alcohol as a Macronutrient',
          paragraphs: [
            'Alcohol (ethanol) provides 7 calories per gram — almost as energy-dense as fat (9 calories per gram) and nearly double that of carbohydrates or protein (4 calories per gram). However, it is often called an "empty calorie" source because it provides no essential nutrients, vitamins, or minerals.',
            'Your body treats alcohol as a toxin and prioritises its metabolism above all other macronutrients. When you drink, fat oxidation (fat burning) is suppressed until the alcohol is fully processed. This does not mean alcohol directly causes fat gain, but it makes it very easy to over-consume calories and stall fat loss.',
          ],
          imageUrl: ch6AlcoholEffects,
          imageAlt: 'Alcohol calorie comparison chart',
        },
        {
          heading: 'Effects on Recovery and Performance',
          paragraphs: [
            'Alcohol impairs muscle protein synthesis by up to 37% when consumed after training, even when adequate protein is also consumed. It disrupts sleep architecture — particularly reducing REM sleep and deep sleep phases — which are critical for recovery and growth hormone release.',
            'Alcohol also acts as a diuretic, promoting fluid loss and potentially leading to dehydration. It impairs glycogen replenishment and reduces next-day performance. Even moderate consumption the evening after training can measurably reduce the adaptive response to that session.',
          ],
          bullets: [
            'MPS suppression — Up to 37% reduction when alcohol is consumed post-training',
            'Sleep disruption — Reduced REM and deep sleep phases, even at moderate doses',
            'Dehydration — Alcohol inhibits anti-diuretic hormone (ADH), increasing fluid loss',
            'Glycogen — Alcohol impairs glycogen resynthesis, particularly problematic for back-to-back sessions',
            'Hormonal — Acute reduction in testosterone and increase in cortisol',
          ],
        },
        {
          heading: 'Practical Management',
          paragraphs: [
            'Complete abstinence is not necessary for most people, but being aware of the trade-offs allows you to make informed decisions. If you choose to drink, plan it on rest days rather than training days, and separate consumption from your post-training window by at least 4–6 hours.',
            'Account for alcohol calories in your daily intake. A night out with four pints of lager adds approximately 800 calories — equivalent to a full meal. If fat loss is your goal, this untracked consumption is often the hidden variable that prevents progress.',
          ],
        },
      ],
      unbreakableInsight: 'You can drink and still make progress — but you cannot drink regularly, train hard, and expect optimal results. Something has to give. Be honest about your priorities.',
      coachNote: 'Track your alcohol intake for one month without changing anything. Most people are genuinely surprised by the caloric total. Awareness alone often drives meaningful reduction.',
      practicalTask: {
        title: 'Alcohol Impact Assessment',
        instructions: 'If you consume alcohol, calculate your average weekly alcohol intake in units and calories over the past month. Assess how this aligns with your current nutrition goals.',
        reflectionQuestions: [
          'How many calories per week does your alcohol intake add?',
          'Do you tend to consume alcohol on training days or rest days?',
          'What would be a realistic reduction target that you could sustain?',
        ],
      },
    },
  ],
};
