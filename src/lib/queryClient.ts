import { QueryClient } from '@tanstack/react-query';

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry: (failureCount, error) => {
          if (failureCount >= 2) return false;
          const msg =
            error instanceof Error
              ? error.message
              : typeof error === 'object' && error && 'message' in error
                ? String((error as { message?: unknown }).message)
                : '';
          if (/authentication required/i.test(msg) || /unauthorized/i.test(msg)) {
            return false;
          }
          return true;
        },
        refetchOnWindowFocus: true,
      },
    },
  });
}
