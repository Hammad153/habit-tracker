import { FEATURE_FLAGS } from "@/src/constants";

/**
 * Routes that are intentionally hidden while their feature is flagged OFF.
 * A route is treated as disabled only when the owning feature flag is off,
 * so re-enabling the flag restores navigation automatically.
 */
const DISABLED_FEATURE_ROUTES: Record<string, boolean> = {
  "/(tabs)/budget": FEATURE_FLAGS.BUDGET_ENABLED,
  "/budgets": FEATURE_FLAGS.BUDGET_ENABLED,
  "/budget-detail": FEATURE_FLAGS.BUDGET_ENABLED,
  "/add-budget": FEATURE_FLAGS.BUDGET_ENABLED,
  "/add-expense": FEATURE_FLAGS.BUDGET_ENABLED,
  "/add-income": FEATURE_FLAGS.BUDGET_ENABLED,
  "/expense-history": FEATURE_FLAGS.BUDGET_ENABLED,
  "/category-breakdown": FEATURE_FLAGS.BUDGET_ENABLED,
};

/**
 * Resolves a stored navigation route to a safe destination.
 * Routes belonging to a hidden feature are redirected to the main tab
 * experience instead of a dead end.
 */
export const resolveNavigationRoute = (route: string): string => {
  const base = route.split("?")[0];
  if (base in DISABLED_FEATURE_ROUTES && !DISABLED_FEATURE_ROUTES[base]) {
    return "/(tabs)";
  }
  return route;
};