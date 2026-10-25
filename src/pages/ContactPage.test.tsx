import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const { postMock, toastError, toastSuccess } = vi.hoisted(() => ({
  postMock: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock('@/lib/api', () => ({ post: postMock }));
vi.mock('sonner', () => ({ toast: { error: toastError, success: toastSuccess } }));
vi.mock('../components/layout/PageTemplate', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('../components/corporate/CorporateLegalAddress', () => ({ CorporateLegalAddress: () => null }));

import ContactPage from './ContactPage';

function renderPage(search = '') {
  return render(
    <MemoryRouter initialEntries={[`/contact${search}`]}>
      <ContactPage />
    </MemoryRouter>,
  );
}

function fillAndSubmit(extra: Record<string, string> = {}) {
  fireEvent.change(screen.getByLabelText('Your Name'), { target: { value: 'Ada Lovelace' } });
  fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'ada@example.com' } });
  fireEvent.change(screen.getByLabelText('Subject'), { target: { value: 'Hello' } });
  fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'A sufficiently long message.' } });
  for (const [label, value] of Object.entries(extra)) {
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
  }
  fireEvent.submit(screen.getByRole('button', { name: /send message/i }).closest('form')!);
}

describe('ContactPage', () => {
  beforeEach(() => {
    postMock.mockReset();
    toastError.mockReset();
    toastSuccess.mockReset();
  });

  it('shows success only after the backend accepts the message', async () => {
    postMock.mockResolvedValue({ success: true });
    renderPage();
    fillAndSubmit();

    await waitFor(() => expect(screen.getByText('Message received.')).toBeInTheDocument());
    expect(postMock).toHaveBeenCalledWith('/public/contact', {
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      subject: 'Hello',
      message: 'A sufficiently long message.',
    });
  });

  it('reports a backend failure honestly instead of claiming success', async () => {
    postMock.mockRejectedValue({ message: 'Server exploded', statusCode: 500 });
    renderPage();
    fillAndSubmit();

    await waitFor(() => expect(toastError).toHaveBeenCalledWith('Server exploded'));
    expect(toastSuccess).not.toHaveBeenCalled();
    expect(screen.queryByText('Message received.')).not.toBeInTheDocument();
  });

  it('does not call the backend when a bot fills the honeypot', async () => {
    renderPage();
    fillAndSubmit({ 'Leave this field empty': 'http://spam.example' });

    await waitFor(() => expect(screen.getByText('Message received.')).toBeInTheDocument());
    expect(postMock).not.toHaveBeenCalled();
  });

  it('caps and cleans the ?subject prefill', () => {
    renderPage(`?subject=${encodeURIComponent('x'.repeat(500))}`);
    expect((screen.getByLabelText('Subject') as HTMLInputElement).value).toHaveLength(150);
  });
});
