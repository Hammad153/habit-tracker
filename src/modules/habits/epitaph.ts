export type HumorTone = "gentle" | "sarcastic" | "neutral";

const EPITAPH_TEMPLATES: Record<string, Record<string, string[]>> = {
  fitness: {
    gentle: [
      "The couch has successfully defended its territory.",
      "Rest in reps. The weights will wait.",
      "A strong effort. The gym misses you.",
    ],
    sarcastic: [
      "Your gym shoes have entered retirement.",
      "The treadmill is relieved. Finally some peace and quiet.",
      "Declared dead by the alarm clock. Again.",
    ],
    neutral: [
      "A promising beginning. A memorable ending.",
      "Habit retired. No further activity recorded.",
    ],
  },
  reading: {
    gentle: [
      "One chapter down. The remaining books request privacy.",
      "The bookmark stayed put. The story paused.",
      "Pages left unturned. A quiet farewell.",
    ],
    sarcastic: [
      "Dust has claimed the bookshelf. The novel waits.",
      "One page turned. The rest filed a missing persons report.",
      "The library sent a search party. Nobody came.",
    ],
    neutral: [
      "Reading habit retired. Progress archived.",
      "No completions recorded in the final period.",
    ],
  },
  hydration: {
    gentle: [
      "Water was available. Negotiations failed.",
      "The glass stayed full. Thirst prevailed.",
      "A well-intentioned pour. Gone too soon.",
    ],
    sarcastic: [
      "Survived entirely on optimism and iced coffee.",
      "The water bottle is now a paperweight.",
      "Dehydration won. The cup is dry.",
    ],
    neutral: [
      "Hydration habit retired. No recent completions.",
      "Goal not met. Habit closed.",
    ],
  },
  studying: {
    gentle: [
      "The textbooks remain largely undisturbed.",
      "One lesson learned. The syllabus outlasted the student.",
      "Study session ended. Knowledge waits.",
    ],
    sarcastic: [
      "The highlighter dried up before the habit did.",
      "Crammed once. Forgot forever.",
      "The exam is still there. The habit is not.",
    ],
    neutral: [
      "Studying habit retired. Coursework archived.",
      "No study completions in the final period.",
    ],
  },
  meditation: {
    gentle: [
      "The cushion is empty. The breath continues.",
      "One mindful moment. Then stillness.",
      "The timer rang. No one answered.",
    ],
    sarcastic: [
      "Inner peace proved elusive. The app uninstalled itself.",
      "Om. And then nothing.",
      "The chime rang into the void.",
    ],
    neutral: [
      "Meditation habit retired. Sessions archived.",
      "No meditation completions recorded.",
    ],
  },
  general: {
    gentle: [
      "A promising beginning. A memorable ending.",
      "Well-intentioned. Briefly sustained.",
      "The habit lived. The habit rested.",
    ],
    sarcastic: [
      "It seemed like a good idea at the time.",
      "The streak was real. Briefly.",
      "Good effort. The universe disagreed.",
    ],
    neutral: [
      "Habit retired. No further activity recorded.",
      "Completions ended. Habit closed.",
    ],
  },
};

export const lifespanLabel = (days: number): string => {
  if (days === 1) return "1 day";
  return `${days} days`;
};

export const generateEpitaph = (
  category: string | undefined,
  lifespanDays: number,
  totalCompletions: number,
  bestStreak: number,
  tone: HumorTone = "gentle",
): string => {
  const key = (category ?? "general").toLowerCase();
  const categoryTemplates = EPITAPH_TEMPLATES[key] ?? EPITAPH_TEMPLATES.general;
  const toneTemplates = categoryTemplates[tone] ?? categoryTemplates.neutral;
  const index = Math.abs(
    (lifespanDays * 7 + totalCompletions * 13 + bestStreak * 17) %
      toneTemplates.length,
  );
  return toneTemplates[index];
};

export const getDefaultEpitaph = (): string =>
  "A promising beginning. A memorable ending.";
