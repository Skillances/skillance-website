/**
 * User-facing cancellation messages keyed by the API `cancellationMatrix.code`.
 * Copied from skillance-app lib/l10n/cancellation_matrix_messages.dart and app_en.arb.
 * The client never computes refunds; it only shows the message for the code the API returned.
 */
const FOOTER = 'Final refunds depend on your payment method and bank processing times.';

const MESSAGES: Record<string, { text: string; footer?: boolean }> = {
  PENDING_FULL_REFUND: {
    text: 'This booking was cancelled before confirmation. No session payment applies.',
  },
  CONFIRMED_PRE_START_HOURLY_FULL_REFUND: {
    text: 'Cancelled before the scheduled session. Any card pre-authorisation should drop off per your bank; booking funds are not captured for the session.',
  },
  CONFIRMED_PRE_START_INVOICE_OPEN_FULL_REFUND: {
    text: 'Cancelled before the session. Draft or sent invoices are voided. A paid connection fee is non-refundable.',
  },
  CONFIRMED_PRE_START_INVOICE_PAID_ESCROW_REFUND_DUE: {
    text: 'Cancelled before the session. Booking funds are marked for refund review. A paid connection fee stays with the platform as per the connection-fee rules.',
    footer: true,
  },
  MID_SESSION_PRE_PIN_REFUND_DUE: {
    text: 'Cancelled after the session started but before PIN verification. Booking funds are marked for refund review. A paid connection fee (if any) stays non-refundable.',
    footer: true,
  },
};

const DEFAULT_MESSAGE = 'This booking was cancelled. See your payment or bank statement for final amounts.';

export function cancellationMessage(code: string | null | undefined): string {
  const hit = code ? MESSAGES[code] : undefined;
  if (!hit) return DEFAULT_MESSAGE;
  return hit.footer ? `${hit.text}\n\n${FOOTER}` : hit.text;
}

/** Matrix code from `cancellationReason` stored as `pmx:<CODE>::<reason>`. */
export function cancellationCodeFromReason(reason: string | null | undefined): string | null {
  const m = /^pmx:([A-Z0-9_]+)::/.exec(reason ?? '');
  return m ? m[1] : null;
}

/** Reason text without the `pmx:<CODE>::` prefix. */
export function cancellationReasonForDisplay(reason: string | null | undefined): string {
  return (reason ?? '').replace(/^pmx:[A-Z0-9_]+::/, '').trim();
}
