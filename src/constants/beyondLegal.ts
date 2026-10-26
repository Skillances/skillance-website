/**
 * Beyond the App / Rimitso legal disclosures (ECT Act s43, POPIA, service terms).
 *
 * Replace every bracket placeholder before production deploy.
 * CI runs scripts/check-beyond-legal-placeholders.mjs on prebuild.
 */
import { BEYOND_EMAIL } from '@/beyond/content';
import {
  CORPORATE_LEGAL_ADDRESS_ONE_LINE,
  CORPORATE_LEGAL_NAME,
} from '@/constants/corporate';

export const BEYOND_LEGAL = {
  /** Company registration (CIPC). */
  cipcRegNo: '[CIPC REG NO]',
  /** Set true only when vatNo is confirmed. */
  vatRegistered: false,
  vatNo: '[VAT NO]',
  phone: '[PHONE]',
  directorNames: '[DIRECTOR NAMES]',
  informationOfficerName: '[INFORMATION OFFICER NAME]',
  informationOfficerEmail: '[IO EMAIL]',
  informationOfficerRegStatus: '[REG STATUS/NUMBER]',
  projectRecordsRetentionYears: '[5]',
  changeRequestHourlyRate: '[HOURLY RATE]',
  depositPercent: '[DEPOSIT %]',
  invoicePaymentDays: '[N]',
  carePlanNamesAndPrices: '[PLAN NAMES & PRICES]',
  carePlanResponseBusinessDays: '[N]',
  liabilityCapMonths: '[12]',
  breachNotifyWindow: '[within 24 hours]',
  founderBio: '[FOUNDER NAME/BIO — supply]',
  yearsOrClientCount: '[YEARS / CLIENT COUNT — only if true]',
} as const;

/** When true, /paia-manual serves PAIA_MANUAL_PDF_URL or embedded content. */
export const PAIA_MANUAL_PUBLISHED = false;

/** Absolute URL to published PAIA manual PDF when ready. */
export const PAIA_MANUAL_PDF_URL: string | null = null;

export function formatVatRegistrationLine(): string {
  if (BEYOND_LEGAL.vatRegistered && BEYOND_LEGAL.vatNo && !BEYOND_LEGAL.vatNo.startsWith('[')) {
    return `VAT no. ${BEYOND_LEGAL.vatNo}`;
  }
  return 'Not registered for VAT';
}

/** For service terms pricing — never "incl. VAT" unless registered. */
export function formatPriceVatPhrase(): 'incl. VAT' | 'excl. VAT' {
  return BEYOND_LEGAL.vatRegistered ? 'incl. VAT' : 'excl. VAT';
}

export function beyondTradingNameLine(): string {
  return `Skillance Beyond the App is a trading name of ${CORPORATE_LEGAL_NAME.replace(/\s+\(PTY\)\s+LTD/i, ' (Pty) Ltd')}`;
}

export function isBeyondLegalValueFilled(value: string): boolean {
  return value.trim().length > 0 && !value.trim().startsWith('[');
}

export function beyondFooterDisclosureBlock(): string {
  const vat = formatVatRegistrationLine();
  const parts = [
    beyondTradingNameLine(),
    isBeyondLegalValueFilled(BEYOND_LEGAL.cipcRegNo)
      ? `Reg. no. ${BEYOND_LEGAL.cipcRegNo}`
      : null,
    vat,
    `Registered office: ${CORPORATE_LEGAL_ADDRESS_ONE_LINE}`,
    isBeyondLegalValueFilled(BEYOND_LEGAL.phone) ? BEYOND_LEGAL.phone : null,
    BEYOND_EMAIL,
    isBeyondLegalValueFilled(BEYOND_LEGAL.directorNames)
      ? `Directors: ${BEYOND_LEGAL.directorNames}`
      : null,
  ].filter((part): part is string => Boolean(part));
  return parts.join(' · ');
}
