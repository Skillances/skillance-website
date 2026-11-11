import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';

const post = vi.fn();
vi.mock('@/lib/api', () => ({ get: vi.fn(), post }));

import Reviews from './Reviews';
import Testimonials from './Testimonials';

describe('homepage review surfaces', () => {
  it('renders no review form and does not post a public review', () => {
    const view = render(
      <>
        <Reviews />
        <Testimonials />
      </>,
    );
    expect(view.container).toBeEmptyDOMElement();
    expect(post).not.toHaveBeenCalled();
    expect(view.queryByRole('button', { name: /submit review/i })).toBeNull();
    expect(view.queryByText(/write a review/i)).toBeNull();
    expect(view.queryByText(/what people are saying/i)).toBeNull();
  });
});
