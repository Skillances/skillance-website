/**
 * Central query keys for TanStack Query — keeps cache invalidation predictable.
 */
export const queryKeys = {
  categories: {
    tree: () => ['categories', 'tree'] as const,
    featured: () => ['categories', 'featured'] as const,
    byId: (id: string) => ['categories', id] as const,
  },
  serviceCategories: {
    items: () => ['serviceCategories', 'items'] as const,
  },
  freelancers: {
    list: (params: Record<string, unknown>) => ['freelancers', 'list', params] as const,
    search: (params: Record<string, unknown>) => ['freelancers', 'search', params] as const,
    detail: (id: string) => ['freelancers', id] as const,
    portfolio: (id: string) => ['freelancers', id, 'portfolio'] as const,
    availability: (id: string, date?: string) =>
      ['freelancers', id, 'availability', date ?? ''] as const,
    dashboardStats: (id: string) => ['freelancers', id, 'dashboard', 'stats'] as const,
    dashboardEarnings: (id: string, period?: string) =>
      ['freelancers', id, 'dashboard', 'earnings', period ?? 'weekly'] as const,
    jobs: (id: string) => ['freelancers', id, 'jobs'] as const,
    reviews: (id: string) => ['freelancers', id, 'reviews'] as const,
  },
  bookings: {
    my: () => ['bookings', 'my'] as const,
    detail: (id: string) => ['bookings', id] as const,
  },
  chat: {
    list: () => ['chat', 'list'] as const,
    thread: (chatId: string) => ['chat', chatId, 'messages'] as const,
  },
  favorites: {
    list: () => ['favorites', 'list'] as const,
    status: (freelancerId: string) => ['favorites', 'status', freelancerId] as const,
  },
  recurring: {
    series: () => ['recurring', 'series'] as const,
    seriesDetail: (id: string) => ['recurring', 'series', id] as const,
    pending: () => ['recurring', 'pending'] as const,
  },
  user: {
    me: () => ['user', 'me'] as const,
    roleApplications: () => ['user', 'role-applications'] as const,
  },
  admin: {
    dashboard: (timeframe: string) => ['admin', 'dashboard', timeframe] as const,
  },
  backend: {
    healthPing: () => ['backend', 'health-ping'] as const,
  },
} as const;
