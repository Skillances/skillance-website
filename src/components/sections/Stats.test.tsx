import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

const { get } = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('@/lib/api', () => ({ get }));
vi.mock('@/lib/featureFlags', () => ({ SHOW_PUBLIC_STATS: true }));
vi.mock('gsap', () => ({
  default: {
    registerPlugin: () => undefined,
    context: (fn: () => void) => {
      fn();
      return { revert: () => undefined };
    },
    to: () => undefined,
    fromTo: () => undefined,
  },
}));
vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: { create: () => ({ kill: () => undefined }) },
}));

import Stats from './Stats';

describe('Stats', () => {
  it('hides figures when /public/stats fails', async () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: () => undefined, removeEventListener: () => undefined });
    get.mockRejectedValue(new Error('down'));
    const view = render(<Stats />);
    await waitFor(() => expect(get).toHaveBeenCalled());
    expect(view.container).toBeEmptyDOMElement();
    expect(screen.queryByText(/1K\+/)).toBeNull();
    expect(screen.queryByText(/4\.8/)).toBeNull();
    expect(screen.queryByText(/100%/)).toBeNull();
  });

  it('does not show a bare avgRating of 4.8 as a customer average', async () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: () => undefined, removeEventListener: () => undefined });
    get.mockResolvedValue({
      success: true,
      data: { usersCount: 8, bookingsCount: 4, avgRating: 4.8, verifiedPercent: 100 },
    });
    render(<Stats />);
    expect(await screen.findByText('people on Skillance')).toBeInTheDocument();
    expect(screen.queryByText(/average rating/i)).toBeNull();
    expect(screen.queryByText(/satisfied customers/i)).toBeNull();
    expect(screen.queryByText(/100% of professionals/i)).toBeNull();
  });
});
