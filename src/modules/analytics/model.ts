export interface AnalyticsData {
  totalHabits: number;
  weeklyCompletionRate: number;
  monthlyCompletionRate: number;
  dailyPlanCompletionRate: number;
  monthlyExpenseTotal: number;
  budgetUsagePercentage: number;
  spendingByCategory: {
    category: string;
    total: number;
    color?: string;
    icon?: string;
  }[];
  bestDay: string;
  dayDistribution: { day: string; count: number }[];
  habitStreaks: {
    habitId: string;
    habitTitle: string;
    icon: string;
    iconColor: string;
    longestStreak: number;
    totalCompletions: number;
    completionRate: number;
  }[];
  dailyCompletions: { date: string; count: number }[];
  categoryBreakdown: { category: string; count: number; completions: number }[];
}
