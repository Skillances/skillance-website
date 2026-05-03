/**
 * Central query keys for TanStack Query — keeps cache invalidation predictable.
 */
export const queryKeys = {
  categories: {
    tree: () => ['categories', 'tree'] as const,
  },
  serviceCategories: {
    items: () => ['serviceCategories', 'items'] as const,
  },
  admin: {
    dashboard: (timeframe: string) => ['admin', 'dashboard', timeframe] as const,
  },
  backend: {
    healthPing: () => ['backend', 'health-ping'] as const,
  },
} as const;
