/**
 * Corporate structure: Skillance (brand / platform) ↔ Rimitso Management Services (legal parent).
 * Keep in sync with index.html JSON-LD and public policy mirrors (*.md).
 */
export const CORPORATE_LEGAL_NAME = 'RIMITSO MANAGEMENT SERVICES (PTY) LTD';

/** Natural sentence for UI (footer, etc.). */
export const CORPORATE_OWNERSHIP_SENTENCE =
  'Skillance is owned by and part of Rimitso Management Services (Pty) Ltd.';

/** Registered office of RIMITSO MANAGEMENT SERVICES (PTY) LTD (CIPC / legal record). */
export const CORPORATE_LEGAL_ADDRESS_ONE_LINE =
  '6 DWARS STREET, KRUGERSDORP, KRUGERSDORP, GAUTENG, 1739';

export const CORPORATE_LEGAL_ADDRESS_LINES = [
  '6 DWARS STREET',
  'KRUGERSDORP, KRUGERSDORP',
  'GAUTENG, 1739',
] as const;
