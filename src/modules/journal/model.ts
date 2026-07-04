export type JournalMood =
  | "calm"
  | "happy"
  | "focused"
  | "grateful"
  | "tired"
  | "stressed"
  | "reflective";

export interface IJournalEntry {
  id: string;
  userId: string;
  title: string;
  date: string;
  mood: JournalMood;
  content: string;
  tags: string[];
  isFavorite: boolean;
  isPinned: boolean;
  templateId?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface IJournalTemplate {
  id: string;
  title: string;
  description: string;
  mood: JournalMood;
  tags: string[];
  prompt: string;
}

export const JOURNAL_MOODS: { value: JournalMood; label: string; icon: string }[] = [
  { value: "calm", label: "Calm", icon: "leaf-outline" },
  { value: "happy", label: "Happy", icon: "sunny-outline" },
  { value: "focused", label: "Focused", icon: "radio-button-on-outline" },
  { value: "grateful", label: "Grateful", icon: "heart-outline" },
  { value: "tired", label: "Tired", icon: "moon-outline" },
  { value: "stressed", label: "Stressed", icon: "thunderstorm-outline" },
  { value: "reflective", label: "Reflective", icon: "sparkles-outline" },
];

export const JOURNAL_TEMPLATES: IJournalTemplate[] = [
  {
    id: "blank",
    title: "Blank Entry",
    description: "Start with an open page.",
    mood: "reflective",
    tags: [],
    prompt: "",
  },
  {
    id: "daily-reflection",
    title: "Daily Reflection",
    description: "Review what happened and what you learned.",
    mood: "reflective",
    tags: ["reflection"],
    prompt:
      "What went well today?\n\nWhat challenged me?\n\nWhat is one thing I want to carry into tomorrow?",
  },
  {
    id: "morning",
    title: "Morning Journal",
    description: "Set your tone and priorities.",
    mood: "focused",
    tags: ["morning", "planning"],
    prompt:
      "Today I want to feel...\n\nMy top three priorities are...\n\nOne small promise I will keep is...",
  },
  {
    id: "evening",
    title: "Evening Reflection",
    description: "Close the day with clarity.",
    mood: "calm",
    tags: ["evening", "reflection"],
    prompt:
      "I am proud that I...\n\nSomething I can release tonight is...\n\nTomorrow will be easier if I...",
  },
  {
    id: "gratitude",
    title: "Gratitude Journal",
    description: "Notice what is already working.",
    mood: "grateful",
    tags: ["gratitude"],
    prompt:
      "Three things I am grateful for:\n\n1.\n2.\n3.\n\nThe smallest detail worth remembering is...",
  },
  {
    id: "goal-planning",
    title: "Goal Planning",
    description: "Turn intention into a next action.",
    mood: "focused",
    tags: ["goals", "planning"],
    prompt:
      "The goal I am focusing on is...\n\nWhy it matters:\n\nThe next visible action is...\n\nPossible obstacles and my plan:",
  },
  {
    id: "free-writing",
    title: "Free Writing",
    description: "Write continuously without editing.",
    mood: "reflective",
    tags: ["free-writing"],
    prompt: "I am noticing...",
  },
  {
    id: "weekly-review",
    title: "Weekly Review",
    description: "Find patterns across the week.",
    mood: "reflective",
    tags: ["weekly-review"],
    prompt:
      "This week's wins:\n\nHabits that supported me:\n\nWhat I want to adjust next week:\n\nOne lesson:",
  },
  {
    id: "monthly-reflection",
    title: "Monthly Reflection",
    description: "Zoom out and capture progress.",
    mood: "grateful",
    tags: ["monthly-review"],
    prompt:
      "This month taught me...\n\nThe progress I can see:\n\nWhat deserves more attention next month:\n\nA word for the next month:",
  },
];
