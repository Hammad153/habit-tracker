export interface IHabitTemplate {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  category: string;
  frequency?: string;
  goal: number;
  unit?: string;
  tier: "FREE" | "BASIC" | "PREMIUM";
  sortOrder: number;
}
