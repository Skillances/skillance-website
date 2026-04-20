import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Admin "Back" buttons: go to the previous SPA history entry when possible,
 * otherwise navigate to `fallback` (e.g. list page).
 */
export function useAdminBackNavigation() {
  const navigate = useNavigate();

  return useCallback(
    (fallback: string) => {
      const idx =
        typeof window !== 'undefined' && window.history.state != null
          ? (window.history.state as { idx?: number }).idx
          : undefined;
      if (typeof idx === 'number' && idx > 0) {
        navigate(-1);
        return;
      }
      if (typeof window !== 'undefined' && window.history.length > 1) {
        navigate(-1);
        return;
      }
      navigate(fallback);
    },
    [navigate],
  );
}
