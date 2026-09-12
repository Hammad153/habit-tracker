import React from "react";
import {
  Heart,
  Zap,
  BookOpen,
  Moon,
  Target,
  Flame,
  Check,
  CheckSquare,
  Calendar,
  Bell,
  Dumbbell,
  Coffee,
  Smile,
  Briefcase,
  GraduationCap,
  Wallet,
  Languages,
  Timer,
  Activity,
  Sparkles,
  Clock,
  Settings,
  Plus,
  Trash2,
  Edit2,
  ChevronRight,
  ChevronLeft,
  X,
  Droplets,
  Utensils,
  Bed,
  Code,
  Bike,
  Sun,
  Music,
  PenLine,
  Compass,
  Award,
  Layers,
  FileText,
  BarChart2,
  Home,
  Grid,
  TrendingUp,
  CreditCard,
  DollarSign,
  PieChart,
  User,
  Shield,
  HelpCircle,
  LucideIcon,
} from "lucide-react-native";
import { CategoryKey } from "@/src/components/ListRow";

export const LUCIDE_HABIT_ICONS: { name: string; icon: LucideIcon }[] = [
  { name: "heart", icon: Heart },
  { name: "zap", icon: Zap },
  { name: "book", icon: BookOpen },
  { name: "moon", icon: Moon },
  { name: "target", icon: Target },
  { name: "flame", icon: Flame },
  { name: "water", icon: Droplets },
  { name: "fitness", icon: Dumbbell },
  { name: "barbell", icon: Dumbbell },
  { name: "cafe", icon: Coffee },
  { name: "restaurant", icon: Utensils },
  { name: "bed", icon: Bed },
  { name: "code", icon: Code },
  { name: "happy", icon: Smile },
  { name: "bicycle", icon: Bike },
  { name: "sunny", icon: Sun },
  { name: "timer", icon: Timer },
  { name: "briefcase", icon: Briefcase },
  { name: "school", icon: GraduationCap },
  { name: "wallet", icon: Wallet },
  { name: "language", icon: Languages },
  { name: "musical-notes", icon: Music },
  { name: "pencil", icon: PenLine },
  { name: "flower", icon: Sparkles },
  { name: "leaf", icon: Activity },
  { name: "create", icon: PenLine },
  { name: "walk", icon: Activity },
];

const iconMap: Record<string, LucideIcon> = {
  heart: Heart,
  zap: Zap,
  book: BookOpen,
  "book-outline": BookOpen,
  moon: Moon,
  "moon-outline": Moon,
  target: Target,
  flame: Flame,
  water: Droplets,
  droplets: Droplets,
  fitness: Dumbbell,
  barbell: Dumbbell,
  cafe: Coffee,
  restaurant: Utensils,
  bed: Bed,
  code: Code,
  happy: Smile,
  bicycle: Bike,
  sunny: Sun,
  timer: Timer,
  briefcase: Briefcase,
  school: GraduationCap,
  wallet: Wallet,
  language: Languages,
  "musical-notes": Music,
  pencil: PenLine,
  create: PenLine,
  flower: Sparkles,
  leaf: Activity,
  walk: Activity,
  calendar: Calendar,
  bell: Bell,
  settings: Settings,
  award: Award,
  check: Check,
  plus: Plus,
  grid: Grid,
  home: Home,
  chart: BarChart2,
  user: User,
  dollar: DollarSign,
  credit: CreditCard,
};

export const getLucideIcon = (name?: string): LucideIcon => {
  if (!name) return Target;
  const clean = name.toLowerCase().replace(/-outline$/, "");
  return iconMap[clean] || Target;
};

export const CATEGORY_CYCLE: CategoryKey[] = [
  "rose",
  "amber",
  "mint",
  "violet",
  "sky",
  "sand",
];

export const getCategoryKeyForId = (id?: string): CategoryKey => {
  if (!id) return "mint";
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % CATEGORY_CYCLE.length;
  return CATEGORY_CYCLE[index];
};

export const getHabitLucideIcon = getLucideIcon;
