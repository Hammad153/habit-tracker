import { DesignTokens } from "@/src/components/theme";

export const PERIOD_DAYS: Record<string, number> = {
  Week: 7,
  Month: 30,
  Year: 365,
};

export const FEATURE_FLAGS = {
  BUDGET_ENABLED: false,
} as const;

export const CATEGORY_KEYS = [
  "rose",
  "amber",
  "mint",
  "violet",
  "sky",
  "sand",
] as const;

export const HABIT_COLORS = CATEGORY_KEYS.map(
  (k) => DesignTokens.category[k].ink
);

export const HABIT_ICONS = [
  "water",
  "book",
  "barbell",
  "flower",
  "moon",
  "create",
  "walk",
  "restaurant",
  "bed",
  "code",
  "happy",
  "bicycle",
  "sunny",
  "heart",
  "leaf",
  "cafe",
  "fitness",
  "musical-notes",
  "pencil",
  "timer",
  "briefcase",
  "school",
  "wallet",
  "language",
];

export const HABIT_CATEGORIES = [
  "Fitness",
  "Mindfulness",
  "Health",
  "Productivity",
  "Career",
  "General",
];

export const MOTIVATION_MESSAGES = [
  "Consistency is built in quiet repetitions.",
  "Small promises kept today become identity tomorrow.",
  "Show up for the version of you that asked for change.",
  "Progress loves a repeatable system.",
  "A steady day is still a strong day.",
  "Your habits are votes for your future self.",
  "Discipline gets lighter when it becomes familiar.",
  "Do the next right rep. Momentum will catch up.",
  "Tiny wins count because they compound.",
  "Make today easy to be proud of.",
  "The streak is useful, but the return is the skill.",
  "You do not need perfect energy to keep a promise.",
  "Protect the habit before you polish the outcome.",
  "A good routine lowers the cost of beginning.",
  "The best system is the one you actually repeat.",
  "One completed habit can change the shape of the day.",
  "Consistency is self-trust with a schedule.",
  "Start smaller when life gets loud. Keep the thread.",
  "Your future does not need drama. It needs reps.",
  "Do it gently, do it clearly, do it today.",
  "Attention becomes direction. Direction becomes progress.",
  "A calm checkmark is still a win.",
  "Leave proof that you cared today.",
  "Build the day one useful action at a time.",
  "Keep going long enough for effort to become evidence.",
];
